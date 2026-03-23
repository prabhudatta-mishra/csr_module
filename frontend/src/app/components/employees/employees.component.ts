import { Component, ViewChild, effect, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EmployeesService, Employee } from '../../employees.service';
import { ProjectsService, Project } from '../../projects.service';
import { AuthService } from '../../auth.service';
import { AddEmployeeDialogComponent } from '../shared/add-employee-dialog.component';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule,
    MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule,
    MatDialogModule, MatChipsModule, MatTooltipModule
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-wrapper">
      <!-- Page Header -->
      <div class="page-header animate-up">
        <div class="header-left">
          <h1 class="page-title">Employees</h1>
          <p class="page-subtitle">Manage your workforce</p>
        </div>
        <div class="header-actions">
          <div class="count-badge">
            <mat-icon>people</mat-icon>
            <span>{{ totalEmployees() }} members</span>
          </div>
          <button class="btn-primary hover-pop" (click)="addEmployee()">
            <mat-icon>person_add</mat-icon>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <!-- Main Card -->
      <div class="table-card glass animate-up stagger-1">
        <ng-container *ngIf="loading(); else tableBlock">
          <div class="skeleton-wrap">
            <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]">
              <div class="skel-avatar"></div>
              <div class="skel-line w-32"></div>
              <div class="skel-line w-48"></div>
              <div class="skel-line w-24"></div>
              <div class="skel-line w-16"></div>
            </div>
          </div>
        </ng-container>

        <ng-template #tableBlock>
          <!-- Filter Bar -->
          <div class="filter-bar">
            <div class="search-wrap">
              <mat-icon class="search-icon">search</mat-icon>
              <input class="search-input" [(ngModel)]="filterText" (ngModelChange)="applyFilterText()" placeholder="Search employees...">
            </div>
            <div class="role-chips">
              <button
                *ngFor="let role of roleOptions"
                class="role-chip"
                [class.active]="selectedRoles().has(role)"
                (click)="toggleRole(role)">
                <mat-icon>{{ getRoleIcon(role) }}</mat-icon>
                {{ role }}
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort (matSortChange)="sortData($event)">
              <!-- Avatar + Name -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let row">
                  <div class="name-cell">
                    <div class="avatar" [style.background]="getAvatarColor(row.name)">{{ initials(row.name) }}</div>
                    <div>
                      <div class="emp-name">{{ row.name }}</div>
                      <div class="emp-id">EMP-{{ row.id | number:'4.0-0' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let row">
                  <span class="email-text">{{ row.email }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                <td mat-cell *matCellDef="let row">
                  <span class="dept-badge" [class]="getDeptClass(row.department)">{{ row.department }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="assignedProjects">
                <th mat-header-cell *matHeaderCellDef>Assigned Project(s)</th>
                <td mat-cell *matCellDef="let row">
                  <div class="project-tags">
                    <span class="project-tag" *ngFor="let pid of row.assignedProjectIds">
                      {{ getProjectName(pid) }}
                    </span>
                    <span class="no-project" *ngIf="!row.assignedProjectIds || row.assignedProjectIds.length === 0">
                      None
                    </span>
                  </div>
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

            <!-- Empty State -->
            <div class="empty-state" *ngIf="dataSource.filteredData.length === 0 && !loading()">
              <mat-icon>people_outline</mat-icon>
              <h3>No Employees Found</h3>
              <p>Add your first employee to get started</p>
              <button class="btn-primary" (click)="addEmployee()">
                <mat-icon>person_add</mat-icon> Add Employee
              </button>
            </div>
          </div>

          <div class="paginator-wrap">
            <mat-paginator [length]="totalEmployees()" [pageSize]="pageSize" [pageSizeOptions]="[5,10,25,100]" showFirstLastButtons></mat-paginator>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { padding: 1.5rem 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 1400px; margin: 0 auto; }

    /* Header */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.85rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
    :host-context(.dark-theme) .page-title { color: #f8fafc; }
    .page-subtitle { font-size: 0.9rem; color: #64748b; margin: 0.2rem 0 0; }
    :host-context(.dark-theme) .page-subtitle { color: #94a3b8; }

    .header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

    .count-badge {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.4rem 0.85rem;
      background: rgba(14,165,233,0.1);
      color: #0284c7;
      border-radius: 999px;
      font-size: 0.85rem; font-weight: 600;
      border: 1px solid rgba(14,165,233,0.2);
    }
    .count-badge mat-icon { font-size: 16px; width:16px; height:16px; }

    .btn-primary {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.55rem 1.1rem;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white; border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 12px rgba(14,165,233,0.3);
      transition: all 0.25s ease;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14,165,233,0.4); }
    .btn-primary mat-icon { font-size: 18px; width:18px; height:18px; }

    .btn-accent {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.55rem 1.1rem;
      background: rgba(16,185,129,0.1);
      color: #059669;
      border: 1.5px solid rgba(16,185,129,0.3);
      border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      transition: all 0.25s ease;
    }
    .btn-accent:hover { background: rgba(16,185,129,0.15); transform: translateY(-2px); }
    .btn-accent mat-icon { font-size: 18px; width:18px; height:18px; }

    .hover-pop:hover { transform: translateY(-2px); }

    /* Table Card */
    .table-card {
      border-radius: 20px;
      overflow: hidden;
    }
    .glass {
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.6);
      box-shadow: 0 4px 24px rgba(15,23,42,0.06);
    }
    :host-context(.dark-theme) .glass {
      background: rgba(30,41,59,0.6);
      border-color: rgba(255,255,255,0.08);
    }

    /* Filter Bar */
    .filter-bar { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(226,232,240,0.6); flex-wrap: wrap; }
    :host-context(.dark-theme) .filter-bar { border-bottom-color: rgba(255,255,255,0.06); }

    .search-wrap {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(248,250,252,0.8);
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.5rem 0.85rem;
      flex: 1; min-width: 220px; max-width: 360px;
      transition: border-color 0.2s;
    }
    .search-wrap:focus-within { border-color: #0ea5e9; }
    :host-context(.dark-theme) .search-wrap { background: rgba(15,23,42,0.4); border-color: rgba(255,255,255,0.1); }
    .search-icon { font-size: 18px; width:18px; height:18px; color: #94a3b8; }
    .search-input { border: none; outline: none; background: transparent; font-size: 0.875rem; color: #0f172a; width: 100%; }
    :host-context(.dark-theme) .search-input { color: #f1f5f9; }

    .role-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .role-chip {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      border: 1.5px solid #e2e8f0;
      background: transparent;
      font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #64748b;
      transition: all 0.2s ease;
    }
    .role-chip mat-icon { font-size: 14px; width:14px; height:14px; }
    .role-chip:hover { border-color: #0ea5e9; color: #0ea5e9; background: rgba(14,165,233,0.05); }
    .role-chip.active { background: rgba(14,165,233,0.1); color: #0284c7; border-color: #0ea5e9; }
    :host-context(.dark-theme) .role-chip { border-color: rgba(255,255,255,0.1); color: #94a3b8; }
    :host-context(.dark-theme) .role-chip.active { background: rgba(14,165,233,0.15); color: #38bdf8; }

    /* Table */
    .table-container { overflow-x: auto; }
    table { width: 100%; }

    :host ::ng-deep .mat-mdc-header-cell {
      background: rgba(248,250,252,0.8) !important;
      font-size: 0.78rem !important;
      font-weight: 700 !important;
      color: #64748b !important;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(226,232,240,0.6) !important;
      padding: 1rem 1.25rem !important;
    }
    :host-context(.dark-theme) ::ng-deep .mat-mdc-header-cell {
      background: rgba(15,23,42,0.3) !important;
      color: #94a3b8 !important;
      border-bottom-color: rgba(255,255,255,0.06) !important;
    }
    :host ::ng-deep .mat-mdc-cell {
      padding: 1rem 1.25rem !important;
      border-bottom: 1px solid rgba(226,232,240,0.4) !important;
      color: #334155;
    }
    :host-context(.dark-theme) ::ng-deep .mat-mdc-cell { color: #cbd5e1; border-bottom-color: rgba(255,255,255,0.04) !important; }

    .table-row { transition: background 0.15s ease; }
    .table-row:hover :host ::ng-deep .mat-mdc-cell { background: rgba(14,165,233,0.04) !important; }

    /* Name Cell */
    .name-cell { display: flex; align-items: center; gap: 0.75rem; }
    .avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.875rem; color: white;
      flex-shrink: 0;
    }
    .emp-name { font-weight: 600; font-size: 0.875rem; color: #0f172a; }
    :host-context(.dark-theme) .emp-name { color: #f1f5f9; }
    .emp-id { font-size: 0.75rem; color: #94a3b8; margin-top: 1px; }
    .email-text { font-size: 0.875rem; color: #64748b; }

    /* Dept Badge */
    .dept-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem; font-weight: 600;
    }
    .dept-env        { background: rgba(16,185,129,0.1); color: #059669; }
    .dept-edu        { background: rgba(14,165,233,0.1); color: #0284c7; }
    .dept-health     { background: rgba(239,68,68,0.1);  color: #dc2626; }
    .dept-community  { background: rgba(245,158,11,0.1); color: #d97706; }
    .dept-default    { background: rgba(100,116,139,0.1); color: #475569; }

    /* Project Tags */
    .project-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .project-tag {
      background: rgba(14,165,233,0.1); color: #0284c7;
      border: 1px solid rgba(14,165,233,0.2);
      padding: 0.2rem 0.6rem; border-radius: 6px;
      font-size: 0.75rem; font-weight: 600;
      white-space: nowrap;
    }
    :host-context(.dark-theme) .project-tag { background: rgba(14,165,233,0.15); color: #38bdf8; border-color: rgba(14,165,233,0.3); }
    .no-project { color: #94a3b8; font-size: 0.8rem; font-style: italic; }

    /* Actions */
    .actions-wrap { display: flex; gap: 0.3rem; }
    .icon-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      background: transparent;
    }
    .icon-btn mat-icon { font-size: 18px; width:18px; height:18px; }
    .icon-btn.edit { color: #0ea5e9; }
    .icon-btn.edit:hover { background: rgba(14,165,233,0.1); }
    .icon-btn.delete { color: #ef4444; }
    .icon-btn.delete:hover { background: rgba(239,68,68,0.1); }

    /* Empty State */
    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem 2rem; gap: 0.75rem; text-align: center;
    }
    .empty-state mat-icon { font-size: 64px; width:64px; height:64px; color: #cbd5e1; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: #334155; margin: 0; }
    :host-context(.dark-theme) .empty-state h3 { color: #94a3b8; }
    .empty-state p { color: #94a3b8; margin: 0; font-size: 0.875rem; }

    /* Paginator */
    .paginator-wrap {
      border-top: 1px solid rgba(226,232,240,0.6);
      padding: 0.25rem 0.5rem;
    }
    :host-context(.dark-theme) .paginator-wrap { border-top-color: rgba(255,255,255,0.06); }

    /* Skeleton */
    .skeleton-wrap { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .skeleton-row { display: flex; align-items: center; gap: 1rem; }
    .skel-avatar { width: 38px; height: 38px; border-radius: 50%; background: #e2e8f0; animation: shimmer 1.5s infinite; flex-shrink: 0; }
    .skel-line { height: 14px; border-radius: 6px; background: #e2e8f0; animation: shimmer 1.5s infinite; }
    .w-32 { width: 8rem; } .w-48 { width: 12rem; } .w-24 { width: 6rem; } .w-16 { width: 4rem; }
    @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
    :host-context(.dark-theme) .skel-avatar, :host-context(.dark-theme) .skel-line { background: rgba(255,255,255,0.08); }

    /* Animations */
    .animate-up { animation: fade-up 0.5s ease both; }
    .stagger-1 { animation-delay: 0.08s; }
    @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }

    @media (max-width: 768px) {
      .page-wrapper { padding: 1rem; }
      .page-header { flex-direction: column; }
      .header-actions { width: 100%; }
    }
  `]
})
export class EmployeesComponent implements AfterViewInit {
  displayedColumns = ['name', 'email', 'department', 'assignedProjects', 'actions'];
  dataSource = new MatTableDataSource<Employee>();
  totalEmployees = signal(0);
  loading = signal(true);
  pageSize = 10;
  filterText = '';
  roleOptions = ['Employee', 'Manager', 'Admin'];
  selectedRoles = signal<Set<string>>(new Set());

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private avatarColors = ['#0ea5e9','#10b981','#8b5cf6','#f59e0b','#f43f5e','#06b6d4','#84cc16'];

  constructor(
    private employeesService: EmployeesService,
    private projectsService: ProjectsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    effect(() => {
      const employees = this.employeesService.employees().filter(e => e.role !== 'Volunteer');
      this.dataSource.data = employees;
      this.totalEmployees.set(employees.length);
      this.loading.set(false);
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initials(name: string) {
    return (name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const idx = (name || '').charCodeAt(0) % this.avatarColors.length;
    return this.avatarColors[idx];
  }

  getDeptClass(dept: string): string {
    const d = (dept || '').toLowerCase();
    if (d.includes('environ')) return 'dept-badge dept-env';
    if (d.includes('educ')) return 'dept-badge dept-edu';
    if (d.includes('health')) return 'dept-badge dept-health';
    if (d.includes('communit')) return 'dept-badge dept-community';
    return 'dept-badge dept-default';
  }

  getProjectName(id: number): string {
    const p = this.projectsService.projects().find(x => x.id === id);
    return p ? p.projectName : `#${id}`;
  }

  getRoleIcon(role: string): string {
    switch(role) {
      case 'Employee': return 'badge';
      case 'Volunteer': return 'volunteer_activism';
      case 'Manager': return 'manage_accounts';
      case 'Admin': return 'admin_panel_settings';
      default: return 'person';
    }
  }

  applyFilterText() {
    this.dataSource.filter = this.filterText.trim().toLowerCase();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  sortData(sort: any) {
    const data = this.dataSource.filteredData;
    if (!sort.active || sort.direction === '') { this.dataSource.data = data; return; }
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'email': return compare(a.email, b.email, isAsc);
        case 'department': return compare(a.department, b.department, isAsc);
        default: return 0;
      }
    });
  }

  toggleRole(role: string) {
    const current = new Set(this.selectedRoles());
    if (current.has(role)) { current.delete(role); } else { current.add(role); }
    this.selectedRoles.set(current);
    this.applyRoleFilter();
  }

  private applyRoleFilter() {
    const roles = Array.from(this.selectedRoles());
    this.dataSource.filter = roles.length === 0 ? '' : roles.join(' ');
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Employee': return 'primary';
      case 'Manager': return 'warn'; default: return '';
    }
  }

  addEmployee() { this.openAddDialog(false); }

  private openAddDialog(isVolunteer: boolean) {
    const dialogRef = this.dialog.open(AddEmployeeDialogComponent, { width: '520px', data: { isVolunteer } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.snackBar.open(`${isVolunteer ? 'Volunteer' : 'Employee'} added successfully!`, 'Close', { duration: 3000 });
    });
  }

  edit(employee: Employee) {
    const dialogRef = this.dialog.open(AddEmployeeDialogComponent, {
      width: '560px',
      data: { isVolunteer: false, employee }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        this.snackBar.open('Employee updated successfully!', 'Close', { duration: 3000 });
        this.notificationService.push(`${result.employee?.name || employee.name}'s profile was updated.`);
      }
    });
  }

  delete(employee: Employee) {
    this.employeesService.remove(employee.id);
    this.snackBar.open('Employee removed successfully!', 'Close', { duration: 3000 });
    this.notificationService.push(`${employee.name} has been removed from the team.`);
  }
}

function compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
