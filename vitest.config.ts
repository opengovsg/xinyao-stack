// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup-test-env.ts'],
    include: ['./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    watchExclude: [
      '.*\\/node_modules\\/.*',
      '.*\\/build\\/.*',
      '.*\\/postgres-data\\/.*'
    ]
  }
})
