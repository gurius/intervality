import { Injectable } from '@angular/core';
import { SettingsService } from '../settings/settings.service';
import {
  Observable,
  combineLatestWith,
  filter,
  interval,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { PlayerService } from './player.service';
import { isBoolean, isCloseTo, isStartBeforeArray, typeGuard } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class BeepService {
  private audioContext: AudioContext;

  startBefore: number = 0;
  notifyBefore: number = 0;

  notify$!: Observable<number>;

  isSoundOn$!: Observable<boolean>;

  constructor(
    private settingsService: SettingsService,
    private playerService: PlayerService,
  ) {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    this.isSoundOn$ = settingsService
      .getParam('sound-notification')
      .pipe(typeGuard(isBoolean));

    const notifyBeforSeconds$ = settingsService
      .getParam('notify-before-seconds')
      .pipe(
        typeGuard(isStartBeforeArray),

        map((cfg) =>
          cfg.map((tup) => {
            let [start, range, intensity] = tup;

            const end = range;

            return [start, end, intensity] as [number, number, number];
          }),
        ),
      );

    this.notify$ = playerService.snapshot$.pipe(
      combineLatestWith(notifyBeforSeconds$, this.isSoundOn$),
      filter(([snapshot, cfg, isSoundOn]) => {
        if (!isSoundOn || snapshot?.state !== 'playing') return false;

        const { currentMs: ms } = snapshot ?? { currentMs: 0 };
        // is any of configs time start meet current countdown value
        const isOneOf = cfg.some((c) => {
          const confms = c.at(0);
          return confms && isCloseTo(confms, ms);
        });

        return isOneOf;
      }),
      map(([snapshot, cfg]) => {
        const { currentMs: ms } = snapshot ?? { currentMs: 0 };

        const conf = cfg.find((c) => {
          const confms = c.at(0);
          return confms && isCloseTo(confms, ms);
        });

        const [startAt, stopAfter, intensity] = conf ?? [-1, 0, 1000];
        return { snapshot, startAt, intensity, stopAfter };
      }),
      switchMap(({ intensity, stopAfter }) => {
        return interval(intensity).pipe(takeUntil(interval(stopAfter)));
      }),

      tap(() => {
        this.play(0.1, 0.2, 0.3, 0.1);
      }),
    );

    this.notify$.subscribe();
  }

  public play(
    duration: number,
    attack: number = 0.1,
    release: number = 0.2,
    volume: number = 0.8,
    frequency: number = 864,
    type: OscillatorType = 'sine',
  ): void {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime,
    );

    // Set up the attack phase
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      volume,
      this.audioContext.currentTime + attack,
    );

    // Set up the release phase
    const endTime = this.audioContext.currentTime + duration;
    gainNode.gain.setValueAtTime(volume, endTime);
    gainNode.gain.linearRampToValueAtTime(0, endTime + release);

    oscillator.start();
  }
}
