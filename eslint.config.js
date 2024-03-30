// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import deprecationPlugin from 'eslint-plugin-deprecation'

export default tseslint.config(
  eslint.configs.recommended,
  prettierConfig,
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
      prettierConfig,
    ],
    ...{ plugins: { ['deprecation']: deprecationPlugin } },
    rules: {
      'deprecation/deprecation': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['main.js', 'coverage/'],
  },
)
