import { describe } from 'node:test';
import { runImportCases, runNextOnlyCases, runReactCases, runSharedCases } from './cases.ts';

/**
 * The Next.js rule set layers `eslint-config-next` on top, so it must still provide everything the plain
 * TypeScript and React rule sets do — import resolution included. `eslint-config-next` itself only
 * enables `import/no-anonymous-default-export`, so the resolution rules and their resolver have to come
 * from this config; leaving them out once meant every `@/…` alias in a consuming project was reported as
 * unresolvable.
 */
describe('config("nextjs")', () => {
  runSharedCases('nextjs');
  runImportCases('nextjs');
  runReactCases('nextjs');
  runNextOnlyCases('nextjs');
});
