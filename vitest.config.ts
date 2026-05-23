import { defineConfig } from 'vitest/config'

// Vitest config — kept separate from vite.config.ts so the production build
// doesn't load any test machinery. Tests run in a plain Node environment;
// the SCORM and xAPI runtimes are loaded into a `vm` context with a mocked
// LMS / LRS, so jsdom isn't required.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
    testTimeout: 5000,
  },
})
