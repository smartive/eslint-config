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

const reactConfig: Linter.Config = { name: '@smartive/eslint-config/react', rules: reactRules };

export const flatConfigTypescript = (rulesOnly = false) =>
  defineConfig([
    js.configs.recommended,
    eslintPluginPrettierRecommended,
    ...(rulesOnly
      ? [
          {
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
    {
      files: ['**/*.js', '**/*.mjs'],
      extends: [tsEslint.configs.disableTypeChecked],
    },
    baseConfig,
  ]);

export const flatConfigReact = () =>
  defineConfig([
    ...flatConfigTypescript(),
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'],
    reactHooks.configs.flat.recommended,
    reactConfig,
  ]);

export const flatConfigNext = () =>
  defineConfig([
    ...createRequire(import.meta.url)('eslint-config-next/core-web-vitals'),
    ...flatConfigTypescript(true),
    reactConfig,
  ]);
