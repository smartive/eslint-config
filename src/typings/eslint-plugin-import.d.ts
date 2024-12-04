import type { ESLint, Linter, Rule } from 'eslint';

declare module 'eslint-plugin-import' {
  export = plugin;
}

const plugin: ESLint.Plugin & {
  meta: {
    name: string;
    version: string;
  };
  configs: {
    recommended: Linter.LegacyConfig;
    errors: Linter.LegacyConfig;
    warnings: Linter.LegacyConfig;
    'stage-0': Linter.LegacyConfig;
    react: Linter.LegacyConfig;
    'react-native': Linter.LegacyConfig;
    electron: Linter.LegacyConfig;
    typescript: Linter.LegacyConfig;
  };
  flatConfigs: {
    recommended: Linter.FlatConfig;
    errors: Linter.FlatConfig;
    warnings: Linter.FlatConfig;
    'stage-0': Linter.FlatConfig;
    react: Linter.FlatConfig;
    'react-native': Linter.FlatConfig;
    electron: Linter.FlatConfig;
    typescript: Linter.FlatConfig;
  };
  rules: {
    [key: string]: Rule.RuleModule;
  };
};
