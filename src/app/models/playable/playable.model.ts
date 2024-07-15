import { TimerSet } from './set.model';
import { SuperSet as Superset } from './super-set.model';
import { Stopwatch } from './stopwatch.model';
import { Countdown } from './countdown.model';
import { uid } from '../../utils';
import { Timer } from './timer.model';

export type PlayableType = 'countdown' | 'stopwatch' | 'set' | 'superset';

export type SupersetNestable = 'countdown' | 'stopwatch' | 'set';

export interface PlayableStopwatch extends Stopwatch {
  playableType: 'stopwatch';
}

export interface PlayableCountdown extends Countdown {
  playableType: 'countdown';
}

export interface PlayableSet extends TimerSet {
  playableType: 'set';
}

export interface PlayableSuperset extends Superset {
  playableType: 'superset';
}

export type Playable =
  | PlayableSuperset
  | PlayableSet
  | PlayableCountdown
  | PlayableStopwatch;

export function blank(type: PlayableType): Playable {
  switch (type) {
    case 'countdown':
      return {
        playableType: 'countdown',
        timerType: 'countdown',
        name: '',
        id: uid(),
        value: 0,
      } as PlayableCountdown;

    case 'stopwatch':
      return {
        playableType: 'stopwatch',
        timerType: 'stopwatch',
        name: '',
        id: uid(),
        value: 0,
      } as PlayableStopwatch;

    case 'superset':
      return {
        playableType: 'superset',
        id: uid(),
        name: '',
        setsAndTimers: [],
        repetitions: 1,
      } as PlayableSuperset;
    case 'set':
    default:
      return {
        playableType: 'set',
        id: uid(),
        name: '',
        timers: [{ name: '', value: 0, timerType: 'hybrid' }],
        repetitions: 1,
      } as PlayableSet;
  }
}

export function blankSt(type: SupersetNestable): Omit<TimerSet, 'id'> | Timer {
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
