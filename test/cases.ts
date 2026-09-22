import type { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { it } from 'node:test';
import { describeMessages, lint, problemsOnLine, type ConfigType } from './helpers.ts';

const expectProblemOn = (type: ConfigType, fixture: string, line: number, what: string): void => {
  it(what, async () => {
    const messages = await lint(type, fixture);

    assert.ok(
      problemsOnLine(messages, line).length > 0,
      `expected a problem on ${fixture}:${line}, got:\n${describeMessages(messages)}`,
    );
  });
};

/**
 * Reports from `@smartive-eslint/forbid-component-props` on a given line. Matched on the message rather than
 * the rule id, like every other assertion here — the rule is ours, so the wording is ours to keep.
 */
const forbiddenPropReports = (messages: Linter.LintMessage[], line: number): Linter.LintMessage[] =>
  problemsOnLine(messages, line).filter((message) => message.message.includes('forbidden on components'));

const expectClean = (type: ConfigType, fixture: string, what: string): void => {
  it(what, async () => {
    const messages = await lint(type, fixture);

    assert.deepEqual(messages, [], `expected no problems in ${fixture}, got:\n${describeMessages(messages)}`);
  });
};

/**
 * Behaviour every rule set must provide. Each case pins a *problem on a line*, never a rule id, so the
 * assertions survive swapping out the plugin that reports it.
 */
export const runSharedCases = (type: ConfigType): void => {
  expectClean(type, 'clean.ts', 'reports nothing for a clean file');
  expectProblemOn(type, 'default-rules.ts', 2, 'flags console.log');
  expectProblemOn(type, 'default-rules.ts', 4, 'flags loose equality');
  expectProblemOn(type, 'typescript-rules.ts', 1, 'flags explicit any');
  expectProblemOn(type, 'floating-promise.ts', 6, 'flags a floating promise');
  expectProblemOn(type, 'prettier.ts', 2, 'flags a prettier violation');

  // plain JavaScript has to work too: a rule set that only registers its plugins for .ts/.tsx
  // throws "Could not find plugin" the moment a .js file is linted
  expectClean(type, 'clean.mjs', 'reports nothing for a clean .mjs file');
  expectProblemOn(type, 'plain.js', 2, 'flags console.log in a .js file');
  expectProblemOn(type, 'plain.js', 4, 'flags loose equality in a .js file');
};

/**
 * Import resolution, which every rule set must provide.
 *
 * The two halves fail separately, so both are pinned: `unresolved-import.ts` catches a rule set that
 * never switches the resolution rules on, and `alias-import.ts` catches one that switches them on
 * without an `import-x/resolver-next` setting — the built-in fallback resolver does not read
 * `tsconfig.json` `paths`, so it reports every aliased import as unresolvable.
 */
export const runImportCases = (type: ConfigType): void => {
  expectClean(type, 'clean-import.ts', 'resolves an extensionless relative import');
  expectClean(type, 'alias-import.ts', 'resolves a tsconfig `paths` alias');
  expectProblemOn(type, 'unresolved-import.ts', 1, 'flags an unresolvable import');
};

/**
 * Rules that only the `nextjs` rule set provides, because they come from `eslint-config-next`.
 *
 * Asserted by line, not by rule id, so they keep holding if the plugin behind them is swapped — the
 * accessibility rules come from `eslint-plugin-jsx-a11y` and `@next/eslint-plugin-next`, the import
 * rule from `eslint-plugin-import`, and any of those may be replaced.
 */
export const runNextOnlyCases = (type: ConfigType): void => {
  expectProblemOn(type, 'next-plugins.tsx', 4, 'flags an <img> without an alt attribute');
  expectProblemOn(type, 'next-plugins.tsx', 7, 'flags an anonymous default export');
};

/** React/JSX behaviour shared by the `react` and `nextjs` rule sets. */
export const runReactCases = (type: ConfigType): void => {
  expectClean(type, 'clean-component.tsx', 'reports nothing for a clean component');
  expectClean(type, 'display-name.tsx', 'does not require prop types or a display name');
  expectProblemOn(type, 'missing-key.tsx', 9, 'flags a list item without a key');
  expectProblemOn(type, 'rules-of-hooks.tsx', 7, 'flags a conditionally called hook');
  expectProblemOn(type, 'exhaustive-deps.tsx', 8, 'flags a missing effect dependency');

  it('flags forbidden component props as errors', async () => {
    const messages = await lint(type, 'forbidden-component-props.tsx');
    const onJsx = problemsOnLine(messages, 7);

    for (const prop of ['className', 'style']) {
      assert.ok(
        onJsx.some((message) => message.severity === 2 && message.message.includes(prop)),
        `expected an error about "${prop}" on line 7, got:\n${describeMessages(messages)}`,
      );
    }
  });

  it('does not flag forbidden props on intrinsic elements', async () => {
    const messages = await lint(type, 'component-props-edge-cases.tsx');

    assert.deepEqual(
      forbiddenPropReports(messages, 10),
      [],
      `<div className style /> must stay clean — flagging it would be a false positive on every DOM element.\n${describeMessages(messages)}`,
    );
  });

  it('flags forbidden props on member-expression components', async () => {
    const messages = await lint(type, 'component-props-edge-cases.tsx');

    assert.ok(
      forbiddenPropReports(messages, 13).some((message) => message.message.includes('className')),
      `expected an error for <Group.Item className />, got:\n${describeMessages(messages)}`,
    );
  });

  it('ignores spread attributes', async () => {
    const messages = await lint(type, 'component-props-edge-cases.tsx');

    assert.deepEqual(
      forbiddenPropReports(messages, 16),
      [],
      `a spread carries no attribute name to check, got:\n${describeMessages(messages)}`,
    );
  });

  runStylisticJsxCases(type);
};

/**
 * The three `@stylistic` JSX rules, which fill the gap left by `eslint-plugin-react`.
 *
 * Matched on the message rather than the rule id, like everything else here: ESLint Stylistic is one
 * possible source for these checks, not the only conceivable one.
 */
const runStylisticJsxCases = (type: ConfigType): void => {
  const expectMessageOn = (fixture: string, line: number, needle: string, what: string): void => {
    it(what, async () => {
      const messages = await lint(type, fixture);

      assert.ok(
        problemsOnLine(messages, line).some((message) => message.message.includes(needle)),
        `expected a problem mentioning "${needle}" on ${fixture}:${line}, got:\n${describeMessages(messages)}`,
      );
    });
  };

  expectMessageOn('stylistic-jsx.tsx', 10, 'Curly braces are unnecessary', 'flags curly braces around a string prop');
  expectMessageOn('stylistic-jsx.tsx', 13, 'Curly braces are unnecessary', 'flags curly braces around a string child');
  expectMessageOn('stylistic-jsx.tsx', 16, 'self-closing', 'flags a childless component that is not self-closing');
  expectMessageOn('stylistic-jsx.tsx', 19, 'PascalCase', 'flags a component name that is not PascalCase');

  expectClean(type, 'stylistic-jsx-clean.tsx', 'leaves necessary braces, element props and real children alone');
};
