import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayableRoutingModule } from './playable-routing.module';
import { PlayableListComponent } from './playable-list/playable-list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [PlayableListComponent],
  imports: [CommonModule, PlayableRoutingModule, SharedModule],
})
export class PlayableModule {}
