import js from '@eslint/js';
import type { Linter } from 'eslint';
import { flatConfigs as eslintPluginImportConfigs } from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { createRequire } from 'node:module';
import tsEslint from 'typescript-eslint';
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

const reactConfig: Linter.Config = { name: '@smartive/eslint-config/react', rules: reactRules };

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
          eslintPluginImportConfigs.errors,
          eslintPluginImportConfigs.warnings,
          eslintPluginImportConfigs.typescript,
          {
            settings: {
              'import/resolver': {
                node: true,
                typescript: {
                  alwaysTryTypes: true,
                },
              },
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
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'],
    reactHooks.configs.flat.recommended,
    reactConfig,
    jsDisableTypeChecked,
  ]);

export const flatConfigNext = () =>
  defineConfig([
    ...createRequire(import.meta.url)('eslint-config-next/core-web-vitals'),
    ...flatConfigTypescript(true),
    reactConfig,
    jsDisableTypeChecked,
  ]);
