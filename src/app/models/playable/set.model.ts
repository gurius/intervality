import { DataStopwatch } from './stopwatch.model';

export interface DataSet {
  id: number;
  name: string;
  timers: number[];
  repetitions: number;
  seqNo: number;
}
