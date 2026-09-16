import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { config } from '../dist/index.js';
import type { ConfigType } from './helpers.ts';

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
