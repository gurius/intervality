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
import { Subscription, first, take, tap } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { SetFormComponent } from './set-form/set-form.component';
import { SuperSetFormComponent } from './super-set-form/super-set-form.component';
import { DialogueService } from '../modal/dialogue.service';
import { TranslateService } from '@ngx-translate/core';
import { LeavePermission } from '../guards/can-leave/can-leave';

export interface Submittable {
  submit: () => void;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent implements OnDestroy, OnInit, LeavePermission {
  playable!: Playable;

  timer!: PlayableCountdown | PlayableStopwatch;

  playableType!: PlayableType;

  paramMapSubscription: Subscription;

  form: FormGroup = new FormGroup({});
  submitted = false;

  @ViewChild('submit') currentForm!: SetFormComponent | SuperSetFormComponent;

  constructor(
    private aroute: ActivatedRoute,
    private playableService: PlayableService,
    private location: Location,
    private dialogueService: DialogueService,
    private translateService: TranslateService,
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
                this.playableType === 'countdown' ||
                this.playableType === 'stopwatch'
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
            this.playableType === 'countdown' ||
            this.playableType === 'stopwatch'
          ) {
            this.timer = this.playable as PlayableCountdown | PlayableStopwatch;
          }
        }
      }
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
    this.submitted = true;
  }

  canLeave() {
    if (this.form.dirty && !this.submitted) {
      return this.dialogueService
        .open({
          title: this.translateService.instant('Editor.Discard'),
          content: this.translateService.instant('Editor.Confirm'),
        })
        .pipe(
          first(),
          tap((isConfirm) => {
            if (isConfirm) {
              this.form.reset();
              this.location.back();
            }
          }),
        );
    } else {
      return true;
    }
  }

  discard() {
    if (this.form.dirty && !this.submitted) {
      this.dialogueService
        .open({
          title: this.translateService.instant('Editor.Discard'),
          content: this.translateService.instant('Editor.Confirm'),
        })
        .pipe(take(1))
        .subscribe((isConfirm) => {
          if (isConfirm) {
            this.form.reset();
            this.location.back();
          }
        });
    } else {
      this.form.reset();
      this.location.back();
    }
  }
}
