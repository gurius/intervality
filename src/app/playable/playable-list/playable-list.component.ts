import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Playable, PlayableType } from '../../models/playable/playable.model';
import { FormControl } from '@angular/forms';
import { PlayableService } from '../playable.service';
import { Observable, forkJoin, map } from 'rxjs';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-playable-list',
  templateUrl: './playable-list.component.html',
  styleUrl: './playable-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayableListComponent {
  types = PlayableType;

  userInput = signal('');

  filter = new FormControl();

  service = inject(PlayableService);

  visibleIdx: number | null = null;

  private dataService = inject(DataService);

  find(e?: KeyboardEvent) {
    if (!e || e.code === 'Enter') this.userInput.set(this.filter.value);
  }

  data: Observable<Playable[]> = this.service.getPlayable() as Observable<
    Playable[]
  >;

  toggleItemMenu(idx: number) {
    this.visibleIdx = this.visibleIdx === idx ? null : idx;
  }

  remove(id: string) {
    this.dataService.deleteItem(id);
    this.data = this.service.getPlayable() as Observable<Playable[]>;
  }
}
