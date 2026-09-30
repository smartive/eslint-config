import { describe } from 'node:test';
import { runImportCases, runReactCases, runReactOnlyCases, runSharedCases } from './cases.ts';

describe('config("react")', () => {
  runSharedCases('react');
  runImportCases('react');
  runReactCases('react');
  runReactOnlyCases('react');
});
