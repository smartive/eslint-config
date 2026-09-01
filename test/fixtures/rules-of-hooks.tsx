import { useState, type ReactNode } from 'react';

type CounterProps = { enabled: boolean };

export const Counter = ({ enabled }: CounterProps): ReactNode => {
  if (enabled) {
    const [count] = useState(0);

    return <span>{count}</span>;
  }

  return <span>off</span>;
};
