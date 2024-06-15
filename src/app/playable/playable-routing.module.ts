import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayableListComponent } from './playable-list/playable-list.component';

const routes: Routes = [{ path: '', component: PlayableListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayableRoutingModule {}
