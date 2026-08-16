import { parsePostJob } from './post-job.js';

const ERROR_FIELDS = ['code', 'status', 'stage', 'retryAfter'];
const SAFE_ERROR_VALUE = /^[a-zA-Z0-9_.:/-]{1,64}$/;

function isoTimestamp(now) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError('now must be a valid Date');
  }
  return now.toISOString();
}

function cloneJson(value, field) {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError();
    return JSON.parse(serialized);
  } catch {
    throw new TypeError(`${field} must be serializable as JSON`);
  }
}

function errorMetadata(error) {
  const source = error && (typeof error === 'object' || typeof error === 'function')
    ? error
    : {};
  const metadata = {};
  for (const field of ERROR_FIELDS) {
    const value = source[field];
    if (
      (typeof value === 'string' && SAFE_ERROR_VALUE.test(value))
      || (typeof value === 'number' && Number.isFinite(value))
    ) {
      metadata[field] = value;
    }
  }
  return metadata;
}

function isStatus(state, status) {
  return state !== null && typeof state === 'object' && state.status === status;
}

export function createPendingPostState(now) {
  return {
    status: 'pending',
    updatedAt: isoTimestamp(now),
  };
}

export function claimPost(state, job, now) {
  const updatedAt = isoTimestamp(now);
  if (!isStatus(state, 'pending')) {
    return { claimed: false, state };
  }

  return {
    claimed: true,
    state: {
      status: 'attempting',
      job: parsePostJob(job),
      updatedAt,
    },
  };
}

export function markPostPending(state, error, now) {
  const updatedAt = isoTimestamp(now);
  if (!isStatus(state, 'attempting')) return state;
  return {
    status: 'pending',
    job: state.job,
    error: errorMetadata(error),
    updatedAt,
  };
}

export function markPostPublished(state, result, now) {
  const updatedAt = isoTimestamp(now);
  if (!isStatus(state, 'attempting')) return state;
  return {
    status: 'published',
    job: state.job,
    result: cloneJson(result, 'result'),
    updatedAt,
  };
}

export function markPostFailed(state, error, now) {
  const updatedAt = isoTimestamp(now);
  if (!isStatus(state, 'attempting')) return state;
  return {
    status: 'failed',
    job: state.job,
    error: errorMetadata(error),
    updatedAt,
  };
}

export function markPostUncertain(state, error, now) {
  const updatedAt = isoTimestamp(now);
  if (!isStatus(state, 'attempting')) return state;
  return {
    status: 'uncertain',
    job: state.job,
    error: errorMetadata(error),
    updatedAt,
  };
}

export function markPostBackfilled(state, metadata, now) {
  const updatedAt = isoTimestamp(now);
  if (!isStatus(state, 'pending')) return state;
  return {
    status: 'backfilled',
    metadata: cloneJson(metadata, 'metadata'),
    updatedAt,
  };
}

export function classifyPublishError(error) {
  const status = Number(error?.status ?? error?.response?.status);
  const stage = String(error?.stage ?? '').toLowerCase();
  const marker = [error?.name, error?.code, error?.kind, error?.type, error?.message]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (status === 429) return 'retryable';

  if (
    status === 400
    || status === 401
    || status === 403
    || status === 422
    || /auth|unauthori[sz]ed|forbidden|invalid[_ -]?payload|validation/.test(marker)
  ) {
    return 'failed';
  }

  if (
    stage === 'pre-send'
    || stage === 'before-send'
    || error?.requestSent === false
  ) {
    return 'retryable';
  }

  if (
    status === 408
    || status >= 500
    || stage === 'response-parse'
    || stage === 'post-response'
    || /network|fetch failed|abort|timeout|timed out|etimedout|econn|enotfound|eai_again|socket/.test(marker)
  ) {
    return 'uncertain';
  }

  return 'failed';
}
