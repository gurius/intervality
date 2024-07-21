import { Injectable } from '@angular/core';
import { SettingsService } from '../settings/settings.service';
import { distinctUntilChanged, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private lang: string = '';
  constructor(private settingsService: SettingsService) {
    this.settingsService.language$.subscribe((lang) => {
      this.lang = lang || navigator.language;
    });

    this.synth = window.speechSynthesis;
  }

  get voice() {
    return window.speechSynthesis
      .getVoices()
      .find((s) => s.lang.toLowerCase().includes(this.lang));
  }

  public say(text: string): void {
    if (this.synth.speaking) {
      console.error('SpeechSynthesis is already speaking');
      return;
    }

    if (text !== '' && this.voice) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.voice = this.voice;
      utter.lang = this.lang;

      utter.onend = (e: SpeechSynthesisEvent) => {
        console.log(e);
      };

      utter.onerror = (e: SpeechSynthesisErrorEvent) => {
        console.error('SpeechSynthesisUtterance error: ', e);
      };

      this.synth.speak(utter);
    }
  }
}
