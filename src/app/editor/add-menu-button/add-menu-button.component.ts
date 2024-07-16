import { Component, Input, OnInit, inject, output } from '@angular/core';
import {
  Playable,
  PlayableType,
  SupersetNestable,
} from '../../models/playable/playable.model';
import { DataService } from '../../data.service';
import { FormControl } from '@angular/forms';

export type AssetType = { type: SupersetNestable; item?: Playable };

@Component({
  selector: 'app-add-menu-button',
  templateUrl: './add-menu-button.component.html',
  styleUrl: './add-menu-button.component.css',
})
export class AddMenuButtonComponent implements OnInit {
  @Input() acceptAssetTypes!: PlayableType[];

  selectCtrl = new FormControl('');

  onAddItem = output<AssetType>();

  showMenu = false;

  existingItems!: {
    label: string;
    value: string;
    type: PlayableType;
  }[];

  selectedExisting: {
    label: string;
    value: string | null;
    type?: PlayableType;
  } | null = null;

  dataService = inject(DataService);

  ngOnInit(): void {
    this.existingItems = this.dataService
      .getAll()
      .filter((data) => this.acceptAssetTypes.includes(data.playableType))
      .map((item) => ({
        ...{ label: item.name },
        ...{ value: item.id },
        ...{ type: item.playableType },
      }));
  }

  addNewItem(type: SupersetNestable) {
    this.onAddItem.emit({ type });
    this.showMenu = false;
  }

  openAddMenu() {
    this.showMenu = true;
  }

  addExistingItem() {
    if (this.selectedExisting) {
      const item = this.dataService.getById(this.selectedExisting.value!);
      this.onAddItem.emit({
        type: item.playableType as SupersetNestable,
        item,
      });
    }
    this.selectCtrl.reset();
    this.showMenu = false;
  }

  getShowCountdown() {
    return this.acceptAssetTypes.includes('countdown');
  }

  getShowStopwatch() {
    return this.acceptAssetTypes.includes('stopwatch');
  }

  getShowSet() {
    return this.acceptAssetTypes.includes('set');
  }
}
