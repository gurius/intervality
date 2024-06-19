import { Pipe, PipeTransform } from '@angular/core';
import { Playable } from '../../models/playable/playable.model';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform(
    playable: Playable[],
    userInput: string,
    ...args: unknown[]
  ): Playable[] | null {
    if (!playable || !playable.length) {
      return null;
    }

    if (!userInput) {
      return playable;
    }

    return playable.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(userInput.toLowerCase()),
    );
  }
}
