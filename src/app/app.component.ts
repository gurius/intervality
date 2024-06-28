import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PlayerService } from './player/player.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'intervality';
  version = '0.0.1';
  isPanelVisible = false;
  isPushMode = true;
  isPlayer = false;
  constructor(
    private router: Router,
    private player: PlayerService,
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

  navigate(url: string) {
    // this.router.navigate([url]);
    this.toggleSidePanel();
  }
}
