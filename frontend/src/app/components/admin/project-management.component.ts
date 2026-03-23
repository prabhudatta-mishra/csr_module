import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ProjectsService, Project } from '../../projects.service';
import { AddProjectDialogComponent } from '../shared/add-project-dialog.component';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatTableModule, MatPaginatorModule, MatChipsModule,
    MatProgressBarModule, MatMenuModule, MatSortModule, MatDialogModule, FormsModule, MatTooltipModule
  ],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header animate-up">
        <div>
          <h1 class="page-title">Project Management</h1>
          <p class="page-subtitle">Admin overview and control of all CSR projects</p>
        </div>
        <button class="btn-primary hover-pop" (click)="createProject()">
          <mat-icon>add</mat-icon>
          <span>Create Project</span>
        </button>
      </div>

      <!-- KPI Stats -->
      <div class="kpi-grid animate-up stagger-1">
        <div class="kpi-card glass">
          <div class="kpi-icon sky-grad"><mat-icon>work</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num sky-text">{{ totalProjects() }}</div>
            <div class="kpi-label">Total Projects</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon emerald-grad"><mat-icon>trending_up</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num emerald-text">{{ activeProjects() }}</div>
            <div class="kpi-label">Active Projects</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon violet-grad"><mat-icon>currency_rupee</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num violet-text">₹{{ totalBudget() | number }}</div>
            <div class="kpi-label">Total Budget</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon amber-grad"><mat-icon>groups</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num amber-text">{{ totalParticipants() }}</div>
            <div class="kpi-label">Total Participants</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions + Department Overview -->
      <div class="two-col animate-up stagger-2">
        <!-- Quick Actions -->
        <div class="card glass">
          <div class="card-header-sec">
            <mat-icon class="sky-text">flash_on</mat-icon>
            <div>
              <div class="card-title">Quick Actions</div>
              <div class="card-sub">Manage project operations</div>
            </div>
          </div>
          <div class="action-list">
            <button class="action-item primary" (click)="createProject()">
              <div class="action-icon sky-grad"><mat-icon>add</mat-icon></div>
              <div class="action-text">
                <div class="action-title">Create New Project</div>
                <div class="action-sub">Add a new CSR initiative</div>
              </div>
              <mat-icon class="action-arrow">arrow_forward_ios</mat-icon>
            </button>
            <button class="action-item" (click)="exportData()">
              <div class="action-icon emerald-grad"><mat-icon>download</mat-icon></div>
              <div class="action-text">
                <div class="action-title">Export Projects</div>
                <div class="action-sub">Download project CSV</div>
              </div>
              <mat-icon class="action-arrow">arrow_forward_ios</mat-icon>
            </button>
            <button class="action-item" (click)="archiveCompleted()">
              <div class="action-icon amber-grad"><mat-icon>archive</mat-icon></div>
              <div class="action-text">
                <div class="action-title">Archive Completed</div>
                <div class="action-sub">Move to archive</div>
              </div>
              <mat-icon class="action-arrow">arrow_forward_ios</mat-icon>
            </button>
          </div>
        </div>

        <!-- Department Overview -->
        <div class="card glass">
          <div class="card-header-sec">
            <mat-icon class="violet-text">bar_chart</mat-icon>
            <div>
              <div class="card-title">Department Overview</div>
              <div class="card-sub">Projects per department</div>
            </div>
          </div>
          <div class="dept-list">
            <div class="dept-row" *ngFor="let dept of departmentStats()">
              <div class="dept-left">
                <div class="dept-dot" [style.background]="getDeptColor(dept.name)"></div>
                <div class="dept-icon-wrap" [style.background]="getDeptColor(dept.name) + '22'">
                  <mat-icon [style.color]="getDeptColor(dept.name)">{{ getDeptIcon(dept.name) }}</mat-icon>
                </div>
                <span class="dept-name">{{ dept.name }}</span>
              </div>
              <div class="dept-bar-wrap">
                <div class="dept-bar" [style.width]="getBarWidth(dept.count) + '%'" [style.background]="getDeptColor(dept.name)"></div>
              </div>
              <span class="dept-count">{{ dept.count }} projects</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="card glass animate-up stagger-3">
        <div class="card-header-sec">
          <mat-icon class="emerald-text">list_alt</mat-icon>
          <div>
            <div class="card-title">Recent Projects</div>
            <div class="card-sub">Latest project activities and updates</div>
          </div>
        </div>
        <div class="proj-list">
          <div class="proj-row" *ngFor="let project of recentProjects()">
            <div class="proj-icon" [class]="getStatusIconClass(project.status)">
              <mat-icon>{{ getDeptIcon(project.department) }}</mat-icon>
            </div>
            <div class="proj-info">
              <div class="proj-name">{{ project.projectName }}</div>
              <div class="proj-dept">{{ project.department }} · {{ project.startDate | date:'mediumDate' }}</div>
            </div>
            <div class="budget-pill">₹{{ project.budget | number }}</div>
            <span class="status-badge" [class]="'status-badge ' + project.status.toLowerCase()">
              <span class="status-dot"></span>{{ project.status }}
            </span>
            <div class="proj-actions">
              <button class="icon-btn view" matTooltip="View" (click)="viewProject(project)"><mat-icon>visibility</mat-icon></button>
              <button class="icon-btn edit" matTooltip="Edit" (click)="editProject(project)"><mat-icon>edit</mat-icon></button>
            </div>
          </div>
          <div class="empty-proj" *ngIf="recentProjects().length === 0">
            <mat-icon>work_outline</mat-icon>
            <p>No projects yet. Create your first project.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { padding: 1.5rem 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 1400px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.85rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
    :host-context(.dark-theme) .page-title { color: #f8fafc; }
    .page-subtitle { font-size: 0.9rem; color: #64748b; margin: 0.2rem 0 0; }
    :host-context(.dark-theme) .page-subtitle { color: #94a3b8; }

    .btn-primary { display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; background: linear-gradient(135deg,#0ea5e9,#0284c7); color: white; border: none; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(14,165,233,0.3); transition: all 0.25s; }
    .btn-primary mat-icon { font-size: 18px; width:18px; height:18px; }
    .btn-primary:hover { transform: translateY(-2px); }
    .hover-pop:hover { transform: translateY(-2px); }

    .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.25rem; }
    @media(max-width:960px){.kpi-grid{grid-template-columns:repeat(2,1fr);}}
    .kpi-card { border-radius: 18px; padding: 1.4rem; display: flex; gap: 1rem; align-items: center; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    .kpi-card:hover { transform: translateY(-5px); }
    .kpi-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .kpi-icon mat-icon { font-size: 24px; width:24px; height:24px; color: white; }
    .sky-grad    { background: linear-gradient(135deg,#38bdf8,#0284c7); box-shadow: 0 6px 16px rgba(14,165,233,0.25); }
    .emerald-grad{ background: linear-gradient(135deg,#34d399,#059669); box-shadow: 0 6px 16px rgba(16,185,129,0.25); }
    .violet-grad { background: linear-gradient(135deg,#a78bfa,#6d28d9); box-shadow: 0 6px 16px rgba(139,92,246,0.25); }
    .amber-grad  { background: linear-gradient(135deg,#fbbf24,#d97706); box-shadow: 0 6px 16px rgba(245,158,11,0.25); }
    .kpi-body { display: flex; flex-direction: column; }
    .kpi-num { font-size: 1.75rem; font-weight: 800; line-height: 1; letter-spacing: -0.04em; }
    .kpi-label { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }
    :host-context(.dark-theme) .kpi-label { color: #94a3b8; }
    .sky-text{color:#0284c7;} .emerald-text{color:#059669;} .violet-text{color:#6d28d9;} .amber-text{color:#d97706;}
    :host-context(.dark-theme) .sky-text{color:#38bdf8;} :host-context(.dark-theme) .emerald-text{color:#10b981;}
    :host-context(.dark-theme) .violet-text{color:#a78bfa;} :host-context(.dark-theme) .amber-text{color:#fbbf24;}

    .glass { background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06); }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    @media(max-width:800px){.two-col{grid-template-columns:1fr;}}
    .card { border-radius: 20px; padding: 1.5rem; }
    .card-header-sec { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
    .card-header-sec mat-icon { font-size: 22px; width:22px; height:22px; flex-shrink: 0; margin-top: 2px; }
    .card-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
    :host-context(.dark-theme) .card-title { color: #f8fafc; }
    .card-sub { font-size: 0.78rem; color: #94a3b8; margin-top: 0.1rem; }

    .action-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .action-item { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: 12px; border: 1px solid rgba(226,232,240,0.5); background: rgba(248,250,252,0.5); cursor: pointer; transition: all 0.2s; width: 100%; text-align: left; }
    :host-context(.dark-theme) .action-item { background: rgba(15,23,42,0.3); border-color: rgba(255,255,255,0.06); }
    .action-item:hover { transform: translateX(4px); border-color: rgba(14,165,233,0.3); }
    .action-item.primary { border-color: rgba(14,165,233,0.25); }
    .action-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .action-icon mat-icon { font-size: 20px; width:20px; height:20px; color: white; }
    .action-text { flex: 1; }
    .action-title { font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    :host-context(.dark-theme) .action-title { color: #f1f5f9; }
    .action-sub { font-size: 0.75rem; color: #94a3b8; }
    .action-arrow { font-size: 16px; width:16px; height:16px; color: #94a3b8; }

    .dept-list { display: flex; flex-direction: column; gap: 0.875rem; }
    .dept-row { display: flex; align-items: center; gap: 0.75rem; }
    .dept-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dept-icon-wrap { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .dept-icon-wrap mat-icon { font-size: 16px; width:16px; height:16px; }
    .dept-left { display: flex; align-items: center; gap: 0.4rem; min-width: 130px; }
    .dept-name { font-size: 0.8rem; font-weight: 600; color: #334155; }
    :host-context(.dark-theme) .dept-name { color: #cbd5e1; }
    .dept-bar-wrap { flex: 1; height: 8px; background: rgba(226,232,240,0.6); border-radius: 999px; overflow: hidden; }
    :host-context(.dark-theme) .dept-bar-wrap { background: rgba(255,255,255,0.08); }
    .dept-bar { height: 100%; border-radius: 999px; transition: width 0.8s ease; min-width: 4px; }
    .dept-count { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; min-width: 80px; text-align: right; }

    .proj-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .proj-row { display: flex; align-items: center; gap: 1rem; padding: 0.875rem; border-radius: 12px; background: rgba(248,250,252,0.5); border: 1px solid rgba(226,232,240,0.4); transition: all 0.2s; }
    :host-context(.dark-theme) .proj-row { background: rgba(15,23,42,0.3); border-color: rgba(255,255,255,0.05); }
    .proj-row:hover { transform: translateX(4px); border-color: rgba(14,165,233,0.2); }
    .proj-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .proj-icon mat-icon { font-size: 20px; width:20px; height:20px; }
    .icon-sky     { background: rgba(14,165,233,0.1); color: #0ea5e9; }
    .icon-emerald { background: rgba(16,185,129,0.1); color: #10b981; }
    .icon-slate   { background: rgba(100,116,139,0.1); color: #475569; }
    .proj-info { flex: 1; min-width: 0; }
    .proj-name { font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    :host-context(.dark-theme) .proj-name { color: #f1f5f9; }
    .proj-dept { font-size: 0.75rem; color: #94a3b8; }
    .budget-pill { padding: 0.2rem 0.65rem; background: rgba(16,185,129,0.1); color: #059669; border-radius: 999px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
    .status-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .status-badge.ongoing   { background: rgba(16,185,129,0.1); color: #059669; }
    .status-badge.planned   { background: rgba(59,130,246,0.1); color: #2563eb; }
    .status-badge.completed { background: rgba(100,116,139,0.1); color: #475569; }
    .proj-actions { display: flex; gap: 0.25rem; }
    .icon-btn { width: 30px; height: 30px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; background: transparent; transition: all 0.2s; }
    .icon-btn mat-icon { font-size: 16px; width:16px; height:16px; }
    .icon-btn.view { color: #0ea5e9; } .icon-btn.view:hover { background: rgba(14,165,233,0.1); }
    .icon-btn.edit { color: #10b981; } .icon-btn.edit:hover { background: rgba(16,185,129,0.1); }
    .empty-proj { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2.5rem; text-align: center; color: #94a3b8; }
    .empty-proj mat-icon { font-size: 48px; width:48px; height:48px; }

    .animate-up { animation: fade-up 0.5s ease both; }
    .stagger-1{animation-delay:0.08s;} .stagger-2{animation-delay:0.14s;} .stagger-3{animation-delay:0.2s;}
    @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @media(max-width:768px){.page-wrapper{padding:1rem;} .page-header{flex-direction:column;}}
  `]
})
export class ProjectManagementComponent {
  totalProjects = signal(0);
  activeProjects = signal<number>(0);
  totalBudget = signal<number>(0);
  totalParticipants = signal<number>(0);

  constructor(private readonly projectsService: ProjectsService, private readonly snackBar: MatSnackBar, private dialog: MatDialog) {
    effect(() => {
      const projects = this.projectsService.projects();
      this.totalProjects.set(projects.length);
      this.activeProjects.set(projects.filter(p => p.status === 'Ongoing').length);
      this.totalBudget.set(projects.reduce((sum, p) => sum + p.budget, 0));
      this.totalParticipants.set(Math.floor(Math.random() * 100) + 50);
    }, { allowSignalWrites: true });
  }

  recentProjects() { return this.projectsService.projects().slice(0, 6); }

  departmentStats() {
    const projects = this.projectsService.projects();
    const departments = ['Environment', 'Education', 'Healthcare', 'Community'];
    return departments.map(dept => ({
      name: dept,
      count: projects.filter(p => p.department === dept).length
    }));
  }

  getBarWidth(count: number): number {
    const max = Math.max(...this.departmentStats().map(d => d.count), 1);
    return Math.round((count / max) * 100);
  }

  getDeptColor(dept: string): string {
    const d = (dept||'').toLowerCase();
    if (d.includes('environ')) return '#10b981';
    if (d.includes('educ')) return '#0ea5e9';
    if (d.includes('health')) return '#ef4444';
    if (d.includes('communit')) return '#f59e0b';
    return '#8b5cf6';
  }

  getDeptIcon(dept: string): string {
    const d = (dept||'').toLowerCase();
    if (d.includes('environ')) return 'eco';
    if (d.includes('educ')) return 'school';
    if (d.includes('health')) return 'local_hospital';
    if (d.includes('communit')) return 'groups';
    return 'work';
  }

  getStatusIconClass(status: string): string {
    return 'proj-icon ' + (status === 'Ongoing' ? 'icon-emerald' : status === 'Completed' ? 'icon-slate' : 'icon-sky');
  }

  createProject() {
    const ref = this.dialog.open(AddProjectDialogComponent, { width: '600px' });
    ref.afterClosed().subscribe(r => { if (r) this.snackBar.open('Project created!', 'Close', { duration: 3000 }); });
  }
  exportData() { this.snackBar.open('Exporting projects...', 'Close', { duration: 2000 }); }
  archiveCompleted() { this.snackBar.open('Archiving completed projects...', 'Close', { duration: 2000 }); }
  viewProject(p: Project) { this.snackBar.open(`Viewing: ${p.projectName}`, 'Close', { duration: 2000 }); }
  editProject(p: Project) { this.snackBar.open(`Editing: ${p.projectName}`, 'Close', { duration: 2000 }); }
}
