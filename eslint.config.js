import vasek from './src/index.js';

export default vasek(
  {
    ignores: [
      'tests/fixtures/**',
      'examples/**',
      'node_modules/**',
    ],
  },
  {
    name: 'vasek/self-config',
    files: ['src/**/*.js', 'eslint.config.js'],
    rules: {
      'no-magic-numbers': 'off',
    },
  },
  {
    name: 'vasek/self-tests',
    files: ['tests/**/*.js'],
    rules: {
      'test/no-import-node-test': 'off',
    },
  },
);
