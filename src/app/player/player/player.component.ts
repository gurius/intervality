import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService, PlayerSnapshot } from '../player.service';
import { ActivatedRoute } from '@angular/router';
import { PlayableService } from '../../playable/playable.service';
import { Playable } from '../../models/playable/playable.model';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
})
export class PlayerComponent implements OnInit, OnDestroy {
  id!: string;
  snapshot$: Observable<PlayerSnapshot | null>;

  destroy$ = new Subject<void>();

  constructor(
    private playerService: PlayerService,
    private playableService: PlayableService,
    private aroute: ActivatedRoute,
  ) {
    this.snapshot$ = playerService.snapshot$.pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    const id = this.aroute.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
      this.initPlayer(this.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.playerService.reset();
  }

  initPlayer(id: string) {
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
