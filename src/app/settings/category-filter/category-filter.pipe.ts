import { Pipe, PipeTransform } from '@angular/core';
import { CategoryDictionary, SettingsList } from '../settings';

@Pipe({
  name: 'categoryFilter',
})
export class CategoryFilterPipe implements PipeTransform {
  transform(
    settingsList: SettingsList[],
    categoryName: CategoryDictionary,
  ): SettingsList[] | null {
    if (!settingsList || !settingsList.length) {
      return null;
    }

    if (!categoryName) {
      return settingsList;
    }

    return settingsList.filter((item) => item.category === categoryName);
  }
}
