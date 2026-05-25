import { BANNED_OPENERS, BANNED_WORDS } from './prompt.js';

const URL_RE = /https?:\/\/\S+/;
const EM_DASH_RE = /—/;
const HASHTAG_RE = /(?:^|\s)#\w+/;
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function firstNWords(text, n) {
  return (text || '').trim().split(/\s+/).slice(0, n).join(' ').toLowerCase();
}

function wordNgrams(text, n) {
  const words = (text || '').toLowerCase().split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + n <= words.length; i++) out.add(words.slice(i, i + n).join(' '));
  return out;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let intersect = 0;
  for (const x of a) if (b.has(x)) intersect++;
  return intersect / (a.size + b.size - intersect);
}

export function scoreCandidate(candidate, recentPosts, { maxLength }) {
  const reasons = [];
  const post = candidate?.post || '';
  const lower = post.toLowerCase();

  if (post.length > maxLength) reasons.push(`length > ${maxLength}`);
  if (post.length < 80) reasons.push(`length < 80`);

  for (const word of BANNED_WORDS) {
    const re = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (re.test(post)) { reasons.push(`banned word "${word}"`); break; }
  }

  for (const opener of BANNED_OPENERS) {
    if (lower.startsWith(opener.toLowerCase())) { reasons.push(`banned opener "${opener}"`); break; }
  }

  if (URL_RE.test(post)) reasons.push('contains URL');
  if (EM_DASH_RE.test(post)) reasons.push('contains em dash');
  if (HASHTAG_RE.test(post)) reasons.push('contains hashtag');
  if (EMOJI_RE.test(post)) reasons.push('contains emoji');

  const first5 = firstNWords(post, 5);
  for (const r of recentPosts) {
    if (first5 && firstNWords(r.message, 5) === first5) {
      reasons.push('first-5-words match recent post');
      break;
    }
  }

  const candNgrams = wordNgrams(post, 5);
  for (const r of recentPosts) {
    const recNgrams = wordNgrams(r.message, 5);
    if (jaccard(candNgrams, recNgrams) > 0.4) {
      reasons.push('5-gram Jaccard > 0.4 vs recent post');
      break;
    }
  }

  if (reasons.length > 0) return { score: 0, reasons };

  let score = 50;
  if (/\d/.test(post)) score += 20;
  const last3Angles = recentPosts.slice(0, 3).map(r => r.angle);
  if (candidate.angle && !last3Angles.includes(candidate.angle)) score += 10;
  if (Math.abs(post.length - (maxLength - 10)) <= 20) score += 10;
  const sentenceCount = (post.match(/[.!?]+/g) || []).length;
  if (sentenceCount > 2) score -= 5 * (sentenceCount - 2);

  return { score, reasons: [] };
}

export function pick(candidates, recentPosts, { maxLength }) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const scored = candidates.map(c => ({ candidate: c, ...scoreCandidate(c, recentPosts, { maxLength }) }));
  const survivors = scored.filter(s => s.score > 0);
  if (survivors.length === 0) {
    console.log('[reject-both]', scored.map(s => s.reasons).flat());
    return null;
  }
  survivors.sort((a, b) => b.score - a.score);
  const winner = survivors[0];
  return {
    message: winner.candidate.post,
    angle: winner.candidate.angle,
    anchored_on: winner.candidate.anchored_on,
    score: winner.score,
    candidates_considered: candidates.length,
  };
}
