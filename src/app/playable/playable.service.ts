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
      id: 4798,
      name: 'Plank',
      playableType: PlayableType.Countdown,
      value: 300000,
    },
  ];

  stopwatch: PlayableStopwatch[] = [
    {
      id: 3682,
      name: 'Sprint',
      playableType: PlayableType.Stopwatch,
      value: 0,
    },
    {
      id: 3605,
      name: 'Jumps',
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
        {
          name: 'Pullups',
          timerType: 'stopwatch',
          value: 0,
          convertToCountdownAfterSet: true,
        },
        {
          name: 'Rest',
          timerType: 'stopwatch',
          convertToCountdownAfterSet: true,
          value: 0,
        },
        {
          name: 'Pushups',
          timerType: 'stopwatch',
          value: 0,
          convertToCountdownAfterSet: true,
        },
        {
          name: 'Rest',
          timerType: 'stopwatch',
          convertToCountdownAfterSet: true,
          value: 0,
        },
      ],
    },
    {
      playableType: PlayableType.Set,
      id: 1392,
      name: 'All countdowns',
      repetitions: 3,
      timers: [
        {
          name: 'One',
          timerType: 'countdown',
          value: 5000,
        },
        {
          name: 'Two',
          timerType: 'countdown',
          value: 5000,
        },
        {
          name: 'Three',
          timerType: 'countdown',
          value: 5000,
        },
      ],
    },
  ];

  supersets: PlayableSuperSet[] = [
    {
      playableType: PlayableType.SuperSet,
      id: 4351,
      name: 'Light Legs Day',
      repetitions: 1,
      setsAndTimers: [
        {
          name: 'Warmup',
          value: 300000,
          timerType: 'countdown',
        },
        {
          name: 'Light Legs',
          repetitions: 3,
          timers: [
            {
              name: 'Squats 10x',
              value: 0,
              timerType: 'stopwatch',
              convertToCountdownAfterSet: true,
            },
            {
              name: 'Rest',
              timerType: 'stopwatch',
              // saveAsCountdown: true, // can't be tested for now
              convertToCountdownAfterSet: false,
              value: 0,
            },
          ],
        },
        { name: 'Stretching', value: 150000, timerType: 'countdown' },
      ],
    },
  ];
}
