module.exports = {
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
  env: {
    es6: true,
    commonjs: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'require-await': 'error',
    'require-yield': 'error',
    'no-return-await': 'error',
    'no-unused-vars': [
      'error',
      {
        args: 'all',
        caughtErrors: 'all',
        ignoreRestSiblings: false,
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        vars: 'all',
      },
    ],
  },
};
