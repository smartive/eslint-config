import type { ReactNode } from 'react';

type Props = { className?: string; style?: Record<string, string> };

const Card = ({ className }: Props): ReactNode => <span>{className}</span>;

const Group = { Item: Card };

// intrinsic elements keep their props — flagging these would be a false positive
export const Intrinsic = (): ReactNode => <div className="p-4" style={{ color: 'red' }} />;

// `<Foo.Bar />` is a component too, so the forbidden props apply
export const Member = (): ReactNode => <Group.Item className="p-4" />;

// a spread carries no attribute name to check, and must not trip the rule
export const Spread = (props: Props): ReactNode => <Card {...props} />;
