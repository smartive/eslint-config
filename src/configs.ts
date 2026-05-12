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
const TS_FILES = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

const baseConfig: Linter.Config = {
  name: '@smartive/eslint-config/base',
  rules: { ...defaultRules, ...prettierRules },
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

const tsBaseConfig: Linter.Config = {
  name: '@smartive/eslint-config/ts-base',
  files: TS_FILES,
  rules: typescriptRules,
};

const reactConfig: Linter.Config = { name: '@smartive/eslint-config/react', files: TS_FILES, rules: reactRules };

export const flatConfigTypescript = (rulesOnly = false) =>
  defineConfig([
    js.configs.recommended,
    eslintPluginPrettierRecommended,
    ...(rulesOnly
      ? [
          {
            name: '@smartive/eslint-config/ts-rules-only',
            files: TS_FILES,
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
    tsBaseConfig,
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
    {
      name: '@smartive/eslint-config/next-ts-plugin',
      plugins: { '@typescript-eslint': tsEslint.plugin },
    },
    ...flatConfigTypescript(true),
    reactConfig,
  ]);
