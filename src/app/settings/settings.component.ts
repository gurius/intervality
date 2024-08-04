import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Change, SettingsService, StartBefore } from './settings.service';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { FileService } from '../shared/services/file/file.service';
import { DataService } from '../shared/services/data/data.service';
import { Playable } from '../models/playable/playable.model';
import { DialogueService } from '../modal/modal-dialogue/dialogue.service';
import { Subject, first, map, pairwise, startWith, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  CategoryDictionary,
  ConfigNames,
  SelectStringOption,
  SettingsList,
} from './settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnDestroy {
  destroy$ = new Subject<void>();

  settingsForm: FormGroup;

  categories: CategoryDictionary[];

  @ViewChild('importInput') importInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fileService: FileService,
    private dataService: DataService,
    private fb: NonNullableFormBuilder,
    private dialogueService: DialogueService,
    private translateService: TranslateService,
    protected settingsService: SettingsService,
  ) {
    this.settingsForm = this.fb.group({});
    this.initFormControls();
    this.fileService.uploadStrem$.subscribe((file) => {
      const data = JSON.parse(file);
      this.dataService.merge(data as Playable[], 'intervality-data', (data) => {
        data.sort((a, b) => a.name.localeCompare(b.name));
      });
    });
    this.settingsForm.addControl('fileInput', this.fb.control(''));
    this.settingsForm.valueChanges
      .pipe(
        startWith(
          settingsService.config
            .map(({ id, value }) => ({ [id]: value }))
            .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        ),
        pairwise(),
        map(([prev, curr]) => {
          const chages: Change[] = [];
          for (let key in curr) {
            if (prev[key] !== curr[key]) {
              chages.push({ id: key as ConfigNames, value: curr[key] });
            }
          }
          return chages;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((chages) => {
        console.log(chages);
        this.settingsService.update(chages);
      });

    this.categories = Array.from(
      new Set(settingsService.config.map((c) => c.category)),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  isSelectInput(point: SettingsList): point is SelectStringOption<string> {
    return point.controlType === 'select';
  }

  initFormControls() {
    this.settingsService.config?.forEach((c) => {
      const validators = [
        Validators.required,
        ...(c.id === 'prestart-delay' ? [Validators.min(0)] : []),
      ];
      if (c.id === 'notify-before-seconds') {
        this.addTimingsCtrl(c);
      } else {
        this.settingsForm.addControl(
          c.id,
          this.fb.control(c.value, validators),
        );
      }
    });
  }

  addTimingBtn() {
    const timerSet: StartBefore = [1, 1, 0.5];
    this.notifyBeforeSecondsArray.push(this.addTimingsSet(timerSet));
  }

  removeTimerset(idx: number) {
    this.notifyBeforeSecondsArray.removeAt(idx);
    this.notifyBeforeSecondsArray.reset();
  }

  get notifyBeforeSecondsArray() {
    return this.settingsForm.get('notify-before-seconds') as FormArray;
  }

  getInnerArray(ctrls: AbstractControl): FormArray {
    return ctrls as FormArray;
  }

  addTimingsCtrl(c: SettingsList) {
    this.settingsForm.addControl(
      c.id,
      this.fb.array(
        (c.value as StartBefore[]).map((t) => this.addTimingsSet(t)),
      ),
    );
  }

  addTimingsSet(t: [number, number, number]) {
    const [before, duration, intensity] = t;
    return this.fb.array([
      this.fb.control(before, [Validators.required]),
      this.fb.control(duration, [Validators.required]),
      this.fb.control(intensity, [Validators.required]),
    ]);
  }

  stringGuard(val: unknown): val is string {
    return typeof val === 'string';
  }

  export() {
    const data = localStorage.getItem('intervality-data');
    if (data) {
      this.fileService.saveFile(
        new Blob([data], { type: 'application/json' }),
        'intervality-data',
      );
    } else {
      this.dialogueService
        .open({
          title: this.translateService.instant('Settings.Export'),
          content: this.translateService.instant('Settings.NothingToExport'),
        })
        .pipe(first())
        .subscribe();
    }
  }

  onImport(e: any) {
    const file = e.target.files[0];
    this.fileService.upladFile(file);
    this.settingsForm.get('fileInput')?.reset();
  }
}
