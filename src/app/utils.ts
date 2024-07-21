import { INTERVAL_MS } from './config';

export const uid = () => {
  const date = new Date().getTime().toString(36);
  const rnd = Math.random().toString(36).substring(2);
  return `${date}-${rnd}`;
};

export const isCloseTo = (confms: number, ms: number) => {
  const half = INTERVAL_MS / 2;

  return confms + half >= ms && confms - half <= ms;
};
