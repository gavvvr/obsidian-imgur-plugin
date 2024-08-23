// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      {
        languageOptions: {
          parserOptions: {
            project: true,
            tsconfigDirName: import.meta.dirname,
          },
        },
      },
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['main.js', 'coverage/'],
  },
)
