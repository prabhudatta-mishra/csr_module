import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  readonly loading = signal<boolean>(false);
  private counter = 0;

  show() {
    this.counter++;
    this.loading.set(true);
  }

  hide() {
    this.counter = Math.max(0, this.counter - 1);
    if (this.counter === 0) this.loading.set(false);
  }
}
