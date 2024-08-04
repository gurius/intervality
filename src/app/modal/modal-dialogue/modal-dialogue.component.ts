import { Component, inject } from '@angular/core';
import { DialogueService } from './dialogue.service';

@Component({
  selector: 'app-modal-dialogue',
  templateUrl: './modal-dialogue.component.html',
  styleUrl: './modal-dialogue.component.css',
  host: {
    '(click)': 'onBackdropClick($event)',
  },
})
export class ModalDialogueComponent {
  dialogueService = inject(DialogueService);
  dialogueData$ = this.dialogueService.dialogue$;

  cancel() {
    this.dialogueService.cancel();
  }
  confirm() {
    this.dialogueService.confirm();
  }

  onBackdropClick(e: Event): void {
    e.stopPropagation();
    this.dialogueService.cancel();
  }
}
