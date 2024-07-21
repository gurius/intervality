import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PlayerService } from '../player.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { PlayableService } from '../../playable/playable.service';
import { pick, uniqWith, isEqual } from 'lodash-es';
import { uid } from '../../utils';

@Component({
  selector: 'app-completion-report',
  templateUrl: './completion-report.component.html',
  styleUrl: './completion-report.component.css',
})
export class CompletionReportComponent implements OnInit, OnDestroy {
  playerService = inject(PlayerService);
  playableService = inject(PlayableService);

  name!: string;

  destroy$ = new Subject<void>();
  ngOnInit(): void {
    this.playableService
      .getPlayable(this.playerService.currentPlayableId)
      .pipe(
        takeUntil(this.destroy$),
        tap((p) => {
          this.name = p.name;
        }),
      )
      .subscribe();
    console.log(this.playerService.startTime);
    console.log(this.playerService.endTime);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }

  // steps with value 0 - skipped by user therefore excluded
  completeSteps = this.playerService.sequence.steps.filter((s) => s.value);

  report: {
    name: string;
    totalTime: number;
    reps: number;
  }[] = this.stepNames.map((name) => ({
    name,
    totalTime: this.playerService.sequence.steps
      .filter((step) => step.name === name)
      .map((step) => step.value)
      .reduce((acc, curr) => acc + curr, 0),
    reps: this.playerService.sequence.steps.filter((step) => step.name === name)
      .length,
  }));

  get reportValue() {
    return {
      id: uid(),
      playableId: this.playerService.currentPlayableId,
      startTime: this.playerService.startTime,
      endTimer: this.playerService.endTime,
      valid: this.isValid,
      value: this.playerService.sequence.steps.map((s) =>
        pick(s, ['name', 'value']),
      ),
    };
  }

  get isValid() {
    return (
      new Date(this.playerService.endTime).getTime() -
        new Date(this.playerService.startTime).getTime() <
      this.totalTime
    );
  }

  get stepNames() {
    return Array.from(new Set(this.completeSteps.map((s) => s.name)));
  }

  get totalTime() {
    return this.completeSteps
      .map((s) => s.value)
      .reduce((acc, curr) => acc + curr, 0);
  }

  saveReport() {
    console.log(this.reportValue);
  }
  discardReport() {
    this.playerService.stop();
  }
}
