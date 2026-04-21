const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
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
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: { jest: true },
    },
  },
];
