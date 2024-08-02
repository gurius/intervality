import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Report, ReportService } from '../report.service';
import { Observable } from 'rxjs';
import { chain, groupBy, sumBy } from 'lodash-es';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartComponent {
  grouped = true;
  reportData$!: Observable<Report | null>;
  constructor(
    private aRoute: ActivatedRoute,
    private reportService: ReportService,
  ) {
    this.reportData$ = reportService.currentReport$;
    const rId = aRoute.snapshot.paramMap.get('reportId');
    if (rId) {
      // this.reportData$ = this.reportService.getReportById(rId);
    }
  }

  groupByName(
    data: { name: string; value: number }[],
  ): { name: string; value: number }[] {
    const grouped = groupBy(data, 'name');
    const result = [];
    for (const name in grouped) {
      result.push({
        name,
        value: sumBy(grouped[name], 'value'),
      });
    }
    return result;
  }
}
