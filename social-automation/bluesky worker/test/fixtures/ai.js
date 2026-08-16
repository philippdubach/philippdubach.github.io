import { WorkerEntrypoint } from 'cloudflare:workers';

const ACCEPTED = {
  post: 'Queue-backed delivery forces an uncomfortable tradeoff: ambiguity must stop retries even when publication cannot be confirmed.',
  angle: 'tension',
  anchored_on: 'the delivery ambiguity boundary',
  opener_words: ['Queue-backed', 'delivery', 'forces', 'an', 'uncomfortable'],
};

const REJECTED = {
  post: 'Too short to survive scoring.',
  angle: 'observation',
  anchored_on: 'a generic summary',
  opener_words: ['Too', 'short', 'to', 'survive', 'scoring'],
};

export default class AiFixture extends WorkerEntrypoint {
  async run(model) {
    return {
      response: JSON.stringify(model.includes('120b') ? ACCEPTED : REJECTED),
    };
  }
}
