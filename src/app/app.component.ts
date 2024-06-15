import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'intervalify';
  version = '0.0.1';
  isPanelVisible = false;

  openSidePanel() {
    this.isPanelVisible = !this.isPanelVisible;
  }
}
