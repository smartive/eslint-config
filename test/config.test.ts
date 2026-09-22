import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { config } from '../dist/index.js';
import { describeMessages, lint, type ConfigType } from './helpers.ts';

describe('config()', () => {
  for (const type of ['typescript', 'react', 'nextjs'] satisfies ConfigType[]) {
    it(`returns a non-empty flat config array for "${type}"`, () => {
      const result = config(type);

      assert.ok(Array.isArray(result), 'expected an array');
      assert.ok(result.length > 0, 'expected at least one config object');
    });
  }

  it('throws on an unknown type', () => {
    assert.throws(() => config('svelte' as ConfigType), /Unknown config type: svelte/);
  });
});

/**
 * The one place a rule id is asserted on purpose.
 *
 * Everywhere else the suite matches on messages, so that swapping the plugin behind a check does not
 * break the tests. This rule is ours, and its id is public API: consumers name it in `eslint-disable`
 * comments and when re-configuring it. Renaming the namespace is therefore a breaking change, and this
 * pins which namespace is shipped.
 */
describe('custom rule namespace', () => {
  for (const type of ['react', 'nextjs'] satisfies ConfigType[]) {
    it(`reports the forbidden-prop rule as "@smartive-eslint/..." in "${type}"`, async () => {
      const messages = await lint(type, 'forbidden-component-props.tsx');

      const ruleIds = [
        ...new Set(
          messages.filter((message) => message.message.includes('forbidden on components')).map((message) => message.ruleId),
        ),
      ];

      assert.deepEqual(
        ruleIds,
        ['@smartive-eslint/forbid-component-props'],
        `expected the rule to report under the "@smartive-eslint" namespace, got:\n${describeMessages(messages)}`,
      );
    });
  }
});
