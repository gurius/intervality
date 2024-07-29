import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { Change, SettingsService } from './settings.service';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FileService } from '../shared/services/file/file.service';
import { DataService } from '../shared/services/data/data.service';
import { Playable } from '../models/playable/playable.model';
import { DialogueService } from '../modal/dialogue.service';
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
        startWith(() => {
          // initial state to compare with in map from the first chage
          settingsService.config.map(({ id, value }) => ({ id, value }));
        }),
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
    console.log(this.categories);
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
      this.settingsForm.addControl(c.id, this.fb.control(c.value, validators));
    });
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
