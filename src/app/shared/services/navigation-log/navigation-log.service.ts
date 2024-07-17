import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationLogService {
  history: { url: string; isBackBtn: boolean }[] = [];

  maxLength = 5;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event) => {
        if (!(event instanceof NavigationStart)) return;

        if (event.navigationTrigger === 'popstate') {
          this.updateHistory = { url: event.url, isBackBtn: false };
        } else if (event.navigationTrigger === 'imperative') {
          this.updateHistory = { url: event.url, isBackBtn: true };
        }
      });
  }

  set updateHistory(state: { url: string; isBackBtn: boolean }) {
    if (this.history.length >= this.maxLength) {
      this.history.shift();
    }

    this.history.push(state);
  }

  get last() {
    return this.history.at(-1);
  }
}
