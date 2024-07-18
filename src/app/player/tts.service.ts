import { Injectable } from '@angular/core';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;

  constructor(private settingsService: SettingsService) {
    this.synth = window.speechSynthesis;
  }

  get lang() {
    const lang = this.settingsService.getConfigValueOf('language')?.value;
    if (lang && lang === 'en') {
      return 'en-US';
    } else {
      return 'uk-UA';
    }
  }

  public say(text: string): void {
    if (this.lang == 'uk-UA') {
      return;
    }

    if (this.synth.speaking) {
      console.error('SpeechSynthesis is already speaking');
      return;
    }

    if (text !== '') {
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.lang = this.lang; // Set the language

      utterThis.onend = () => {
        console.log('SpeechSynthesisUtterance.onend');
      };

      utterThis.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
      };

      this.synth.speak(utterThis);
    }
  }
}
