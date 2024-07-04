import { Timer } from './timer.model';

export interface TimerSet {
  id: string;
  name: string;
  timers: Timer[];
  repetitions: number;
}
