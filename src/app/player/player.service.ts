import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  animationFrameScheduler,
  interval,
  takeUntil,
  tap,
  timeInterval,
} from 'rxjs';
import { Playable } from '../models/playable/playable.model';
import { Timer } from '../models/playable/timer.model';
import { cloneDeep } from 'lodash-es';
import { INTERVAL_MS, PRESTART_DELAY_MS } from '../config';
import { Sequence } from './sequence/sequence';
import { PlayableService } from '../playable/playable.service';
import { AudioService } from '../shared/services/audio.service';
import { SettingsService } from '../settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogueService } from '../modal/dialogue.service';

export type State =
  | null
  | 'prestart'
  | 'playing'
  | 'paused'
  | 'stoped'
  | 'commenced'
  | 'complete';

export type StepStatus = 'current' | 'done' | 'next';
export type StepInFocus = Timer & {
  status: StepStatus;
  remaining: number;
};

export interface PlayerSnapshot {
  past: number;
  ahead: number;
  currStepIdx: number;
  currentMs: number;
  stopWatchMs: number;
  status: string;
  currentStepProgress: number;
  state: State;
  prestart: number;
}

const snapshotTemplate: PlayerSnapshot = {
  past: 0,
  currStepIdx: 0,
  ahead: 0,
  currentStepProgress: 0,
  status: '',
  currentMs: 0,
  stopWatchMs: 0,
  state: 'prestart',
  prestart: PRESTART_DELAY_MS,
};

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private snapshotSubject$ = new BehaviorSubject<PlayerSnapshot | null>(null);
  snapshot$ = this.snapshotSubject$.asObservable();

  private stepEmitter$ = new Subject<{ direction: 'forward' | 'backward' }>();
  step$ = this.stepEmitter$.asObservable();

  private stageEmitter$: BehaviorSubject<State> = new BehaviorSubject(
    'prestart' as State,
  );

  stage$ = this.stageEmitter$.asObservable();

  sequence!: Sequence;
  currentMs = 0;
  stopwatchMs = 0;

  stop$ = new Subject<void>();
  timestamp!: number;

  playing = false;
  commenced = false;

  snapshot!: PlayerSnapshot;
  initialSnapshot!: PlayerSnapshot;

  playableSubject$ = new Subject<Playable | null>();
  playable$ = this.playableSubject$.asObservable();
  currentPlayableId: string = '';

  constructor(
    private playableService: PlayableService,
    private audioService: AudioService,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private dialogueService: DialogueService,
  ) {}

  initializeSequnce(playable: Playable) {
    this.playableSubject$.next(playable);
    this.currentPlayableId = playable.id;
    this.sequence = new Sequence(
      playable,
      this.dialogueService,
      this.translateService,
      this.settingsService.getConfigValueOf('last-rest-removal')
        ?.value as boolean,
      this.settingsService.getConfigValueOf('rest-timer-id')?.value as string,
    );

    this.initialSnapshot = {
      ...snapshotTemplate,
      ahead: this.sequence.ahead,
      status: this.translateService.instant('Player.StepOutOf', {
        n: 1,
        len: this.sequence.length,
      }),
      currentMs: this.sequence.step.value,
    };

    this.snapshotSubject$.next(this.initialSnapshot);
    this.snapshot = cloneDeep(this.initialSnapshot);
  }

  startBefore: number =
    (this.settingsService.getConfigValueOf('prestart-delay')?.value as number) +
    1000;

  commenceSequence(prestart: number) {
    this.commenced = true;
    this.snapshot.state = 'commenced';
    this.snapshot.prestart = prestart;
    this.snapshot.past = this.sequence.passed;
    this.snapshot.ahead = this.sequence.ahead;
    this.snapshotSubject$.next(this.snapshot);
    this.currentMs = this.sequence.step.value;

    const s = interval(INTERVAL_MS)
      .pipe(
        timeInterval(animationFrameScheduler),
        tap(({ interval }) => {
          this.snapshot.prestart -= interval;
          this.snapshotSubject$.next(this.snapshot);

          this.callBeforeEnd(this.snapshot.prestart, () => {
            if (
              !this.settingsService.getConfigValueOf('sound-notification')
                ?.value
            )
              return;

            this.audioService.play(
              this.startBefore > 0 ? 'recurring' : 'before-next',
            );
          });

          if (this.snapshot.prestart <= 1000) {
            // stop prestart and switch to playing
            s.unsubscribe();
            this.startBefore = this.settingsService.getConfigValueOf(
              'prestart-delay',
            )?.value as number;
            this.play();
          }
        }),
        takeUntil(this.stop$),
      )
      .subscribe();
  }

  play(
    prestart: number = this.settingsService.getConfigValueOf('prestart-delay')
      ?.value as number,
  ) {
    if (!this.commenced) {
      this.commenceSequence(prestart);
      return;
    }

    this.timestamp = new Date().getTime();

    this.snapshot.state = 'playing';
    this.playing = true;

    interval(INTERVAL_MS)
      .pipe(
        timeInterval(animationFrameScheduler),
        tap(({ interval }) => {
          const currentStep = this.sequence.step;

          // sotpwatch or countdown milliseconds update
          if (currentStep.timerType !== 'countdown' && !currentStep.value) {
            this.stopwatchMs += interval;
          } else {
            this.currentMs -= interval;
          }

          this.callBeforeEnd(this.currentMs, () => {
            if (
              !this.settingsService.getConfigValueOf('sound-notification')
                ?.value
            )
              return;

            this.audioService.play(
              this.startBefore > 0 ? 'recurring' : 'before-next',
            );
          });

          // when countdown reaches zero - stop playing
          if (currentStep.timerType === 'countdown' && this.currentMs <= 0) {
            if (this.sequence.isLastStep) {
              this.stop(true);
              if (
                this.settingsService.getConfigValueOf('sound-notification')
                  ?.value
              ) {
                setTimeout(() => {
                  this.audioService.play('finish');
                }, 500);
              }
              return;
            }

            this.sequence.goForward(() => {
              this.stepEmitter$.next({ direction: 'forward' });
            });
            this.currentMs = this.sequence.step.value;
            this.startBefore = this.settingsService.getConfigValueOf(
              'prestart-delay',
            )?.value as number;
          }

          this.snapshot.past += interval;
          this.snapshot.status = this.translateService.instant(
            'Player.StepOutOf',
            {
              n: this.sequence.idx + 1,
              len: this.sequence.length,
            },
          );
          this.snapshot.ahead = this.calculateAhead(interval);
          this.snapshot.currentMs = this.currentMs;
          this.snapshot.stopWatchMs = this.stopwatchMs;
          this.snapshot.currentStepProgress =
            100 - (100 / currentStep.value) * this.currentMs;
          this.snapshotSubject$.next(this.snapshot);
        }),
        takeUntil(this.stop$),
      )
      .subscribe();
  }

  pause() {
    this.snapshot.state = 'paused';
    this.stop$.next();
  }

  stop(softStop: boolean = false) {
    this.stop$.next();

    this.currentMs = this.sequence.step.value;
    const state = softStop ? 'complete' : 'stoped';
    this.stopwatchMs = 0;
    this.playing = false;
    this.commenced = false;
    this.snapshot.state = state;
    this.snapshot.currentMs = this.currentMs;

    this.stageEmitter$.next(state);
    this.snapshotSubject$.next(this.snapshot);

    if (!softStop) {
      this.sequence.reset();
      this.snapshotSubject$.next(this.initialSnapshot);
      this.snapshot.status = this.translateService.instant('Player.StepOutOf', {
        n: 1,
        len: this.sequence.length,
      });
    }

    this.snapshot.currentStepProgress = 0;
  }

  goNext() {
    this.sequence.goForward(() => {
      const { value } = this.sequence.step;
      this.currentMs = value;
      this.updatePastAhead();
      this.snapshot.currentStepProgress = 100 - (100 / value) * this.currentMs;
      this.snapshot.status = this.translateService.instant('Player.StepOutOf', {
        n: this.sequence.idx + 1,
        len: this.sequence.length,
      });
      this.stepEmitter$.next({ direction: 'forward' });
      this.snapshotSubject$.next(this.snapshot);
    });
  }

  goPrev() {
    this.sequence.goBackwards(() => {
      const { value } = this.sequence.step;
      this.currentMs = value;
      this.updatePastAhead();
      this.snapshot.currentStepProgress = 100 - (100 / value) * this.currentMs;
      this.snapshot.status = this.translateService.instant('Player.StepOutOf', {
        n: this.sequence.idx + 1,
        len: this.sequence.length,
      });
      this.stepEmitter$.next({ direction: 'backward' });
      this.snapshotSubject$.next(this.snapshot);
    });
  }

  stopwatchStop() {
    this.sequence
      .isTransformable()
      ?.transformToCountdown(this.stopwatchMs, () => {
        this.playableService.updateAsCountdownByName(
          this.currentPlayableId,
          this.sequence.step.name,
          this.stopwatchMs,
        );
      });

    this.stopwatchMs = 0;

    this.snapshot.ahead = this.sequence.ahead;

    if (this.sequence.isLastStep) {
      this.snapshot.ahead = 0;
      this.stop(true);
      return;
    } else {
      this.sequence.goForward(() => {
        this.stepEmitter$.next({ direction: 'forward' });
      });

      this.currentMs = this.sequence.step.value;
    }
  }

  calculateAhead(interval: number) {
    const ahead =
      this.stopwatchMs > 0
        ? this.snapshot.ahead + interval
        : this.sequence.total - this.snapshot.past;

    return ahead;
  }

  onRewind() {
    const { currentStepProgress } = this.snapshot;

    const step = this.sequence.step;
    if (step) {
      this.currentMs = (step.value / 100) * (100 - currentStepProgress);
    }

    this.snapshot.currentMs = this.currentMs;
    this.updatePastAhead();

    this.snapshotSubject$.next(this.snapshot);
  }

  // for use with goNext, goPrev, onRewind,
  updatePastAhead() {
    const passed = this.sequence.step.value - this.currentMs;
    this.snapshot.past = this.sequence.passed + passed;
    this.snapshot.ahead = this.sequence.ahead - passed;
  }

  reset() {
    this.sequence.reset();
    this.currentMs = 0;
    this.stopwatchMs = 0;
    this.timestamp = 0;
    this.playing = false;
    this.commenced = false;
    this.stop();
    this.snapshotSubject$.next(null);
    this.stageEmitter$.next(null);
    this.playableSubject$.next(null);
  }

  callBeforeEnd(currentMs: number, fn: () => void) {
    const pred = Math.floor(currentMs / (this.startBefore + 4));

    if (!(pred >= 1) && this.startBefore >= 0) {
      console.log(currentMs, this.startBefore, pred);
      fn();
      this.startBefore -= 1000;
    }
  }
}
