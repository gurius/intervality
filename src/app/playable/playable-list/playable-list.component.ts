import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Playable } from '../../models/playable/playable.model';
import { FormControl, isFormControl } from '@angular/forms';
import { PlayableService } from '../playable.service';
import { Observable, first, tap } from 'rxjs';
import { DataService } from '../../shared/services/data/data.service';
import { FileService } from '../../shared/services/file/file.service';
import { DialogueService } from '../../modal/dialogue.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-playable-list',
  templateUrl: './playable-list.component.html',
  styleUrl: './playable-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayableListComponent implements OnInit, OnDestroy {
  userInput = signal('');
  data!: Observable<Playable[] | null>;
  filter = new FormControl();

  playableService = inject(PlayableService);
  dialogueService = inject(DialogueService);
  translateService = inject(TranslateService);

  visibleIdx: number | null = null;

  private dataService = inject(DataService);
  private fileService = inject(FileService);

  constructor() {}

  find(e?: KeyboardEvent) {
    if (!e || e.code === 'Enter') this.userInput.set(this.filter.value);
  }
  ngOnInit(): void {
    this.data = this.playableService.all$;
    this.playableService.updateList();
  }

  ngOnDestroy(): void {}

  toggleItemMenu(idx: number) {
    this.visibleIdx = this.visibleIdx === idx ? null : idx;
  }

  remove(item: Playable) {
    this.dialogueService
      .open({
        title: this.translateService.instant('Common.Deletion'),
        content: this.translateService.instant('Common.DeletionConfirmation', {
          name: item.name,
        }),
      })
      .pipe(first())
      .subscribe((isConfirm) => {
        if (isConfirm) {
          this.dataService.deleteItem(item.id);
          this.playableService.updateList();
        }
      });
  }

  export(item: Playable) {
    const data = JSON.stringify([item]);
    if (data) {
      this.fileService.saveFile(
        new Blob([data], { type: 'application/json' }),
        item.name,
      );
    } else {
      this.dialogueService
        .open({
          title: this.translateService.instant('Settings.Export'),
          content: this.translateService.instant('Settings.NothingToExport'),
        })
        .pipe(first())
        .subscribe();
    }
  }
}
