import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, shareReplay, tap } from 'rxjs';

export type SettingsList = Select | Toggle | Value<string> | Value<number>;

export type ConfigNames =
  | 'theme'
  | 'sound-notification'
  | 'prestart-delay'
  | 'language'
  | 'last-rest-removal'
  | 'rest-timer-id'
  | 'notify-before-seconds';

export type Locale = 'en' | 'uk';

export type Change =
  | { id: 'theme'; value: string }
  | { id: 'sound-notification'; value: boolean }
  | { id: 'prestart-delay'; value: number }
  | { id: 'language'; value: Locale }
  | { id: 'last-rest-removal'; value: boolean }
  | { id: 'rest-timer-id'; value: string };

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

export type Value<T extends string | number> = {
  label: string;
  id: ConfigNames;
  description: string;
  controlType: 'string' | 'number';
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
  language$ = this.languageSubject$.asObservable().pipe(shareReplay(1));

  config$ = new BehaviorSubject<SettingsList[]>([]);

  config: SettingsList[] = [];

  constructor(
    private tService: TranslateService,
    private metaService: Meta,
  ) {
    const lang = this.config.find((c) => c.id === 'language');
    if (lang) {
      this.languageSubject$.next(lang.value as Locale);
    }

    this.restoreFromLocalStorage();

    this.tService.onLangChange.subscribe((event) => {
      this.initConfig();
      this.restoreFromLocalStorage();

      this.config$.next(cloneDeep(this.config));
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
        case 'last-rest-removal':
          const onOroff = localStorage.getItem(c.id);
          c.value = onOroff ? JSON.parse(onOroff) : c.default;
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

  // for translation to apply
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
        controlType: 'number',
        value: 1000,
        default: 1000,
      },
      {
        label: this.tService.instant('Settings.NotifyBeforeSeconds'),
        id: 'notify-before-seconds',
        description: this.tService.instant('Settings.NotifyBeforeSecondsLabel'),
        controlType: 'string',
        value: '13,1,0.5|9,1,0.4|2,1.8,0.3',
        default: '13,1,0.5|9,1,0.4|2,1.8,0.3',
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
      {
        label: this.tService.instant('Settings.RemoveLastRest'),
        id: 'last-rest-removal',
        description: this.tService.instant('Settings.RemoveLastRestLabel'),
        controlType: 'toggle',
        value: false,
        default: false,
      },
      {
        label: this.tService.instant('Settings.RestTimerID'),
        id: 'rest-timer-id',
        description: this.tService.instant('Settings.RestTimerIDLabel'),
        controlType: 'string',
        value: this.tService.instant('Settings.RestTimerIDDefault'),
        default: this.tService.instant('Settings.RestTimerIDDefault'),
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
        } else if (
          config.id === 'rest-timer-id' ||
          config.id === 'notify-before-seconds'
        ) {
          config.value = (value as string).trim();
        } else {
          config.value = value;
        }
      }
    });
    this.saveChages();
    this.config$.next(cloneDeep(this.config));
  }

  saveChages() {
    this.config?.forEach((c) => {
      switch (c.id) {
        case 'theme':
          this.setTheme(c.value as 'system' | 'light' | 'dark');
          this.applyTheme();
          break;
        case 'sound-notification':
        case 'last-rest-removal':
          localStorage.setItem(c.id, c.value as string);
          break;
        case 'prestart-delay':
        case 'language':
          localStorage.setItem(c.id, `${c.value}`);
          this.languageSubject$.next(c.value as Locale);

          break;
        case 'rest-timer-id':
          if ((c.value as string).trim() === c.default) {
            localStorage.removeItem(c.id);
          } else {
            localStorage.setItem(c.id, (c.value as string).trim());
          }
          break;
        case 'notify-before-seconds':
          localStorage.setItem(c.id, (c.value as string).trim());
          break;
      }
    });
  }

  getConfigValueOf(id: ConfigNames) {
    return this.config?.find((c) => c.id === id);
  }

  transformNotifyBeforeValue(v: string): [number, number, number][] {
    return v
      .split('|')
      .map(
        (v) =>
          v.split(',').map((v, i) => Number(v.trim()) * 1000) as [
            number,
            number,
            number,
          ],
      );
  }

  // theme
  applyTheme() {
    const theme = localStorage.getItem('theme');
    if (
      theme === 'dark' ||
      (theme === null &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      this.metaService.updateTag(
        { name: 'theme-color', content: '#28212c' },
        `name='theme-color'`,
      );
      this.metaService.updateTag(
        { rel: 'mask-icon', content: '#28212c' },
        `rel='mask-icon'`,
      );
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      this.metaService.updateTag(
        { name: 'theme-color', content: '#fffde7' },
        `name='theme-color'`,
      );

      this.metaService.updateTag(
        { rel: 'mask-icon', content: '#fffde7' },
        `rel='mask-icon'`,
      );
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
