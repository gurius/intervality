import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { SetFormComponent } from './set-form/set-form.component';
import { SharedModule } from '../shared/shared.module';
import { TimersFormArrayComponent } from './timer-form-array/timer-form.component';
import { SuperSetFormComponent } from './super-set-form/super-set-form.component';
import { TimerFormComponent } from './timer-form/timer-form.component';

@NgModule({
  declarations: [EditorComponent, SetFormComponent, TimersFormArrayComponent, SuperSetFormComponent, TimerFormComponent],
  imports: [CommonModule, EditorRoutingModule, SharedModule],
})
export class EditorModule {}
