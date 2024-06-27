import { Timer } from './timer.model';

export interface TimerSet {
  id: number;
  name: string;
  timers: Timer[];
  repetitions: number;
}
