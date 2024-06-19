import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'intervalify';
  version = '0.0.1';
  isPanelVisible = false;
  isPushMode = true;
  private router = inject(Router);
  toggleSidePanel() {
    this.isPanelVisible = !this.isPanelVisible;
  }

  navigate(url: string) {
    // this.router.navigate([url]);
    this.toggleSidePanel();
  }
}
