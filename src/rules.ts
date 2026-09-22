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
  '@smartive-eslint/forbid-component-props': ['warn', { forbid: ['style', 'className'] }],
  // The only three JSX rules ESLint Stylistic offers that Prettier does not already own. Every other
  // `@stylistic/jsx-*` rule is either in `eslint-config-prettier`'s conflict list, deprecated upstream,
  // or — in the case of `jsx-function-call-newline` — never fires on Prettier-formatted code.
  //
  // Configuring `jsx-curly-brace-presence` with an object and `propElementValues: 'always'` is what its
  // documentation recommends, the brace-less `prop=<Icon />` form being "obscure, and intentionally
  // undocumented". It also has to be `'always'` here: on `'never'` the fixer rewrites `prop={<Icon />}`
  // to `prop=<Icon />`, Prettier puts the braces straight back, and ESLint reports a circular fix.
  // https://eslint.style/rules/jsx-curly-brace-presence
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
