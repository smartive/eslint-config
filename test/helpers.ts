import { ESLint, type Linter } from 'eslint';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../dist/index.js';

export type ConfigType = Parameters<typeof config>[0];

export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

const linters = new Map<ConfigType, ESLint>();

const linterFor = (type: ConfigType): ESLint => {
  let linter = linters.get(type);

  if (!linter) {
    linter = new ESLint({ cwd: FIXTURES, overrideConfigFile: true, overrideConfig: config(type) });
    linters.set(type, linter);
  }

  return linter;
};

/**
 * Lints a single fixture and returns its messages.
 *
 * Assertions built on this deliberately never look at `ruleId`: the point of these tests is to survive a
 * plugin swap, where the rule reporting a given problem changes its name.
 */
export const lint = async (type: ConfigType, fixture: string): Promise<Linter.LintMessage[]> => {
  const [result] = await linterFor(type).lintFiles([join(FIXTURES, fixture)]);

  return result?.messages ?? [];
};

/** Problems on a given 1-based line, ignoring which rule produced them. */
export const problemsOnLine = (messages: Linter.LintMessage[], line: number): Linter.LintMessage[] =>
  messages.filter((message) => message.line === line);

export const describeMessages = (messages: Linter.LintMessage[]): string =>
  messages
    .map((message) => `  ${message.line}:${message.column} [${message.ruleId ?? 'fatal'}] ${message.message}`)
    .join('\n');
