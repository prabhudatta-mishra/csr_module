import { Injectable, signal } from '@angular/core';

export interface ProgressUpdate {
  id: number;
  projectId: number;
  employeeId: number;
  date: string; // ISO timestamp
  note: string;
  hours?: number;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private seq = 0;
  readonly updates = signal<ProgressUpdate[]>([]);

  add(update: Omit<ProgressUpdate, 'id' | 'date'>) {
    const item: ProgressUpdate = {
      id: ++this.seq,
      date: new Date().toISOString(),
      ...update,
    };
    this.updates.set([item, ...this.updates()]);
    return item;
  }

  listFor(projectId: number, employeeId: number): ProgressUpdate[] {
    return this.updates().filter(u => u.projectId === projectId && u.employeeId === employeeId);
  }
}
