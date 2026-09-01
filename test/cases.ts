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
};

/** Import resolution, which only the `typescript` and `react` rule sets enable. */
export const runImportCases = (type: ConfigType): void => {
  expectClean(type, 'clean-import.ts', 'resolves an extensionless relative import');
  expectProblemOn(type, 'unresolved-import.ts', 1, 'flags an unresolvable import');
};

/** React/JSX behaviour shared by the `react` and `nextjs` rule sets. */
export const runReactCases = (type: ConfigType): void => {
  expectClean(type, 'clean-component.tsx', 'reports nothing for a clean component');
  expectClean(type, 'display-name.tsx', 'does not require prop types or a display name');
  expectProblemOn(type, 'missing-key.tsx', 9, 'flags a list item without a key');
  expectProblemOn(type, 'rules-of-hooks.tsx', 7, 'flags a conditionally called hook');
  expectProblemOn(type, 'exhaustive-deps.tsx', 8, 'flags a missing effect dependency');

  it('flags forbidden component props as warnings', async () => {
    const messages = await lint(type, 'forbidden-component-props.tsx');
    const onJsx = problemsOnLine(messages, 7);

    for (const prop of ['className', 'style']) {
      assert.ok(
        onJsx.some((message) => message.severity === 1 && message.message.includes(prop)),
        `expected a warning about "${prop}" on line 7, got:\n${describeMessages(messages)}`,
      );
    }
  });
};
