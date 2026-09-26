// a module exporting `Button` both as a named export and as its default is a normal shape, and importing
// the default under that same name is exactly right — `import-x/no-named-as-default` reports it anyway
import Button from './named-as-default-export';

export const render = (label: string): string => Button(label);
