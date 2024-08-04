import { Component, Injectable, Type } from '@angular/core';
import { BehaviorSubject, Subject, delay } from 'rxjs';

export type DialogueData = {
  title: string;
  content?: string;
  component?: Type<any>;
  inputs?: Record<string, unknown>;
  module?: Type<any>;
  actions?: Action[];
};

export type Action = 'confirm' | 'cancel';

@Injectable({
  providedIn: 'root',
})
export class DialogueService {
  private dialogueSubject$ = new BehaviorSubject<DialogueData | null>(null);
  dialogue$ = this.dialogueSubject$.asObservable().pipe(delay(1));

  private dialogueResultSubject$ = new Subject<boolean>();
  dialogueResult$ = this.dialogueResultSubject$.asObservable();

  constructor() {}

  open(data: DialogueData) {
    this.dialogueSubject$.next(data);
    return this.dialogueResult$;
  }

  confirm() {
    this.dialogueResultSubject$.next(true);
    this.dialogueSubject$.next(null);
  }

  cancel() {
    this.dialogueResultSubject$.next(false);
    this.dialogueSubject$.next(null);
  }
}
