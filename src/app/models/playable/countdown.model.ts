import { TimerType } from './timer.model';

export interface Countdown {
  id: string;
  name: string;
  value: number;
  timerType: TimerType;
}
