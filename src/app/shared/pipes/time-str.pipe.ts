import { Pipe, PipeTransform } from '@angular/core';
import { INTERVAL_MS } from '../../config';
export type Fromat = 'mm:ss' | 'mm:ss.sss' | 'ms' | 'second';
@Pipe({
  name: 'timeStr',
})
export class TimeStrPipe implements PipeTransform {
  transform(
    ms: number,
    format: Fromat = 'mm:ss.sss',
    ...args: unknown[]
  ): string {
    switch (format) {
      case 'mm:ss':
        return ms ? new Date(ms).toISOString().substring(14, 19) : '00:00';

      case 'mm:ss.sss':
        return ms ? new Date(ms).toISOString().substring(14, 22) : '00:00.00';

      case 'ms':
        return ms ? new Date(ms).toISOString().substring(19, 22) : '.00';
      case 'second':
        return ms ? new Date(ms).toISOString().substring(18, 19) : '0';

      default:
        return ms ? new Date(ms).toISOString().substring(14, 22) : '00:00.00';
    }
  }
}
