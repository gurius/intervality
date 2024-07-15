import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerComponent } from './player/player.component';
import { canLeaveGuard } from '../guards/can-leave/can-leave.guard';

const routes: Routes = [
  { path: '', component: PlayerComponent, canDeactivate: [canLeaveGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayerRoutingModule {}
