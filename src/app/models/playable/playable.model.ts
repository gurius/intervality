import { TimerSet } from './set.model';
import { SuperSet } from './super-set.model';
import { Stopwatch } from './stopwatch.model';
import { Countdown } from './countdown.model';

// export type PlayableType =
//   | DataSuperSet
//   | DataStopwatch
//   | DataCountdown
//   | DataSet;

export enum PlayableType {
  Countdown = 'countdown',
  Stopwatch = 'stopwatch',
  Set = 'set',
  SuperSet = 'super-set',
}

export interface PlayableStopwatch extends Stopwatch {
  playableType: PlayableType.Stopwatch;
}

export interface PlayableCountdown extends Countdown {
  playableType: PlayableType.Countdown;
}

export interface PlayableSet extends TimerSet {
  playableType: PlayableType.Set;
}

export interface PlayableSuperSet extends SuperSet {
  playableType: PlayableType.SuperSet;
}

export type Playable =
  | PlayableSuperSet
  | PlayableSet
  | PlayableCountdown
  | PlayableStopwatch;
