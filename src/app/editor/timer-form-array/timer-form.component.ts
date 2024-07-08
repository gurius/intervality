import { Component, Input, OnInit, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Timer, TimerType } from '../../models/playable/timer.model';
import { PlayableType } from '../../models/playable/playable.model';
import { AssetType } from '../add-menu-button/add-menu-button.component';

export type StopwatchForm = FormGroup<{
  name: FormControl<string>;
  timerType: FormControl<string>;
}>;

export type CountdownForm = FormGroup<{
  name: FormControl<string>;
  value: FormControl<number>;
}>;

@Component({
  selector: 'app-timers-form-array',
  templateUrl: './timer-form.component.html',
  styleUrl: './timer-form.component.css',
})
export class TimersFormArrayComponent implements OnInit {
  @Input({ required: true }) group!: FormGroup;
  @Input({ required: true }) timers!: Timer[];

  fb = inject(NonNullableFormBuilder);

  rnd!: string;

  ngOnInit(): void {
    this.rnd = Math.random().toString(36).substring(2, 5);

    this.group.addControl('timers', this.fb.array(this.timersFormGroups));
  }

  get timersArray() {
    return this.group.get('timers') as FormArray<FormGroup>;
  }

  getTimerMeta(idx: number) {
    return this.timers.at(idx);
  }

  get timersFormGroups() {
    return this.timers.map((t) => {
      return this.createTimerForm(t.timerType, t);
    });
  }

  isControllerInGroup(g: FormGroup, prop: string) {
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

  // TODO: implement getting a real timers
  get existingTimers() {
    return [
      { value: 'run', label: 'Run' },
      { value: 'jump', label: 'Jump' },
      { value: 'plank', label: 'Plank' },
      { value: 'stretching', label: 'Stretching' },
    ];
  }

  get addMenuTypes() {
    return [PlayableType.Countdown, PlayableType.Stopwatch];
  }

  addTimer(aType: AssetType) {
    const { type, item } = aType;
    this.timersArray.push(
      this.createTimerForm(type as TimerType, item as Timer),
    );
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
