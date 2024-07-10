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
import { INTERVAL_MS, PRESTART_DELAY } from '../config';
import { Sequence } from './sequence/sequence';
import { PlayableService } from '../playable/playable.service';

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
  stopWatchMs = 0;

  stop$ = new Subject<void>();
  timestamp!: number;

  playing = false;
  commenced = false;

  snapshot!: PlayerSnapshot;
  initialSnapshot!: PlayerSnapshot;

  playable!: Playable;

  constructor(private playableService: PlayableService) {}

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

  commenceSequence(prestart: number) {
    this.commenced = true;
    this.snapshot.state = 'commenced';
  }

  play(prestart: number = PRESTART_DELAY) {
    if (!this.commenced) this.commenceSequence(prestart);

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
            this.stopWatchMs += interval;
          } else {
            this.currentMs -= interval;
          }

          // when countdown reaches zero - stop playing
          if (currentStep.timerType === 'countdown' && this.currentMs <= 0) {
            if (this.sequence.isLastStep) {
              this.stop();
              return;
            }

            this.sequence.goForward(() => {
              this.stepEmitter$.next({ direction: 'forward' });
            });
            this.currentMs = this.sequence.step.value;
          }

          this.snapshot.past += interval;
          this.snapshot.status = `step ${this.sequence.idx + 1} of ${this.sequence.length}`;
          this.snapshot.ahead = this.calculateAhead(interval);
          this.snapshot.currentMs = this.currentMs;
          this.snapshot.stopWatchMs = this.stopWatchMs;
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
    this.stopWatchMs = 0;
    this.playing = false;
    this.snapshot.state = 'stoped';
    this.stageEmitter$.next('stoped');
  }

  goNext() {
    this.sequence.goForward(() => {
      const { value } = this.sequence.step;
      this.currentMs = value;
      this.updatePastAhead();
      this.snapshot.currentStepProgress = 100 - (100 / value) * this.currentMs;
      this.stepEmitter$.next({ direction: 'forward' });
    });
  }

  goPrev() {
    this.sequence.goBackwards(() => {
      const { value } = this.sequence.step;
      this.currentMs = value;
      this.updatePastAhead();
      this.snapshot.currentStepProgress = 100 - (100 / value) * this.currentMs;
      this.stepEmitter$.next({ direction: 'backward' });
    });
  }

  stopwatchStop() {
    this.sequence
      .isTransformable()
      ?.transformToCountdown(this.stopWatchMs, () => {
        this.playableService.updateAsCountdownByName(
          this.playable.id,
          this.sequence.step.name,
          this.stopWatchMs,
        );
      });

    this.stopWatchMs = 0;

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
      this.stopWatchMs > 0
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
    this.snapshot.past = this.sequence.passed;
    this.snapshot.ahead = this.sequence.ahead;
  }

  reset() {
    this.sequence.reset();
    this.currentMs = 0;
    this.stopWatchMs = 0;
    this.timestamp = 0;
    this.playing = false;
    this.commenced = false;
    this.stop();
    this.snapshotSubject$.next(null);
  }
}
