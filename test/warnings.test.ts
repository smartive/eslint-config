import type { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { config } from '../dist/index.js';
import { describeMessages, lintWith, problemsOnLine, type ConfigType } from './helpers.ts';

const TYPES: ConfigType[] = ['typescript', 'react', 'nextjs'];

type Severity = 'off' | 'warn' | 'error';

const severityOf = (entry: Linter.RuleEntry | undefined): Severity => {
  const severity = Array.isArray(entry) ? entry[0] : entry;

  if (severity === 1 || severity === 'warn') {
    return 'warn';
  }

  return severity === 2 || severity === 'error' ? 'error' : 'off';
};

/** The severity each rule ends up with, i.e. its last assignment across the whole configuration. */
const effectiveSeverities = (configs: Linter.Config[]): Map<string, Severity> =>
  new Map(
    [...new Map(configs.flatMap((c) => Object.entries(c.rules ?? {})))].map(([rule, entry]) => [rule, severityOf(entry)]),
  );

const rulesWith = (configs: Linter.Config[], severity: Severity): string[] =>
  [...effectiveSeverities(configs)]
    .filter(([, actual]) => actual === severity)
    .map(([rule]) => rule)
    .sort();

describe('config(type, { warnings: false })', () => {
  for (const type of TYPES) {
    describe(type, () => {
      it('leaves no rule at warn severity', () => {
        const remaining = rulesWith(config(type, { warnings: false }), 'warn');

        assert.deepEqual(remaining, [], `expected every warning to be off, still warning:\n  ${remaining.join('\n  ')}`);
      });

      it('keeps every error', () => {
        const before = rulesWith(config(type), 'error');
        const after = rulesWith(config(type, { warnings: false }), 'error');

        assert.deepEqual(after, before, 'switching warnings off must not change which rules report errors');
      });

      it('still warns by default', () => {
        // guards against the opposite defect: silencing warnings for everyone, not just opted-in callers
        assert.ok(rulesWith(config(type), 'warn').length > 0, `${type} is expected to warn about something`);
      });

      /**
       * Switching a warning off globally also switches it off inside a `files`-scoped block. That is only
       * correct while no rule is a warning in one scope and an error in another — a property of the
       * upstream configs, which can change under us, so it is pinned rather than assumed.
       */
      it('has no rule that is a warning in one scope and an error in another', () => {
        const assigned = new Map<string, Set<Severity>>();

        for (const c of config(type)) {
          for (const [rule, entry] of Object.entries(c.rules ?? {})) {
            const severities = assigned.get(rule) ?? new Set<Severity>();

            severities.add(severityOf(entry));
            assigned.set(rule, severities);
          }
        }

        const effective = effectiveSeverities(config(type));
        const conflicting = [...assigned]
          .filter(([rule, severities]) => effective.get(rule) === 'warn' && severities.has('error'))
          .map(([rule]) => rule);

        assert.deepEqual(conflicting, [], 'these rules would lose their error when warnings are switched off');
      });
    });
  }

  it('reports the warnings in a fixture by default, and none of them when switched off', async () => {
    // every problem next-plugins.tsx produces is a warning: two from eslint-config-next's own plugins,
    // one from import-x
    const withWarnings = await lintWith('nextjs', {}, 'next-plugins.tsx');

    assert.ok(
      withWarnings.length > 0 && withWarnings.every((message) => message.severity === 1),
      `expected only warnings, got:\n${describeMessages(withWarnings)}`,
    );

    const without = await lintWith('nextjs', { warnings: false }, 'next-plugins.tsx');

    assert.deepEqual(without, [], `expected the warnings to be gone, got:\n${describeMessages(without)}`);
  });

  it('still reports errors when warnings are switched off', async () => {
    const messages = await lintWith('typescript', { warnings: false }, 'typescript-rules.ts');

    assert.ok(
      problemsOnLine(messages, 1).some((message) => message.severity === 2),
      `expected the explicit-any error to survive, got:\n${describeMessages(messages)}`,
    );
  });
});
