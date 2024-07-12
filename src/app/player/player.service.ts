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
import { INTERVAL_MS, PRESTART_DELAY_MS, SOUND_NOTIFICATION } from '../config';
import { Sequence } from './sequence/sequence';
import { PlayableService } from '../playable/playable.service';
import { AudioService } from '../shared/services/audio.service';

export type State =
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

  playable!: Playable;

  constructor(
    private playableService: PlayableService,
    private audioService: AudioService,
  ) {}

  initializeSequnce(playable: Playable) {
    this.playable = playable;
    this.sequence = new Sequence(playable);

    this.initialSnapshot = {
      ...snapshotTemplate,
      ahead: this.sequence.ahead,
      status: `step 1 of ${this.sequence.length}`,
      currentMs: this.sequence.step.value,
    };

    this.snapshotSubject$.next(this.initialSnapshot);
    this.snapshot = cloneDeep(this.initialSnapshot);
    this.currentMs = this.sequence.step.value;
  }
  startBefore: number = PRESTART_DELAY_MS;

  commenceSequence(prestart: number) {
    this.commenced = true;
    this.snapshot.state = 'commenced';
    this.snapshot.prestart = prestart;

    const s = interval(INTERVAL_MS)
      .pipe(
        timeInterval(animationFrameScheduler),
        tap(({ interval }) => {
          this.snapshot.prestart -= interval;
          this.snapshotSubject$.next(this.snapshot);

          this.soundSignal(this.snapshot.prestart);

          if (this.snapshot.prestart <= 1000) {
            // stop prestart and switch to playing
            s.unsubscribe();
            this.startBefore = PRESTART_DELAY_MS;
            this.play();
          }
        }),
      )
      .subscribe();
  }

  soundSignal(currentMs: number) {
    if (!SOUND_NOTIFICATION) return;
    const pred = Math.floor(currentMs / this.startBefore);
    if (!(pred >= 1) && this.startBefore > 0) {
      this.audioService.play(
        this.startBefore === 1000 ? 'before-next' : 'recurring',
      );

      this.startBefore -= 1000;
    }
  }

  play(prestart: number = PRESTART_DELAY_MS) {
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

          this.soundSignal(this.currentMs);

          // when countdown reaches zero - stop playing
          if (currentStep.timerType === 'countdown' && this.currentMs <= 0) {
            if (this.sequence.isLastStep) {
              this.stop();
              if (SOUND_NOTIFICATION) {
                this.audioService.play('finish');
              }
              return;
            }

            this.sequence.goForward(() => {
              this.stepEmitter$.next({ direction: 'forward' });
            });
            this.currentMs = this.sequence.step.value;
            this.startBefore = PRESTART_DELAY_MS;
          }

          this.snapshot.past += interval;
          this.snapshot.status = `step ${this.sequence.idx + 1} of ${this.sequence.length}`;
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

  calculateDelta() {
    const passedMs = new Date().getTime() - this.timestamp;
    return passedMs;
  }

  stop() {
    this.stop$.next();

    this.sequence.reset();
    this.updatePastAhead();
    this.currentMs = this.sequence.step.value;
    this.stopwatchMs = 0;
    this.playing = false;
    this.commenced = false;
    this.snapshot.state = 'stoped';
    this.stageEmitter$.next('stoped');
  }

  goNext() {
    this.sequence.goForward(() => {
      const { value } = this.sequence.step;
      this.currentMs = value;
      this.updatePastAhead();
      this.snapshot.currentStepProgress = 100 - (100 / value) * this.currentMs;
      this.snapshot.status = `step ${this.sequence.idx + 1} of ${this.sequence.length}`;
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
      this.snapshot.status = `step ${this.sequence.idx + 1} of ${this.sequence.length}`;
      this.stepEmitter$.next({ direction: 'backward' });
      this.snapshotSubject$.next(this.snapshot);
    });
  }

  stopwatchStop() {
    this.sequence
      .isTransformable()
      ?.transformToCountdown(this.stopwatchMs, () => {
        this.playableService.updateAsCountdownByName(
          this.playable.id,
          this.sequence.step.name,
          this.stopwatchMs,
        );
      });

    this.stopwatchMs = 0;

    if (this.sequence.isLastStep) {
      this.stop();
      return;
    }

    this.sequence.goForward(() => {
      this.stepEmitter$.next({ direction: 'forward' });
    });

    this.currentMs = this.sequence.step.value;
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
  }
}
