import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayerRoutingModule } from './player-routing.module';
import { PlayerComponent } from './player/player.component';
import { SharedModule } from '../shared/shared.module';
import { SequenceComponent } from './sequence/sequence.component';
import { CompletionReportComponent } from './completion-report/completion-report.component';

@NgModule({
  declarations: [PlayerComponent, SequenceComponent, CompletionReportComponent],
  imports: [CommonModule, PlayerRoutingModule, SharedModule],
})
export class PlayerModule {}
