# @smartive/eslint-config

This package provides smartive's default [eslint](https://eslint.org/) configuration.

## Installation

```sh
$ npm install eslint @smartive/eslint-config -D
```

Requires **ESLint 10.0.0 or newer** — see [ESLint 10 is required](#eslint-10-is-required).

## Usage

This package offers three different rule sets, one for plain TypeScript applications, a separate one for React applications and one that works well with Next.js applications (minimum supported version is Next.js v16).

### Flat Config (`eslint.config.mjs`)

```javascript
import { config } from '@smartive/eslint-config'

// For plain TS applications ..
export default config('typescript');

// .. or React applications
export default config('react');

// .. or Next.js applications
// make sure to add `eslint-config-next@16`
// to your devDependencies
export default config('nextjs');
```

### NPM scripts

To use eslint add the following to your package.json:

```json
"scripts": {
  "lint": "eslint {your source directory}",
  "lint:fix": "eslint {your source directory} --fix"
}
```

## Included plugins

- [`typescript-eslint`](https://typescript-eslint.io/)
- [`eslint-plugin-import-x`](https://github.com/un-ts/eslint-plugin-import-x) (`typescript` and `react` rule sets)
- [`@eslint-react/eslint-plugin`](https://eslint-react.xyz/) (`react` and `nextjs` rule sets)
- [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier)

`eslint-plugin-react`, `eslint-plugin-react-hooks` and `eslint-plugin-import` are no longer used.

### ESLint 10 is required

`@eslint-react/eslint-plugin` dropped ESLint 9 in its v3.0.0, which declares a `^10.0.0` peer range. Note
that its `peerDependencies` say `eslint: "*"`, so npm will not warn you about an older ESLint — it will
simply misbehave at some point.

### `eslint-config-next` and ESLint 10

`eslint-config-next` bundles `eslint-plugin-react`, which supports ESLint 9 at most — its peer range ends
at `^9.7`, and on ESLint 10 every one of its rules throws while loading, because React version detection
uses the `context.getFilename()` API that ESLint 10 removed. The same config parses plain JavaScript with
the Babel parser Next.js bundles, and that parser calls `scopeManager.addGlobals()`, also removed in
ESLint 10, so linting any `.js` file throws as well
([vercel/next.js#89764](https://github.com/vercel/next.js/issues/89764), still open — there is no fix in
`eslint-config-next@canary` either).

The `nextjs` rule set therefore:

- turns off every rule `eslint-config-next` enables that comes from a plugin replaced here —
  `eslint-plugin-react` (38 rules), `eslint-plugin-react-hooks` (16) and `eslint-plugin-import` (1). The
  list is derived from the loaded config rather than hard-coded, so it tracks upstream changes.
- restores the one import rule from `eslint-plugin-import-x`, so no coverage is lost.
- pins `settings.react.version`, so re-enabling any of those rules in a consuming project degrades to a
  normal lint result instead of a crash.
- parses `.js`, `.jsx` and `.mjs` with the typescript-eslint parser instead of the Babel one.

`jsx-a11y` (6 rules) and `@next/next` (22 rules) are left untouched — nothing here replaces them. Both
declare peer ranges ending at ESLint 9, but both work on ESLint 10.

ESLint React covers most of what is turned off. What is genuinely lost:

| Rule                                                                                                                      | Replacement                                                       |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `import/no-anonymous-default-export`                                                                                      | `import-x/no-anonymous-default-export`, enabled in its place      |
| `react/jsx-no-duplicate-props`                                                                                            | TypeScript reports this as `TS17001`                              |
| `react/jsx-uses-react`, `react/jsx-uses-vars`, `react/jsx-no-undef`                                                       | redundant — ESLint 10 tracks JSX references natively              |
| `react/no-is-mounted`, `react/require-render-return`                                                                      | class-component patterns, not relevant to modern React            |
| `react-hooks/config`, `react-hooks/gating`, `react-hooks/incompatible-library`, `react-hooks/preserve-manual-memoization` | none — ESLint React does not implement these React Compiler rules |
| `react/no-unescaped-entities`                                                                                             | none                                                              |

## Upgrading from v8

The plugin namespace for this package's own rules changed from `smartive` to `@smartive-eslint`, so
`smartive/forbid-component-props` is now `@smartive-eslint/forbid-component-props`. Nothing about the
rule's behaviour or options changed. The shipped rule sets are updated; what needs changing is every
mention of the old id in consuming projects:

```sh
$ grep -rn 'smartive/forbid-component-props' --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' .
```

How each kind of mention fails is worth knowing, because only two of the three are loud:

| Mention                                                       | What happens on v9                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `'smartive/forbid-component-props': ['warn', …]` in a config  | ESLint refuses to start: `Could not find plugin "smartive" in configuration`                                 |
| `// eslint-disable-next-line smartive/forbid-component-props` | `Definition for rule 'smartive/forbid-component-props' was not found`, and the suppressed warning comes back |
| `'smartive/forbid-component-props': 'off'` in a config        | **silently ignored** — the rule stays on at its default `warn`                                               |

The third is the one to search for: turning a rule off under a namespace that no longer exists is not
an error, so the override simply stops taking effect.

## Upgrading from v7

Expect new errors on code that passed before. ESLint React's `recommended-type-checked` preset is
considerably broader than the `eslint-plugin-react` set it replaces, so upgrading turns on **44 checks
that had no predecessor** — 14 as `error`, 30 as `warn`. These are new findings in unchanged code, not
regressions.

The 14 that fail a build:

| Rule                                                  | Catches                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| `@eslint-react/no-leaked-conditional-rendering`       | `{count && <Foo />}` rendering `0`, or crashing on a non-node |
| `@eslint-react/no-nested-component-definitions`       | components declared inside other components                   |
| `@eslint-react/no-nested-lazy-component-declarations` | `lazy()` called inside a component                            |
| `@eslint-react/jsx-no-key-after-spread`               | `key` placed after `{...props}`                               |
| `@eslint-react/jsx-no-namespace`                      | namespaced JSX names                                          |
| `@eslint-react/jsx-no-children-prop-with-children`    | `children` passed both as prop and as JSX children            |
| `@eslint-react/dom-no-void-elements-with-children`    | children on `<img>`, `<br>` and friends                       |
| `@eslint-react/dom-no-flush-sync`                     | `flushSync`, which forces a synchronous re-render             |
| `@eslint-react/dom-no-use-form-state`                 | the removed `useFormState`                                    |
| `@eslint-react/no-access-state-in-setstate`           | reading `this.state` inside `setState`                        |
| `@eslint-react/rsc-function-definition`               | invalid server-component function forms                       |
| `no-unassigned-vars`                                  | declared, never assigned, still read                          |
| `no-useless-assignment`                               | a value overwritten before it is read                         |
| `preserve-caught-error`                               | rethrowing without passing `cause`                            |

The last three are core ESLint rules, new to `js.configs.recommended` in `@eslint/js` v10.

The 30 warnings cluster into a few families: effect-cleanup leaks
(`@eslint-react/web-api-no-leaked-timeout`, `-interval`, `-event-listener`, `-fetch`, and the two
observer rules), React 19 deprecations (`no-forward-ref`, `no-context-provider`, `no-use-context`,
`no-clone-element`, the `no-children-*` set), naming conventions (`naming-convention-context-name`,
`-id-name`, `-ref-name`) and `@eslint-react/no-array-index-key`.

Rule ids also changed, so existing suppressions stop working — silently, since an `eslint-disable`
naming an unknown rule is simply inert. Anything mentioning `react/*`, `react-hooks/*` or `import/*`
needs rewriting to `@eslint-react/*`, `import-x/*` or `@smartive-eslint/*`.

## Custom rules

### `@smartive-eslint/forbid-component-props`

Forbids the given props on components (`<Foo />`, `<Foo.Bar />`) while leaving intrinsic elements
(`<div />`) alone. It replaces `react/forbid-component-props`, which has no equivalent in ESLint React.
Enabled in the `react` and `nextjs` rule sets as:

```javascript
'@smartive-eslint/forbid-component-props': ['warn', { forbid: ['style', 'className'] }]
```

Each entry in `forbid` is either a prop name or an object that narrows where the prop stays allowed:

| Key                  | Meaning                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `propName`           | The forbidden prop (required).                                                           |
| `allowedFor`         | Component names the prop is still allowed on, matched exactly.                           |
| `allowedForPatterns` | Globs (`*` for any run of characters, `?` for one) the component name may match instead. |
| `message`            | Replaces the default report message.                                                     |

Component names are matched on their full JSX name, so `<Mantine.Button />` matches `Mantine.*`.

```javascript
'@smartive-eslint/forbid-component-props': [
  'error',
  {
    forbid: [
      {
        propName: 'className',
        allowedFor: ['NextImage', 'NextLink'],
        allowedForPatterns: ['*Icon', 'Mantine*'],
        message: 'Avoid using className except NextImage, NextLink, icons and Mantine components',
      },
    ],
  },
]
```

## Development

```sh
$ npm run check-types  # type-check the config sources
$ npm run prettier     # formatting
$ npm test             # build, type-check the tests, then run them
```

The tests in `test/` lint the fixtures in `test/fixtures/` with each of the three rule sets and assert that
a given fixture line is flagged. They deliberately never assert on rule ids, so that swapping out a plugin
for an equivalent one does not require rewriting them.

> `npm test` runs the TypeScript test files directly through Node's type stripping, which needs Node
> 22.18 or newer.
