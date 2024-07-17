import { CanDeactivateFn } from '@angular/router';
import { LeavePermission } from './can-leave';
import { inject } from '@angular/core';
import { NavigationLogService } from '../../shared/services/navigation-log/navigation-log.service';

export const canLeaveGuard: CanDeactivateFn<LeavePermission> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {
  if (component.bypassGuard) return true;

  const navLog = inject(NavigationLogService);
  const { url = '', isBackBtn } = navLog.last ?? {};

  return component.canLeave
    ? component.canLeave(!isBackBtn ? { url } : nextState)
    : true;
};
