import { Countdown } from './countdown.model';
import { Stopwatch } from './stopwatch.model';

// timer is a part of a set/superset
export type TimerType = 'stopwatch' | 'countdown';

export interface CountdownTimer extends Omit<Countdown, 'id'> {
  timerType: 'countdown';
}

// can remain a stopwatch or be converted to countdown after being stopped first time
export interface InitiallyStopwatchTimer extends Omit<Stopwatch, 'id'> {
  timerType: 'stopwatch';
  convertToCountdownAfterSet: boolean;
}

// can be run only once as a stopwatch
// after that it is converted to countdown for every next set/superset run
export interface EventuallyCountdownTimer extends Omit<Stopwatch, 'id'> {
  timerType: 'stopwatch';
  saveAsCountdown: true;
}

export type Timer =
  | CountdownTimer
  | InitiallyStopwatchTimer
  | EventuallyCountdownTimer;
