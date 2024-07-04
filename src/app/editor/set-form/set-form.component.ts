import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { PlayableSet } from '../../models/playable/playable.model';

@Component({
  selector: 'app-set-form',
  templateUrl: './set-form.component.html',
  styleUrl: './set-form.component.css',
})
export class SetFormComponent implements OnInit {
  @Input() set!: PlayableSet;

  setFrom!: FormGroup;

  constructor(private fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    if (!this.set) return;

    const { name, repetitions } = this.set;

    this.setFrom = this.fb.group({
      name: [name, Validators.required],
      repetitions: [repetitions, Validators.required],
    });
  }

  submit() {
    console.log(this.setFrom.getRawValue());
  }
}
