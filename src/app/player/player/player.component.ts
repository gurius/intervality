import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService, PlayerSnapshot } from '../player.service';
import { ActivatedRoute } from '@angular/router';
import { PlayableService } from '../../playable/playable.service';
import { Playable } from '../../models/playable/playable.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
})
export class PlayerComponent implements OnInit, OnDestroy {
  id!: number;
  snapshot$: Observable<PlayerSnapshot | null>;
  constructor(
    private playerService: PlayerService,
    private playableService: PlayableService,
    private aroute: ActivatedRoute,
  ) {
    this.snapshot$ = playerService.snapshot$;
  }

  ngOnInit(): void {
    const id = this.aroute.snapshot.paramMap.get('id');
    if (id) {
      this.id = Number(id);
      this.initPlayer(this.id);
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  initPlayer(id: number) {
    this.playableService.getPlayable(id).subscribe((p) => {
      this.playerService.initializeSequnce(p as Playable);
    });
  }

  play() {
    this.playerService.play();
  }
  pause() {
    this.playerService.pause();
  }
  stop() {
    this.playerService.stop();
    this.initPlayer(this.id);
  }
  stopwatchStop() {
    this.playerService.stopwatchStop();
  }

  next() {
    this.playerService.goNext();
  }
  previous() {
    this.playerService.goPrev();
  }
  updateCureentStep() {
    this.playerService.onRewind();
  }
}
