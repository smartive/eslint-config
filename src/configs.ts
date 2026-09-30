import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import type { Linter } from 'eslint';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { createRequire } from 'node:module';
import tsEslint from 'typescript-eslint';
import { smartivePlugin } from './plugin/index.js';
import { a11yRules, defaultRules, nextRules, prettierRules, reactRules, typescriptRules } from './rules.js';

// Resolved through `typescript-eslint`, so it's the same copy as `tsEslint.parser`, wherever npm puts it.
const typescriptEslintParserPath = createRequire(createRequire(import.meta.url).resolve('typescript-eslint')).resolve(
  '@typescript-eslint/parser',
);

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

/**
 * Only the three `@stylistic` JSX rules in `reactRules` are switched on — see the comment there.
 * Registering the plugin also lets a consuming project opt into the rest of it by rule id.
 *
 * The accessibility rules come from `eslint-plugin-jsx-a11y-x`, a fork of `eslint-plugin-jsx-a11y`. The
 * original runs on ESLint 10 too, but its peer range ends at `^9`, so npm refuses to install it next to
 * ESLint 10. Its recommended preset is taken from the plugin rather than copied, so new rules in it reach
 * consuming projects.
 */
const reactConfig: Linter.Config = {
  name: '@smartive/eslint-config/react',
  plugins: { '@smartive-eslint': smartivePlugin, '@stylistic': stylistic, 'jsx-a11y-x': jsxA11y },
  rules: { ...reactRules, ...(jsxA11y.configs.recommended.rules as Linter.RulesRecord), ...a11yRules },
};

/**
 * React projects put JSX in plain `.js` files too, which the typescript-eslint parser only accepts with
 * `ecmaFeatures.jsx`. `.jsx` files need no flag; they are listed so the parser stays the same for all.
 */
const reactJsParserConfig: Linter.Config = {
  name: '@smartive/eslint-config/react-js-parser',
  files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
  languageOptions: {
    parser: tsEslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
};

/**
 * `eslint-plugin-import-x` plus the resolvers its resolution rules need.
 *
 * Every rule set needs both halves. The plugin configs switch the resolution rules on; the
 * `import-x/resolver-next` setting tells them how to resolve. Without the setting the plugin falls back
 * to its built-in resolver, which knows nothing about `tsconfig.json` `paths`, so every aliased import
 * (`@/foo`) is reported as unresolvable.
 *
 * A function, not a constant: `createTypeScriptImportResolver` reads `process.cwd()` when it is called,
 * to find the `tsconfig.json` it resolves `paths` against. Building it at module load would pin the
 * working directory at import time instead of at `config()` time.
 */
const importXConfigs = (): Linter.Config[] => [
  importX.flatConfigs.errors as Linter.Config,
  importX.flatConfigs.warnings as Linter.Config,
  importX.flatConfigs.typescript as Linter.Config,
  {
    name: '@smartive/eslint-config/import-x-resolver',
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true }), createNodeResolver()],
      // The `typescript` preset names `@typescript-eslint/parser` by package, which `import-x` resolves from
      // the project root — so it fails when npm nests the parser instead of hoisting it. An absolute path
      // loads from anywhere, and keeps TypeScript imports parseable from files that use another parser.
      'import-x/parsers': { [typescriptEslintParserPath]: ['.ts', '.tsx', '.cts', '.mts'] },
    },
  },
  {
    name: '@smartive/eslint-config/import-x-overrides',
    rules: {
      'import-x/no-rename-default': 'off',
      'import-x/no-named-as-default': 'off',
    },
  },
];

export const flatConfigTypescript = () =>
  defineConfig([
    js.configs.recommended,
    eslintPluginPrettierRecommended,
    ...importXConfigs(),
    ...tsEslint.configs.recommendedTypeChecked,
    ...tsEslint.configs.stylisticTypeChecked,
    baseConfig,
    jsDisableTypeChecked,
  ]);

export const flatConfigReact = () =>
  defineConfig([
    ...flatConfigTypescript(),
    eslintReact.configs['recommended-type-checked'],
    reactJsParserConfig,
    reactConfig,
    jsDisableTypeChecked,
    jsDisableTypeCheckedReact,
  ]);

/**
 * The `react` rule set plus what only makes sense in a Next.js project.
 *
 * `@next/eslint-plugin-next` is an optional peer dependency, so it is required on demand: importing it at
 * module load would break every other rule set for projects that do not install it.
 */
export const flatConfigNext = () => {
  const nextPlugin = createRequire(import.meta.url)('@next/eslint-plugin-next') as typeof import('@next/eslint-plugin-next');

  return defineConfig([
    ...flatConfigReact(),
    {
      name: '@smartive/eslint-config/next',
      plugins: { '@next/next': nextPlugin },
      // taken from the plugin rather than copied, so it keeps up with new Next.js rules
      rules: { ...nextPlugin.configs['core-web-vitals'].rules, ...nextRules },
    },
    {
      name: '@smartive/eslint-config/next-ignores',
      ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
    },
  ]);
};
