import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  uploadStreamSubject$ = new Subject<string>();
  uploadStrem$ = this.uploadStreamSubject$.asObservable();

  constructor() {}

  upladFile(file: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.uploadStreamSubject$.next(reader.result as string);
      },
      false,
    );

    reader.readAsText(file);
  }

  saveFile(blob: Blob, name: string) {
    const objectURL = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = objectURL;
    a.download = name;
    a.style.display = 'none';

    document.body.append(a);

    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(objectURL);
      a.remove();
    }, 1000);
  }
}
