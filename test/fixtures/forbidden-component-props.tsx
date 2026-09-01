import type { ReactNode } from 'react';

type CardProps = { className?: string; style?: Record<string, string> };

const Card = ({ className }: CardProps): ReactNode => <div>{className}</div>;

export const Page = (): ReactNode => <Card className="p-4" style={{ color: 'red' }} />;
