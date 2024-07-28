import { noop } from 'lodash-es';
import { identity } from 'rxjs';

export type SettingsList =
  | SingleValueOption<string>
  | SelectStringOption<string>
  | SingleValueOption<number>
  | SelectStringOption<number>
  | SingleValueOption<boolean>
  | SelectStringOption<boolean>;

export type ConfigNames =
  | 'theme'
  | 'sound-notification'
  | 'prestart-delay'
  | 'language'
  | 'last-rest-removal'
  | 'rest-timer-id'
  | 'notify-before-seconds';

export interface OptionParameters<T> {
  label: string;
  id: ConfigNames;
  description: string;
  controlType: 'toggle' | 'string' | 'number' | 'select';
  value?: T;
  defaults: T;

  // remove item from localStorage if value is equal to defalut
  unsetIfDefault?: boolean;

  onAfterSaved?: () => void;

  transformBeforeGet?: (v: T) => T;
  transformBeforeSet?: (v: T) => T;
}

export interface SelectOptionParameters<T> extends OptionParameters<T> {
  controlType: 'select';
  options: { label: string; value: T }[];
}

class SettingsOption<T> {
  label: string;
  id: ConfigNames;
  description: string;
  controlType: 'toggle' | 'select' | 'string' | 'number';

  unsetIfDefault: boolean;

  onAfterSaved: () => void;

  protected val: T | undefined;
  protected defaults: T;

  transformBeforeGet: (v: T) => T = identity;
  transformBeforeSet: (v: T) => T = identity;

  constructor({
    label,
    id,
    description,
    controlType,
    defaults,
    unsetIfDefault = false,
    onAfterSaved = noop,
    transformBeforeGet = identity,
    transformBeforeSet = identity,
  }: OptionParameters<T> | SelectOptionParameters<T>) {
    this.defaults = defaults;
    this.label = label;
    this.id = id;
    this.description = description;
    this.controlType = controlType;
    this.defaults = defaults;
    this.unsetIfDefault = unsetIfDefault;

    this.onAfterSaved = onAfterSaved;
    this.transformBeforeGet = transformBeforeGet;
    this.transformBeforeSet = transformBeforeSet;
  }

  get value() {
    const val = this.isInitialised ? this.val : this.restore();
    return this.transformBeforeGet(val);
  }

  set value(value: T) {
    this.val = this.transformBeforeSet(value);
    this.saveToLocalStorage();
    this.onAfterSaved();
  }

  get rawValue() {
    // need all the same as with value except transform part
    return this.isInitialised ? this.val : this.restore();
  }

  get isInitialised(): boolean {
    return typeof this.val !== 'undefined';
  }

  saveToLocalStorage() {
    if (this.val === null || this.val === undefined)
      throw new Error(`value hasn't been saved`);

    if (this.unsetIfDefault && this.value === this.defaults) {
      localStorage.removeItem(this.id);
    } else {
      localStorage.setItem(this.id, this.val!.toString().trim());
    }
  }

  restore() {
    const item = localStorage.getItem(this.id);

    return item ? this.parse(item) : this.defaults;
  }

  isInitiallyString() {
    return this.controlType === 'string' || this.controlType === 'select';
  }

  parse(value: string) {
    return this.isInitiallyString() ? value : JSON.parse(value);
  }
}

export class SingleValueOption<T> extends SettingsOption<T> {
  constructor(param: OptionParameters<T>) {
    super(param);
  }
}

export class SelectStringOption<T> extends SettingsOption<T> {
  options: { label: string; value: T }[];
  constructor(param: SelectOptionParameters<T>) {
    param.controlType = 'select';
    super(param);
    this.options = param.options;
  }
}
