import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayableRoutingModule } from './playable-routing.module';
import { PlayableListComponent } from './playable-list/playable-list.component';

@NgModule({
  declarations: [PlayableListComponent],
  imports: [CommonModule, PlayableRoutingModule],
})
export class PlayableModule {}
