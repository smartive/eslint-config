import type { ReactNode } from 'react';

type Props = { label?: string; icon?: ReactNode; children?: ReactNode };

const Icon = (): ReactNode => <svg />;

const Card = ({ label }: Props): ReactNode => <span>{label}</span>;

// a plain string prop, already brace-free
export const PlainProp = (): ReactNode => <Card label="hello" />;

// braces around an expression are necessary and must stay
export const Expression = ({ label }: Props): ReactNode => <Card>{label?.trim()}</Card>;

// a JSX element as a prop value keeps its braces: `propElementValues: 'always'`
export const ElementProp = (): ReactNode => <Card icon={<Icon />} />;

// a component with real children is not "empty", so it must not be made self-closing
export const WithChildren = (): ReactNode => (
  <Card>
    <Icon />
  </Card>
);
