import { Injectable } from '@angular/core';
import { Playable } from './models/playable/playable.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  private update(data: Playable[]) {
    localStorage.setItem('intervality-data', JSON.stringify(data));
  }

  getAll(): Playable[] {
    const data = localStorage.getItem('intervality-data');
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): Playable {
    const p = this.getAll().find((p) => p.id === id);

    if (!p) {
      throw new Error("Couldn't retrieve item");
    }

    return p;
  }

  saveItem(item: Playable) {
    const data = this.getAll();

    data.push(item);

    data.sort((a, b) => a.name.localeCompare(b.name));

    this.update(data);
  }

  updsertItem(item: Playable) {
    const data = this.getAll();

    const idx = data.findIndex((p) => p.id === item.id);

    if (idx === -1) {
      this.saveItem(item);
      return;
    }

    const numberOfitems = data
      .filter((p) => p.id === item.id)
      .map(() => 1)
      .reduce((acc, curr) => acc + curr, 0);

    if (numberOfitems > 1) {
      throw new Error('Dublicates found!');
    }

    const newData = data.with(idx, item);

    newData.sort((a, b) => a.name.localeCompare(b.name));

    this.update(newData);
  }

  deleteItem(id: string) {
    const data = this.getAll();

    const idx = data.findIndex((p) => p.id === id);

    if (idx === -1) {
      throw new Error("Couldn't retrieve item");
    }

    data.splice(idx, 1);

    this.update(data);
  }

  merge(playable: Playable[]) {
    const data = this.getAll();

    const alreadyInStorage = playable.filter((p) => {
      return data.some((d) => d.id === p.id);
    });

    const newSet = playable.filter((p) => {
      return !data.some((d) => d.id === p.id);
    });

    alreadyInStorage.forEach((item) => {
      const idx = data.findIndex((p) => p.id === item.id);

      const numberOfitems = data
        .filter((p) => p.id === item.id)
        .map(() => 1)
        .reduce((acc, curr) => acc + curr, 0);

      if (numberOfitems > 1) {
        throw new Error('Dublicates found!');
      }

      // update with item form new set
      data.with(idx, item);
    });

    const newData = data.concat(newSet);

    newData.sort((a, b) => a.name.localeCompare(b.name));

    this.update(newData);
  }
}
