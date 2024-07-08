import { Component, Input, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Submittable } from '../editor.component';
import { DataService } from '../../data.service';
import {
  PlayableCountdown,
  PlayableStopwatch,
  PlayableType,
} from '../../models/playable/playable.model';

@Component({
  selector: 'app-timer-form',
  templateUrl: './timer-form.component.html',
  styleUrl: './timer-form.component.css',
})
export class TimerFormComponent implements OnInit, Submittable {
  @Input() group!: FormGroup;
  @Input() timer!: PlayableCountdown | PlayableStopwatch;
  @Input() idx!: number;

  rnd!: string;

  private fb = inject(NonNullableFormBuilder);
  private dataService = inject(DataService);

  isControllerInGroup(g: FormGroup, prop: string) {
    return g.controls.hasOwnProperty(prop);
  }

  ngOnInit(): void {
    this.rnd = Math.random().toString(36).substring(2, 5);
    switch (this.timer.timerType) {
      case 'countdown':
        const value = this.timer.value ? this.timer.value / 1000 : 5;
        this.group.addControl(
          'name',
          this.fb.control(this.timer.name || '', Validators.required),
        );
        this.group.addControl(
          'value',
          this.fb.control(value, [Validators.required, Validators.min(1)]),
        );
        break;

      default:
        this.group.addControl(
          'name',
          this.fb.control(this.timer.name || '', Validators.required),
        );

        this.group.addControl(
          'timerType',
          this.fb.control(
            (this.timer.timerType as string) || 'hybrid',
            Validators.required,
          ),
        );
        break;
    }
  }

  get name() {
    return this.group.get('name') as FormControl;
  }

  get value() {
    return this.group.get('value') as FormControl;
  }

  get timerTypes() {
    return [
      { value: 'stopwatch', label: 'Stopwatch' },
      // { value: 'countdown', label: 'Countdown' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'converted', label: 'Converted' },
    ];
  }

  submit() {
    const timer = this.group.getRawValue();
    timer.id = this.timer.id;
    timer.value = timer.value ? timer.value * 1000 : 0;
    if (!timer.timerType) {
      timer.playableType = PlayableType.Countdown;
      timer.timerType = 'countdown';
    } else {
      timer.playableType = PlayableType.Stopwatch;
    }

    console.log(timer);

    this.dataService.updsertItem(timer);
  }
}
