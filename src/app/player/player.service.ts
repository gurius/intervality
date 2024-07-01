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
import { Playable, PlayableType } from '../models/playable/playable.model';
import { InitiallyStopwatchTimer, Timer } from '../models/playable/timer.model';
import { cloneDeep, drop, dropRight, omit, take, times } from 'lodash-es';
import { TimerSet } from '../models/playable/set.model';
import { INTERVAL_MS, PRESTART_DELAY } from '../config';

export type StepStatus = 'current' | 'done' | 'next';
export type StepInFocus = Timer & {
  status: StepStatus;
  remaining: number;
};

export interface PlayerSnapshot {
  past: number;
  ahead: number;
  currStepIdx: number;
  stepsInFocus: StepInFocus[];
  status: string;
  currentStepProgress: number;
  state:
    | 'prestart'
    | 'playing'
    | 'paused'
    | 'stoped'
    | 'commenced'
    | 'complete';
}

const snapshotTemplate: PlayerSnapshot = {
  past: 0,
  currStepIdx: 0,
  ahead: 0,
  currentStepProgress: 0,
  status: '',
  stepsInFocus: [],
  state: 'prestart',
};

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private snapshotSubject$ = new BehaviorSubject<PlayerSnapshot | null>(null);
  snapshot$ = this.snapshotSubject$.asObservable();
  sequence: Timer[] = [];
  seqIdx = 0;
  currentMs = 0;
  stopWatchMs = 0;

  stop$ = new Subject<void>();
  timestamp!: number;

  playing = false;
  commenced = false;

  snapshot!: PlayerSnapshot;
  initialSnapshot!: PlayerSnapshot;

  playable!: Playable;

  constructor() {}

  initializeSequnce(playable: Playable) {
    this.playable = playable;
    this.sequence = [];
    switch (playable.playableType) {
      case PlayableType.Countdown:
      case PlayableType.Stopwatch:
        this.sequence.push(omit(playable, ['playableType', 'id']) as Timer);
        break;
      case PlayableType.Set:
        const { repetitions, timers } = playable;
        const set = times(repetitions, () => cloneDeep(timers)).flat();
        this.sequence = this.sequence.concat(set);
        break;
      case PlayableType.SuperSet:
        const { repetitions: reps, setsAndTimers } = playable;
        const sset = times(reps, () => cloneDeep(setsAndTimers))
          .flat()
          .map((setOrTimer) => {
            if (!(setOrTimer as TimerSet).timers) {
              return cloneDeep(setOrTimer);
            } else {
              const { repetitions, timers } = setOrTimer as TimerSet;
              return times(repetitions, () => cloneDeep(timers)).flat();
            }
          })
          .flat();

        this.sequence = this.sequence.concat(sset as Timer[]);
        break;
    }

    // drop last rest
    if (
      this.sequence.length > 1 &&
      this.sequence.at(-1)?.name.toLowerCase().includes('rest')
    ) {
      this.sequence = dropRight(this.sequence);
    }

    const total = this.sequence
      .map((t) => t.value)
      .reduce((acc, curr) => acc + curr, 0);

    const stepsInFocus = this.getStepsStatuses(
      cloneDeep(take(this.sequence, 3)),
    );

    this.initialSnapshot = {
      ...snapshotTemplate,
      ahead: total,
      status: `step 1 of ${this.sequence.length}`,
      stepsInFocus: this.calculateRemainingRepetitions(stepsInFocus),
    };

    this.snapshotSubject$.next(this.initialSnapshot);
    this.snapshot = cloneDeep(this.initialSnapshot);
    this.currentMs = this.sequence.at(this.seqIdx)!.value;
  }

  commenceSequence(prestart: number) {
    this.commenced = true;
    this.snapshot.state = 'commenced';
  }

  play(prestart: number = PRESTART_DELAY) {
    if (!this.commenced) this.commenceSequence(prestart);

    this.timestamp = new Date().getTime();

    this.snapshot.state = 'playing';

    interval(INTERVAL_MS)
      .pipe(
        timeInterval(animationFrameScheduler),
        tap(({ interval }) => {
          const { stepsInFocus } = this.snapshot;
          const currentStep = this.sequence.at(this.seqIdx)!;

          // sotpwatch or countdown milliseconds update
          if (currentStep.timerType !== 'countdown' && !currentStep.value) {
            this.stopWatchMs += interval;
          } else {
            this.currentMs -= interval;
          }

          // when countdown reaches zero - stop playing
          if (currentStep.value && this.currentMs <= 0) {
            if (this.seqIdx + 1 === this.sequence.length) {
              this.stop();
              return;
            }

            this.seqIdx += 1;
            if (this.seqIdx >= 2) {
              this.updateStepsInFocus();
              this.getStepsStatuses(stepsInFocus);
              this.updateCurrentlyRunningStep(stepsInFocus);
            }
            // getting the next timer's milliseconds
            this.currentMs = this.sequence.at(this.seqIdx)!.value;
          } else {
            this.getStepsStatuses(stepsInFocus);
            this.updateCurrentlyRunningStep(stepsInFocus);
          }

          this.snapshot.past += interval;
          this.snapshot.status = `step ${this.seqIdx + 1} of ${this.sequence.length}`;
          this.snapshot.ahead = this.calculateAhead(interval);

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
    this.seqIdx = 0;
    this.currentMs = this.sequence.at(this.seqIdx)!.value;
    this.stopWatchMs = 0;
    this.initializeSequnce(this.playable);
    this.stop$.next();
  }

  goNext() {
    if (!(this.seqIdx + 1 >= this.sequence.length)) {
      ++this.seqIdx;
      this.switchStep();
    }
  }

  goPrev() {
    if (this.seqIdx > 0) {
      --this.seqIdx;
      this.switchStep(false);
    }
  }

  switchStep(isToNext: boolean = true) {
    const { stepsInFocus } = this.snapshot;
    this.currentMs = this.sequence.at(this.seqIdx)!.value;

    this.updateStepsInFocus(isToNext);

    this.getStepsStatuses(this.snapshot.stepsInFocus);

    this.updatePastAhead();

    this.updateCurrentlyRunningStep(stepsInFocus);

    this.snapshot.status = `step ${this.seqIdx + 1} of ${this.sequence.length}`;

    this.snapshotSubject$.next(this.snapshot);
  }

  stopwatchStop() {
    const currentStep = this.sequence[this.seqIdx];
    if (currentStep.timerType === 'hybrid') {
      this.sequence.forEach((step) => {
        if (step.name === currentStep.name) {
          step.value = this.stopWatchMs;
          step.timerType = 'countdown';
        }
      });
    }
    this.stopWatchMs = 0;

    if (this.seqIdx + 1 === this.sequence.length) {
      this.stop();
      return;
    }

    this.seqIdx += 1;

    this.currentMs = this.sequence.at(this.seqIdx)!.value;

    if (this.seqIdx >= 2) {
      this.updateStepsInFocus();
    }
  }

  updateStepsInFocus(dropFirst = true) {
    if (
      this.sequence.length <= this.seqIdx + 1 ||
      (!dropFirst && this.sequence.length <= this.seqIdx + 2) ||
      (dropFirst && this.seqIdx <= 1) ||
      (!dropFirst && this.seqIdx <= 0)
    )
      return;

    const { stepsInFocus } = this.snapshot;
    const update = dropFirst ? drop(stepsInFocus) : dropRight(stepsInFocus);
    const idx = dropFirst ? this.seqIdx + 1 : this.seqIdx - 1;
    const newStep: StepInFocus = {
      ...cloneDeep(this.sequence.at(idx)!),
      status: 'next',
      remaining: 0,
    };
    if (dropFirst) {
      update.push(newStep);
    } else {
      update.unshift(newStep);
    }
    this.snapshot.stepsInFocus = this.calculateRemainingRepetitions(update);
  }

  updateCurrentlyRunningStep(stepsInFocus: StepInFocus[]) {
    // gett current step
    const currentInFocus = stepsInFocus.find(
      (step) => step.status === 'current',
    );
    const currentStep = this.sequence.at(this.seqIdx)!;
    // update it's value
    if (currentStep.timerType !== 'countdown' && !currentStep.value) {
      currentInFocus && (currentInFocus.value = this.stopWatchMs);
    } else {
      currentInFocus && (currentInFocus.value = this.currentMs);
      this.snapshot.currentStepProgress =
        100 - (100 / currentStep.value) * this.currentMs;
    }
  }

  getStatus(i: number): StepStatus {
    const states: {
      first: StepStatus[];
      middle: StepStatus[];
      last: StepStatus[];
    } = {
      first: ['current', 'next', 'next'],
      middle: ['done', 'current', 'next'],
      last: ['done', 'done', 'current'],
    };
    const isFirst = this.seqIdx === 0;
    const isLast = this.seqIdx + 1 === this.sequence.length;
    switch (true) {
      case isLast && !isFirst:
        return states.last.at(i)!;
      case isFirst && !isLast:
        return states.first.at(i)!;
      default:
        return states.middle.at(i)!;
    }
  }

  getStepsStatuses<T extends Timer | StepInFocus>(steps: T[]) {
    steps.forEach((step, i) => {
      Object.assign(step, {
        status: this.getStatus(i),
      });
    });
    return steps as StepInFocus[];
  }

  calculateRemainingRepetitions(stepsInFocus: StepInFocus[]) {
    stepsInFocus.forEach((step) => {
      step.remaining = this.sequence
        .slice(this.seqIdx)
        .filter((s) => s.name === step.name)
        .map(() => 1)
        .reduce((acc, curr) => acc + curr, 0);
    });
    return stepsInFocus;
  }

  calculateAhead(interval: number) {
    const ahead =
      this.stopWatchMs > 0
        ? this.snapshot.ahead + interval
        : this.sequence
            .map((t) => t.value)
            .reduce((acc, curr) => acc + curr, 0) - this.snapshot.past;

    return ahead;
  }

  onRewind() {
    const { stepsInFocus, currentStepProgress } = this.snapshot;
    const currentInFocus = stepsInFocus.find((s) => s.status === 'current');

    const step = this.sequence.at(this.seqIdx)!;
    if (currentInFocus) {
      this.currentMs = currentInFocus.value =
        (step.value / 100) * (100 - currentStepProgress);
    }
    this.updatePastAhead();
  }

  updatePastAhead() {
    this.snapshot.past = this.sequence
      .slice(0, this.seqIdx)
      .map((s) => s.value)
      .reduce((acc, curr) => acc + curr, 0);

    this.snapshot.ahead = this.sequence
      .slice(this.seqIdx)
      .map((s) => s.value)
      .reduce((acc, curr) => acc + curr, 0);
  }
}
