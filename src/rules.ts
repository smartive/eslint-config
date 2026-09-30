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
  // an anonymous default component has no name in devtools, and Fast Refresh cannot preserve its state
  'import-x/no-anonymous-default-export': 'warn',
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      checksVoidReturn: {
        attributes: false,
      },
    },
  ],
};

/**
 * On top of `eslint-plugin-jsx-a11y-x`'s recommended preset, which switches on every rule below as `error`
 * unless it is listed here.
 */
export const a11yRules: Linter.RulesRecord = {
  // the rules `eslint-config-next` switches on (as `warn`); the preset has them too, but listing them keeps
  // them on whatever the preset does
  'jsx-a11y-x/alt-text': 'error',
  'jsx-a11y-x/aria-props': 'error',
  'jsx-a11y-x/aria-proptypes': 'error',
  'jsx-a11y-x/aria-unsupported-elements': 'error',
  'jsx-a11y-x/role-has-required-aria-props': 'error',
  'jsx-a11y-x/role-supports-aria-props': 'error',

  'jsx-a11y-x/no-aria-hidden-on-focusable': 'warn',
  'jsx-a11y-x/prefer-tag-over-role': 'warn',
  'jsx-a11y-x/lang': 'error',

  'jsx-a11y-x/anchor-is-valid': 'off',
  'jsx-a11y-x/no-static-element-interactions': 'off',
  'jsx-a11y-x/click-events-have-key-events': 'off',
  'jsx-a11y-x/no-noninteractive-element-interactions': 'off',
  'jsx-a11y-x/no-noninteractive-tabindex': 'off',
  'jsx-a11y-x/media-has-caption': 'off',
  'jsx-a11y-x/label-has-associated-control': 'off',
  'jsx-a11y-x/no-autofocus': 'off',
  'jsx-a11y-x/img-redundant-alt': 'off',
  'jsx-a11y-x/iframe-has-title': 'off',
  'jsx-a11y-x/no-distracting-elements': 'off',
  'jsx-a11y-x/mouse-events-have-key-events': 'off',

  'jsx-a11y-x/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
};

/** On top of `@next/eslint-plugin-next`'s `core-web-vitals` preset and `a11yRules`. */
export const nextRules: Linter.RulesRecord = {
  // `next/image`'s <Image> renders an <img>, so it needs alt text the same way. ESLint merges this with
  // the rule's default options, so `<img>`, `<object>`, `<area>` and `<input type="image">` stay covered.
  'jsx-a11y-x/alt-text': ['error', { img: ['Image'] }],
};

export const prettierRules: Linter.RulesRecord = {
  'prettier/prettier': [
    'error',
    {
      endOfLine: 'auto',
    },
  ],
};
