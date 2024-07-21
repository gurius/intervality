import { Injectable } from '@angular/core';
import {
  DataKeyDictionary,
  DataService,
} from '../shared/services/data/data.service';
import { BehaviorSubject, map } from 'rxjs';

export interface Report {
  id: string;
  playableId: string;
  startTime: string;
  value: ReportValue[];
}

export interface ReportValue {
  name: string;
  value: number;
}

const dictionaryKey: DataKeyDictionary = 'intervality-reports';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private currentReportEmitter$ = new BehaviorSubject<Report | null>(null);
  currentReport$ = this.currentReportEmitter$.asObservable();

  private allReportsEmitter$ = new BehaviorSubject<Report[] | null>(null);
  private allReports$ = this.allReportsEmitter$.asObservable();

  constructor(private dataService: DataService) {}

  private updateList() {
    // retreive reports from tha localStorage
    const reports = this.dataService.getAll<Report>(dictionaryKey);
    // emit the result
    this.allReportsEmitter$.next(reports);
  }

  getAllForPlayableId(id: string) {
    this.updateList();
    return this.allReports$.pipe(
      map((reports) => reports?.filter((r) => r.playableId === id)),
    );
  }

  isNew(reportId: string) {
    const reports = this.dataService.getAll<Report>(dictionaryKey);
    return !reports.some((r) => r.id === reportId);
  }

  deleteById(id: string) {
    this.dataService.deleteItem(id, dictionaryKey);
    this.updateList();
  }

  deleteBatch(ids: string[]) {
    this.dataService.deleteBatch(ids, dictionaryKey);
    this.updateList();
  }

  submitForReview(report: Report) {
    this.currentReportEmitter$.next(report);
  }

  completeReview() {
    this.currentReportEmitter$.next(null);
  }

  saveReport(report: Report) {
    this.dataService.updsertItem<Report>(report, dictionaryKey, (data) =>
      data.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    );

    this.completeReview();
  }
}
