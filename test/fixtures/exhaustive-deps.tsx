import { useEffect, type ReactNode } from 'react';

type LoggerProps = { label: string };

export const Logger = ({ label }: LoggerProps): ReactNode => {
  useEffect(() => {
    console.info(label);
  }, []);

  return <span>{label}</span>;
};
