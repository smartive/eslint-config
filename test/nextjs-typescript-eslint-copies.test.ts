import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { sep } from 'node:path';
import { describe, it } from 'node:test';
import { describeMessages, lint } from './helpers.ts';

/**
 * A consumer's lockfile can keep one `typescript-eslint` nested under this package and another under
 * `eslint-config-next`. Both then load their own `@typescript-eslint` plugin object, and ESLint rejects the
 * merged config with "Cannot redefine plugin" if both get registered.
 *
 * Dropping them from the CommonJS cache makes `eslint-config-next`, which `flatConfigNext` requires lazily,
 * load a fresh copy while `dist/` keeps the one it imported — the same split, inside this repo. `node --test`
 * runs each file in its own process, so the cache surgery stays in this file.
 */
const { cache } = createRequire(import.meta.url);
const separatePackages = ['typescript-eslint', '@typescript-eslint', 'eslint-config-next'].map(
  (pkg) => `${sep}node_modules${sep}${pkg.replace('/', sep)}${sep}`,
);

for (const path of Object.keys(cache)) {
  if (separatePackages.some((pkg) => path.includes(pkg))) {
    delete cache[path];
  }
}

describe('config("nextjs") with a separate typescript-eslint copy in eslint-config-next', () => {
  it('lints TypeScript without redefining the @typescript-eslint plugin', async () => {
    const messages = await lint('nextjs', 'clean.ts');

    assert.deepEqual(messages, [], `expected no problems in clean.ts, got:\n${describeMessages(messages)}`);
  });
});
