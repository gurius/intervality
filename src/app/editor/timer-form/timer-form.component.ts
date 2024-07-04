import { Component, Input, OnInit, SkipSelf, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Timer, TimerType } from '../../models/playable/timer.model';

export type StopwatchForm = FormGroup<{
  name: FormControl<string>;
  timerType: FormControl<string>;
}>;

export type CountdownForm = FormGroup<{
  name: FormControl<string>;
  value: FormControl<number>;
}>;

@Component({
  selector: 'app-timer-form',
  templateUrl: './timer-form.component.html',
  styleUrl: './timer-form.component.css',
  // viewProviders: [
  //   {
  //     provide: ControlContainer,
  //     useFactory: () => inject(ControlContainer, { SkipSelf: true }),
  //   },
  // ],
})
export class TimerFormComponent implements OnInit {
  @Input({ required: true }) group!: FormGroup;
  @Input({ required: true }) timers!: Timer[];

  fb = inject(NonNullableFormBuilder);

  isAddMenuVisible = false;

  ngOnInit(): void {
    this.group.addControl('timers', this.fb.array(this.timersMeta));
  }

  get timersArray() {
    return this.group.get('timers') as FormArray<FormGroup>;
  }

  getTimerMeta(idx: number) {
    return this.timers.at(idx);
  }

  get timersMeta() {
    return this.timers.map((t) => {
      return this.createTimerForm(t.timerType, t);
    });
  }

  getGroupHasCtrl(g: FormGroup, prop: string) {
    return g.controls.hasOwnProperty(prop);
  }

  get timerTypes() {
    return [
      { value: 'stopwatch', label: 'Stopwatch' },
      // { value: 'countdown', label: 'Countdown' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'converted', label: 'Converted' },
    ];
  }

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

  addTimer(e: Event, type: TimerType) {
    e.stopPropagation();

    this.isAddMenuVisible = false;
    this.timersArray.push(this.createTimerForm(type));
  }

  createTimerForm(type: TimerType, t?: Timer): StopwatchForm | CountdownForm {
    let timer: StopwatchForm | CountdownForm;

    switch (type) {
      case 'countdown':
        const value = t?.value ? t.value / 1000 : 5;
        timer = this.fb.group({
          name: [t?.name || '', Validators.required],
          value: [value, Validators.required],
        });
        break;

      default:
        timer = this.fb.group({
          name: [t?.name || '', Validators.required],
          timerType: [
            (t?.timerType as string) || 'hybrid',
            Validators.required,
          ],
        });
        break;
    }
    return timer;
  }

  removeTimer(idx: number) {
    this.timersArray.removeAt(idx);
  }
}
