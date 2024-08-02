import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { EchartService } from './echart.service';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-echart',
  templateUrl: './echart.component.html',
  styleUrl: './echart.component.css',

  host: { '(resize)': 'onResize($event)' },
})
export class EchartComponent implements OnDestroy, OnInit {
  @Input({ required: true }) chartParams!: {
    name: string;
    data: { name: string; value: number }[];
    type: 'bar' | 'pie';
  };
  chartInstance!: echarts.ECharts;
  el: ElementRef;

  constructor(
    elementref: ElementRef,
    private echartService: EchartService,
  ) {
    this.el = elementref;
  }

  ngOnInit(): void {
    switch (this.chartParams.type) {
      case 'pie':
        this.chartInstance = this.echartService.getPie({
          element: this.el.nativeElement,
          data: this.chartParams.data,
          name: this.chartParams.name,
        });
        break;

      case 'bar':
        // bar chart instantiation
        break;
    }
  }

  onResize() {
    this.chartInstance.resize();
  }

  ngOnDestroy(): void {
    this.chartInstance.dispose();
  }
}
