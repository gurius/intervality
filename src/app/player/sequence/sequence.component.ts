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
import { SettingsService } from '../../settings/settings.service';

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
  settingsService = inject(SettingsService);

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
        if (stage === 'stoped') {
          this.currentScrollYposition = 0;
          this.scrollTo(0);
        }
      });
  }

  isRest(name: string) {
    const restId =
      this.settingsService.getConfigValueOf('rest-timer-id')?.value;
    return (
      restId &&
      name
        .toLowerCase()
        .trim()
        .includes((restId as string).toLowerCase())
    );
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
