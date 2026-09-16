const later = async (): Promise<void> => {
  await Promise.resolve();
};

export const run = (): void => {
  later();
};
