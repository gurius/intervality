import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Playable,
  PlayableType,
  blank,
} from '../models/playable/playable.model';
import { PlayableService } from '../playable/playable.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent {
  playable!: Playable;

  playableType: PlayableType;

  constructor(
    private aroute: ActivatedRoute,
    private playableService: PlayableService,
  ) {
    const id = this.aroute.snapshot.paramMap.get('id');

    this.playableType = this.aroute.snapshot.paramMap.get(
      'playableType',
    ) as PlayableType;

    if (id) {
      this.playableService
        .getPlayable(id)
        .pipe(first())
        .subscribe((playable) => {
          if (playable) {
            this.playable = playable as Playable;
          }
        });
    } else if (!id && this.playableType) {
      const set = blank(PlayableType.Set);
      if (set) {
        this.playable = set;
      }
    }
    console.log(id, this.playableType);
  }
}
