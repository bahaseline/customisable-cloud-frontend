const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^(next|_)' }],
      'no-console': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
    },
  },
  {
    // Tests use the node:test runner and run against a live database.
    files: ['test/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
];
