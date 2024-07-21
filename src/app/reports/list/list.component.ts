import { Component } from '@angular/core';
import { Report, ReportService } from '../report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-report-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  reports$!: Observable<Report[] | undefined> | undefined;

  constructor(
    private reportService: ReportService,
    private aroute: ActivatedRoute,
    private router: Router,
  ) {
    // need to access parent parameters to get playableId
    this.reports$ = this.aroute.parent?.paramMap.pipe(
      filter((p) => p.has('playableId')),
      map((p) => p.get('playableId')),
      switchMap((id) => (id ? reportService.getAllForPlayableId(id) : [])),
    );
  }

  remove(item: Report) {
    this.reportService.deleteById(item.id);
  }

  removeAll(reports: Report[]) {
    const ids = reports.map((r) => r.id);
    this.reportService.deleteBatch(ids);
  }

  submitForReview(item: Report) {
    this.reportService.submitForReview(item);
    this.router.navigate(['../record', item.id], { relativeTo: this.aroute });
  }

  goToChart() {}

  export() {}
}
