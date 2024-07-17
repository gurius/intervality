import { GuardResult, MaybeAsync, RouterStateSnapshot } from '@angular/router';

export interface LeavePermission {
  canLeave(
    state: RouterStateSnapshot | { url: string },
  ): MaybeAsync<GuardResult>;
  bypassGuard: boolean;
}
