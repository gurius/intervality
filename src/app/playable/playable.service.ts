import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Playable, PlayableSuperset } from '../models/playable/playable.model';
import { DataService } from '../data.service';
import {
  CountdownTimer,
  EventuallyCountdownTimer,
  Timer,
} from '../models/playable/timer.model';
import { TimerSet } from '../models/playable/set.model';

@Injectable({
  providedIn: 'root',
})
export class PlayableService {
  constructor(private dataService: DataService) {}

  getPlayable(id?: string): Observable<Playable | Playable[]> {
    const playable = this.dataService.getAll();
    if (id) {
      return of(this.dataService.getById(id)) as Observable<Playable>;
    } else {
      return of(playable) as Observable<Playable[]>;
    }
  }

  updateAsCountdownByName(
    playableId: string,
    stopwatchName: string,
    value: number,
  ) {
    let playable = this.dataService.getById(playableId);

    let upadte;

    switch (playable.playableType) {
      case 'stopwatch':
        playable = {
          ...playable,
          ...this.swToCd(playable as EventuallyCountdownTimer, value),
          playableType: 'countdown',
        };
        break;
      case 'set':
        const idx = playable.timers.findIndex(
          (t) => t.name === stopwatchName && t.timerType === 'converted',
        );
        if (idx !== -1) {
          upadte = this.swToCd(
            playable.timers[idx] as EventuallyCountdownTimer,
            value,
          );
          playable.timers[idx] = upadte;
        }
        break;
      case 'superset':
        const sotIdx = playable.setsAndTimers.forEach((sot, idx) => {
          if ((sot as TimerSet).timers) {
            (sot as TimerSet).timers.forEach((t, i) => {
              if (t.name === stopwatchName && t.timerType === 'converted') {
                (sot as TimerSet).timers[i] = this.swToCd(t, value);
              }
            });
          } else {
            if (
              sot.name === stopwatchName &&
              (sot as Timer).timerType === 'converted'
            ) {
              (playable as PlayableSuperset).setsAndTimers[idx] = this.swToCd(
                sot as EventuallyCountdownTimer,
                value,
              );
            }
          }
        });
        break;
    }

    this.dataService.updsertItem(playable);
  }

  swToCd<T extends EventuallyCountdownTimer, N extends CountdownTimer>(
    p: T,
    value: number,
  ): N {
    return { ...p, timerType: 'countdown', value } as N;
  }
}
