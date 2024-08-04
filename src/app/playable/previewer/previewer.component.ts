import { Component, Input } from '@angular/core';
import { Playable, PlayableSet } from '../../models/playable/playable.model';
import { Timer } from '../../models/playable/timer.model';
import { TimerSet } from '../../models/playable/set.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-previewer',
  templateUrl: './previewer.component.html',
  styleUrl: './previewer.component.css',
  host: {
    '(click)': 'onClick($event)',
  },
})
export class PreviewerComponent {
  @Input({ required: true }) item!: Playable;

  constructor(private router: Router) {}

  isSet(x: Omit<TimerSet, 'id'> | Timer): x is Omit<TimerSet, 'id'> {
    return 'timers' in x;
  }

  isTimer(x: Omit<TimerSet, 'id'> | Timer): x is Timer {
    return 'timerType' in x;
  }

  onClick(e: Event) {
    this.router.navigate(['/player', this.item.id]);
  }
}
