import { TimerSet } from './set.model';
import { SuperSet as Superset } from './super-set.model';
import { Stopwatch } from './stopwatch.model';
import { Countdown } from './countdown.model';
import { uid } from '../../utils';
import { Timer } from './timer.model';

export enum PlayableType {
  Countdown = 'countdown',
  Stopwatch = 'stopwatch',
  Set = 'set',
  Superset = 'super-set',
}

export type PlayableTypeStr = 'countdown' | 'stopwatch' | 'set';

export interface PlayableStopwatch extends Stopwatch {
  playableType: PlayableType.Stopwatch;
}

export interface PlayableCountdown extends Countdown {
  playableType: PlayableType.Countdown;
}

export interface PlayableSet extends TimerSet {
  playableType: PlayableType.Set;
}

export interface PlayableSuperset extends Superset {
  playableType: PlayableType.Superset;
}

export type Playable =
  | PlayableSuperset
  | PlayableSet
  | PlayableCountdown
  | PlayableStopwatch;

export function blank(type: PlayableType): Playable {
  switch (type) {
    case PlayableType.Countdown:
      return {
        playableType: PlayableType.Countdown,
        timerType: 'countdown',
        name: '',
        id: uid(),
        value: 0,
      } as PlayableCountdown;

    case PlayableType.Stopwatch:
      return {
        playableType: PlayableType.Stopwatch,
        timerType: 'stopwatch',
        name: '',
        id: uid(),
        value: 0,
      } as PlayableStopwatch;

    case PlayableType.Superset:
      return {
        playableType: PlayableType.Superset,
        id: uid(),
        name: '',
        setsAndTimers: [],
        repetitions: 1,
      } as PlayableSuperset;
    case PlayableType.Set:
    default:
      return {
        playableType: PlayableType.Set,
        id: uid(),
        name: '',
        timers: [{ name: '', value: 0, timerType: 'hybrid' }],
        repetitions: 1,
      } as PlayableSet;
  }
}

export function blankSt(type: PlayableTypeStr): Omit<TimerSet, 'id'> | Timer {
  switch (type) {
    case 'countdown':
      return { name: '', value: 0, timerType: 'countdown' } as Timer;
    case 'stopwatch':
      return { name: '', value: 0, timerType: 'hybrid' } as Timer;
    case 'set':
    default:
      return {
        name: '',
        timers: [{ name: '', value: 0, timerType: 'hybrid' }],
        repetitions: 1,
      } as Omit<TimerSet, 'id'>;
  }
}
