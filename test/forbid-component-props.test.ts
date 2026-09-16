import { RuleTester } from 'eslint';
import { describe, it } from 'node:test';
import { forbidComponentProps } from '../dist/plugin/forbid-component-props.js';

/**
 * Unit coverage for the one rule this package implements itself.
 *
 * The rule-set tests exercise it only through the shipped options (`{ forbid: ['style', 'className'] }`),
 * so the branches that depend on other options — or on JSX shapes the fixtures do not contain — are
 * only reachable from here.
 */
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

describe('smartive/forbid-component-props', () => {
  it('passes its rule tests', () => {
    ruleTester.run('forbid-component-props', forbidComponentProps, {
      valid: [
        // intrinsic elements are never components, whatever they are given
        { code: '<div className="p-4" style={{}} />', options: [{ forbid: ['className', 'style'] }] },
        // namespaced names are not components either
        { code: '<svg:rect className="p-4" />', options: [{ forbid: ['className'] }] },
        // a spread has no attribute name to match
        { code: '<Card {...props} />', options: [{ forbid: ['className'] }] },
        // props outside the list are fine
        { code: '<Card title="hi" />', options: [{ forbid: ['className'] }] },
        // no options at all means nothing is forbidden
        { code: '<Card className="p-4" />' },
        // an explicitly empty list disables the rule
        { code: '<Card className="p-4" />', options: [{ forbid: [] }] },
      ],
      invalid: [
        {
          code: '<Card className="p-4" />',
          options: [{ forbid: ['className'] }],
          errors: [{ messageId: 'forbiddenProp', data: { prop: 'className' } }],
        },
        {
          // member expressions are components
          code: '<Group.Item className="p-4" />',
          options: [{ forbid: ['className'] }],
          errors: [{ messageId: 'forbiddenProp', data: { prop: 'className' } }],
        },
        {
          // deeply nested member expressions too
          code: '<Ui.Group.Item style={{}} />',
          options: [{ forbid: ['style'] }],
          errors: [{ messageId: 'forbiddenProp', data: { prop: 'style' } }],
        },
        {
          // every forbidden prop on the element is reported, not just the first
          code: '<Card className="p-4" style={{}} />',
          options: [{ forbid: ['className', 'style'] }],
          errors: [
            { messageId: 'forbiddenProp', data: { prop: 'className' } },
            { messageId: 'forbiddenProp', data: { prop: 'style' } },
          ],
        },
      ],
    });
  });
});
