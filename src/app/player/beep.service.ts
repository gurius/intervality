import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BeepService {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }

  public play(
    duration: number,
    attack: number = 0.1,
    release: number = 0.2,
    volume: number = 0.8,
    frequency: number = 864,
    type: OscillatorType = 'sine',
  ): void {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime,
    ); // Frequency in Hz

    // Set up the attack phase
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      volume,
      this.audioContext.currentTime + attack,
    );

    // Set up the release phase
    const endTime = this.audioContext.currentTime + duration;
    gainNode.gain.setValueAtTime(volume, endTime);
    gainNode.gain.linearRampToValueAtTime(0, endTime + release);

    oscillator.start();
    oscillator.stop(endTime + release);
  }
}
