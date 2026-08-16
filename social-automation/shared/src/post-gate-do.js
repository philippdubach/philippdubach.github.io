import { DurableObject } from 'cloudflare:workers';
import {
  claimPost,
  createPendingPostState,
  markPostBackfilled,
  markPostFailed,
  markPostPending,
  markPostPublished,
  markPostUncertain,
} from './post-gate-state.js';

export class PostGate extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;

    ctx.blockConcurrencyWhile(async () => {
      this.sql.exec(`
        CREATE TABLE IF NOT EXISTS post_gate_state (
          singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
          value TEXT NOT NULL
        )
      `);
      this.sql.exec(
        'INSERT OR IGNORE INTO post_gate_state (singleton, value) VALUES (1, ?)',
        JSON.stringify(createPendingPostState()),
      );
    });
  }

  _readState() {
    const row = this.sql
      .exec('SELECT value FROM post_gate_state WHERE singleton = 1')
      .one();
    return JSON.parse(row.value);
  }

  _writeState(state) {
    this.sql.exec(
      'UPDATE post_gate_state SET value = ? WHERE singleton = 1',
      JSON.stringify(state),
    );
  }

  async claim(job) {
    const result = claimPost(this._readState(), job);
    this._writeState(result.state);
    return result;
  }

  async markPending(error) {
    const state = markPostPending(this._readState(), error);
    this._writeState(state);
    return state;
  }

  async markPublished(result) {
    const state = markPostPublished(this._readState(), result);
    this._writeState(state);
    return state;
  }

  async markFailed(error) {
    const state = markPostFailed(this._readState(), error);
    this._writeState(state);
    return state;
  }

  async markUncertain(error) {
    const state = markPostUncertain(this._readState(), error);
    this._writeState(state);
    return state;
  }

  async markBackfilled(metadata) {
    const state = markPostBackfilled(this._readState(), metadata);
    this._writeState(state);
    return state;
  }

  async getState() {
    return this._readState();
  }
}
