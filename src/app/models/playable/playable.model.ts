import { DataSet } from './set.model';
import { DataSuperSet } from './super-set.model';
import { DataStopwatch } from './stopwatch.model';
import { DataCountdown } from './countdown.model';

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

export interface PlayableStopwatch extends DataStopwatch {
  playableType: PlayableType.Stopwatch;
}

export interface PlayableCountdown extends DataCountdown {
  playableType: PlayableType.Countdown;
}

export interface PlayableSet extends DataSet {
  playableType: PlayableType.Set;
}

export interface PlayableSuperSet extends DataSuperSet {
  playableType: PlayableType.SuperSet;
}

export type Playable =
  | PlayableSuperSet
  | PlayableSet
  | PlayableCountdown
  | PlayableStopwatch;
