import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterPipe } from './pipes/filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimeStrPipe } from './pipes/time-str.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { EchartComponent } from './echart/echart.component';

@NgModule({
  declarations: [FilterPipe, TimeStrPipe, EchartComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  exports: [
    FilterPipe,
    ReactiveFormsModule,
    TimeStrPipe,
    FormsModule,
    FontAwesomeModule,
    TranslateModule,
    EchartComponent,
  ],
})
export class SharedModule {}
