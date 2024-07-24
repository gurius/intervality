import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ReportService } from '../../report.service';
import { map } from 'rxjs';

export const canActivateGuard: CanActivateFn = (route, state) => {
  const reportService = inject(ReportService);
  return reportService.currentReport$.pipe(map((r) => !!r));
};
