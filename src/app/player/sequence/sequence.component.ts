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
import { isString, typeGuard } from '../../utils';

const scorllDelta = 124;

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

  restTimerId: string = 'rest';

  ngAfterViewInit(): void {
    if (this.playerService.playing) this.scrollTo(this.currentScrollYposition);
  }

  ngOnInit(): void {
    if (this.playerService.playing) {
      this.currentScrollYposition =
        this.playerService.sequence.idx * scorllDelta - scorllDelta;
    }

    this.settingsService
      .getParam('rest-timer-id')
      .pipe(typeGuard(isString), takeUntil(this.destroy$))
      .subscribe((x) => {
        this.restTimerId = x;
      });

    this.sequence = this.playerService.sequence.steps;
    this.playerService.step$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ direction }) => {
        if (direction === 'backward' && this.playerService.sequence.idx >= 1) {
          this.currentScrollYposition -= scorllDelta;
        } else if (
          direction === 'forward' &&
          this.playerService.sequence.idx >= 2
        ) {
          this.currentScrollYposition += scorllDelta;
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
    return name.toLowerCase().trim().includes(this.restTimerId.toLowerCase());
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
