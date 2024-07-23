import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportComponent } from './report/report.component';
import { ReportListComponent } from './report-list/report-list.component';
import { SharedModule } from '../shared/shared.module';
import { CompletionReportComponent } from './completion-report/completion-report.component';

@NgModule({
  declarations: [
    ReportComponent,
    ReportListComponent,
    CompletionReportComponent,
  ],
  imports: [CommonModule, ReportsRoutingModule, SharedModule],
})
export class ReportsModule {}
