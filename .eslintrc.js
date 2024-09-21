module.exports = {
  env: {
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [
    {
      env: {
        jest: true,
      },
      files: ['**/*.spec.ts', '**/*.test.ts'],
    },
  ],
  ignorePatterns: ['.eslintrc'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-import-helpers'],
  root: true,
  rules: {
    'arrow-body-style': ['warn', 'as-needed'],
    eqeqeq: ['warn', 'always'],
    'linebreak-style': ['warn', 'unix'],
    'eol-last': ['warn', 'always'],
    'no-restricted-imports': [
      'warn',
      {
        patterns: ['../../../*', '!../*', '!../../*', '!test/**/*'],
      },
    ],
    'no-const-assign': 'warn',
    'no-lone-blocks': 'warn',
    'no-return-await': 'warn',
    'no-trailing-spaces': 'warn',
    'no-throw-literal': 'warn',
    'no-unused-expressions': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'no-useless-catch': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-return': 'warn',
    'no-unneeded-ternary': 'warn',
    'no-unreachable': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    quotes: ['off', 'double'],
    'require-await': 'warn',
    semi: ['warn', 'always'],
    'spaced-comment': ['warn', 'always', { exceptions: ['-', '+'] }],
  },
};
