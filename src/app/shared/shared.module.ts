import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterPipe } from './pipes/filter.pipe';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [FilterPipe],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [FilterPipe, ReactiveFormsModule],
})
export class SharedModule {}
