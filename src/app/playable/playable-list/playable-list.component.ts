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
  find(e?: KeyboardEvent) {
    if (!e || e.code === 'Enter') this.userInput.set(this.filter.value);
  }

  data: Observable<Playable[]> = forkJoin([
    this.service.getSets(),
    this.service.getSuperSets(),
    this.service.getCountdowns(),
    this.service.getStopwatches(),
  ]).pipe(map((result) => result.flat()));
}
