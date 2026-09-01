import { describe } from 'node:test';
import { runImportCases, runSharedCases } from './cases.ts';

describe('config("typescript")', () => {
  runSharedCases('typescript');
  runImportCases('typescript');
});
