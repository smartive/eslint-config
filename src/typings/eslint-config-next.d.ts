import type { Linter } from 'eslint';

declare module 'eslint-config-next' {
  const plugin: Linter.LegacyConfig;
  export = plugin;
}
