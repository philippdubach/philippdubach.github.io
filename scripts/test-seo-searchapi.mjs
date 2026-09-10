import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, chmod, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepare, privateState, redact, run } from './seo-searchapi.mjs';

const manifest = () => ({ version: 1, stage: 'pilot', panel: 'baseline-test', budgetCredits: 100, engines: { google: { maxCost: 2, confirmed: true, source: 'Fixture pricing, not real provider pricing' } }, requests: [{ params: { engine: 'google', q: 'public research', gl: 'us', hl: 'en' } }] });
async function state(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'seo-searchapi-test-'));
  await chmod(dir, 0o700);
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
function fixture(balances, onSearch = () => ({ organic_results: [] })) {
  const requests = [];
  return { requests, fetcher: async (url, options) => {
    requests.push({ url: String(url), options });
    return { ok: true, json: async () => url.pathname.endsWith('/me') ? { account: { remaining_credits: balances.shift() } } : onSearch() };
  } };
}

test('default is offline dry run even when a key is supplied', async () => {
  const result = await run(manifest(), { key: 'test-secret', fetcher: () => { throw new Error('Must not fetch'); } });
  assert.equal(result.networkRequests, 0);
  assert.equal(result.mode, 'dry-run');
});
test('deduplicates equivalent parameter order within one measurement panel', () => {
  const m = manifest();
  m.requests.push({ params: { hl: 'en', gl: 'us', q: 'public research', engine: 'google' } });
  assert.equal(prepare(m).requests.length, 1);
  assert.equal(prepare(m).maximumCredits, 2);
  const first = prepare(m).requests[0].fingerprint;
  m.panel = 'later-measurement';
  assert.notEqual(prepare(m).requests[0].fingerprint, first);
});
test('pricing confirmation, query hygiene and budget are enforced', () => {
  const m = manifest();
  m.engines.google.confirmed = false;
  assert.throws(() => prepare(m, true), /Confirm engine pricing/);
  m.budgetCredits = 1;
  assert.throws(() => prepare(m), /exceeds/);
  m.budgetCredits = 101;
  assert.throws(() => prepare(m), /budget/);
  m.budgetCredits = 100;
  m.requests[0].params.api_key = 'oops';
  assert.throws(() => prepare(m), /parameter/);
  delete m.requests[0].params.api_key;
  m.requests[0].params.q = 'person@example.org';
  assert.throws(() => prepare(m), /private data/);
});
test('redacts credentials in objects and embedded URLs', () => {
  const result = redact({ api_key: 'hide', Authorization: 'Bearer hide', metadata: { url: 'https://example.org/?api_key=hide', text: 'hide' } }, 'hide');
  assert.equal('api_key' in result, false);
  assert.equal('Authorization' in result, false);
  assert.ok(!JSON.stringify(result).includes('hide'));
});
test('rejects repository state including symlink aliases', async t => {
  await assert.rejects(privateState(process.cwd()), /outside repository/);
  const dir = await state(t);
  const alias = path.join(dir, 'repo');
  await symlink(process.cwd(), alias);
  await assert.rejects(privateState(alias), /outside repository/);
  await chmod(dir, 0o755);
  await assert.rejects(privateState(dir), /private permissions/);
});
test('reserves before search, caches once, and uses Bearer only', async t => {
  const dir = await state(t);
  const f = fixture([100, 98], async () => {
    const ledger = JSON.parse(await readFile(path.join(dir, 'ledger.json')));
    assert.equal(ledger.entries[0].status, 'reserved');
    return { api_key: 'test-secret', organic_results: [] };
  });
  const options = { execute: true, stateDir: dir, key: 'test-secret', fetcher: f.fetcher };
  const result = await run(manifest(), options);
  assert.equal(result.completed, 1);
  assert.equal(result.reservedOrChargedCredits, 2);
  assert.equal((await run(manifest(), options)).cached, 1);
  assert.equal(f.requests.length, 3);
  for (const request of f.requests) {
    assert.equal(request.options.headers.Authorization, 'Bearer test-secret');
    assert.equal(request.options.redirect, 'error');
    assert.ok(!request.url.includes('test-secret'));
  }
});
test('failed search remains charged and cannot silently retry', async t => {
  const dir = await state(t);
  const f = fixture([100], () => { throw new Error('Network broke'); });
  const options = { execute: true, stateDir: dir, key: 'test-secret', fetcher: f.fetcher };
  await assert.rejects(run(manifest(), options));
  const ledger = JSON.parse(await readFile(path.join(dir, 'ledger.json')));
  assert.equal(ledger.entries[0].charged, 2);
  assert.equal(ledger.entries[0].status, 'uncertain');
  await assert.rejects(run(manifest(), options), /Uncertain prior charge/);
  assert.equal(f.requests.length, 2);
});
test('unexpected credit charge stops following requests and records actual difference', async t => {
  const dir = await state(t);
  const m = manifest();
  m.requests.push({ params: { engine: 'google', q: 'second public query' } });
  const f = fixture([100, 95]);
  await assert.rejects(run(m, { execute: true, stateDir: dir, key: 'test-secret', fetcher: f.fetcher }), /Unexpected balance/);
  const ledger = JSON.parse(await readFile(path.join(dir, 'ledger.json')));
  assert.equal(ledger.entries.length, 1);
  assert.equal(ledger.entries[0].charged, 5);
  assert.equal(f.requests.length, 3);
});
test('persisted stage budget prevents spending across fresh manifests', async t => {
  const dir = await state(t);
  const m = manifest();
  m.budgetCredits = 2;
  const f = fixture([100, 98]);
  const options = { execute: true, stateDir: dir, key: 'test-secret', fetcher: f.fetcher };
  await run(m, options);
  m.panel = 'second-panel';
  await assert.rejects(run(m, options), /budget exhausted/);
  assert.equal(f.requests.length, 3);
});
test('total 1000-credit cap stops before any network request', async t => {
  const dir = await state(t);
  await writeFile(path.join(dir, 'ledger.json'), JSON.stringify({ version: 1, entries: [
    { stage: 'articles', status: 'complete', charged: 1000, fingerprint: 'prior-credit-reservations' },
  ] }), { mode: 0o600 });
  await assert.rejects(run(manifest(), { execute: true, stateDir: dir, key: 'test-secret', fetcher: () => { throw new Error('Must not fetch'); } }), /budget exhausted/);
});
