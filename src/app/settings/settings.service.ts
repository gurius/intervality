import { Injectable } from '@angular/core';
import { values } from 'lodash-es';
import { config } from 'rxjs';

export type SettingsList = Select | Toggle | Value;

export type ConfigNames = 'theme' | 'sound-notification' | 'prestart-delay';

export type Change = {
  id: ConfigNames;
  value: string | boolean | number;
};

export type Toggle = {
  label: string;
  id: ConfigNames;
  description: string;
  controlType: 'toggle';
  value: boolean;
  default: boolean;
};

export type Select<T = any> = {
  label: string;
  id: ConfigNames;
  description: string;
  controlType: 'select';
  options: T[];
  value: string;
  default: string;
};

export type Value<T = any> = {
  label: string;
  id: ConfigNames;
  description: string;
  controlType: 'value';
  value: T;
  default: T;
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  config: SettingsList[] = [
    {
      label: 'Theme',
      id: 'theme',
      description: 'Select a theme',
      controlType: 'select',
      options: [
        { value: 'system', label: 'System' },
        { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' },
      ],
      value: 'system',
      default: 'system',
    },
    {
      label: 'Sound notifiacation',
      id: 'sound-notification',
      description: 'Notify',
      controlType: 'toggle',
      value: false,
      default: false,
    },
    {
      label: 'Prestart delay',
      id: 'prestart-delay',
      description: 'Delay in seconds',
      controlType: 'value',
      value: 1000,
      default: 1000,
    },
  ];

  constructor() {
    this.initConfig();

    // system theme change listener init
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => this.applyTheme());
  }

  initConfig() {
    this.config.forEach((c) => {
      switch (c.id) {
        case 'sound-notification':
          const isNotify = localStorage.getItem(c.id);
          c.value = isNotify ? JSON.parse(isNotify) : c.default;
          break;
        case 'prestart-delay':
          const value = localStorage.getItem(c.id);
          c.value = value ? JSON.parse(value) : c.default;
          break;
        default:
          c.value = localStorage.getItem(c.id) ?? c.default;
          break;
      }
    });
  }

  update(changes: Change[]) {
    changes.forEach(({ id, value }) => {
      const config = this.config?.find((c) => {
        return c.id === id;
      });

      if (config) {
        if (config.id === 'prestart-delay') {
          config.value = (value as number) * 1000;
        } else {
          config.value = value;
        }
      }
    });
    this.saveChages();
  }

  saveChages() {
    this.config?.forEach((c) => {
      switch (c.id) {
        case 'theme':
          this.setTheme(c.value);
          this.applyTheme();
          break;
        case 'sound-notification':
          localStorage.setItem(c.id, c.value);
          break;
        case 'prestart-delay':
          localStorage.setItem(c.id, `${c.value}`);
          break;
      }
    });
  }

  getConfigValueOf(id: ConfigNames) {
    return this.config?.find((c) => c.id === id);
  }

  // theme
  applyTheme() {
    const theme = localStorage.getItem('theme');
    if (
      theme === 'dark' ||
      (theme === null &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }

  setTheme(theme: 'system' | 'dark' | 'light') {
    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme);
    }
  }
}
