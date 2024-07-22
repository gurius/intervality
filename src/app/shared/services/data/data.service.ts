import { Injectable } from '@angular/core';
import { Data } from '@angular/router';
import { extend } from 'lodash-es';

export type DataKeyDictionary = 'intervality-data' | 'intervality-reports';

export interface Identifiable {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  private update<T extends Identifiable>(data: T[], dataKey: string) {
    localStorage.setItem(dataKey, JSON.stringify(data));
  }

  getAll<T extends Identifiable>(dataKey: DataKeyDictionary): T[] {
    const data = localStorage.getItem(dataKey);
    return data ? JSON.parse(data) : [];
  }

  getById<T extends Identifiable>(id: string, dataKey: DataKeyDictionary) {
    const p = this.getAll(dataKey).find((p) => p.id === id);

    if (!p) {
      throw new Error("Couldn't retrieve item");
    }

    return p as T;
  }

  saveItem<T extends Identifiable>(
    item: T,
    dataKey: DataKeyDictionary,
    compareFn: (data: T[]) => void = () => {},
  ) {
    const data = this.getAll(dataKey);

    data.push(item);

    compareFn(data as T[]);

    this.update(data, dataKey);
  }

  updsertItem<T extends Identifiable>(
    item: T,
    dataKey: DataKeyDictionary,
    compareFn: (data: T[]) => void = () => {},
  ) {
    const data = this.getAll(dataKey);

    const idx = data.findIndex((p) => p.id === item.id);

    if (idx === -1) {
      this.saveItem(item, dataKey, compareFn);
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

    compareFn(newData as T[]);

    this.update(newData, dataKey);
  }

  deleteItem(id: string, dataKey: DataKeyDictionary) {
    const data = this.getAll(dataKey);

    const idx = data.findIndex((p) => p.id === id);

    if (idx === -1) {
      throw new Error("Couldn't retrieve item");
    }

    data.splice(idx, 1);

    this.update(data, dataKey);
  }

  merge<T extends Identifiable>(
    mergeData: T[],
    dataKey: DataKeyDictionary,
    compareFn: (data: T[]) => void = () => {},
  ) {
    const data = this.getAll(dataKey);

    const alreadyInStorage = mergeData.filter((p) => {
      return data.some((d) => d.id === p.id);
    });

    const newSet = mergeData.filter((p) => {
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

    compareFn(newData as T[]);

    this.update(newData, dataKey);
  }
}
