import { cloneDeep, pick, times } from 'lodash-es';
import { Playable } from '../../models/playable/playable.model';
import { Timer, TimerType } from '../../models/playable/timer.model';
import { StepInFocus, StepStatus } from '../player.service';
import { TimerSet } from '../../models/playable/set.model';
import { DialogueService } from '../../modal/dialogue.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, first } from 'rxjs';
import { SettingsService } from '../../settings/settings.service';
import { isBoolean, isString, typeGuard } from '../../utils';

export class Sequence {
  private currentIdx = 0;
  private isRemoveLastStep!: boolean;
  private restId: string = 'rest';

  dialogueService: DialogueService;
  translateService: TranslateService;
  steps: Array<StepInFocus>;

  subscription: Subscription;

  cleanUp(): void {
    this.subscription.unsubscribe();
  }

  constructor(
    playable: Playable,
    dialogueService: DialogueService,
    translateService: TranslateService,
    settingsService: SettingsService,
  ) {
    this.subscription = settingsService
      .getParam('last-rest-removal')
      .pipe(typeGuard(isBoolean))
      .subscribe((x) => {
        this.isRemoveLastStep = x;
      });

    this.subscription.add(
      settingsService
        .getParam('rest-timer-id')
        .pipe(typeGuard(isString))
        .subscribe((x) => {
          this.restId = x;
        }),
    );

    this.translateService = translateService;
    this.dialogueService = dialogueService;
    switch (playable.playableType) {
      case 'countdown':
      case 'stopwatch':
        this.steps = [new Step(playable)];
        break;
      case 'set':
        const { repetitions, timers } = playable;
        const set = times(repetitions, () => cloneDeep(timers))
          .flat()
          .map((t) => new Step(t));
        this.steps = set;
        break;
      case 'superset':
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

        this.steps = sset;
        break;
    }

    const firstStep = this.steps.at(0);
    if (firstStep) firstStep.status = 'current';

    // remove last step if it's rest since it's the end of an exercise
    if (
      this.steps.length > 1 &&
      this.steps
        .at(-1)
        ?.name.toLowerCase()
        .trim()
        .includes(this.restId.toLowerCase())
    ) {
      if (this.isRemoveLastStep) {
        this.steps.splice(-1);
      } else {
        this.dialogueService
          .open({
            title: this.translateService.instant('Settings.RemoveLastRest'),
            content: this.translateService.instant(
              'Settings.RemoveLastRestLabel',
            ),
          })
          .pipe(first())
          .subscribe((isConfirm) => {
            if (isConfirm) this.steps.splice(-1);
          });
      }
    }

    this.initializeEachRemaining();
  }

  private initializeEachRemaining() {
    this.steps.forEach((step) => {
      step.remaining = this.steps
        .filter((s) => s.name === step.name && s.remaining === 0)
        .map(() => 1)
        .reduce((acc, curr) => acc + curr, 0);
    });
  }

  get length() {
    return this.steps.length;
  }

  get idx() {
    return this.currentIdx;
  }

  get step() {
    const step = this.steps.at(this.currentIdx);
    if (step) {
      return step;
    } else {
      throw new Error(
        'Unexpected: step is not found or index out of boundaries',
      );
    }
  }

  get passed() {
    return this.steps
      .slice(0, this.idx)
      .map((s) => s.value)
      .reduce((acc, curr) => acc + curr, 0);
  }

  get ahead() {
    return this.steps
      .slice(this.idx)
      .map((s) => s.value)
      .reduce((acc, curr) => acc + curr, 0);
  }

  get total() {
    return this.steps.map((s) => s.value).reduce((acc, curr) => acc + curr, 0);
  }

  set updateStepValue(value: number) {
    const step = this.steps.at(this.currentIdx);
    if (step) {
      step.value = value;
    } else {
      throw new Error(
        'Unexpected: step is not found or index out of boundaries',
      );
    }
  }

  get isLastStep() {
    return this.currentIdx + 1 >= this.steps.length;
  }

  goBackwards(onSuccess?: () => void) {
    if (this.currentIdx > 0) {
      --this.currentIdx;
      this.updateStepsStatuses();
      if (onSuccess) onSuccess();
    }
  }

  goForward(onSuccess?: () => void) {
    if (!(this.currentIdx + 1 >= this.steps.length)) {
      this.currentIdx++;
      this.updateStepsStatuses();
      if (onSuccess) onSuccess();
    }
  }

  updateStepsStatuses() {
    this.steps.forEach((step, i) => {
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
    this.updateStepsStatuses();
  }

  isTransformable(): Sequence | void {
    if (
      this.step.timerType === 'hybrid' ||
      this.step.timerType === 'converted'
    ) {
      return this;
    }
  }

  transformToCountdown(value: number, onSuccess?: () => void) {
    const { name, timerType } = this.step;
    let convertible = this.steps.some(
      (step) => step.timerType === 'converted' && step.name === name,
    );
    this.steps.forEach((step) => {
      if (step.name === name && step.timerType === timerType) {
        step.value = value;
        step.timerType = 'countdown';
      }
    });
    if (convertible && onSuccess) {
      onSuccess();
    }
  }

  get reportValue() {
    return this.steps.map((s) => pick(s, ['name', 'value']));
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
