import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['lcov', 'html'],
    },
    reporters: ['default', 'junit'],
    outputFile: 'test-results.xml',
  },
})
