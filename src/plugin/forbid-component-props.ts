import type { Rule } from 'eslint';

type JsxIdentifier = { type: 'JSXIdentifier'; name: string };

type JsxNamespacedName = { type: 'JSXNamespacedName'; namespace: JsxIdentifier; name: JsxIdentifier };

type JsxMemberExpression = {
  type: 'JSXMemberExpression';
  object: JsxIdentifier | JsxMemberExpression;
  property: JsxIdentifier;
};

type JsxElementName = JsxIdentifier | JsxNamespacedName | JsxMemberExpression;

type JsxAttribute = { type: 'JSXAttribute'; name: JsxIdentifier | JsxNamespacedName };

type JsxSpreadAttribute = { type: 'JSXSpreadAttribute' };

type JsxOpeningElement = {
  type: 'JSXOpeningElement';
  name: JsxElementName;
  attributes: (JsxAttribute | JsxSpreadAttribute)[];
};

/**
 * Distinguishes components (`<Foo />`, `<Foo.Bar />`) from intrinsic elements (`<div />`, `<svg:rect />`).
 */
const isComponent = (name: JsxElementName): boolean => {
  switch (name.type) {
    case 'JSXIdentifier':
      return /^[A-Z]/.test(name.name);
    case 'JSXMemberExpression':
      return true;
    default:
      return false;
  }
};

/**
 * Replacement for `react/forbid-component-props`, which has no equivalent in
 * `@eslint-react/eslint-plugin` (https://eslint-react.xyz/docs/migrating-from-eslint-plugin-react).
 */
export const forbidComponentProps: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Forbid certain props on components.',
      url: 'https://github.com/smartive/eslint-config#smartiveforbid-component-props',
    },
    schema: [
      {
        type: 'object',
        properties: {
          forbid: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      forbiddenProp: 'Prop "{{prop}}" is forbidden on components.',
    },
  },
  create(context) {
    const { forbid = [] } = (context.options[0] ?? {}) as { forbid?: string[] };
    const forbidden = new Set(forbid);

    if (forbidden.size === 0) {
      return {};
    }

    return {
      JSXOpeningElement(node: Rule.Node) {
        const element = node as unknown as JsxOpeningElement;

        if (!isComponent(element.name)) {
          return;
        }

        for (const attribute of element.attributes) {
          if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier') {
            continue;
          }

          if (forbidden.has(attribute.name.name)) {
            context.report({
              node: attribute as unknown as Rule.Node,
              messageId: 'forbiddenProp',
              data: { prop: attribute.name.name },
            });
          }
        }
      },
    };
  },
};
