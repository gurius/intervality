import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { values } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';

export type SettingsList = Select | Toggle | Value;

export type ConfigNames =
  | 'theme'
  | 'sound-notification'
  | 'prestart-delay'
  | 'language';

export type Locale = 'en' | 'uk';

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
  languages: Locale[] = ['en', 'uk'];
  defautlLocale = 'en';

  initialised = false;

  languageSubject$ = new BehaviorSubject<Locale>(
    (localStorage.getItem('language') as Locale) ?? 'en',
  );
  language$ = this.languageSubject$.asObservable();

  config: SettingsList[] = [];

  constructor(private tService: TranslateService) {
    const lang = this.config.find((c) => c.id === 'language');
    if (lang) {
      this.languageSubject$.next(lang.value);
    }

    this.restoreFromLocalStorage();

    this.tService.onLangChange.subscribe((event) => {
      this.initConfig();
      this.restoreFromLocalStorage();

      this.initialised = true;
    });
    // system theme change listener init
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => this.applyTheme());
  }

  restoreFromLocalStorage() {
    if (this.initialised) return;
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

  initConfig() {
    this.config = [
      {
        label: this.tService.instant('Settings.Theme'),
        id: 'theme',
        description: this.tService.instant('Settings.ThemeLabel'),
        controlType: 'select',
        options: [
          {
            value: 'system',
            label: this.tService.instant('Settings.OptionSystem'),
          },
          {
            value: 'dark',
            label: this.tService.instant('Settings.OptionDark'),
          },
          {
            value: 'light',
            label: this.tService.instant('Settings.OptionLight'),
          },
        ],
        value: 'system',
        default: 'system',
      },
      {
        label: this.tService.instant('Settings.Sound'),
        id: 'sound-notification',
        description: this.tService.instant('Settings.SoundLabel'),
        controlType: 'toggle',
        value: false,
        default: false,
      },
      {
        label: this.tService.instant('Settings.PrestartDelay'),
        id: 'prestart-delay',
        description: this.tService.instant('Settings.PrestartLabel'),
        controlType: 'value',
        value: 1000,
        default: 1000,
      },
      {
        label: this.tService.instant('Settings.Language'),
        id: 'language',
        description: this.tService.instant('Settings.LanguageLabel'),
        controlType: 'select',
        options: this.languages.map((lang) => ({
          value: lang,
          label: this.tService.instant(`Settings.${lang}`),
        })),
        value: 'en',
        default: this.defautlLocale,
      },
    ];
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
        case 'language':
          localStorage.setItem(c.id, `${c.value}`);
          this.languageSubject$.next(c.value);

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
