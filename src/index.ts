import js from '@eslint/js';
import type { Linter } from 'eslint';
import { flatConfigs as eslintPluginImportConfigs } from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

const reactRules: Linter.RulesRecord = {
  'react/prop-types': 'off',
  'react/display-name': 'off',
  'react/forbid-component-props': ['warn', { forbid: ['style', 'className'] }],
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      checksVoidReturn: {
        attributes: false,
      },
    },
  ],
};

const rules = (react: boolean): Linter.RulesRecord => ({
  '@typescript-eslint/no-unsafe-enum-comparison': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-var-requires': 'warn',
  '@typescript-eslint/no-unused-vars': ['error'],
  '@typescript-eslint/no-floating-promises': ['error'],
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
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
  'prettier/prettier': [
    'error',
    {
      endOfLine: 'auto',
    },
  ],
  ...(react ? reactRules : {}),
});

export const generateLegacyConfig = (react: boolean): Linter.LegacyConfig => ({
  rules: rules(react),
  env: {
    es2020: true,
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    projectService: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    ...(react ? ['plugin:react/recommended', 'plugin:react/jsx-runtime'] : []),
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
});

const flatConfigTypescript = tsEslint.config(
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  eslintPluginImportConfigs.errors,
  eslintPluginImportConfigs.warnings,
  eslintPluginImportConfigs.typescript,
  tsEslint.configs.recommendedTypeChecked,
  tsEslint.configs.stylisticTypeChecked,
  {
    rules: rules(false),
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
  },
);

const flatConfigReact = tsEslint.config(
  flatConfigTypescript,
  reactPlugin.configs.flat!.recommended as unknown as Linter.Config,
  reactPlugin.configs.flat!['jsx-runtime'] as unknown as Linter.Config,
  { rules: reactRules },
);

export const configs = {
  typescript: flatConfigTypescript,
  react: flatConfigReact,
};
