export interface DataStopwatch {
  id: number;
  name: string;
  value: number;
  units: TimeUnits;
  seqNo: number;
  partTakesInSets: number[];
}

export enum TimeUnits {
  Seconds = 'seconds',
  Miliseconds = 'miliseconds',
  Nanoseconds = 'nanoseconds',
}
