import type { Linter } from 'eslint';
import { flatConfigNext, flatConfigReact, flatConfigTypescript } from './configs.js';

export const config = (type: 'typescript' | 'react' | 'nextjs'): Linter.Config[] => {
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
