import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface CommandItem {
  icon: string;
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatListModule, MatIconModule, MatInputModule, FormsModule],
  template: `
    <div class="palette">
      <mat-icon class="search">search</mat-icon>
      <input matInput [(ngModel)]="query" (input)="filter()" placeholder="Type a command (e.g., Add Project, Go Projects)"/>
      <div class="results">
        <div class="item" *ngFor="let c of filtered()" (click)="run(c)">
          <mat-icon>{{ c.icon }}</mat-icon>
          <span>{{ c.label }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .palette { display: grid; gap: .5rem; width: 560px; max-width: 94vw; }
    .search { position: absolute; margin: .6rem .5rem; opacity: .6; }
    input[matInput] { padding-left: 2rem; }
    .results { max-height: 300px; overflow: auto; display: grid; }
    .item { display: grid; grid-template-columns: 24px 1fr; align-items: center; gap: .5rem; padding: .5rem; border-radius: .5rem; cursor: pointer; }
    .item:hover { background: rgba(0,0,0,.06); }
  `]
})
export class CommandPaletteComponent {
  query = '';
  private readonly items = signal<CommandItem[]>([]);
  readonly filtered = signal<CommandItem[]>([]);

  constructor(
    private readonly router: Router,
    public dialogRef: MatDialogRef<CommandPaletteComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    const go = (path: string) => () => { this.router.navigateByUrl(path); this.dialogRef.close(); };
    const items: CommandItem[] = [
      { icon: 'add', label: 'Add Project', action: () => { this.router.navigateByUrl('/projects?add=1'); this.dialogRef.close('add-project'); } },
      { icon: 'dashboard', label: 'Go to Dashboard', action: go('/dashboard') },
      { icon: 'work', label: 'Go to Projects', action: go('/projects') },
      { icon: 'group', label: 'Go to Employees', action: go('/employees') },
      { icon: 'insights', label: 'Go to Reports', action: go('/reports') },
      { icon: 'view_kanban', label: 'Go to Projects Board', action: go('/projects/board') },
      { icon: 'dark_mode', label: 'Toggle Theme', action: () => { data?.toggleTheme?.(); this.dialogRef.close(); } },
    ];
    this.items.set(items);
    this.filtered.set(items);
  }

  filter() {
    const q = this.query.trim().toLowerCase();
    if (!q) { this.filtered.set(this.items()); return; }
    this.filtered.set(this.items().filter(i => i.label.toLowerCase().includes(q)));
  }

  run(c: CommandItem) {
    c.action();
  }
}
