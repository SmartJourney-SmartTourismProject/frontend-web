import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Mirrors backend/vitest.config.ts's shape (globals: true, one `test`
// block) so the two suites read the same way, adjusted for a browser-like
// environment: jsdom for React component tests, a setup file for
// jest-dom matchers, and the Playwright e2e suite excluded (it runs
// against a live `next dev` server via `npm run test:e2e`, not here).
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    root: './',
    environment: 'jsdom',
    // vitest.setup.ts patches globalThis.localStorage back to jsdom's real
    // implementation - see the comment there for why it's needed.
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
