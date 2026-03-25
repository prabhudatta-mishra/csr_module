import { Component, ViewChild, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Project, ProjectsService } from '../../projects.service';
import { ProjectDialogComponent } from './project-dialog.component';
import { ConfirmDialogComponent, ConfirmData } from './confirm-dialog.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatChipsModule, MatTooltipModule
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header animate-up">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">Manage and track all CSR initiatives</p>
        </div>
        <div class="header-actions">
          <div class="stat-pill sky">
            <mat-icon>work</mat-icon>
            <span>{{ totalProjects() }} total</span>
          </div>
          <div class="stat-pill emerald">
            <mat-icon>play_circle</mat-icon>
            <span>{{ ongoingCount() }} active</span>
          </div>
          <button class="btn-primary hover-pop" (click)="add()">
            <mat-icon>add</mat-icon>
            <span>Add Project</span>
          </button>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card glass animate-up stagger-1">
        <ng-container *ngIf="loading(); else tableBlock">
          <div class="skeleton-wrap">
            <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5,6]">
              <div class="skel-line w-40"></div>
              <div class="skel-line w-24"></div>
              <div class="skel-line w-20"></div>
              <div class="skel-line w-28"></div>
              <div class="skel-line w-16"></div>
            </div>
          </div>
        </ng-container>

        <ng-template #tableBlock>
          <!-- Filter Bar -->
          <div class="filter-bar">
            <div class="search-wrap">
              <mat-icon class="search-icon">search</mat-icon>
              <input class="search-input" [(ngModel)]="filterText" (ngModelChange)="applyFilterText()" placeholder="Search projects...">
            </div>
            <div class="status-chips">
              <button
                *ngFor="let s of statusOptions"
                class="status-chip"
                [class.active]="selectedStatuses().has(s)"
                [class]="'status-chip ' + s.toLowerCase() + (selectedStatuses().has(s) ? ' active' : '')"
                (click)="toggleStatus(s)">
                <mat-icon>{{ getStatusIcon(s) }}</mat-icon>
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort (matSortChange)="sortData($event)">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Project Name</th>
                <td mat-cell *matCellDef="let row">
                  <div class="project-name-cell">
                    <div class="project-icon-wrap" [class]="getStatusIconClass(row.status)">
                      <mat-icon>{{ getDeptIcon(row.department) }}</mat-icon>
                    </div>
                    <div>
                      <div class="proj-name">{{ row.projectName }}</div>
                      <div class="proj-dept">{{ row.department }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="budget">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Budget</th>
                <td mat-cell *matCellDef="let row">
                  <div class="budget-cell">
                    <mat-icon class="currency-icon">currency_rupee</mat-icon>
                    <span class="budget-value">{{ row.budget | number }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let row">
                  <span class="status-badge" [class]="'status-badge ' + row.status.toLowerCase()">
                    <span class="status-dot"></span>
                    {{ row.status }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="startDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Start Date</th>
                <td mat-cell *matCellDef="let row">
                  <span class="date-text">{{ row.startDate | date:'mediumDate' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <div class="actions-wrap">
                    <button class="icon-btn edit" matTooltip="Edit" (click)="edit(row)"><mat-icon>edit</mat-icon></button>
                    <button class="icon-btn delete" matTooltip="Delete" (click)="delete(row)"><mat-icon>delete</mat-icon></button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
            </table>

            <div class="empty-state" *ngIf="dataSource.filteredData.length === 0 && !loading()">
              <mat-icon>work_outline</mat-icon>
              <h3>No Projects Found</h3>
              <p>Create your first project to get started</p>
              <button class="btn-primary" (click)="add()">
                <mat-icon>add</mat-icon> Add Project
              </button>
            </div>
          </div>

          <div class="paginator-wrap">
            <mat-paginator [length]="totalProjects()" [pageSize]="pageSize" [pageSizeOptions]="[5,10,25,100]" showFirstLastButtons></mat-paginator>
          </div>
        </ng-template>
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

    .header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .stat-pill {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.4rem 0.85rem; border-radius: 999px;
      font-size: 0.82rem; font-weight: 600;
    }
    .stat-pill mat-icon { font-size: 15px; width:15px; height:15px; }
    .stat-pill.sky { background: rgba(14,165,233,0.1); color: #0284c7; border: 1px solid rgba(14,165,233,0.2); }
    .stat-pill.emerald { background: rgba(16,185,129,0.1); color: #059669; border: 1px solid rgba(16,185,129,0.2); }

    .btn-primary {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.55rem 1.1rem;
      background: linear-gradient(135deg,#0ea5e9,#0284c7);
      color: white; border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 12px rgba(14,165,233,0.3);
      transition: all 0.25s ease;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14,165,233,0.4); }
    .btn-primary mat-icon { font-size: 18px; width:18px; height:18px; }
    .hover-pop:hover { transform: translateY(-2px); }

    .table-card { border-radius: 20px; overflow: hidden; }
    .glass {
      background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06);
    }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); box-shadow: 0 4px 24px rgba(0,0,0,0.25); }

    .filter-bar { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(226,232,240,0.6); flex-wrap: wrap; }
    :host-context(.dark-theme) .filter-bar { border-bottom-color: rgba(255,255,255,0.06); }

    .search-wrap {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(248,250,252,0.8); border: 1.5px solid #e2e8f0;
      border-radius: 10px; padding: 0.5rem 0.85rem;
      flex: 1; min-width: 200px; max-width: 340px; transition: border-color 0.2s;
    }
    .search-wrap:focus-within { border-color: #0ea5e9; }
    :host-context(.dark-theme) .search-wrap { background: rgba(15,23,42,0.4); border-color: rgba(255,255,255,0.1); }
    .search-icon { font-size: 18px; width:18px; height:18px; color: #94a3b8; }
    .search-input { border: none; outline: none; background: transparent; font-size: 0.875rem; color: #0f172a; width: 100%; }
    :host-context(.dark-theme) .search-input { color: #f1f5f9; }

    .status-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .status-chip {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.35rem 0.85rem; border-radius: 999px;
      border: 1.5px solid #e2e8f0; background: transparent;
      font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #64748b;
      transition: all 0.2s ease;
    }
    .status-chip mat-icon { font-size: 14px; width:14px; height:14px; }
    .status-chip.ongoing.active   { background: rgba(16,185,129,0.1); color: #059669; border-color: #10b981; }
    .status-chip.planned.active   { background: rgba(59,130,246,0.1); color: #2563eb; border-color: #3b82f6; }
    .status-chip.completed.active { background: rgba(100,116,139,0.1); color: #475569; border-color: #64748b; }
    .status-chip:hover { opacity: 0.8; }
    :host-context(.dark-theme) .status-chip { border-color: rgba(255,255,255,0.1); color: #94a3b8; }

    .table-container { overflow-x: auto; }
    table { width: 100%; }

    :host ::ng-deep .mat-mdc-header-cell {
      background: rgba(248,250,252,0.9) !important; font-size: 0.78rem !important;
      font-weight: 700 !important; color: #64748b !important; text-transform: uppercase;
      letter-spacing: 0.05em; border-bottom: 1px solid rgba(226,232,240,0.6) !important;
      padding: 1rem 1.25rem !important;
    }
    :host-context(.dark-theme) ::ng-deep .mat-mdc-header-cell { background: rgba(15,23,42,0.3) !important; color: #94a3b8 !important; border-bottom-color: rgba(255,255,255,0.06) !important; }
    :host ::ng-deep .mat-mdc-cell { padding: 0.9rem 1.25rem !important; border-bottom: 1px solid rgba(226,232,240,0.4) !important; color: #334155; }
    :host-context(.dark-theme) ::ng-deep .mat-mdc-cell { color: #cbd5e1; border-bottom-color: rgba(255,255,255,0.04) !important; }
    .table-row { transition: background 0.15s; }
    .table-row:hover :host ::ng-deep .mat-mdc-cell { background: rgba(14,165,233,0.03) !important; }

    .project-name-cell { display: flex; align-items: center; gap: 0.75rem; }
    .project-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .project-icon-wrap mat-icon { font-size: 18px; width:18px; height:18px; }
    .icon-sky     { background: rgba(14,165,233,0.1); color: #0ea5e9; }
    .icon-emerald { background: rgba(16,185,129,0.1); color: #10b981; }
    .icon-slate   { background: rgba(100,116,139,0.1); color: #475569; }
    .proj-name { font-weight: 600; font-size: 0.875rem; color: #0f172a; }
    :host-context(.dark-theme) .proj-name { color: #f1f5f9; }
    .proj-dept { font-size: 0.75rem; color: #94a3b8; }
    .budget-cell { display: flex; align-items: center; gap: 0.2rem; }
    .currency-icon { font-size: 14px; width:14px; height:14px; color: #94a3b8; }
    .budget-value { font-weight: 600; color: #0f172a; font-size: 0.875rem; }
    :host-context(.dark-theme) .budget-value { color: #f1f5f9; }
    .date-text { font-size: 0.875rem; color: #64748b; }

    .status-badge {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.25rem 0.85rem; border-radius: 999px;
      font-size: 0.78rem; font-weight: 700;
    }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .status-badge.ongoing   { background: rgba(16,185,129,0.12); color: #059669; }
    .status-badge.planned   { background: rgba(59,130,246,0.12); color: #2563eb; }
    .status-badge.completed { background: rgba(100,116,139,0.12); color: #475569; }
    :host-context(.dark-theme) .status-badge.ongoing   { color: #34d399; }
    :host-context(.dark-theme) .status-badge.planned   { color: #60a5fa; }
    :host-context(.dark-theme) .status-badge.completed { color: #94a3b8; }

    .actions-wrap { display: flex; gap: 0.3rem; }
    .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; }
    .icon-btn mat-icon { font-size: 18px; width:18px; height:18px; }
    .icon-btn.edit { color: #0ea5e9; } .icon-btn.edit:hover { background: rgba(14,165,233,0.1); }
    .icon-btn.delete { color: #ef4444; } .icon-btn.delete:hover { background: rgba(239,68,68,0.1); }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; gap: 0.75rem; text-align: center; }
    .empty-state mat-icon { font-size: 64px; width:64px; height:64px; color: #cbd5e1; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: #334155; margin: 0; }
    :host-context(.dark-theme) .empty-state h3 { color: #94a3b8; }
    .empty-state p { color: #94a3b8; margin: 0; font-size: 0.875rem; }

    .paginator-wrap { border-top: 1px solid rgba(226,232,240,0.6); padding: 0.25rem 0.5rem; }
    :host-context(.dark-theme) .paginator-wrap { border-top-color: rgba(255,255,255,0.06); }

    .skeleton-wrap { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .skeleton-row { display: flex; align-items: center; gap: 1rem; }
    .skel-line { height: 14px; border-radius: 6px; background: #e2e8f0; animation: shimmer 1.5s infinite; }
    .w-40{width:10rem;} .w-24{width:6rem;} .w-20{width:5rem;} .w-28{width:7rem;} .w-16{width:4rem;}
    @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
    :host-context(.dark-theme) .skel-line { background: rgba(255,255,255,0.08); }

    .animate-up { animation: fade-up 0.5s ease both; }
    .stagger-1 { animation-delay: 0.08s; }
    @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @media(max-width:768px) { .page-wrapper{padding:1rem;} .page-header{flex-direction:column;} }
  `]
})
export class ProjectsComponent {
  displayedColumns = ['name', 'budget', 'status', 'startDate', 'actions'];
  dataSource = new MatTableDataSource<Project>();
  totalProjects = signal(0);
  ongoingCount = signal(0);
  loading = signal(true);
  pageSize = 10;
  filterText = '';
  statusOptions = ['Planned', 'Ongoing', 'Completed'];
  selectedStatuses = signal<Set<string>>(new Set());

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private projectsService: ProjectsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    effect(() => {
      const projects = this.projectsService.projects();
      this.dataSource.data = projects;
      this.totalProjects.set(projects.length);
      this.ongoingCount.set(projects.filter(p => p.status === 'Ongoing').length);
      this.loading.set(false);
    }, { allowSignalWrites: true });

    setTimeout(() => {
      const projects = this.projectsService.projects();
      if (projects.length === 0) {
        const testData: Project[] = [
          { id: 1, projectName: 'Test Project 1', department: 'Environment', budget: 500000, startDate: '2025-01-10', endDate: '2025-12-20', status: 'Ongoing' },
          { id: 2, projectName: 'Test Project 2', department: 'Education', budget: 800000, startDate: '2025-02-01', endDate: '2025-10-30', status: 'Planned' },
          { id: 3, projectName: 'Test Project 3', department: 'Healthcare', budget: 300000, startDate: '2025-03-15', endDate: '2025-07-15', status: 'Completed' }
        ];
        this.dataSource.data = testData;
        this.totalProjects.set(testData.length);
        this.loading.set(false);
      }
    }, 500);

    this.route.queryParams.subscribe(params => {
      if (params['add'] === '1') this.add();
      if (params['q']) {
        this.filterText = params['q'];
        // defer until dataSource is ready
        setTimeout(() => {
          this.dataSource.filter = this.filterText.trim().toLowerCase();
        }, 100);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilterText() { this.dataSource.filter = this.filterText.trim().toLowerCase(); }
  applyFilter(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.dataSource.filter = v.trim().toLowerCase();
  }

  sortData(sort: any) {
    const data = this.dataSource.filteredData;
    if (!sort.active || sort.direction === '') { this.dataSource.data = data; return; }
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compare(a.projectName, b.projectName, isAsc);
        case 'budget': return compare(a.budget, b.budget, isAsc);
        case 'status': return compare(a.status, b.status, isAsc);
        case 'startDate': return compare(a.startDate, b.startDate, isAsc);
        default: return 0;
      }
    });
  }

  toggleStatus(status: string) {
    const current = new Set(this.selectedStatuses());
    if (current.has(status)) { current.delete(status); } else { current.add(status); }
    this.selectedStatuses.set(current);
    const statuses = Array.from(this.selectedStatuses());
    this.dataSource.filter = statuses.length === 0 ? '' : statuses.join(' ');
  }

  getStatusColor(status: string) { return status === 'Ongoing' ? 'primary' : status === 'Completed' ? 'accent' : 'primary'; }
  getStatusIcon(status: string) { return status === 'Ongoing' ? 'play_circle' : status === 'Completed' ? 'check_circle' : 'schedule'; }
  getStatusIconClass(status: string) { return status === 'Ongoing' ? 'project-icon-wrap icon-emerald' : status === 'Completed' ? 'project-icon-wrap icon-slate' : 'project-icon-wrap icon-sky'; }
  getDeptIcon(dept: string) {
    if (!dept) return 'work';
    const d = dept.toLowerCase();
    if (d.includes('environ')) return 'eco';
    if (d.includes('educ')) return 'school';
    if (d.includes('health')) return 'local_hospital';
    if (d.includes('communit')) return 'groups';
    return 'work';
  }

  add() {
    const ref = this.dialog.open(ProjectDialogComponent, { width: '600px', data: {} });
    ref.afterClosed().subscribe(r => { 
      if (r) {
        this.projectsService.add(r);
        this.snackBar.open('Project added!', 'Close', { duration: 3000 }); 
      }
    });
  }

  edit(project: Project) {
    const ref = this.dialog.open(ProjectDialogComponent, { width: '600px', data: { ...project } });
    ref.afterClosed().subscribe(r => { 
      if (r) {
        this.projectsService.update(project.id, r);
        this.snackBar.open('Project updated!', 'Close', { duration: 3000 }); 
      }
    });
  }

  delete(project: Project) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Project', message: `Delete "${project.projectName}"?`, confirmText: 'Delete', cancelText: 'Cancel' }
    });
    ref.afterClosed().subscribe(r => {
      if (r) { this.projectsService.remove(project.id); this.snackBar.open('Project deleted!', 'Close', { duration: 3000 }); }
    });
  }
}

function compare(a: any, b: any, isAsc: boolean) { return (a < b ? -1 : 1) * (isAsc ? 1 : -1); }
