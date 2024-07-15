import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './editor.component';
import { canLeaveGuard } from '../guards/can-leave/can-leave.guard';

const routes: Routes = [
  { path: '', component: EditorComponent, canDeactivate: [canLeaveGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditorRoutingModule {}
