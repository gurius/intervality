export const uid = () => {
  const date = new Date().getTime().toString(36);
  const rnd = Math.random().toString(36).substring(2);
  return `${date}-${rnd}`;
};
