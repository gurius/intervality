import { OperatorFunction, config, map } from 'rxjs';
import { INTERVAL_MS } from './config';
import { StartBefore } from './settings/settings.service';

export const uid = () => {
  const date = new Date().getTime().toString(36);
  const rnd = Math.random().toString(36).substring(2);
  return `${date}-${rnd}`;
};

export const isCloseTo = (confms: number, ms: number) => {
  const half = INTERVAL_MS / 2;

  return confms + half >= ms && confms - half <= ms;
};

// rxjs guard OperatorFunction
export const typeGuard = <T, Y extends T>(
  isOfExpectedType: (value: T) => value is Y,
): OperatorFunction<T, Y> => {
  return (source) =>
    source.pipe(
      map((value) => {
        if (isOfExpectedType(value)) {
          return value;
        } else {
          throw new Error('TypeGuard: Wrong type');
        }
      }),
    );
};

export const isBoolean = (x: unknown): x is boolean =>
  x !== null && x !== undefined && typeof x === 'boolean';

export const isString = (x: unknown): x is string => typeof x === 'string';
export const isNumber = (x: unknown): x is number => typeof x === 'number';
export const isStartBeforeArray = (x: unknown): x is StartBefore[] =>
  Array.isArray(x) && Array.isArray(x.at(0));
