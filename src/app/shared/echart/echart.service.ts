import { Injectable } from '@angular/core';

import * as echarts from 'echarts/core';

import { BarChart, LineChart, PieChart } from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import type {
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
} from 'echarts/charts';
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import { SettingsService } from '../../settings/settings.service';
import { isString, typeGuard } from '../../utils';
import { TimeStrPipe } from '../pipes/time-str.pipe';

type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
>;

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  SVGRenderer,
  LegendComponent,
]);

export type GetPieParam = {
  element: HTMLElement;
  data: { name: string; value: number }[];
  name: string;
};

@Injectable({
  providedIn: 'root',
})
export class EchartService {
  theme: string | null = null;
  private tPipe = new TimeStrPipe();

  constructor(private settingsService: SettingsService) {
    settingsService
      .getParam('theme')
      .pipe(typeGuard(isString))
      .subscribe((t) => {
        if (t === 'system') {
          t = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        this.theme = t;
      });
  }

  isDark() {
    return this.theme === 'dark';
  }

  colorPalette = () =>
    this.isDark()
      ? [
          '#dd6b66',
          '#759aa0',
          '#e69d87',
          '#8dc1a9',
          '#ea7e53',
          '#eedd78',
          '#73a373',
          '#73b9bc',
          '#7289ab',
          '#91ca8c',
          '#f49f42',
        ]
      : [
          '#d87c7c',
          '#919e8b',
          '#d7ab82',
          '#6e7074',
          '#61a0a8',
          '#efa18d',
          '#787464',
          '#cc7e63',
          '#724e58',
          '#4b565b',
        ];
  themed(light: string, dark: string): string {
    return this.isDark() ? dark : light;
  }

  getPie({ element, data, name }: GetPieParam): echarts.ECharts {
    const myChart = echarts.init(element, this.theme, {
      renderer: 'svg',
    });

    const color = this.colorPalette();

    const option: ECOption = {
      color,

      backgroundColor: this.themed('#fffde7', '#28212c'),
      tooltip: {
        trigger: 'item',
        backgroundColor: this.themed('#f3edc2', '#564d5b'),
        borderColor: this.themed('#bd72e7', '#796a85'),
        textStyle: {
          color: this.themed('#27212b', '#dac7e5'),
        },
        valueFormatter: (v) => this.tPipe.transform(v as number),
      },
      legend: {
        bottom: 10,
        left: 'center',
      },
      series: [
        {
          name: name,
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['50%', '38%'],
          avoidLabelOverlap: false,
          padAngle: 0.7,
          itemStyle: {
            borderRadius: 10,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    };

    myChart && myChart.setOption(option);

    return myChart;
  }
}
