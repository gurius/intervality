import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Playable,
  PlayableCountdown,
  PlayableSet,
  PlayableStopwatch,
  PlayableSuperset,
  PlayableType,
  blank,
} from '../models/playable/playable.model';
import { PlayableService } from '../playable/playable.service';
import { Subscription, first } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { SetFormComponent } from './set-form/set-form.component';
import { SuperSetFormComponent } from './super-set-form/super-set-form.component';

export interface Submittable {
  submit: () => void;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent implements OnDestroy, OnInit {
  playable!: Playable;

  timer!: PlayableCountdown | PlayableStopwatch;

  playableType!: PlayableType;

  paramMapSubscription: Subscription;

  form: FormGroup = new FormGroup({});

  @ViewChild('submit') currentForm!: SetFormComponent | SuperSetFormComponent;

  constructor(
    private aroute: ActivatedRoute,
    private playableService: PlayableService,
    private location: Location,
  ) {
    this.paramMapSubscription = this.aroute.params.subscribe((p) => {
      this.form = new FormGroup({});

      this.playableType = p['playableType'];
      const id = p['id'];
      if (id) {
        this.playableService
          .getPlayable(id)
          .pipe(first())
          .subscribe((playable) => {
            if (playable) {
              this.playable = playable as Playable;
              if (
                this.playableType === PlayableType.Countdown ||
                this.playableType === PlayableType.Stopwatch
              ) {
                this.timer = this.playable as
                  | PlayableCountdown
                  | PlayableStopwatch;
              }
            }
          });
      } else if (!id && this.playableType) {
        const blankPlayable = blank(this.playableType);
        if (blankPlayable) {
          this.playable = blankPlayable;
          if (
            this.playableType === PlayableType.Countdown ||
            this.playableType === PlayableType.Stopwatch
          ) {
            this.timer = this.playable as PlayableCountdown | PlayableStopwatch;
          }
        }
      }
      console.log(id, this.playableType);
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.paramMapSubscription.unsubscribe();
  }

  get set() {
    return this.playable as PlayableSet;
  }

  get superSet() {
    return this.playable as PlayableSuperset;
  }

  submit() {
    if (this.form.invalid) return;
    this.currentForm.submit();
  }

  discard() {
    this.form.reset();
    this.location.back();
  }
}
