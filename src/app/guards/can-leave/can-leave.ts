import { GuardResult, MaybeAsync } from '@angular/router';

export interface LeavePermission {
  canLeave(): MaybeAsync<GuardResult>;
}
