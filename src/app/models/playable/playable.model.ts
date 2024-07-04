import { TimerSet } from './set.model';
import { SuperSet } from './super-set.model';
import { Stopwatch } from './stopwatch.model';
import { Countdown } from './countdown.model';
import { uid } from '../../utils';

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

export function blank(type: PlayableType): Playable | void {
  switch (type) {
    case 'countdown':
      return {
        playableType: PlayableType.Countdown,
        name: '',
        id: uid(),
        value: 0,
      };

    case 'stopwatch':
      return {
        playableType: PlayableType.Stopwatch,
        name: '',
        id: uid(),
        value: 0,
      };

    case 'set':
      return {
        playableType: PlayableType.Set,
        id: uid(),
        name: '',
        timers: [{ name: '', value: 0, timerType: 'hybrid' }],
        repetitions: 1,
      };
    case 'super-set':
      return {
        playableType: PlayableType.SuperSet,
        id: uid(),
        name: '',
        setsAndTimers: [],
        repetitions: 1,
      };
  }
}
