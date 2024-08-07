import { Countdown } from './countdown.model';
import { Stopwatch } from './stopwatch.model';

// timer is a part of a set/superset
// hybrid - when ran in player initially is a stopwatch
// but after stop press - turns into countdown for the rest of the repetitions
// while remainging stopwatch for the next run of set/super set
//
// converted - on the other hand is also initially a stopwatch with the difference
// that when it's stopped it turns into countdown completely
// so it's no logner a stopwatch on the next run or next repetition

export type TimerType = 'stopwatch' | 'countdown' | 'hybrid' | 'converted';

export interface CountdownTimer extends Omit<Countdown, 'id'> {
  timerType: 'countdown';
}

// is alway a regular stopwatch
export interface StopwatchTimer extends Omit<Stopwatch, 'id'> {
  timerType: 'stopwatch';
}

// remains a stopwatch throughout launches and converted to countdown
// after being stopped the first time for the rest of the sequence
export interface InitiallyStopwatchTimer extends Omit<Stopwatch, 'id'> {
  timerType: 'hybrid';
}

// can be run only once as a stopwatch
// after that it is converted to countdown for all next launches
export interface EventuallyCountdownTimer extends Omit<Stopwatch, 'id'> {
  timerType: 'converted';
}

export type Timer =
  | CountdownTimer
  | StopwatchTimer
  | InitiallyStopwatchTimer
  | EventuallyCountdownTimer;
