import { CanDeactivateFn } from '@angular/router';
import { DialogueService } from '../../modal/dialogue.service';
import { inject } from '@angular/core';
import { LeavePermission } from './can-leave';

export const canLeaveGuard: CanDeactivateFn<LeavePermission> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {
  const dialogueService = inject(DialogueService);
  return component.canLeave ? component.canLeave() : true;
};
