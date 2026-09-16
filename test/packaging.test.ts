import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

type Manifest = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as Manifest;

/** Every `.js` file the build emits, recursively. */
const emittedFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return emittedFiles(path);
    }

    return entry.name.endsWith('.js') ? [path] : [];
  });

/**
 * Package name of a bare specifier: `@scope/pkg/deep` -> `@scope/pkg`, `pkg/deep` -> `pkg`.
 * Returns undefined for relative specifiers and Node builtins, which need no declaration.
 */
const packageOf = (specifier: string): string | undefined => {
  if (specifier.startsWith('.') || specifier.startsWith('node:')) {
    return undefined;
  }

  const segments = specifier.split('/');

  return specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
};

const importedPackages = (): Set<string> => {
  const found = new Set<string>();

  for (const file of emittedFiles(DIST)) {
    const source = readFileSync(file, 'utf8');

    for (const [, specifier] of source.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
      const pkg = specifier === undefined ? undefined : packageOf(specifier);

      if (pkg !== undefined) {
        found.add(pkg);
      }
    }
  }

  return found;
};

/**
 * Guards the one class of bug the rule-set tests structurally cannot see.
 *
 * `helpers.ts` loads `dist/` from inside this repo, where devDependencies are installed, so every
 * runtime import resolves whether or not it is declared. A consumer only gets `dependencies` and
 * `peerDependencies` — which is how 8.0.0-next.1 shipped importing `@eslint/js` without declaring it,
 * passing the full suite and crashing on load for everyone.
 */
describe('packaging', () => {
  it('declares every package the build imports at runtime', () => {
    const declared = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})]);

    const undeclared = [...importedPackages()].filter((pkg) => !declared.has(pkg)).sort();

    assert.deepEqual(
      undeclared,
      [],
      `dist/ imports these without declaring them, so they are missing for consumers:\n` +
        undeclared
          .map((pkg) => `  ${pkg} (currently: ${manifest.devDependencies?.[pkg] ? 'devDependency' : 'nowhere'})`)
          .join('\n'),
    );
  });

  it('publishes the built entry points', () => {
    const packed = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT, encoding: 'utf8' })) as [
      { files: { path: string }[] },
    ];

    const published = new Set(packed[0]?.files.map(({ path }) => path));

    for (const entry of ['dist/index.js', 'dist/index.d.ts', 'dist/configs.js']) {
      assert.ok(published.has(entry), `expected ${entry} in the published tarball, got:\n  ${[...published].join('\n  ')}`);
    }
  });
});
