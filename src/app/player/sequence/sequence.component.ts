import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { PlayerService, PlayerSnapshot, StepInFocus } from '../player.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sequence',
  templateUrl: './sequence.component.html',
  styleUrl: './sequence.component.css',
})
export class SequenceComponent implements OnInit, OnDestroy {
  @Input() snapshot: PlayerSnapshot | null = null;

  @ViewChild('container') container!: ElementRef;

  destroy$ = new Subject<void>();

  playerService = inject(PlayerService);

  currentScrollYposition = 0;

  sequence: StepInFocus[] = [];

  ngOnInit(): void {
    this.sequence = this.playerService.sequence.steps;
    this.playerService.step$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ direction }) => {
        if (direction === 'backward' && this.playerService.sequence.idx >= 1) {
          this.currentScrollYposition -= 124;
        } else if (
          direction === 'forward' &&
          this.playerService.sequence.idx >= 2
        ) {
          this.currentScrollYposition += 124;
        }
        this.scrollTo(this.currentScrollYposition);
      });

    this.playerService.stage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((stage) => {
        if (stage === 'stoped' || stage === 'complete') {
          this.currentScrollYposition = 0;
          this.scrollTo(0);
        }
      });
  }

  scrollTo(position: number) {
    this.container?.nativeElement.scroll({
      top: position,
      behavior: 'smooth',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  stopwatchStop() {
    this.playerService.stopwatchStop();
  }

  updateCureentStep() {
    this.playerService.onRewind();
  }
}
