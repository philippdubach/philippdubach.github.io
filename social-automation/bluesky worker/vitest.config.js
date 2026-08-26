import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

const RSS_FIXTURE = `<?xml version="1.0"?>
<rss><channel><item>
  <title>Queue Safety Under Ambiguity</title>
  <link>https://philippdubach.com/posts/route-qualified/</link>
  <description>A qualifying post about safe queued social delivery.</description>
  <pubDate>${new Date(Date.now() - 24 * 60 * 60 * 1000).toUTCString()}</pubDate>
  <guid>route-qualified</guid>
</item></channel></rss>`;

const ARTICLE_FIXTURE = `<!doctype html><html><head>
  <meta property="og:title" content="Queue Safety Under Ambiguity">
  <meta property="og:image" content="https://static.philippdubach.com/queue-safety.png">
  <meta property="og:description" content="How durable state prevents duplicate social posts.">
</head><body><article>
  <aside class="key-takeaways"><ul><li>Persist intent before external I/O.</li></ul></aside>
  <p>A durable delivery gate makes retries explicit and preserves ambiguity as terminal state.</p>
</article></body></html>`;

export default defineConfig({
  plugins: [
    cloudflareTest({
      remoteBindings: false,
      main: './src/index.js',
      additionalExports: { PostGate: 'DurableObject' },
      miniflare: {
        compatibilityDate: '2026-08-16',
        bindings: {
          API_SECRET: 'test-api-secret',
          BLUESKY_HANDLE: 'alice.test',
          BLUESKY_APP_PASSWORD: 'test-app-password',
          RSS_URL: 'https://philippdubach.com/posts/index.xml',
          SITE_NAME: 'philippdubach.com',
        },
        kvNamespaces: ['POSTED_STATE'],
        queueProducers: {
          POST_QUEUE: { queueName: 'social-poster-post-jobs' },
        },
        queueConsumers: {
          'social-poster-post-jobs': {
            maxBatchSize: 1,
            maxBatchTimeout: 1,
            maxRetries: 3,
            deadLetterQueue: 'social-poster-post-jobs-dlq',
            // The official pool exposes no Queue broker clock advancement.
            // Compress only broker time so exhaustion/DLQ transfer is testable;
            // handler-level tests separately assert the production 300s retry.
            retryDelay: 0,
          },
          'social-poster-post-jobs-dlq': {
            maxBatchSize: 1,
            maxBatchTimeout: 1,
            maxRetries: 3,
          },
        },
        durableObjects: {
          POST_GATE: { className: 'PostGate', useSQLite: true },
        },
        serviceBindings: { AI: 'test-ai' },
        outboundService: async (request) => {
          const url = new URL(request.url);
          if (url.hostname !== 'philippdubach.com') {
            return new Response('Unexpected content origin', { status: 502 });
          }
          if (url.pathname === '/posts/index.xml') {
            return new Response(RSS_FIXTURE, {
              headers: { 'Content-Type': 'application/rss+xml' },
            });
          }
          if (url.pathname === '/posts/route-qualified/') {
            return new Response(ARTICLE_FIXTURE, {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
          }
          return new Response('Content fixture not found', { status: 404 });
        },
        workers: [{
          name: 'test-ai',
          scriptPath: './test/fixtures/ai.js',
          modules: true,
          compatibilityDate: '2026-08-16',
        }],
      },
    }),
  ],
  test: {
    include: ['test/**/*.test.js'],
  },
});
