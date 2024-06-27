import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterPipe } from './pipes/filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimeStrPipe } from './pipes/time-str.pipe';

@NgModule({
  declarations: [FilterPipe, TimeStrPipe],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  exports: [FilterPipe, ReactiveFormsModule, TimeStrPipe, FormsModule],
})
export class SharedModule {}
