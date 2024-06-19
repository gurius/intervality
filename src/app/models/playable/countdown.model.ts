import { TimeUnits } from './stopwatch.model';

export interface DataCountdown {
  id: number;
  name: string;
  value: number;
  units: TimeUnits;
  seqNo: number;
  partTakesInSets: number[];
}
