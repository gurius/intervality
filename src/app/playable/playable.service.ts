import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import {
  Playable,
  PlayableCountdown,
  PlayableSet,
  PlayableStopwatch,
  PlayableSuperSet,
  PlayableType,
} from '../models/playable/playable.model';

@Injectable({
  providedIn: 'root',
})
export class PlayableService {
  constructor() {}

  getCountdowns(): Observable<PlayableCountdown[]> {
    return of(this.countdown);
  }

  getStopwatches(): Observable<PlayableStopwatch[]> {
    return of(this.stopwatch);
  }

  getSets(): Observable<PlayableSet[]> {
    return of(this.sets);
  }
  getSuperSets(): Observable<PlayableSuperSet[]> {
    return of(this.supersets);
  }

  getPlayable(id?: number): Observable<Playable | undefined | Playable[]> {
    const playable = [
      ...this.supersets,
      ...this.sets,
      ...this.stopwatch,
      ...this.countdown,
    ];
    if (id) return of(playable.find((p) => p.id === id));
    else return of(playable);
  }

  countdown: PlayableCountdown[] = [
    {
      id: 3619,
      name: 'Jumps',
      playableType: PlayableType.Countdown,
      value: 5000,
    },
    {
      id: 1761,
      name: 'Rest',
      playableType: PlayableType.Countdown,
      value: 5000,
    },
    {
      id: 4798,
      name: 'Plank',
      playableType: PlayableType.Countdown,
      value: 3194,
    },
  ];

  stopwatch: PlayableStopwatch[] = [
    {
      id: 3682,
      name: 'Stretching',
      playableType: PlayableType.Stopwatch,
      value: 0,
    },
    {
      id: 3605,
      name: 'Jumps',
      playableType: PlayableType.Stopwatch,
      value: 0,
    },
    {
      id: 4597,
      name: 'Pushups',
      playableType: PlayableType.Stopwatch,
      value: 0,
    },
  ];

  sets: PlayableSet[] = [
    {
      playableType: PlayableType.Set,
      id: 1986,
      name: 'Light Training',
      repetitions: 3,
      timers: [
        { name: 'Pullups', timerType: 'countdown', value: 4500 },
        {
          name: 'Rest',
          timerType: 'stopwatch',
          convertToCountdownAfterSet: true,
          value: 0,
        },
      ],
    },
  ];

  supersets: PlayableSuperSet[] = [
    {
      playableType: PlayableType.SuperSet,
      id: 4351,
      name: 'Light Legs Day',
      repetitions: 2,
      setsAndTimers: [
        {
          name: 'Warmup',
          value: 5000,
          timerType: 'countdown',
        },
        {
          name: 'Light Legs',
          repetitions: 3,
          timers: [
            { name: 'Squats 10x', value: 5000, timerType: 'countdown' },
            {
              name: 'Rest',
              timerType: 'stopwatch',
              // saveAsCountdown: true,
              convertToCountdownAfterSet: false,
              value: 0,
            },
          ],
        },
        { name: 'Cooldown', value: 5000, timerType: 'countdown' },
      ],
    },
  ];
}
