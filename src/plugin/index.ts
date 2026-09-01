import type { ESLint } from 'eslint';
import { forbidComponentProps } from './forbid-component-props.js';

export const smartivePlugin: ESLint.Plugin = {
  meta: { name: '@smartive/eslint-config' },
  rules: {
    'forbid-component-props': forbidComponentProps,
  },
};
