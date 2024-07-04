import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PlayerService } from './player/player.service';
import { filter } from 'rxjs';
import { WakelockService } from './shared/services/wakelock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'intervality';
  version = '0.0.1';
  isPanelVisible = false;
  isPushMode = false;
  isPlayer = false;

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    const { innerWidth } = window;
    if (innerWidth < 640) {
      this.isPushMode = false;
    } else {
      this.isPushMode = true;
    }
  }

  constructor(
    private router: Router,
    private player: PlayerService,
    protected wakelockService: WakelockService,
  ) {
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((s) => {
        console.log(s, this.router.url);
        this.isPlayer = this.router.url.includes('player');
      });
  }
  toggleSidePanel() {
    this.isPanelVisible = !this.isPanelVisible;
  }

  playerStop() {
    this.player.stop();
  }

  toggleWakelock() {
    if (this.wakelockService.isLocked()) {
      this.wakelockService.releaseLock();
    } else {
      this.wakelockService.requestLock();
    }
  }
}
