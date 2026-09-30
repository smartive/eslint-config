import { describe } from 'node:test';
import { runImportCases, runNextOnlyCases, runReactCases, runSharedCases } from './cases.ts';

/** The Next.js rule set is the React one plus the Next.js-specific parts, so it runs both sets of cases. */
describe('config("nextjs")', () => {
  runSharedCases('nextjs');
  runImportCases('nextjs');
  runReactCases('nextjs');
  runNextOnlyCases('nextjs');
});
