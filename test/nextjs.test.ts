import { describe } from 'node:test';
import { runNextOnlyCases, runReactCases, runSharedCases } from './cases.ts';

/**
 * The Next.js rule set layers `eslint-config-next` on top, so it must still provide everything the plain
 * TypeScript and React rule sets do. Import resolution is deliberately not asserted here:
 * `eslint-config-next` only enables `import/no-anonymous-default-export`, not the resolution rules.
 */
describe('config("nextjs")', () => {
  runSharedCases('nextjs');
  runReactCases('nextjs');
  runNextOnlyCases('nextjs');
});
