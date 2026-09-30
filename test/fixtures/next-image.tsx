import type { ReactNode } from 'react';

const Image = (props: { src: string; alt?: string }): ReactNode => <span>{props.src}</span>;

// `next/image`'s <Image> renders an <img>, so in a Next.js project it needs alt text just the same
export const Banner = (): ReactNode => <Image src="/x.png" />;
