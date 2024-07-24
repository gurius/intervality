import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Observable, filter, map, switchMap } from 'rxjs';
import { PlayableService } from '../../playable/playable.service';
import { Playable } from '../../models/playable/playable.model';
import { Report, ReportService } from '../report.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent {
  playable$: Observable<Playable | null>;
  detailsData$!: Observable<Report | null>;

  constructor(
    private aroute: ActivatedRoute,
    private playbaleService: PlayableService,
    private reportService: ReportService,
  ) {
    this.detailsData$ = this.reportService.currentReport$;
    this.playable$ = this.aroute.paramMap.pipe(
      filter((p) => p.has('playableId')),
      map((p) => p.get('playableId')),
      switchMap((id) => (id ? playbaleService.getPlayable(id) : EMPTY)),
    );
  }
}
