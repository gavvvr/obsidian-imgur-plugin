// @ts-check

import eslint from '@eslint/js'
import perfectionist from 'eslint-plugin-perfectionist'
import * as wdio from 'eslint-plugin-wdio'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const sortImportsSettings = {
  type: 'natural',
  order: 'asc',
  ignoreCase: false,
  newlinesBetween: 1,
  groups: [
    'type',
    'builtin',
    'external',
    'type-internal',
    'value-internal',
    ['type-parent', 'type-sibling', 'type-index'],
    ['parent', 'sibling', 'index'],
    'ts-equals-import',
    'unknown',
  ],
  environment: 'node',
}

export default defineConfig(
  eslint.configs.recommended,
  {
    ...perfectionist.configs['recommended-natural'],
    rules: {
      'perfectionist/sort-imports': ['error', sortImportsSettings],
      'perfectionist/sort-named-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      {
        languageOptions: {
          parserOptions: {
            projectService: true,
            tsconfigDirName: import.meta.dirname,
          },
        },
      },
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['test/e2e/specs/**/*.ts'],
    extends: [wdio.configs['flat/recommended']],
  },
  {
    extends: [eslint.configs.recommended],
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    ignores: ['main.js', 'coverage/', '**/e2e_test_vault/'],
  },
)
