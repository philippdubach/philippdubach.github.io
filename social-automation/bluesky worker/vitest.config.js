import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest({
      remoteBindings: false,
      wrangler: { configPath: './wrangler.toml' },
      miniflare: {
        bindings: {
          API_SECRET: 'test-api-secret',
          BLUESKY_HANDLE: 'alice.test',
          BLUESKY_APP_PASSWORD: 'test-app-password',
        },
      },
    }),
  ],
  test: {
    include: ['test/**/*.test.js'],
  },
});
