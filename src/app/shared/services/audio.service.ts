import { Injectable } from '@angular/core';
export type Sound = 'before-next' | 'recurring' | 'finish';
@Injectable({
  providedIn: 'root',
})
export class AudioService {
  sound: {
    'before-next': HTMLAudioElement | undefined;
    recurring: HTMLAudioElement | undefined;
    finish: HTMLAudioElement | undefined;
  } = { 'before-next': undefined, recurring: undefined, finish: undefined };

  play(title: Sound) {
    this.sound[title]?.play().catch((error) => {
      console.error('Audio playback failed:', error);
    });
  }

  constructor() {
    this.sound['before-next'] = new Audio(`/assets/sounds/before-next.mp3`);
    this.sound['before-next'].preload = 'auto';

    this.sound.recurring = new Audio(`/assets/sounds/recurring.mp3`);
    this.sound.recurring.preload = 'auto';

    this.sound.finish = new Audio(`/assets/sounds/finish.mp3`);
    this.sound.finish.preload = 'auto';
  }
}
