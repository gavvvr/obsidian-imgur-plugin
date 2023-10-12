import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'html'],
    },
    reporters: ['default', 'junit'],
    outputFile: 'test-results.xml',
  },
})
