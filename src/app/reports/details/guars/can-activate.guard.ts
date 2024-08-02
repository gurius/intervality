import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ReportService } from '../../report.service';
import { map } from 'rxjs';
import { NavigationLogService } from '../../../shared/services/navigation-log/navigation-log.service';

export const canActivateGuard: CanActivateFn = (route, state) => {
  const reportService = inject(ReportService);
  const navLog = inject(NavigationLogService);
  const router = inject(Router);

  const { url = '/playable', isBackBtn } = navLog.last ?? {};

  return reportService.currentReport$.pipe(
    map((r) =>
      r ? !!r : router.createUrlTree([isBackBtn ? url : '/playable']),
    ),
  );
};
