import { Component, OnDestroy } from '@angular/core';
import { PlayerService, PlayerSnapshot } from '../player/player.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrl: './mini-player.component.css',
})
export class MiniPlayerComponent implements OnDestroy {
  snapshot$: Observable<PlayerSnapshot | null>;
  destroy$ = new Subject<void>();

  constructor(private playerService: PlayerService) {
    this.snapshot$ = playerService.snapshot$.pipe(takeUntil(this.destroy$));
  }

  returnToPlayer() {
    this.playerService.returnToPlayer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
