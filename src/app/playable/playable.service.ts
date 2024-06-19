import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Playable,
  PlayableCountdown,
  PlayableSet,
  PlayableStopwatch,
  PlayableSuperSet,
  PlayableType,
} from '../models/playable/playable.model';
import { TimeUnits } from '../models/playable/stopwatch.model';

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

  countdown: PlayableCountdown[] = [
    {
      id: 3619,
      name: 'Salazar Cruz',
      playableType: PlayableType.Countdown,
      value: 2421,
      units: TimeUnits.Miliseconds,
      seqNo: 1,
      partTakesInSets: [1111],
    },
    {
      id: 1761,
      name: 'Farmer Guthrie',
      playableType: PlayableType.Countdown,
      value: 3453,
      units: TimeUnits.Miliseconds,
      seqNo: 1,
      partTakesInSets: [1111],
    },
    {
      id: 4798,
      name: 'Patrica Webster',
      playableType: PlayableType.Countdown,
      value: 3194,
      units: TimeUnits.Miliseconds,
      seqNo: 1,
      partTakesInSets: [1111],
    },
  ];

  stopwatch: PlayableStopwatch[] = [
    {
      id: 3682,
      name: 'Margery Moreno',
      playableType: PlayableType.Stopwatch,
      value: 4593,
      units: TimeUnits.Miliseconds,
      seqNo: 1,
      partTakesInSets: [1111],
    },
    {
      id: 3605,
      name: 'Rose Bates',
      playableType: PlayableType.Stopwatch,
      value: 1750,
      units: TimeUnits.Miliseconds,
      seqNo: 1,
      partTakesInSets: [1111],
    },
    {
      id: 4597,
      name: 'Vonda Casey',
      playableType: PlayableType.Stopwatch,
      value: 3030,
      units: TimeUnits.Miliseconds,
      seqNo: 1,
      partTakesInSets: [1111],
    },
  ];
  sets: PlayableSet[] = [
    {
      playableType: PlayableType.Set,
      id: 1986,
      name: 'Liza Wiggins',
      seqNo: 1,
      repetitions: 1,
      timers: [4304, 4388, 4881],
    },
    {
      playableType: PlayableType.Set,
      id: 4351,
      name: 'Rosemarie Hahn',
      seqNo: 1,
      repetitions: 2,
      timers: [1806, 1828, 4930],
    },
    {
      playableType: PlayableType.Set,
      id: 4714,
      name: 'Kathrine Bond',
      seqNo: 1,
      repetitions: 4,
      timers: [1029, 4255, 3881],
    },
    {
      playableType: PlayableType.Set,
      id: 1580,
      name: 'Rachelle Bartlett',
      seqNo: 1,
      repetitions: 3,
      timers: [2059, 1245, 4284],
    },
    {
      playableType: PlayableType.Set,
      id: 3964,
      name: 'Maureen Johnson',
      seqNo: 1,
      repetitions: 1,
      timers: [1983, 4224, 4124],
    },
    {
      playableType: PlayableType.Set,
      id: 1967,
      name: 'Strickland Fry',
      seqNo: 1,
      repetitions: 1,
      timers: [3411, 4117, 2654],
    },
  ];

  supersets: PlayableSuperSet[] = [
    {
      playableType: PlayableType.SuperSet,
      id: 4351,
      name: 'Conway Diaz',
      repetitions: 1,
      playables: [4466, 3822, 2534],
    },
    {
      playableType: PlayableType.SuperSet,
      id: 2745,
      name: 'Wiggins Rowland',
      repetitions: 1,
      playables: [3258, 3328, 3106],
    },
    {
      playableType: PlayableType.SuperSet,
      id: 3120,
      name: 'Karina Dillon',
      repetitions: 4,
      playables: [3020, 3421, 4524],
    },
  ];
}
