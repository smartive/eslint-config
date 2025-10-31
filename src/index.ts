import type { Config } from '@eslint/config-helpers';
import { flatConfigNext, flatConfigReact, flatConfigTypescript } from './configs.js';

export const config = (type: 'typescript' | 'react' | 'nextjs'): Config[] => {
  switch (type) {
    case 'typescript':
      return flatConfigTypescript();
    case 'react':
      return flatConfigReact();
    case 'nextjs':
      return flatConfigNext();
    default:
      throw new Error(`Unknown config type: ${type}`);
  }
};
