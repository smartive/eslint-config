import { trim } from './clean';

export const shout = (input: string): string => {
  const result = `${trim(input)}!`;

  return result;
};
