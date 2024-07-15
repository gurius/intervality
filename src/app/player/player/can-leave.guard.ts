import { CanDeactivateFn } from '@angular/router';
import { PlayerComponent } from './player.component';
import { DialogueService } from '../../modal-dialogue/dialogue.service';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const canLeaveGuard: CanDeactivateFn<PlayerComponent> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {
  const dialogueService = inject(DialogueService);
  const translateService = inject(TranslateService);

  if (component.running()) {
    return dialogueService.open({
      title: translateService.instant('Player.LeavePlayer'),
      content: translateService.instant('Player.LeaveConfirm'),
    });
  } else {
    return true;
  }
};
