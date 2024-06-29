import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WakelockService {
  wakeLock: WakeLockSentinel | null = null;

  isSupported() {
    return 'wakeLock' in navigator;
  }

  isLocked() {
    return !!this.wakeLock;
  }

  async init() {
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released:', this.wakeLock?.released);
      });
      console.log('wake lock is active', this.wakeLock);
    } catch (err) {
      console.log(`cant access wake lock: ${err}`);
    }
  }

  releaseLock() {
    this.wakeLock?.release().then(() => {
      this.wakeLock = null;
      console.log(`wake lock is released`);
    });
  }

  requestLock() {
    this.init();
  }
}
