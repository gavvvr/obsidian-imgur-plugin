import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['lcov', 'html'],
    },
    reporters: ['default', 'junit'],
    outputFile: 'test-results.xml',
  },
})
