import { TimerType } from './timer.model';

export interface Stopwatch {
  id: string;
  name: string;
  value: number;
  timerType: TimerType;
}

export interface StopwatchHistory {
  id: string;
  name: string;
  value: number;
  timestamp: number;
}
