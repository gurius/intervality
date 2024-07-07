import { Component, Input, OnInit, inject } from '@angular/core';
import {
  PlayableSuperset,
  PlayableType,
  PlayableTypeStr,
  blank,
  blankSt,
} from '../../models/playable/playable.model';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Submittable } from '../editor.component';
import {
  CountdownForm,
  StopwatchForm,
} from '../timer-form-array/timer-form.component';
import { TimerSet } from '../../models/playable/set.model';
import { Timer } from '../../models/playable/timer.model';
import { DataService } from '../../data.service';

export type SetFormGroup = FormGroup<{
  name: FormControl<string>;
  repetitions: FormControl<number>;
  timers: FormArray<StopwatchForm | CountdownForm>;
}>;

export type TimerFormGroup = StopwatchForm | CountdownForm;

export type SetsAndTimersFormArray = FormArray<SetFormGroup | TimerFormGroup>;

@Component({
  selector: 'app-super-set-form',
  templateUrl: './super-set-form.component.html',
  styleUrl: './super-set-form.component.css',
})
export class SuperSetFormComponent implements Submittable, OnInit {
  @Input('super-set') superSet!: PlayableSuperset;
  @Input() supersetForm!: FormGroup;

  private fb = inject(NonNullableFormBuilder);
  private dataService = inject(DataService);

  isAddMenuVisible = false;

  ngOnInit(): void {
    const { name, repetitions } = this.superSet;

    this.supersetForm.addControl(
      'name',
      this.fb.control(name || '', Validators.required),
    );

    this.supersetForm.addControl(
      'repetitions',
      this.fb.control(repetitions || 1, Validators.required),
    );

    this.supersetForm.addControl(
      'setsAndTimers',
      this.fb.array(this.setsAndTimersFormGroups),
    );
  }

  get setsAndTimersFormGroups() {
    return this.superSet.setsAndTimers.map((st) => {
      return this.fb.group({});
    });
  }

  getIsSet(idx: number) {
    const st = this.superSet.setsAndTimers.at(idx);
    return !!st && st.hasOwnProperty('timers');
  }

  getSetMeta(idx: number) {
    const st = this.superSet.setsAndTimers.at(idx);
    if (!st || !st.hasOwnProperty('timers')) {
      throw new Error('missing set or unexpected timer item');
    }
    return st as Omit<TimerSet, 'id'>;
  }

  getTimersMeta(idx: number) {
    const st = this.superSet.setsAndTimers.at(idx);
    if (!st || st.hasOwnProperty('timers')) {
      throw new Error('missing timer or unexpected set item');
    }
    return st as Timer;
  }

  get setsAndTimersArray() {
    return this.supersetForm.get('setsAndTimers') as SetsAndTimersFormArray;
  }

  addTimer(e: Event, type: PlayableTypeStr) {
    e.stopPropagation();

    this.isAddMenuVisible = false;
    this.superSet.setsAndTimers.push(this.createItem(type));
    (this.supersetForm.get('setsAndTimers') as FormArray).push(
      this.fb.group({}),
    );
  }

  createItem(type: PlayableTypeStr): Omit<TimerSet, 'id'> | Timer {
    switch (type) {
      case 'countdown':
        return blankSt(PlayableType.Countdown);

      case 'stopwatch':
        return blankSt(PlayableType.Stopwatch);

      case 'set':
      default:
        return blankSt(PlayableType.Set);
    }
  }

  // TODO: implement getting a real timers
  get existingTimers() {
    return [
      { value: 'run', label: 'Run' },
      { value: 'jump', label: 'Jump' },
      { value: 'plank', label: 'Plank' },
      { value: 'stretching', label: 'Stretching' },
    ];
  }

  openAddMenu() {
    this.isAddMenuVisible = true;
  }

  removeItem(idx: number) {
    this.superSet.setsAndTimers.splice(idx, 1);

    this.setsAndTimersArray.removeAt(idx);
  }

  submit() {
    const { setsAndTimers, ...nameAndReps } =
      this.supersetForm.getRawValue() as PlayableSuperset;

    const superset: PlayableSuperset = {
      ...nameAndReps,
      ...(this.superSet.id ? { id: this.superSet.id } : {}),
      playableType: PlayableType.Superset,
      setsAndTimers: setsAndTimers.map((t) => {
        if ((t as Omit<TimerSet, 'id'>).timers) {
          (t as Omit<TimerSet, 'id'>).timers.forEach((t) => {
            t.value = t.value ? t.value * 1000 : 0;
            t.timerType = t.timerType ?? 'countdown';
          });
        } else {
          const timer = t as Timer;
          timer.value = timer.value ? timer.value * 1000 : 0;
          timer.timerType = timer.timerType ?? 'countdown';
        }
        return t;
      }),
    };

    console.log(superset);
    this.dataService.updsertItem(superset);
  }
}
