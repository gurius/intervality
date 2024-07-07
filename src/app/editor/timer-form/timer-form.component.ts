import { Component, Input, OnInit, inject } from '@angular/core';
import {
  Form,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Timer } from '../../models/playable/timer.model';

@Component({
  selector: 'app-timer-form',
  templateUrl: './timer-form.component.html',
  styleUrl: './timer-form.component.css',
})
export class TimerFormComponent implements OnInit {
  @Input() group!: FormGroup;
  @Input() timer!: Timer;
  @Input() idx!: number;

  rnd!: string;

  fb = inject(NonNullableFormBuilder);

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
          this.fb.control(value, Validators.required),
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

  get timerTypes() {
    return [
      { value: 'stopwatch', label: 'Stopwatch' },
      // { value: 'countdown', label: 'Countdown' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'converted', label: 'Converted' },
    ];
  }
}
