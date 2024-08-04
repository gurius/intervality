import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService, PlayerSnapshot } from '../player.service';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { PlayableService } from '../../playable/playable.service';
import { Playable } from '../../models/playable/playable.model';
import { Observable, Subject, first, takeUntil, tap } from 'rxjs';
import { LeavePermission } from '../../guards/can-leave/can-leave';
import {
  DialogueData,
  DialogueService,
} from '../../modal/modal-dialogue/dialogue.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
})
export class PlayerComponent implements OnInit, OnDestroy, LeavePermission {
  id!: string;
  snapshot$: Observable<PlayerSnapshot | null>;
  destroy$ = new Subject<void>();

  bypassGuard = false;

  constructor(
    private playerService: PlayerService,
    private playableService: PlayableService,
    private aroute: ActivatedRoute,
    private translateService: TranslateService,
    private dialogueService: DialogueService,
    private router: Router,
  ) {
    this.snapshot$ = playerService.snapshot$.pipe(takeUntil(this.destroy$));
  }

  canLeave(state: RouterStateSnapshot) {
    if (this.playerService.playing) {
      return this.dialogueService
        .open({
          title: this.translateService.instant('Player.LeavePlayer'),
          content: this.translateService.instant('Player.LeaveConfirm'),
        })
        .pipe(
          first(),
          tap((isConfirm) => {
            if (isConfirm) {
              this.bypassGuard = true;
              this.router.createUrlTree([state.url]);
            } else {
              this.bypassGuard = false;
            }
          }),
        );
    } else {
      return true;
    }
  }

  onUserResponse(): void {}

  ngOnInit(): void {
    if (this.playerService.minimised) {
      this.playerService.minimised = false;

      return;
    }
    const id = this.aroute.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
      this.initPlayer(this.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    if (this.playerService.playing) {
      this.playerService.minimised = true;
      return;
    }
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
