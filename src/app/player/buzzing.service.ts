import { Injectable } from '@angular/core';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root',
})
export class BuzzService {
  private synth: SpeechSynthesis;

  constructor(private settingsService: SettingsService) {
    this.synth = window.speechSynthesis;
  }

  patterns = [
    2000, //vibrate one time for 2 seconds
    [2000, 1000, 2000, 1000, 2000, 1000, 2000],
    [
      400, 200, 400, 200, 400, 200, 800, 200, 800, 200, 400, 200, 400, 200, 200,
      200,
    ], //vibrate "Twinkle, Twinkle, Little Star"
    [150, 50, 150, 50, 300, 100, 150, 50, 150, 50, 300, 100, 150, 50, 150, 50], //vibrate "Super Mario Bros" theme
    [
      300, 200, 300, 200, 300, 400, 300, 200, 300, 200, 300, 400, 300, 200, 600,
      200,
    ], //vibrate "Jingle Bells"
  ];

  vibration(pattern: VibratePattern = [20]) {
    if (!window.navigator.vibrate) {
      alert(
        'Your device does not support the Vibration API. Try on an Android phone!',
      );
    } else {
      window.navigator.vibrate(pattern);
    }
  }
}
