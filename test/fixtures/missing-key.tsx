import type { ReactNode } from 'react';

type ListProps = { items: readonly string[] };

export const List = ({ items }: ListProps): ReactNode => {
  return (
    <ul>
      {items.map((item) => (
        <li>{item}</li>
      ))}
    </ul>
  );
};
