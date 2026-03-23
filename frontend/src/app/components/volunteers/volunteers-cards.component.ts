import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeesService, Employee } from '../../employees.service';
import { ProjectsService, Project } from '../../projects.service';

@Component({
  selector: 'app-volunteers-cards',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header animate-up">
        <div>
          <h1 class="page-title">Volunteers</h1>
          <p class="page-subtitle">{{ shown.length }} active volunteers across all departments</p>
        </div>
        <button class="btn-primary hover-pop" (click)="add()">
          <mat-icon>person_add</mat-icon>
          <span>Add Volunteer</span>
        </button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-bar glass animate-up stagger-1">
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input class="search-input" [(ngModel)]="q" (ngModelChange)="apply()" placeholder="Search volunteers by name or email...">
          <button class="clear-btn" *ngIf="q" (click)="q=''; apply()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="sort-pills">
          <span class="sort-label">Sort by:</span>
          <button class="sort-pill" [class.active]="sort==='name'" (click)="sort='name'; apply()">
            <mat-icon>sort_by_alpha</mat-icon>Name
          </button>
          <button class="sort-pill" [class.active]="sort==='hours'" (click)="sort='hours'; apply()">
            <mat-icon>schedule</mat-icon>Hours
          </button>
        </div>
        <div class="dept-filters">
          <button class="dept-filter" *ngFor="let d of deptOptions"
            [class.active]="activeDept===d"
            [class]="'dept-filter ' + getDeptClass(d)"
            (click)="filterDept(d)">
            {{ d }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state glass animate-up" *ngIf="shown.length === 0">
        <mat-icon>volunteer_activism</mat-icon>
        <h3>No Volunteers Found</h3>
        <p *ngIf="q">No results for "{{ q }}"</p>
        <p *ngIf="!q">Add your first volunteer to get started</p>
        <button class="btn-primary" (click)="add()"><mat-icon>person_add</mat-icon> Add Volunteer</button>
      </div>

      <!-- Cards Grid -->
      <div class="cards-grid">
        <div class="vol-card glass hover-pop animate-up"
          *ngFor="let v of shown; let i = index"
          [style.animation-delay]="(i * 60) + 'ms'">
          <!-- Card Header -->
          <div class="card-header" [style.background]="getHeaderGradient(v.department)">
            <div class="dept-tag">{{ v.department }}</div>
          </div>

          <!-- Avatar -->
          <div class="card-body">
            <div class="avatar-wrap">
              <div class="avatar" [style.background]="getAvatarColor(v.name)">
                {{ initials(v.name) }}
              </div>
              <div class="online-indicator"></div>
            </div>

            <div class="vol-info">
              <div class="vol-name">{{ v.name }}</div>
              <div class="vol-email">
                <mat-icon>email</mat-icon>
                {{ v.email }}
              </div>
            </div>

            <!-- Stats Row -->
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-val">{{ hours(v) }}</div>
                <div class="stat-lbl">Hours</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-val">{{ projects(v) }}</div>
                <div class="stat-lbl">Projects</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-val sky-text">Active</div>
                <div class="stat-lbl">Status</div>
              </div>
            </div>

            <!-- Assigned Projects -->
            <div class="assigned-projects" *ngIf="v.assignedProjectIds && v.assignedProjectIds.length > 0">
              <span class="proj-tag" *ngFor="let pid of v.assignedProjectIds">
                <mat-icon>assignment</mat-icon> {{ getProjectName(pid) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <button class="action-btn edit" matTooltip="Edit" (click)="edit(v)">
                <mat-icon>edit</mat-icon> Edit
              </button>
              <button class="action-btn delete" matTooltip="Delete" (click)="remove(v)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { padding: 1.5rem 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 1600px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.85rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
    :host-context(.dark-theme) .page-title { color: #f8fafc; }
    .page-subtitle { font-size: 0.9rem; color: #64748b; margin: 0.2rem 0 0; }
    :host-context(.dark-theme) .page-subtitle { color: #94a3b8; }

    .btn-primary {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.55rem 1.1rem; background: linear-gradient(135deg,#0ea5e9,#0284c7);
      color: white; border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 12px rgba(14,165,233,0.3); transition: all 0.25s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14,165,233,0.4); }
    .btn-primary mat-icon { font-size: 18px; width:18px; height:18px; }
    .hover-pop:hover { transform: translateY(-2px); }

    /* Toolbar */
    .toolbar-bar {
      border-radius: 16px; padding: 1rem 1.25rem;
      display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
    }
    .glass {
      background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06);
    }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); }

    .search-wrap {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(248,250,252,0.8); border: 1.5px solid #e2e8f0;
      border-radius: 10px; padding: 0.45rem 0.85rem;
      min-width: 220px; max-width: 320px; flex: 1; transition: border-color 0.2s;
    }
    .search-wrap:focus-within { border-color: #0ea5e9; }
    :host-context(.dark-theme) .search-wrap { background: rgba(15,23,42,0.4); border-color: rgba(255,255,255,0.1); }
    .search-icon { font-size: 18px; width:18px; height:18px; color: #94a3b8; }
    .search-input { border: none; outline: none; background: transparent; font-size: 0.875rem; color: #0f172a; flex: 1; }
    :host-context(.dark-theme) .search-input { color: #f1f5f9; }
    .clear-btn { border: none; background: none; cursor: pointer; color: #94a3b8; display: flex; padding: 0; }
    .clear-btn mat-icon { font-size: 16px; width:16px; height:16px; }

    .sort-pills { display: flex; align-items: center; gap: 0.5rem; }
    .sort-label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; white-space: nowrap; }
    .sort-pill {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.35rem 0.8rem; border-radius: 999px;
      border: 1.5px solid #e2e8f0; background: transparent;
      font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #64748b; transition: all 0.2s;
    }
    .sort-pill mat-icon { font-size: 14px; width:14px; height:14px; }
    .sort-pill.active { background: rgba(14,165,233,0.1); color: #0284c7; border-color: #0ea5e9; }
    :host-context(.dark-theme) .sort-pill { border-color: rgba(255,255,255,0.1); color: #94a3b8; }

    .dept-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .dept-filter {
      padding: 0.3rem 0.7rem; border-radius: 999px; border: 1.5px solid transparent;
      font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .dept-filter.active { transform: scale(1.05); }
    .dept-all   { background: rgba(100,116,139,0.1); color: #475569; border-color: #94a3b8; }
    .dept-env   { background: rgba(16,185,129,0.1); color: #059669; border-color: #10b981; }
    .dept-edu   { background: rgba(14,165,233,0.1); color: #0284c7; border-color: #0ea5e9; }
    .dept-health{ background: rgba(239,68,68,0.1);  color: #dc2626; border-color: #ef4444; }

    /* Cards Grid */
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    @media(max-width:600px) { .cards-grid{grid-template-columns:1fr;} }

    .vol-card {
      border-radius: 20px; overflow: hidden;
      display: flex; flex-direction: column;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
      cursor: default;
    }
    .vol-card:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(15,23,42,0.12) !important; }

    .card-header {
      height: 60px; position: relative;
      display: flex; align-items: flex-start; padding: 0.75rem 1rem;
    }
    .dept-tag {
      padding: 0.2rem 0.65rem; border-radius: 999px;
      background: rgba(255,255,255,0.3); backdrop-filter: blur(8px);
      font-size: 0.72rem; font-weight: 700; color: white; letter-spacing: 0.03em;
    }

    .card-body { padding: 0 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }

    .avatar-wrap { position: relative; display: inline-block; margin-top: -28px; }
    .avatar {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1rem; color: white;
      border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    :host-context(.dark-theme) .avatar { border-color: #1e293b; }
    .online-indicator {
      position: absolute; bottom: 2px; right: 2px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #10b981; border: 2px solid white;
    }
    :host-context(.dark-theme) .online-indicator { border-color: #1e293b; }

    .vol-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .vol-name { font-size: 1rem; font-weight: 700; color: #0f172a; }
    :host-context(.dark-theme) .vol-name { color: #f1f5f9; }
    .vol-email { display: flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; color: #94a3b8; }
    .vol-email mat-icon { font-size: 14px; width:14px; height:14px; }

    .stats-row { display: flex; align-items: center; padding: 0.75rem 0; border-top: 1px solid rgba(226,232,240,0.5); border-bottom: 1px solid rgba(226,232,240,0.5); }
    :host-context(.dark-theme) .stats-row { border-color: rgba(255,255,255,0.06); }
    .stat-item { flex: 1; text-align: center; }
    .stat-val { font-size: 1rem; font-weight: 800; color: #0f172a; }
    :host-context(.dark-theme) .stat-val { color: #f1f5f9; }
    .stat-lbl { font-size: 0.7rem; color: #94a3b8; font-weight: 500; margin-top: 1px; }
    .stat-divider { width: 1px; height: 30px; background: rgba(226,232,240,0.8); }
    :host-context(.dark-theme) .stat-divider { background: rgba(255,255,255,0.08); }
    .sky-text { color: #0ea5e9; }

    .assigned-projects { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.2rem; }
    .proj-tag { display: inline-flex; align-items: center; gap: 0.25rem; background: rgba(14,165,233,0.1); color: #0284c7; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; border: 1px solid rgba(14,165,233,0.2); }
    .proj-tag mat-icon { font-size: 14px; width: 14px; height: 14px; }
    :host-context(.dark-theme) .proj-tag { background: rgba(14,165,233,0.15); color: #38bdf8; border-color: rgba(14,165,233,0.3); }

    .card-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .action-btn {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.4rem 0.85rem; border-radius: 8px; border: none; cursor: pointer;
      font-size: 0.8rem; font-weight: 600; transition: all 0.2s;
    }
    .action-btn mat-icon { font-size: 16px; width:16px; height:16px; }
    .action-btn.edit { flex: 1; background: rgba(14,165,233,0.1); color: #0284c7; }
    .action-btn.edit:hover { background: rgba(14,165,233,0.18); }
    .action-btn.delete { background: rgba(239,68,68,0.1); color: #dc2626; }
    .action-btn.delete:hover { background: rgba(239,68,68,0.18); }

    /* Empty State */
    .empty-state {
      border-radius: 20px; padding: 4rem 2rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem; text-align: center;
    }
    .empty-state mat-icon { font-size: 64px; width:64px; height:64px; color: #cbd5e1; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: #334155; margin: 0; }
    :host-context(.dark-theme) .empty-state h3 { color: #94a3b8; }
    .empty-state p { color: #94a3b8; margin: 0; font-size: 0.875rem; }

    .animate-up { animation: fade-up 0.5s ease both; }
    .stagger-1 { animation-delay: 0.08s; }
    @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @media(max-width:768px) { .page-wrapper{padding:1rem;} .page-header{flex-direction:column;} }
  `]
})
export class VolunteersCardsComponent {
  q = '';
  sort: 'name' | 'hours' = 'name';
  shown: Employee[] = [];
  activeDept = 'All';
  deptOptions = ['All', 'Environment', 'Education', 'Healthcare'];

  private avatarColors = ['#0ea5e9','#10b981','#8b5cf6','#f59e0b','#f43f5e','#06b6d4'];

  constructor(private readonly svc: EmployeesService, private readonly projectsService: ProjectsService, private readonly dlg: MatDialog, private readonly snack: MatSnackBar) {
    this.apply();
  }

  private all(): Employee[] { return this.svc.list().filter(e => e.role === 'Volunteer'); }

  apply() {
    const q = this.q.trim().toLowerCase();
    let filtered = this.all().filter(v => !q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q));
    if (this.activeDept !== 'All') {
      filtered = filtered.filter(v => v.department === this.activeDept);
    }
    this.shown = [...filtered].sort((a, b) =>
      this.sort === 'name' ? a.name.localeCompare(b.name) : this.hours(b) - this.hours(a)
    );
  }

  filterDept(dept: string) { this.activeDept = dept; this.apply(); }

  initials(name: string) { return (name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase(); }

  getAvatarColor(name: string): string {
    return this.avatarColors[(name || '').charCodeAt(0) % this.avatarColors.length];
  }

  getHeaderGradient(dept: string): string {
    const d = (dept || '').toLowerCase();
    if (d.includes('environ')) return 'linear-gradient(135deg, #34d399, #059669)';
    if (d.includes('educ')) return 'linear-gradient(135deg, #38bdf8, #0284c7)';
    if (d.includes('health')) return 'linear-gradient(135deg, #f87171, #dc2626)';
    if (d.includes('communit')) return 'linear-gradient(135deg, #fbbf24, #d97706)';
    return 'linear-gradient(135deg, #a78bfa, #6d28d9)';
  }

  getDeptClass(dept: string): string {
    if (dept === 'All') return 'dept-filter dept-all';
    const d = dept.toLowerCase();
    if (d.includes('environ')) return 'dept-filter dept-env';
    if (d.includes('educ')) return 'dept-filter dept-edu';
    if (d.includes('health')) return 'dept-filter dept-health';
    return 'dept-filter dept-all';
  }

  hours(_v: Employee) { return Math.floor(Math.abs(Math.sin((_v.id || 1) * 7919)) * 120 + 10); }
  projects(_v: Employee) { return _v.assignedProjectIds ? _v.assignedProjectIds.length : Math.floor(Math.abs(Math.sin((_v.id || 1) * 1301)) * 4); }

  getProjectName(id: number): string {
    const p = this.projectsService.projects().find(x => x.id === id);
    return p ? p.projectName : `#${id}`;
  }

  add() {
    const ref = this.dlg.open(VolunteerDialogComponent, { width: '520px', data: { mode: 'add' } });
    ref.afterClosed().subscribe((val: any) => {
      if (!val) return;
      // We must use addOrGet so we receive the created object back with its new ID!
      const newVol = this.svc.addOrGet({ name: val.name, email: val.email, department: val.department, role: 'Volunteer' });
      this.svc.update(newVol.id, { 
        assignedProjectIds: val.assignedProjectId ? [Number(val.assignedProjectId)] : [] 
      });
      this.snack.open('Volunteer added', 'OK', { duration: 2000 });
      this.apply();
    });
  }

  edit(v: Employee) {
    const ref = this.dlg.open(VolunteerDialogComponent, { width: '520px', data: { mode: 'edit', value: { name: v.name, email: v.email, department: v.department, assignedProjectId: v.assignedProjectIds?.[0] || null } } });
    ref.afterClosed().subscribe((val: any) => {
      if (!val) return;
      this.svc.update(v.id, { 
        name: val.name, 
        email: val.email, 
        department: val.department,
        assignedProjectIds: val.assignedProjectId ? [Number(val.assignedProjectId)] : []
      });
      this.snack.open('Volunteer updated', 'OK', { duration: 2000 });
      this.apply();
    });
  }

  remove(v: Employee) {
    if (!confirm('Delete this volunteer?')) return;
    this.svc.remove(v.id);
    this.snack.open('Volunteer removed', 'OK', { duration: 2000 });
    this.apply();
  }
}

@Component({
  selector: 'app-volunteer-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatSelectModule, MatIconModule],
  template: `
    <div class="dialog-wrap">
      <div class="dialog-header">
        <mat-icon>{{ data?.mode === 'edit' ? 'edit' : 'person_add' }}</mat-icon>
        <h2>{{ data?.mode === 'edit' ? 'Edit' : 'Add' }} Volunteer</h2>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()" class="dialog-form">
        <div class="form-field">
          <mat-icon class="field-icon">person</mat-icon>
          <mat-form-field appearance="outline" class="field">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" required />
          </mat-form-field>
        </div>
        <div class="form-field">
          <mat-icon class="field-icon">email</mat-icon>
          <mat-form-field appearance="outline" class="field">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" required />
          </mat-form-field>
        </div>
        <div class="form-field">
          <mat-icon class="field-icon">business</mat-icon>
          <mat-form-field appearance="outline" class="field">
            <mat-label>Department</mat-label>
            <mat-select formControlName="department">
              <mat-option value="Education">Education</mat-option>
              <mat-option value="Environment">Environment</mat-option>
              <mat-option value="Healthcare">Healthcare</mat-option>
              <mat-option value="Community">Community</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-field">
          <mat-icon class="field-icon">assignment</mat-icon>
          <mat-form-field appearance="outline" class="field">
            <mat-label>Assign Project</mat-label>
            <mat-select formControlName="assignedProjectId">
              <mat-option [value]="null">None (Optional)</mat-option>
              <mat-option *ngFor="let p of availableProjects" [value]="p.id">
                {{ p.projectName }} ({{ p.department }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="dialog-actions">
          <button type="button" class="btn-cancel" mat-dialog-close>Cancel</button>
          <button type="submit" class="btn-save" [disabled]="form.invalid">
            <mat-icon>{{ data?.mode === 'edit' ? 'save' : 'person_add' }}</mat-icon>
            {{ data?.mode === 'edit' ? 'Save Changes' : 'Add Volunteer' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-wrap { min-width: 420px; }
    .dialog-header {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1.5rem 1.5rem 1rem;
      background: linear-gradient(135deg, rgba(14,165,233,0.08), rgba(16,185,129,0.08));
      border-bottom: 1px solid rgba(226,232,240,0.6);
    }
    .dialog-header mat-icon { font-size: 28px; width:28px; height:28px; color: #0ea5e9; }
    .dialog-header h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .dialog-form { display: flex; flex-direction: column; gap: 0.25rem; padding: 1.25rem 1.5rem 1.5rem; }
    .form-field { display: flex; align-items: center; gap: 0.75rem; }
    .field-icon { color: #94a3b8; flex-shrink: 0; margin-top: -1.25rem; }
    .field { flex: 1; }
    .dialog-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
    .btn-cancel { padding: 0.5rem 1.25rem; border-radius: 8px; border: 1.5px solid #e2e8f0; background: transparent; font-size: 0.875rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .btn-cancel:hover { border-color: #94a3b8; }
    .btn-save { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; border-radius: 8px; border: none; background: linear-gradient(135deg,#0ea5e9,#0284c7); color: white; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.25s; }
    .btn-save:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14,165,233,0.3); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-save mat-icon { font-size: 16px; width:16px; height:16px; }
  `]
})
export class VolunteerDialogComponent {
  form!: FormGroup;
  availableProjects: Project[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private ref: MatDialogRef<VolunteerDialogComponent>, private projectsService: ProjectsService) {
    this.availableProjects = this.projectsService.projects();
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['Education', Validators.required],
      assignedProjectId: [null]
    });
    if (data?.value) this.form.patchValue(data.value);
  }
  save() { if (this.form.invalid) return; this.ref.close(this.form.value); }
}
