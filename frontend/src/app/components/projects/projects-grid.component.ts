import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ProjectsService, Project } from '../../projects.service';
import { ProjectDialogComponent } from './project-dialog.component';

@Component({
  selector: 'app-projects-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="section">
      <div class="header">
        <h2>CSR Projects</h2>
        <button mat-raised-button color="primary" (click)="add()">
          <mat-icon>add</mat-icon>
          Add Project
        </button>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="q" placeholder="Project name..." (ngModelChange)="apply()" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="cat" (selectionChange)="apply()">
            <mat-option value="">All</mat-option>
            <mat-option value="Education">Education</mat-option>
            <mat-option value="Environment">Environment</mat-option>
            <mat-option value="Healthcare">Health</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="status" (selectionChange)="apply()">
            <mat-option value="">All</mat-option>
            <mat-option value="Planned">Planned</mat-option>
            <mat-option value="Ongoing">Ongoing</mat-option>
            <mat-option value="Completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="grid">
        <mat-card *ngFor="let p of shown" class="proj glass hover-pop" (click)="open(p)">
          <div class="cover">
            <div class="badge" [ngClass]="(p.status || '').toLowerCase()">{{ p.status }}</div>
          </div>
          <mat-card-content>
            <div class="title">{{ p.projectName }}</div>
            <div class="meta">{{ p.department }} • {{ p.budget | number }}</div>
            <div class="tags">
              <span class="tag" [ngClass]="catClass(p.department)">{{ catLabel(p.department) }}</span>
            </div>
            <div class="progress">
              <div class="bar" [style.width.%]="progress(p)"></div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .section { padding: 1rem; display: grid; gap: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    :host-context(.dark-theme) h2 { color: #f8fafc; }
    .filters { display: flex; flex-wrap: wrap; gap: .5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: .75rem; }
    @media (max-width: 1200px) { .grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
    @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
    .proj { overflow: hidden; cursor: pointer; }
    /* For standard .glass support, text colors: */
    
    .cover { height: 120px; background: linear-gradient(135deg, #0ea5e9, #10b981); position: relative; }
    .badge { position: absolute; top: .5rem; right: .5rem; padding: .15rem .5rem; border-radius: 9999px; font-size: .75rem; color: white; }
    .badge.planned { background: #0284c7; }
    .badge.ongoing { background: #16a34a; }
    .badge.completed { background: #6d28d9; }
    
    .title { font-weight: 600; margin-top: .25rem; }
    :host-context(.dark-theme) .title { color: #f8fafc; }
    
    .meta { opacity: .75; font-size: .9rem; }
    :host-context(.dark-theme) .meta { color: #94a3b8; }
    
    .tags { margin: .25rem 0; }
    .tag { padding: .1rem .5rem; border-radius: 9999px; font-size: .75rem; background: rgba(0,0,0,.06); }
    :host-context(.dark-theme) .tag { background: rgba(255,255,255,0.06); }
    
    .tag.education { background: #e0f2fe; color: #075985; }
    :host-context(.dark-theme) .tag.education { background: rgba(2,132,199,0.2); color: #7dd3fc; }
    
    .tag.environment { background: #dcfce7; color: #166534; }
    :host-context(.dark-theme) .tag.environment { background: rgba(22,163,74,0.2); color: #86efac; }
    
    .tag.health { background: #ede9fe; color: #5b21b6; }
    :host-context(.dark-theme) .tag.health { background: rgba(109,40,217,0.2); color: #c4b5fd; }
    
    .progress { background: rgba(0,0,0,.06); height: 6px; border-radius: 9999px; overflow: hidden; }
    :host-context(.dark-theme) .progress { background: rgba(255,255,255,0.1); }
    
    .bar { background: linear-gradient(90deg, #06b6d4, #22c55e); height: 100%; }
  `]
})
export class ProjectsGridComponent {
  q = '';
  cat = '';
  status = '';
  shown: Project[] = [];

  constructor(private readonly svc: ProjectsService, private readonly dialog: MatDialog, private readonly snack: MatSnackBar) {
    this.apply();
  }

  private all(): Project[] { return this.svc.list(); }

  apply() {
    const q = this.q.trim().toLowerCase();
    this.shown = this.all().filter(p => {
      const okQ = !q || (p.projectName?.toLowerCase().includes(q) || p.department?.toLowerCase().includes(q));
      const okCat = !this.cat || p.department === this.cat;
      const okStatus = !this.status || p.status === this.status;
      return okQ && okCat && okStatus;
    });
  }

  catLabel(d: string | undefined) { return d === 'Healthcare' ? 'Health' : d || 'General'; }
  catClass(d: string | undefined) {
    const key = (d || 'general').toLowerCase();
    return key.includes('educ') ? 'education' : key.includes('env') ? 'environment' : key.includes('health') ? 'health' : 'general';
  }

  progress(p: Project) {
    const total = p.budget || 0, used = p.usedBudget || 0;
    if (!total) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  }

  add() {
    const ref = this.dialog.open(ProjectDialogComponent, { width: '640px', data: {} });
    ref.afterClosed().subscribe((result: Project | undefined) => {
      if (!result) return;
      this.svc.add({
        projectName: result.projectName,
        department: result.department,
        budget: result.budget,
        usedBudget: result.usedBudget ?? 0,
        startDate: result.startDate,
        endDate: result.endDate,
        status: result.status,
        description: result.description
      });
      this.snack.open('Project added', 'OK', { duration: 1500 });
      this.apply();
    });
  }

  open(p: Project) {
    const ref = this.dialog.open(ProjectDialogComponent, { width: '640px', data: { ...p } });
    ref.afterClosed().subscribe((result: Project | undefined) => {
      if (!result) return;
      if (p.id) this.svc.update(p.id, result);
      this.snack.open('Project updated', 'OK', { duration: 1500 });
      this.apply();
    });
  }
}
