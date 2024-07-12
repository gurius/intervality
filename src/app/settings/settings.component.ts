import { Component, inject } from '@angular/core';
import { Change, ConfigNames, SettingsService } from './settings.service';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { values } from 'lodash-es';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  protected settingsService = inject(SettingsService);
  private fb = inject(NonNullableFormBuilder);
  settingsForm: FormGroup;
  constructor() {
    this.settingsForm = this.fb.group({});
    this.initFormControls();
  }

  initFormControls() {
    this.settingsService.config?.forEach((c) => {
      let value = c.id === 'prestart-delay' ? c.value / 1000 : c.value;

      const validators = [
        Validators.required,
        ...(c.id === 'prestart-delay' ? [Validators.min(0)] : []),
      ];
      this.settingsForm.addControl(c.id, this.fb.control(value, validators));
    });
  }

  submit() {
    const changed = Object.entries(this.settingsForm.controls)
      .map((e) => {
        console.log(e[0], e[1].getRawValue());
        const [id, { value }] = e;
        if (id === 'prestart-delay' && value < 0) return {} as Change;
        return { id, value } as Change;
      })
      .filter((e) => !!e.id);

    this.settingsService.update(changed);
  }
}
