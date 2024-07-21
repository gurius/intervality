import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportComponent } from './report/report.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';
import { DetailsComponent } from './details/details.component';

@NgModule({
  declarations: [ReportComponent, ListComponent, DetailsComponent],
  imports: [CommonModule, ReportsRoutingModule, SharedModule],
})
export class ReportsModule {}
