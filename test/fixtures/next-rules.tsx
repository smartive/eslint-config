import Script from 'next/script';
import type { ReactNode } from 'react';

// a synchronous third-party script: an error under core-web-vitals
export const Sync = (): ReactNode => <script src="https://example.com/x.js" />;

// a plain <a> to a page instead of next/link: an error under core-web-vitals
export const PageLink = (): ReactNode => <a href="/about">about</a>;

// an inline <Script> without an id
export const Inline = (): ReactNode => <Script>{`console.info('x')`}</Script>;

// assigning to `module` breaks Next.js's module handling
export const assign = (): void => {
  const module = 1;
  console.info(module);
};
