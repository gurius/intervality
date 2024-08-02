import { Injectable } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WindowResizeService {
  subject$ = new Subject<Event>();

  constructor() {}

  onResize(e: Event) {
    this.subject$.next(e);
  }

  onResize$() {
    return this.subject$.asObservable().pipe(debounceTime(50));
  }
}
