import { memo, type ReactNode } from 'react';

type LabelProps = { label: string };

/** `memo(...)` without an explicit display name, and props typed via TypeScript rather than propTypes. */
export const Label = memo(({ label }: LabelProps): ReactNode => <span>{label}</span>);
