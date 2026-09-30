import type { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { it } from 'node:test';
import { describeMessages, isIgnored, lint, problemsOnLine, type ConfigType } from './helpers.ts';

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

const SEVERITY = { warn: 1, error: 2 } as const;

/** Like `expectProblemOn`, but also pins how severe the problem is. */
const expectSeverityOn = (
  type: ConfigType,
  fixture: string,
  line: number,
  severity: keyof typeof SEVERITY,
  what: string,
): void => {
  it(what, async () => {
    const messages = await lint(type, fixture);

    assert.ok(
      problemsOnLine(messages, line).some((message) => message.severity === SEVERITY[severity]),
      `expected a ${severity} on ${fixture}:${line}, got:\n${describeMessages(messages)}`,
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

  // `import-x/no-rename-default` and `import-x/no-named-as-default` are deliberately off — both come
  // from `flatConfigs.warnings`, so an upstream change to that preset is the thing most likely to switch
  // them back on without anyone noticing here
  expectClean(type, 'renamed-default.ts', 'does not flag a renamed default import');
  expectClean(type, 'named-as-default.ts', 'does not flag a default import named after a named export');
};

/**
 * What only the `nextjs` rule set adds on top of `react`: the `@next/next` rules, `next/image`'s
 * `<Image>` counted as an image, and the ignores for Next.js build output.
 */
export const runNextOnlyCases = (type: ConfigType): void => {
  // `core-web-vitals` raises `no-sync-scripts` and `no-html-link-for-pages` from warning to error, so
  // the severity is part of the behaviour: a rule set carrying only the `recommended` preset would pass
  // a build that should fail
  expectSeverityOn(type, 'next-rules.tsx', 5, 'error', 'flags a synchronous script as an error');
  expectSeverityOn(type, 'next-rules.tsx', 8, 'error', 'flags an <a> to a page as an error');
  expectSeverityOn(type, 'next-rules.tsx', 11, 'error', 'flags an inline <Script> without an id');
  expectSeverityOn(type, 'next-rules.tsx', 15, 'error', 'flags an assignment to `module`');
  expectClean(type, 'pages/about.tsx', 'reports nothing for a clean page');

  expectSeverityOn(type, 'next-image.tsx', 6, 'error', 'flags an <Image> without an alt attribute');

  // Next.js build output and its generated type declarations are never linted
  for (const path of ['.next/server/page.js', 'out/index.js', 'build/index.js', 'next-env.d.ts']) {
    it(`ignores ${path}`, async () => {
      assert.equal(await isIgnored(type, path), true);
    });
  }

  it('only ignores `build/` at the root', async () => {
    assert.equal(await isIgnored(type, 'src/build/index.ts'), false);
  });
};

/** The Next.js-only behaviour above must not leak into the plain `react` rule set. */
export const runReactOnlyCases = (type: ConfigType): void => {
  it('does not treat a component named <Image> as an image', async () => {
    const messages = await lint(type, 'next-image.tsx');

    assert.deepEqual(
      problemsOnLine(messages, 6).filter((message) => message.message.includes('alt')),
      [],
      `outside Next.js, <Image> is just a component, got:\n${describeMessages(messages)}`,
    );
  });

  it('does not ignore build/', async () => {
    assert.equal(await isIgnored(type, 'build/index.js'), false);
  });
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

  runA11yCases(type);
  runStylisticJsxCases(type);
};

/**
 * The accessibility checks — `eslint-plugin-jsx-a11y-x`'s recommended preset with a few rules switched
 * off — and the framework-agnostic parts of `eslint-config-next`: anonymous default exports and JSX in
 * `.js` files.
 */
const runA11yCases = (type: ConfigType): void => {
  // the six `eslint-config-next` has, now errors
  expectSeverityOn(type, 'a11y.tsx', 5, 'error', 'flags an <img> without an alt attribute');
  expectSeverityOn(type, 'a11y.tsx', 6, 'error', 'flags an unknown aria-* attribute');
  expectSeverityOn(type, 'a11y.tsx', 7, 'error', 'flags an invalid aria-* value');
  expectSeverityOn(type, 'a11y.tsx', 8, 'error', 'flags aria-* on an element that does not support it');
  expectSeverityOn(type, 'a11y.tsx', 9, 'error', 'flags a role missing its required aria-* attributes');
  expectSeverityOn(type, 'a11y.tsx', 10, 'error', 'flags an aria-* attribute the role does not support');

  // a sample of the rest of the recommended preset, plus the two rules added on top of it
  expectSeverityOn(type, 'a11y.tsx', 11, 'error', 'flags a role that does not exist');
  expectSeverityOn(type, 'a11y.tsx', 12, 'error', 'flags a link without content');
  expectSeverityOn(type, 'a11y.tsx', 13, 'error', 'flags aria-hidden on a focusable element');
  expectSeverityOn(type, 'a11y.tsx', 16, 'error', 'flags an <object> without alternative text');
  expectSeverityOn(type, 'a11y.tsx', 17, 'error', 'flags an invalid lang value');
  // `role="list"` is exempt, but only on lists
  expectSeverityOn(type, 'a11y.tsx', 18, 'error', 'flags a redundant role');

  it('does not judge the wording of alt text', async () => {
    const messages = await lint(type, 'img-alt-wording.tsx');

    assert.deepEqual(
      problemsOnLine(messages, 4).filter((message) => message.message.includes('alt')),
      [],
      `expected no report about the alt text, got:\n${describeMessages(messages)}`,
    );
  });

  // the rules switched off: too many reports on correct code, or needing a fix the linter cannot judge
  it('does not report what the switched-off accessibility rules would flag', async () => {
    const messages = await lint(type, 'a11y-off.tsx');

    assert.deepEqual(messages, [], `expected no problems in a11y-off.tsx, got:\n${describeMessages(messages)}`);
  });

  expectSeverityOn(type, 'anonymous-default-export.tsx', 4, 'warn', 'flags an anonymous default export');

  // parsing JSX in a .js file at all is the point — a parse error would land on this line too, so the
  // assertion is that the one problem there is the missing alt text
  it('parses JSX in a plain .js file', async () => {
    const messages = await lint(type, 'jsx-in-js.js');

    assert.ok(
      messages.every((message) => !message.fatal) && problemsOnLine(messages, 2).some((m) => m.message.includes('alt')),
      `expected the missing alt on jsx-in-js.js:2 and no parse error, got:\n${describeMessages(messages)}`,
    );
  });
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
