import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  PlayableSet,
  PlayableType,
} from '../../models/playable/playable.model';
import { DataService } from '../../data.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-set-form',
  templateUrl: './set-form.component.html',
  styleUrl: './set-form.component.css',
})
export class SetFormComponent implements OnInit {
  @Input() set!: PlayableSet;

  setFrom!: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private dataService: DataService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    if (!this.set) return;

    const { name, repetitions } = this.set;

    this.setFrom = this.fb.group({
      name: [name, Validators.required],
      repetitions: [repetitions, Validators.required],
    });
  }

  submit() {
    const { timers, ...nameAndReps } =
      this.setFrom.getRawValue() as PlayableSet;

    const set: PlayableSet = {
      ...nameAndReps,
      id: this.set.id,
      playableType: PlayableType.Set,
      timers: timers.map((t) => {
        t.value = t.value ? t.value * 1000 : 0;
        t.timerType = t.timerType ?? 'countdown';
        return t;
      }),
    };

    console.log(set);
    this.dataService.updsertItem(set);
  }

  discard() {
    this.setFrom.reset();
    this.location.back();
  }
}
