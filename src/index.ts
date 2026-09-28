import type { Linter } from 'eslint';
import { flatConfigNext, flatConfigReact, flatConfigTypescript, silenceWarnings } from './configs.js';

export type ConfigType = 'typescript' | 'react' | 'nextjs';

export type ConfigOptions = {
  /**
   * Whether to keep the rules the rule set reports as warnings. Defaults to `true`.
   *
   * `false` switches every rule that would report a warning off, whichever plugin contributes it, and
   * leaves the errors untouched. Useful where a warning is noise rather than a signal — a CI job that
   * only gates on errors, or a large codebase adopting this config gradually.
   *
   * This is about severity, not about which rules exist: re-enable any of them in a later block of your
   * own configuration and it applies as usual, since the last assignment of a rule wins.
   */
  readonly warnings?: boolean;
};

export const config = (type: ConfigType, { warnings = true }: ConfigOptions = {}): Linter.Config[] => {
  const configs = ((): Linter.Config[] => {
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
  })();

  return warnings ? configs : [...configs, silenceWarnings(configs)];
};
