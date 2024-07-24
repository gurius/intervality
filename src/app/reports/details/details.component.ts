import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observable, Subject, first, map, tap } from 'rxjs';
import { PlayableService } from '../../playable/playable.service';
import { Report, ReportService } from '../report.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-completion-report',
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit, OnDestroy {
  playableService = inject(PlayableService);
  reportService = inject(ReportService);
  location = inject(Location);

  reportRev$!: Observable<
    { name: string; totalTime: number; reps: number }[] | null
  >;

  report!: Report;

  ngOnInit(): void {
    this.reportRev$ = this.reportService.currentReport$.pipe(
      first(),
      tap((report) => {
        if (report) {
          this.report = report;
        }
      }),
      map((report) => {
        if (!report) return null;
        return this.getStepNames(report).map((name) => ({
          name,
          totalTime: report.value
            .filter((step) => step.name === name)
            .map((step) => step.value)
            .reduce((acc, curr) => acc + curr, 0),
          reps: report.value.filter((step) => step.name === name).length,
        }));
      }),
    );
  }

  ngOnDestroy(): void {
    this.reportService.completeReview();
  }

  getStepNames(report: Report) {
    return Array.from(new Set(report.value.map((s) => s.name)));
  }

  get totalTime() {
    return this.report.value
      .map((s) => s.value)
      .reduce((acc, curr) => acc + curr, 0);
  }

  discardReport() {
    this.reportService.completeReview();
    this.location.back();
  }

  saveReport() {
    this.reportService.saveReport(this.report);
    this.location.back();
  }
}
