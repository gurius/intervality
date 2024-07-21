import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observable, first, map, tap } from 'rxjs';
import { PlayableService } from '../../playable/playable.service';
import { Report, ReportService } from '../report.service';
import { Location } from '@angular/common';
import { LeavePermission } from '../../guards/can-leave/can-leave';
import { Router, RouterStateSnapshot } from '@angular/router';
import { DialogueService } from '../../modal/dialogue.service';
import { TranslateService } from '@ngx-translate/core';

export interface ReportReview {
  name: string;
  totalTime: number;
  reps: number;
}

@Component({
  selector: 'app-completion-report',
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit, OnDestroy, LeavePermission {
  playableService = inject(PlayableService);
  reportService = inject(ReportService);
  location = inject(Location);
  dialogueService = inject(DialogueService);
  translateService = inject(TranslateService);
  router = inject(Router);

  reportRev$!: Observable<ReportReview[] | null>;

  report!: Report;

  bypassGuard = false;

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

  get isNew() {
    return this.reportService.isNew(this.report.id);
  }

  ngOnDestroy(): void {
    this.reportService.completeReview();
  }

  canLeave(state: RouterStateSnapshot) {
    if (this.isNew) {
      return this.dialogueService
        .open({
          title: this.translateService.instant('Report.UnsavedData'),
          content: this.translateService.instant('Report.LeaveConfirm'),
        })
        .pipe(
          first(),
          tap((isConfirm) => {
            if (isConfirm) {
              this.bypassGuard = true;
              this.router.createUrlTree([state.url]);
            } else {
              this.bypassGuard = false;
            }
          }),
        );
    } else {
      return true;
    }
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
