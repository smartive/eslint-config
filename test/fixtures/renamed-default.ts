// `import-x/no-rename-default` would report this: `clean.ts` has no default export to rename, so use
// one that does — `default-export.ts` exports `trim` as default, imported here under another name.
import shorten from './default-export';

export const shout = (input: string): string => `${shorten(input)}!`;
