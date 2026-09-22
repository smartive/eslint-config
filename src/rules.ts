import type { Linter } from 'eslint';

export const defaultRules: Linter.RulesRecord = {
  'no-constant-binary-expression': 'error',
  'array-callback-return': 'error',
  'no-debugger': 'error',
  'no-alert': 'error',
  'no-console': ['error', { allow: ['debug', 'info', 'warn', 'error', 'trace', 'time', 'timeEnd'] }],
  'newline-before-return': 'error',
  'prefer-const': 'error',
  'no-else-return': 'error',
  'no-extra-semi': 'error',
  curly: 'error',
  eqeqeq: 'error',
  'default-case-last': 'error',
};

export const typescriptRules: Linter.RulesRecord = {
  '@typescript-eslint/no-unsafe-enum-comparison': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/prefer-regexp-exec': 'off',
  '@typescript-eslint/no-var-requires': 'warn',
  '@typescript-eslint/no-unused-vars': ['error'],
  '@typescript-eslint/no-floating-promises': ['error'],
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
};

export const reactRules: Linter.RulesRecord = {
  '@smartive-eslint/forbid-component-props': ['error', { forbid: ['style', 'className'] }],
  '@stylistic/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never', propElementValues: 'always' }],
  '@stylistic/jsx-self-closing-comp': ['error', { component: true, html: true }],
  '@stylistic/jsx-pascal-case': 'error',
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      checksVoidReturn: {
        attributes: false,
      },
    },
  ],
};

export const prettierRules: Linter.RulesRecord = {
  'prettier/prettier': [
    'error',
    {
      endOfLine: 'auto',
    },
  ],
};
