import { CanDeactivateFn } from '@angular/router';
import { PlayerComponent } from './player.component';

export const canLeaveGuard: CanDeactivateFn<PlayerComponent> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {
  if (component.running()) {
    return confirm('Progress will be lost. Are you sure?');
  } else {
    return true;
  }
};
