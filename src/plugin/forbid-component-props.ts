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

type ForbidEntry = {
  propName: string;
  allowedFor?: string[];
  allowedForPatterns?: string[];
  message?: string;
};

type ForbidOption = string | ForbidEntry;

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
 * The source text of the element name, so that `<Ui.Group.Item />` can be matched as `Ui.Group.Item`.
 */
const elementName = (name: JsxElementName): string => {
  switch (name.type) {
    case 'JSXIdentifier':
      return name.name;
    case 'JSXMemberExpression':
      return `${elementName(name.object)}.${name.property.name}`;
    default:
      return `${name.namespace.name}:${name.name.name}`;
  }
};

/**
 * Glob matching for `allowedForPatterns`: `*` matches any run of characters, `?` a single one.
 */
const globToRegExp = (pattern: string): RegExp =>
  new RegExp(
    `^${pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')}$`,
  );

const normalize = (option: ForbidOption): ForbidEntry => (typeof option === 'string' ? { propName: option } : option);

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
            items: {
              anyOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    propName: { type: 'string' },
                    allowedFor: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                    allowedForPatterns: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                    message: { type: 'string' },
                  },
                  required: ['propName'],
                  additionalProperties: false,
                },
              ],
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      forbiddenProp: 'Prop "{{prop}}" is forbidden on components.',
      forbiddenPropWithMessage: '{{message}}',
    },
  },
  create(context) {
    const { forbid = [] } = (context.options[0] ?? {}) as { forbid?: ForbidOption[] };

    const forbidden = new Map(
      forbid.map(normalize).map((entry) => [
        entry.propName,
        {
          allowedFor: new Set(entry.allowedFor ?? []),
          allowedForPatterns: (entry.allowedForPatterns ?? []).map(globToRegExp),
          message: entry.message,
        },
      ]),
    );

    if (forbidden.size === 0) {
      return {};
    }

    return {
      JSXOpeningElement(node: Rule.Node) {
        const element = node as unknown as JsxOpeningElement;

        if (!isComponent(element.name)) {
          return;
        }

        const component = elementName(element.name);

        for (const attribute of element.attributes) {
          if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier') {
            continue;
          }

          const entry = forbidden.get(attribute.name.name);

          if (!entry) {
            continue;
          }

          if (entry.allowedFor.has(component) || entry.allowedForPatterns.some((pattern) => pattern.test(component))) {
            continue;
          }

          context.report({
            node: attribute as unknown as Rule.Node,
            ...(entry.message
              ? { messageId: 'forbiddenPropWithMessage' as const, data: { message: entry.message } }
              : { messageId: 'forbiddenProp' as const, data: { prop: attribute.name.name } }),
          });
        }
      },
    };
  },
};
