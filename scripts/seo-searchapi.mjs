#!/usr/bin/env node
// Public docs: https://www.searchapi.io/docs/account-api
// This research-only client never changes the site or retries a paid request.
// Dry run: node scripts/seo-searchapi.mjs --manifest seo/research/pilot.json
// Execute: append --execute --state-dir /absolute/private/directory (0700).
// Keep ONE state directory across stages/panels. Never reset it to regain budget.
// Engine maxCost must be verified with the provider before marking confirmed:true.
// Balance differences cannot distinguish concurrent account usage; use a quiet account.
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, open, unlink, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENDPOINT = 'https://www.searchapi.io/api/v1/';
const ENGINES = new Set(['google', 'google_rank_tracking', 'google_ai_mode', 'google_ai_overview', 'google_related_questions']);
const PARAMS = new Set(['engine', 'q', 'gl', 'hl', 'location', 'device', 'page', 'num', 'page_token', 'next_page_token', 'link']);
const STAGE_CAPS = { pilot: 100, articles: 350, site: 200, followup: 250, contingency: 100 };

export function redact(value, secret = '') {
  if (Array.isArray(value)) return value.map(v => redact(v, secret));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/api.?key|authorization|password|secret|access_token|refresh_token/i.test(key))
    .map(([key, v]) => [key, redact(v, secret)]));
  if (typeof value !== 'string') return value;
  let clean = value.replace(/([?&](?:api_key|access_token)=)[^&#\s]*/gi, '$1[REDACTED]');
  if (secret) clean = clean.split(secret).join('[REDACTED]').split(encodeURIComponent(secret)).join('[REDACTED]');
  return clean;
}

export function prepare(manifest, execute = false) {
  if (manifest.version !== 1 || !(manifest.stage in STAGE_CAPS) || !/^[\w-]{1,80}$/.test(manifest.panel || '')) throw new Error('Invalid manifest version, stage or panel');
  if (!(Number.isInteger(manifest.budgetCredits) && manifest.budgetCredits > 0 && manifest.budgetCredits <= STAGE_CAPS[manifest.stage])) throw new Error('Invalid stage budget');
  if (!Array.isArray(manifest.requests) || manifest.requests.length > 1000) throw new Error('Invalid request list');
  const seen = new Set();
  const requests = [];
  for (const item of manifest.requests) {
    const params = item.params;
    if (!params || !ENGINES.has(params.engine)) throw new Error('Unsupported engine');
    if (Object.keys(params).some(k => !PARAMS.has(k)) || Object.values(params).some(v => !['string', 'number'].includes(typeof v))) throw new Error('Unexpected request parameter');
    if (params.q && (params.q.length > 500 || /[\r\n]|\bBearer\b|api_key=|[^\s]+@[^\s]+/i.test(params.q))) throw new Error('Query must be reviewed public research text, not private data');
    const pricing = manifest.engines?.[params.engine];
    if (!pricing || !Number.isInteger(pricing.maxCost) || pricing.maxCost < 1 || pricing.maxCost > 100 || typeof pricing.source !== 'string' || !pricing.source.trim()) throw new Error('Every engine needs a sourced maximum credit cost');
    if (execute && pricing.confirmed !== true) throw new Error('Confirm engine pricing before execution; do not assume one credit per engine');
    const canonical = Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)));
    const fingerprint = createHash('sha256').update(JSON.stringify([manifest.panel, canonical])).digest('hex');
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    requests.push({ fingerprint, params: canonical, maxCost: pricing.maxCost });
  }
  const maximumCredits = requests.reduce((n, r) => n + r.maxCost, 0);
  if (maximumCredits > manifest.budgetCredits) throw new Error('Manifest maximum cost exceeds stage budget');
  return { requests, maximumCredits, stage: manifest.stage, budgetCredits: manifest.budgetCredits };
}

export async function privateState(directory, root = ROOT) {
  const dir = await realpath(directory);
  const repo = await realpath(root);
  const relative = path.relative(repo, dir);
  if (relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) throw new Error('State directory must be outside repository');
  const info = await stat(dir);
  if (!info.isDirectory() || (info.mode & 0o077)) throw new Error('State directory must exist with private permissions (0700)');
  return dir;
}

async function save(file, data) {
  const temporary = `${file}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  await rename(temporary, file);
}

export async function run(manifest, { execute = false, stateDir, key, fetcher = fetch } = {}) {
  const plan = prepare(manifest, execute);
  if (!execute) return { mode: 'dry-run', ...plan, requests: plan.requests.length, pricingVerified: plan.requests.every(r => manifest.engines[r.params.engine].confirmed === true), networkRequests: 0 };
  if (!key || /[\r\n]/.test(key)) throw new Error('Provide SEARCHAPI_API_KEY in the environment');
  if (!stateDir) throw new Error('Execution requires --state-dir');
  const dir = await privateState(stateDir);
  const lockPath = path.join(dir, 'runner.lock');
  const lock = await open(lockPath, 'wx', 0o600).catch(() => { throw new Error('State locked; inspect prior run before removing its lock'); });
  const ledgerPath = path.join(dir, 'ledger.json');
  try {
    let ledger;
    try { ledger = JSON.parse(await readFile(ledgerPath, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw new Error('Unreadable ledger; stop rather than reset budget'); ledger = { version: 1, entries: [] }; }
    if (ledger.version !== 1 || !Array.isArray(ledger.entries) || ledger.entries.some(e => !Number.isFinite(e.charged) || e.charged < 0 || !(e.stage in STAGE_CAPS))) throw new Error('Invalid ledger');
    if (ledger.entries.some(e => e.status !== 'complete')) throw new Error('Uncertain prior charge: reconcile ledger with account history before continuing');
    const request = async (route, params = {}) => {
      const url = new URL(route, ENDPOINT);
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
      let response;
      try { response = await fetcher(url, { headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(60000) }); }
      catch { throw new Error('Network request failed; no automatic retry'); }
      if (!response.ok) throw new Error(`Provider HTTP ${response.status}; no automatic retry`);
      try { return await response.json(); } catch { throw new Error('Provider returned invalid JSON'); }
    };
    const balance = async () => {
      const credits = (await request('me')).account?.remaining_credits;
      if (!Number.isFinite(credits) || credits < 0) throw new Error('Account balance unavailable');
      return credits;
    };
    let completed = 0;
    let cached = 0;
    for (const item of plan.requests) {
      if (ledger.entries.some(e => e.fingerprint === item.fingerprint)) { cached++; continue; }
      const total = ledger.entries.reduce((n, e) => n + e.charged, 0);
      const stageTotal = ledger.entries.filter(e => e.stage === plan.stage).reduce((n, e) => n + e.charged, 0);
      if (total + item.maxCost > 1000 || stageTotal + item.maxCost > plan.budgetCredits) throw new Error('Persistent credit budget exhausted');
      const before = await balance();
      if (before < item.maxCost) throw new Error('Insufficient account credits');
      const entry = { fingerprint: item.fingerprint, stage: plan.stage, panel: manifest.panel, engine: item.params.engine, charged: item.maxCost, status: 'reserved', startedAt: new Date().toISOString(), balanceBefore: before };
      ledger.entries.push(entry);
      await save(ledgerPath, ledger); // Durable reservation BEFORE any paid call.
      try {
        const result = await request('search', item.params);
        if (result.error || result.search_metadata?.status === 'Error') throw new Error('Provider search error; reserved charge retained');
        await save(path.join(dir, `${item.fingerprint}.json`), redact(result, key));
        const after = await balance();
        entry.balanceAfter = after;
        const observed = before - after;
        // Never refund a reservation on an eventually-consistent balance or concurrent usage.
        entry.charged = Math.max(item.maxCost, observed);
        if (observed > item.maxCost || observed < 0) throw new Error('Unexpected balance change; reconcile engine pricing/account usage before continuing');
        entry.status = 'complete';
        completed++;
        await save(ledgerPath, ledger);
      } catch (error) {
        entry.status = 'uncertain';
        await save(ledgerPath, ledger);
        throw error;
      }
    }
    return { mode: 'execute', completed, cached, reservedOrChargedCredits: ledger.entries.reduce((n, e) => n + e.charged, 0) };
  } finally { await lock.close(); await unlink(lockPath); }
}

async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(['--manifest', '--state-dir', '--execute']);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (!allowed.has(args[i])) throw new Error('Usage: node scripts/seo-searchapi.mjs --manifest FILE [--execute --state-dir PRIVATE_DIRECTORY]');
    if (args[i] === '--execute') options.execute = true;
    else { const flag = args[i]; if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Missing option value'); options[flag] = args[++i]; }
  }
  if (!options['--manifest']) throw new Error('--manifest is required');
  const manifest = JSON.parse(await readFile(options['--manifest'], 'utf8'));
  const result = await run(manifest, { execute: options.execute, stateDir: options['--state-dir'], key: process.env.SEARCHAPI_API_KEY });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(redact(error.message, process.env.SEARCHAPI_API_KEY)); process.exitCode = 1; });
}
