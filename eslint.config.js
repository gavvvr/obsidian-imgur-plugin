// @ts-check

import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import deprecationPlugin from 'eslint-plugin-deprecation'
import perfectionist from 'eslint-plugin-perfectionist'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const orderedImportSettings = {
  type: 'natural',
  order: 'asc',
  ignoreCase: false,
  newlinesBetween: 'always',
  groups: [
    'type',
    'builtin',
    'external',
    'internal-type',
    'internal',
    ['parent-type', 'sibling-type', 'index-type'],
    ['parent', 'sibling', 'index'],
    'object',
    'unknown',
  ],
  environment: 'node',
}

export default tseslint.config(
  eslint.configs.recommended,
  prettierConfig,
  {
    ...perfectionist.configs['recommended-natural'],
    rules: {
      'perfectionist/sort-imports': ['error', orderedImportSettings],
    },
  },
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
    // extends: [eslint.configs.recommended, prettierConfig],
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    ignores: ['main.js', 'coverage/'],
  },
)
