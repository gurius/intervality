import { cloneDeep, times } from 'lodash-es';
import { Playable, PlayableType } from '../../models/playable/playable.model';
import { Timer, TimerType } from '../../models/playable/timer.model';
import { StepInFocus, StepStatus } from '../player.service';
import { TimerSet } from '../../models/playable/set.model';
import { REMOVE_LAST_REST } from '../../config';

export class Sequence extends Array<StepInFocus> {
  private currentIdx = 0;

  constructor(playable: Playable) {
    super();
    switch (playable.playableType) {
      case PlayableType.Countdown:
      case PlayableType.Stopwatch:
        this.push(new Step(playable));
        break;
      case PlayableType.Set:
        const { repetitions, timers } = playable;
        const set = times(repetitions, () => cloneDeep(timers))
          .flat()
          .map((t) => new Step(t));
        this.push(...set);
        break;
      case PlayableType.Superset:
        const { repetitions: reps, setsAndTimers } = playable;
        const sset = times(reps, () => cloneDeep(setsAndTimers))
          .flat()
          .map((setOrTimer) => {
            if (!(setOrTimer as TimerSet).timers) {
              return new Step(setOrTimer as Timer);
            } else {
              const { repetitions, timers } = setOrTimer as TimerSet;
              return times(repetitions, () => cloneDeep(timers))
                .flat()
                .map((t) => new Step(t));
            }
          })
          .flat();

        this.push(...sset);
        break;
    }

    const first = this.at(0);
    if (first) first.status = 'current';

    // remove last step if it's rest since it's the end of an exercise
    if (
      REMOVE_LAST_REST &&
      this.length > 1 &&
      this.at(-1)?.name.toLowerCase().includes('rest')
    ) {
      this.splice(-1);
    }

    this.initializeEachRemaining();
  }

  private initializeEachRemaining() {
    this.forEach((step) => {
      step.remaining = this.filter(
        (s) => s.name === step.name && s.remaining === 0,
      )
        .map(() => 1)
        .reduce((acc, curr) => acc + curr, 0);
    });
  }

  get idx() {
    return this.currentIdx;
  }

  get step() {
    const step = this.at(this.currentIdx);
    if (step) {
      return step;
    } else {
      throw new Error(
        'Unexpected: step is not found or index out of boundaries',
      );
    }
  }

  set updateStepValue(value: number) {
    const step = this.at(this.currentIdx);
    if (step) {
      step.value = value;
    } else {
      throw new Error(
        'Unexpected: step is not found or index out of boundaries',
      );
    }
  }

  get isLastStep() {
    return this.currentIdx + 1 >= this.length;
  }

  goBackwards(onSuccess?: () => void) {
    if (this.currentIdx > 0) {
      --this.currentIdx;
      this.updateStepsStatuses();
      if (onSuccess) onSuccess();
    }
  }

  goForward(onSuccess?: () => void) {
    if (!(this.currentIdx + 1 >= this.length)) {
      this.currentIdx++;
      this.updateStepsStatuses();
      if (onSuccess) onSuccess();
    }
  }

  updateStepsStatuses() {
    this.forEach((step, i) => {
      if (i < this.currentIdx) {
        step.status = 'done';
      } else if (i > this.currentIdx) {
        step.status = 'next';
      } else {
        step.status = 'current';
      }
    });
  }

  reset() {
    this.currentIdx = 0;
    this.initializeEachRemaining();
    this.updateStepsStatuses();
  }

  isTransformable(): Sequence | void {
    if (this.step.timerType === 'hybrid') {
      return this;
    } else if (this.step.timerType === 'converted') {
      return this;
    }
  }

  transformToCountdown(value: number, onSuccess?: () => void) {
    let convertable = false;
    this.forEach((step) => {
      if (step.name === this.step.name) {
        convertable = step.timerType === 'converted';
        step.value = value;
        step.timerType = 'countdown';
      }
    });
    if (convertable && onSuccess) {
      onSuccess();
    }
  }
}

export class Step {
  name: string;
  value: number;
  timerType: TimerType;
  status: StepStatus;
  private _remaining: number = 0;

  constructor(timer: Timer, status: StepStatus = 'next') {
    this.name = timer.name;
    this.value = timer.value ?? 0;
    this.timerType = timer.timerType;
    this.status = status;
  }

  set remaining(n: number) {
    this._remaining = n;
  }

  get remaining() {
    return this._remaining;
  }
}
