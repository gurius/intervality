import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report/report.component';
import { DetailsComponent } from './details/details.component';
import { ListComponent } from './list/list.component';
import { canLeaveGuard } from '../guards/can-leave/can-leave.guard';
import { canActivateGuard } from './details/guars/can-activate.guard';

const routes: Routes = [
  {
    path: '',
    component: ReportComponent,
    children: [
      { path: 'list', component: ListComponent },
      {
        path: 'record/:reportId',
        component: DetailsComponent,
        canDeactivate: [canLeaveGuard],
        canActivate: [canActivateGuard],
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
