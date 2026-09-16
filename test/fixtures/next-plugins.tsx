import type { ReactNode } from 'react';

// an <img> without alt: flagged by the accessibility rules eslint-config-next contributes
export const Banner = (): ReactNode => <img src="/x.png" />;

// an anonymous default export: flagged by the import rules eslint-config-next contributes
export default (): ReactNode => <Banner />;
