import { TimerSet } from './set.model';
import { Timer } from './timer.model';

export interface SuperSet {
  id: string;
  name: string;
  setsAndTimers: (Omit<TimerSet, 'id'> | Timer)[];
  repetitions: number;
}
