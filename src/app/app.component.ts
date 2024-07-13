import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PlayerService } from './player/player.service';
import { filter } from 'rxjs';
import { WakelockService } from './shared/services/wakelock.service';
import { SettingsService } from './settings/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Intervality';
  version = '0.10.0';
  isPanelVisible = false;
  isPushMode = !(window.innerWidth < 640);
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
    private playerService: PlayerService,
    protected wakelockService: WakelockService,
    private settingsService: SettingsService,
  ) {
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((s) => {
        console.log(s, this.router.url);
        this.isPlayer = this.router.url.includes('player');
      });

    this.settingsService.applyTheme();
  }
  toggleSidePanel() {
    if (!this.isPushMode || !this.isPanelVisible) {
      this.isPanelVisible = !this.isPanelVisible;
    }
  }

  navigate(path: string[]) {
    this.router.navigate(path);
  }

  playerStop() {
    this.playerService.stop();
  }

  get currentlyPlayingName() {
    const { name = null } = this.playerService.playable ?? {};
    return name;
  }
  get currentlyPlayingType() {
    const { playableType = null } = this.playerService.playable ?? {};
    return playableType;
  }

  editCurrentlyPlaying() {
    const { id, playableType } = this.playerService.playable ?? {};
    this.isPanelVisible = false;
    this.navigate(['/edit', playableType, id]);
  }

  toggleWakelock() {
    if (this.wakelockService.isLocked()) {
      this.wakelockService.releaseLock();
    } else {
      this.wakelockService.requestLock();
    }
  }
}
