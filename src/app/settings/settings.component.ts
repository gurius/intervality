import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Change, SettingsService } from './settings.service';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FileService } from '../shared/services/file/file.service';
import { DataService } from '../shared/services/data/data.service';
import { Playable } from '../models/playable/playable.model';
import { DialogueService } from '../modal/dialogue.service';
import { first } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  protected settingsService = inject(SettingsService);
  settingsForm: FormGroup;

  @ViewChild('importInput') importInput!: ElementRef<HTMLInputElement>;
  constructor(
    private fileService: FileService,
    private dataService: DataService,
    private fb: NonNullableFormBuilder,
    private dialogueService: DialogueService,
    private translateService: TranslateService,
  ) {
    this.settingsForm = this.fb.group({});
    this.initFormControls();
    this.fileService.uploadStrem$.subscribe((file) => {
      const data = JSON.parse(file);
      this.dataService.merge(data as Playable[]);
    });
    this.settingsForm.addControl('fileInput', this.fb.control(''));
  }

  initFormControls() {
    this.settingsService.config?.forEach((c) => {
      let value =
        c.id === 'prestart-delay' ? (c.value as number) / 1000 : c.value;

      const validators = [
        Validators.required,
        ...(c.id === 'prestart-delay' ? [Validators.min(0)] : []),
      ];
      this.settingsForm.addControl(c.id, this.fb.control(value, validators));
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

  submit() {
    const changed = Object.entries(this.settingsForm.controls)
      .map((e) => {
        const [id, { value }] = e;
        if (id === 'prestart-delay' && value < 0) return {} as Change;
        return { id, value } as Change;
      })
      .filter((e) => !!e.id);

    this.settingsService.update(changed);
  }
}
