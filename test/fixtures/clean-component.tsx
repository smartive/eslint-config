import { useMemo, type ReactNode } from 'react';

type ListProps = { items: readonly string[] };

export const List = ({ items }: ListProps): ReactNode => {
  const sorted = useMemo(() => [...items].sort(), [items]);

  return (
    <ul>
      {sorted.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};
