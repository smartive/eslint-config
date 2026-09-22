import type { ReactNode } from 'react';

type Props = { label?: string; children?: ReactNode };

const Card = ({ label }: Props): ReactNode => <span>{label}</span>;

const Test_component = Card;

// a string literal prop value needs no curly braces
export const CurlyProp = (): ReactNode => <Card label={'hello'} />;

// a string literal child needs no curly braces either
export const CurlyChild = (): ReactNode => <Card>{'hello'}</Card>;

// a component without children should close itself
export const NotSelfClosing = (): ReactNode => <Card label="hello"></Card>;

// a component name that is neither PascalCase nor a DOM element
export const BadName = (): ReactNode => <Test_component />;
