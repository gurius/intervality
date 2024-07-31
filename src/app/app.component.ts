import { Component, HostListener, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PlayerService } from './player/player.service';
import { delay, filter } from 'rxjs';
import { WakelockService } from './shared/services/wakelock.service';
import { SettingsService } from './settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogueService } from './modal/dialogue.service';
import { Playable } from './models/playable/playable.model';
import { BeepService } from './player/beep.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Intervality';
  version = '0.16.5';
  isPanelVisible = false;
  isPushMode = !(window.innerWidth < 640);
  isPlayer = signal(false);
  playerPlayable$ = this.playerService.playable$.pipe(delay(1));

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
    private translateService: TranslateService,
    protected dialogueService: DialogueService,
    private beepService: BeepService,
  ) {
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((s) => {
        this.isPlayer.set(this.router.url.includes('player'));
      });

    this.settingsService.language$.subscribe((lang) => {
      const language = lang || navigator.language;

      this.translateService.setDefaultLang(this.settingsService.defautlLocale);

      if (this.settingsService.languages.includes(language)) {
        this.translateService.use(language);
      }
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

  getCurrentlyPlayingType({ playableType }: Playable) {
    switch (playableType) {
      case 'superset':
        return this.translateService.instant('NavPanel.Superset').toLowerCase();
      case 'set':
        return this.translateService.instant('NavPanel.Set').toLowerCase();
      case 'stopwatch':
        return this.translateService
          .instant('NavPanel.Stopwatch')
          .toLowerCase();
      case 'countdown':
        return this.translateService
          .instant('NavPanel.Countdown')
          .toLowerCase();

      default:
        return '';
    }
  }

  editCurrentlyPlaying({ id, playableType }: Playable) {
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
