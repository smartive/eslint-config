import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import type { Linter } from 'eslint';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { createRequire } from 'node:module';
import tsEslint from 'typescript-eslint';
import { smartivePlugin } from './plugin/index.js';
import { defaultRules, prettierRules, reactRules, typescriptRules } from './rules.js';

const tsEslintConfigs = [...tsEslint.configs.recommendedTypeChecked, ...tsEslint.configs.stylisticTypeChecked];

const baseConfig: Linter.Config = {
  name: '@smartive/eslint-config/base',
  rules: { ...defaultRules, ...typescriptRules, ...prettierRules },
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2020,
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: true,
    },
  },
};

/**
 * Type-aware rules cannot run on plain JavaScript.
 *
 * This has to come *after* every block that switches such a rule on — `typescriptRules` in
 * `baseConfig` and `reactRules` both do — because in flat config the later block wins. Applied too
 * early, ESLint fails with "You have used a rule which requires type information" on `.js` files.
 */
const jsDisableTypeChecked: Linter.Config = {
  name: '@smartive/eslint-config/js-disable-type-checked',
  files: ['**/*.js', '**/*.mjs'],
  rules: tsEslint.configs.disableTypeChecked.rules as Linter.RulesRecord,
};

/** The same, for the type-aware rules ESLint React contributes. Applied last, for the same reason. */
const jsDisableTypeCheckedReact: Linter.Config = {
  name: '@smartive/eslint-config/js-disable-type-checked-react',
  files: ['**/*.js', '**/*.mjs'],
  rules: eslintReact.configs['disable-type-checked'].rules as Linter.RulesRecord,
};

const reactConfig: Linter.Config = {
  name: '@smartive/eslint-config/react',
  plugins: { smartive: smartivePlugin },
  rules: reactRules,
};

export const flatConfigTypescript = (rulesOnly = false) =>
  defineConfig([
    js.configs.recommended,
    eslintPluginPrettierRecommended,
    ...(rulesOnly
      ? [
          {
            // `eslint-config-next` registers this plugin, but only for `**/*.ts` and `**/*.tsx`. Without
            // registering it here, every `@typescript-eslint/*` rule reference — these, plus the ones in
            // `typescriptRules` and `reactRules` — makes ESLint fail with `Could not find plugin` the
            // moment a `.js` file is linted. Registering it twice is harmless: it is the same instance,
            // since npm dedupes `typescript-eslint` between this package and `eslint-config-next`.
            plugins: { '@typescript-eslint': tsEslint.plugin },
            rules: tsEslintConfigs.reduce(
              (combinedRules, { rules }) => ({ ...combinedRules, ...(rules ? rules : {}) }),
              {} as Linter.RulesRecord,
            ),
          },
        ]
      : [
          importX.flatConfigs.errors,
          importX.flatConfigs.warnings,
          importX.flatConfigs.typescript,
          {
            settings: {
              'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true }), createNodeResolver()],
            },
          },
          ...tsEslint.configs.recommendedTypeChecked,
          ...tsEslint.configs.stylisticTypeChecked,
        ]),
    baseConfig,
    jsDisableTypeChecked,
  ]);

export const flatConfigReact = () =>
  defineConfig([
    ...flatConfigTypescript(),
    eslintReact.configs['recommended-type-checked'],
    reactConfig,
    jsDisableTypeChecked,
    jsDisableTypeCheckedReact,
  ]);

/**
 * Prefixes of every plugin `eslint-config-next` bundles that this config replaces.
 *
 * `jsx-a11y` and `@next/next` are deliberately absent — nothing here replaces those, so their rules stay
 * on. Both declare a peer range ending at ESLint 9 but work on ESLint 10.
 */
const replacedNextRulePrefixes = ['react/', 'react-hooks/', 'import/'];

/**
 * Every rule `eslint-config-next` switches on that comes from a plugin this config replaces, turned off.
 *
 * `eslint-config-next` bundles `eslint-plugin-react`, `eslint-plugin-react-hooks` and
 * `eslint-plugin-import`; ESLint React and `eslint-plugin-import-x` take their place here. Leaving the
 * bundled ones on means duplicate reports, and for `eslint-plugin-react` a hard failure: its peer range
 * ends at `^9.7`, and on ESLint 10 every one of its rules throws while loading, because React version
 * detection calls the `context.getFilename()` API that ESLint 10 removed.
 *
 * Derived from the loaded config rather than hard-coded, so it keeps up with `eslint-config-next`.
 *
 * @see https://github.com/vercel/next.js/issues/89764
 */
const disableReplacedNextRules = (configs: Linter.Config[]): Linter.RulesRecord =>
  Object.fromEntries(
    configs
      .flatMap((nextConfig) => Object.keys(nextConfig.rules ?? {}))
      .filter((rule) => replacedNextRulePrefixes.some((prefix) => rule.startsWith(prefix)))
      .map((rule) => [rule, 'off'] as const),
  );

export const flatConfigNext = () => {
  const nextConfigs = createRequire(import.meta.url)('eslint-config-next/core-web-vitals') as Linter.Config[];

  return defineConfig([
    ...nextConfigs,
    ...flatConfigTypescript(true),
    eslintReact.configs['recommended-type-checked'],
    {
      name: '@smartive/eslint-config/next-compat',
      rules: disableReplacedNextRules(nextConfigs),
      // Belt and braces: `eslint-config-next` sets `react.version: 'detect'`, and the bundled
      // `eslint-plugin-react` implements detection via `context.getFilename()`, which ESLint 10
      // removed. Pinning the version skips that path, so re-enabling one of the rules above in a
      // consuming project degrades to a normal lint result instead of a crash.
      settings: { react: { version: '19.0' } },
    },
    {
      name: '@smartive/eslint-config/next-import-x',
      // `import/no-anonymous-default-export` is the only import rule `eslint-config-next` switches on,
      // and it was just turned off with the rest of `eslint-plugin-import`. Restore it from
      // `eslint-plugin-import-x` so the Next.js rule set keeps the coverage.
      plugins: importX.flatConfigs.errors.plugins,
      rules: { 'import-x/no-anonymous-default-export': 'warn' },
    },
    {
      name: '@smartive/eslint-config/next-js-parser',
      files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
      // `eslint-config-next` parses plain JavaScript with the Babel parser Next.js bundles, and that
      // parser calls `scopeManager.addGlobals()`, which ESLint 10 removed — so linting any `.js` file
      // throws. The typescript-eslint parser handles plain JavaScript including JSX, and is ESLint 10
      // compatible, so it takes over for those files.
      // https://github.com/vercel/next.js/issues/89764
      languageOptions: {
        parser: tsEslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
    },
    reactConfig,
    jsDisableTypeChecked,
    jsDisableTypeCheckedReact,
  ]);
};
