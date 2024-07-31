import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
} from 'rxjs';
import {
  ConfigNames,
  SelectStringOption,
  SettingsList,
  SingleValueOption,
} from './settings';

export type StartBefore = [number, number, number];

export type Locale = 'en' | 'uk';

export type Change = {
  id: ConfigNames;
  value: string | number | boolean | Locale;
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  languages: Locale[] = ['en', 'uk'];
  defautlLocale = 'en';

  initialised = false;

  languageSubject$ = new BehaviorSubject<Locale>(
    JSON.parse(localStorage.getItem('language') ?? '"en"') as Locale,
  );
  language$ = this.languageSubject$.asObservable().pipe(shareReplay(1));

  config$ = new BehaviorSubject<SettingsList[]>([]);

  getParam(cfgId: ConfigNames): Observable<string | number | boolean> {
    return this.config$.asObservable().pipe(
      map((cfg) => cfg.find((c) => c.id === cfgId)?.rawValue),
      distinctUntilChanged(),
      filter((x) => x !== undefined),
      shareReplay(1),
    );
  }

  config: SettingsList[] = [];

  constructor(
    private tService: TranslateService,
    private metaService: Meta,
  ) {
    this.tService.onLangChange.subscribe((event) => {
      this.initConfig();

      this.config$.next(cloneDeep(this.config));
      this.initialised = true;
    });
    // system theme change listener init
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => this.applyTheme());
  }

  // for translation to apply
  initConfig() {
    this.config = [
      new SelectStringOption({
        label: this.tService.instant('Settings.Theme') as string,
        id: 'theme',
        category: 'interface',
        description: this.tService.instant('Settings.ThemeLabel') as string,
        controlType: 'select',
        valType: 'string',
        options: [
          {
            value: 'system',
            label: this.tService.instant('Settings.OptionSystem') as string,
          },
          {
            value: 'dark',
            label: this.tService.instant('Settings.OptionDark') as string,
          },
          {
            value: 'light',
            label: this.tService.instant('Settings.OptionLight') as string,
          },
        ],
        defaults: 'system',
        unsetIfDefault: true, // useful for those whoe switch languages
        onAfterSaved: () => this.applyTheme(),
      }),
      new SingleValueOption({
        label: this.tService.instant('Settings.PrestartDelay') as string,
        id: 'prestart-delay',
        category: 'playback',
        description: this.tService.instant('Settings.PrestartLabel') as string,
        controlType: 'number',
        valType: 'number',
        defaults: 1000,
        transformBeforeGet: (v) => v / 1000, // get
        transformBeforeSet: (v) => v * 1000, // set
      }),
      new SingleValueOption({
        label: this.tService.instant('Settings.Sound'),
        id: 'sound-notification',
        category: 'playback',
        description: this.tService.instant('Settings.SoundLabel'),
        controlType: 'toggle',
        valType: 'boolean',
        defaults: false,
      }),

      new SingleValueOption({
        label: this.tService.instant('Settings.NotifyBeforeSeconds'),
        id: 'notify-before-seconds',
        category: 'playback',
        description: this.tService.instant('Settings.NotifyBeforeSecondsLabel'),
        controlType: 'custom',
        valType: 'StartBefore',
        defaults: [
          [13000, 1000, 500],
          [9000, 1000, 400],
          [2000, 1800, 300],
        ] as StartBefore[],
        transformBeforeGet: (s) =>
          s.map((t) => t.map((v) => v / 1000)) as StartBefore[],
        transformBeforeSet: (s) =>
          s.map((t) => t.map((v) => v * 1000)) as StartBefore[],
      }),
      new SelectStringOption({
        label: this.tService.instant('Settings.Language'),
        id: 'language',
        category: 'interface',
        description: this.tService.instant('Settings.LanguageLabel'),
        controlType: 'select',
        valType: 'string',
        options: this.languages.map((lang) => ({
          value: lang,
          label: this.tService.instant(`Settings.${lang}`),
        })),
        defaults: this.defautlLocale,
      }),
      new SingleValueOption({
        label: this.tService.instant('Settings.RemoveLastRest'),
        id: 'last-rest-removal',
        category: 'playback',
        description: this.tService.instant('Settings.RemoveLastRestLabel'),
        controlType: 'toggle',
        valType: 'boolean',
        defaults: false,
      }),
      new SingleValueOption({
        label: this.tService.instant('Settings.RestTimerID'),
        id: 'rest-timer-id',
        category: 'playback',
        description: this.tService.instant('Settings.RestTimerIDLabel'),
        controlType: 'string',
        valType: 'string',
        defaults: this.tService.instant('Settings.RestTimerIDDefault'),
        unsetIfDefault: true, // useful for those whoe switch languages
      }),
    ];
  }

  update(changes: Change[]) {
    changes.forEach(({ id, value }) => {
      const config = this.config?.find((c) => c.id === id);
      config && (config.value = value);

      if (id === 'language') {
        this.languageSubject$.next(value as Locale);
      }
    });

    this.config$.next(cloneDeep(this.config));
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
    const lsVal = localStorage.getItem('theme');
    const theme = lsVal ? JSON.parse(lsVal) : null;
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
}
