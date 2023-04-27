const airbnb = require('eslint-config-airbnb-typescript/lib/shared')

const airbnbNoExtraDepsRule = airbnb.rules['import/no-extraneous-dependencies']
airbnbNoExtraDepsRule[1].devDependencies.push('vitest.config.ts')

module.exports = {
  root: true,
  extends: ['airbnb-base', 'prettier'],

  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-extraneous-dependencies': airbnbNoExtraDepsRule,
      },
    },
    {
      files: ['.eslintrc.js', 'esbuild.config.mjs'],
      env: {
        node: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: ['.eslintrc.js', 'esbuild.config.mjs'] },
        ],
      },
    },
  ],
}
