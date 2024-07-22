import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PlayerService } from '../player.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { PlayableService } from '../../playable/playable.service';
import { pick } from 'lodash-es';
import { uid } from '../../utils';
import { DataService } from '../../shared/services/data/data.service';

export interface Report {
  id: string;
  playableId: string;
  startTime: string;
  endTime: string;
  valid: boolean;
  value: { name: string; value: number }[];
}

@Component({
  selector: 'app-completion-report',
  templateUrl: './completion-report.component.html',
  styleUrl: './completion-report.component.css',
})
export class CompletionReportComponent implements OnInit, OnDestroy {
  playerService = inject(PlayerService);
  playableService = inject(PlayableService);
  dataService = inject(DataService);

  saved = false;

  name!: string;

  destroy$ = new Subject<void>();

  reports!: Report[];

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

    this.reports = this.dataService
      .getAll<Report>('intervality-reports')
      .map((r) => ({
        ...r,
        startTime: new Date(r.startTime).toLocaleString('uk-UA', {
          day: '2-digit',
          month: 'short',
          weekday: 'short',
          year: '2-digit',
        }),
      }));
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
      endTime: this.playerService.endTime,
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
    this.dataService.updsertItem<Report>(
      this.reportValue,
      'intervality-reports',
      (data) => {
        return data.sort(
          (a, b) =>
            new Date(a.endTime).getTime() - new Date(b.endTime).getTime(),
        );
      },
    );
    this.reports = this.dataService
      .getAll<Report>('intervality-reports')
      .map((r) => ({
        ...r,
        startTime: new Date(r.startTime).toLocaleString('uk-UA'),
      }));
    this.saved = true;
  }

  remove(item: Report) {
    this.dataService.deleteItem(item.id, 'intervality-reports');
    this.reports = this.dataService.getAll<Report>('intervality-reports');
  }

  discardReport() {
    this.playerService.stop();
  }

  goToChart() {}

  export() {}

  removeAll() {}
}
