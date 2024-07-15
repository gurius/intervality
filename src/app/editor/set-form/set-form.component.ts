import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { PlayableSet } from '../../models/playable/playable.model';
import { DataService } from '../../data.service';
import { Submittable } from '../editor.component';
import { TimerSet } from '../../models/playable/set.model';

@Component({
  selector: 'app-set-form',
  templateUrl: './set-form.component.html',
  styleUrl: './set-form.component.css',
})
export class SetFormComponent implements OnInit, OnDestroy, Submittable {
  @Input() set!: PlayableSet | Omit<TimerSet, 'id'>;

  @Input() setForm!: FormGroup;

  rnd!: string;

  constructor(
    private dataService: DataService,
    private fb: NonNullableFormBuilder,
  ) {}

  ngOnInit(): void {
    this.rnd = Math.random().toString(36).substring(2, 5);

    if (!this.set) return;

    const { name, repetitions } = this.set;

    this.setForm.addControl('name', this.fb.control(name, Validators.required));
    this.setForm.addControl(
      'repetitions',
      this.fb.control(repetitions, [Validators.required, Validators.min(1)]),
    );
  }

  ngOnDestroy(): void {
    console.log('set form destroyed');
  }

  get name() {
    return this.setForm.get('name') as FormControl;
  }

  get repetitions() {
    return this.setForm.get('repetitions') as FormControl;
  }

  submit() {
    const { timers, ...nameAndReps } =
      this.setForm.getRawValue() as PlayableSet;

    const set: PlayableSet = {
      ...nameAndReps,
      ...((this.set as TimerSet).id
        ? { id: (this.set as PlayableSet).id }
        : {}),
      playableType: 'set',
      timers: timers.map((t) => {
        t.value = t.value ? t.value * 1000 : 0;
        t.timerType = t.timerType ?? 'countdown';
        return t;
      }),
    };

    console.log(set);
    this.dataService.updsertItem(set);
  }
}
