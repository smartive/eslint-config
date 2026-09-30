import type { ReactNode } from 'react';

export const A11y = (): ReactNode => (
  <main>
    <img src="/x.png" />
    <div aria-foo="x" />
    <div aria-hidden="yes" />
    <meta aria-hidden="true" />
    <div role="checkbox" />
    <li aria-required="true" />
    <div role="buton" />
    <a href="/x" />
    <button aria-hidden="true" type="button">
      x
    </button>
    <object data="/x.pdf" />
    <html lang="english" />
    <button role="button" type="button">
      x
    </button>
  </main>
);
