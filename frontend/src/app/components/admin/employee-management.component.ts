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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { EmployeesService, Employee } from '../../employees.service';
import { AddEmployeeDialogComponent } from '../shared/add-employee-dialog.component';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatTableModule, MatPaginatorModule, MatDialogModule,
    FormsModule, MatMenuModule, MatTabsModule, MatSortModule, MatTooltipModule
  ],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header animate-up">
        <div>
          <h1 class="page-title">Employee Management</h1>
          <p class="page-subtitle">Admin control for employee participation and assignments</p>
        </div>
        <button class="btn-primary hover-pop" (click)="addEmployee()">
          <mat-icon>person_add</mat-icon>
          <span>Add Employee</span>
        </button>
      </div>

      <!-- KPI Stats -->
      <div class="kpi-grid animate-up stagger-1">
        <div class="kpi-card glass">
          <div class="kpi-icon sky-grad"><mat-icon>badge</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num sky-text">{{ totalEmployees() }}</div>
            <div class="kpi-label">Total Employees</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon emerald-grad"><mat-icon>assignment_turned_in</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num emerald-text">{{ activeEmployees() }}</div>
            <div class="kpi-label">Active Employees</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon amber-grad"><mat-icon>calendar_month</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num amber-text">{{ bookingsThisMonth() }}</div>
            <div class="kpi-label">Bookings This Month</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon violet-grad"><mat-icon>groups</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num violet-text">{{ departmentsCount() }}</div>
            <div class="kpi-label">Departments</div>
          </div>
        </div>
      </div>

      <!-- Actions + Department Distribution -->
      <div class="two-col animate-up stagger-2">
        <!-- Quick Actions -->
        <div class="card glass">
          <div class="card-header-sec">
            <mat-icon class="sky-text">flash_on</mat-icon>
            <div>
              <div class="card-title">Quick Actions</div>
              <div class="card-sub">Manage employee operations</div>
            </div>
          </div>
          <div class="action-list">
            <button class="action-item primary" (click)="addEmployee()">
              <div class="action-icon sky-grad"><mat-icon>person_add</mat-icon></div>
              <div class="action-text">
                <div class="action-title">Add New Employee</div>
                <div class="action-sub">Create an employee profile</div>
              </div>
              <mat-icon class="action-arrow">arrow_forward_ios</mat-icon>
            </button>
            <button class="action-item" (click)="exportEmployees()">
              <div class="action-icon emerald-grad"><mat-icon>download</mat-icon></div>
              <div class="action-text">
                <div class="action-title">Export Employee List</div>
                <div class="action-sub">Download CSV report</div>
              </div>
              <mat-icon class="action-arrow">arrow_forward_ios</mat-icon>
            </button>
            <button class="action-item" (click)="bulkAssign()">
              <div class="action-icon violet-grad"><mat-icon>assignment</mat-icon></div>
              <div class="action-text">
                <div class="action-title">Bulk Assign Projects</div>
                <div class="action-sub">Assign multiple employees</div>
              </div>
              <mat-icon class="action-arrow">arrow_forward_ios</mat-icon>
            </button>
          </div>
        </div>

        <!-- Department Distribution -->
        <div class="card glass">
          <div class="card-header-sec">
            <mat-icon class="violet-text">pie_chart</mat-icon>
            <div>
              <div class="card-title">Department Distribution</div>
              <div class="card-sub">Employee breakdown by dept</div>
            </div>
          </div>
          <div class="dept-list">
            <div class="dept-row" *ngFor="let dept of departmentDistribution()">
              <div class="dept-left">
                <div class="dept-dot" [style.background]="getDeptColor(dept.name)"></div>
                <span class="dept-name">{{ dept.name }}</span>
              </div>
              <div class="dept-bar-wrap">
                <div class="dept-bar" [style.width]="(dept.percentage || 0) + '%'" [style.background]="getDeptColor(dept.name)"></div>
              </div>
              <span class="dept-count">{{ dept.count }} ({{ dept.percentage }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Employee List -->
      <div class="card glass animate-up stagger-3">
        <div class="card-header-sec">
          <mat-icon class="emerald-text">people</mat-icon>
          <div>
            <div class="card-title">Recent Employee Activities</div>
            <div class="card-sub">Latest employee bookings and participation</div>
          </div>
        </div>
        <div class="emp-list">
          <div class="emp-row" *ngFor="let e of recentEmployees()">
            <div class="emp-avatar" [style.background]="getAvatarColor(e.name)">{{ initials(e.name) }}</div>
            <div class="emp-info">
              <div class="emp-name">{{ e.name }}</div>
              <div class="emp-email">{{ e.email }}</div>
            </div>
            <div class="dept-badge" [class]="getDeptBadge(e.department)">{{ e.department }}</div>
            <div class="emp-stats">
              <span class="stat-chip"><mat-icon>work</mat-icon>{{ getAssignedProjectsCount(e) }} projects</span>
              <span class="stat-chip"><mat-icon>schedule</mat-icon>{{ lastActivity(e) }}</span>
            </div>
            <div class="emp-actions">
              <button class="icon-btn view" matTooltip="View" (click)="viewEmployee(e)"><mat-icon>visibility</mat-icon></button>
              <button class="icon-btn assign" matTooltip="Assign" (click)="assignProject(e)"><mat-icon>assignment</mat-icon></button>
              <button class="icon-btn edit" matTooltip="Edit" (click)="editEmployee(e)"><mat-icon>edit</mat-icon></button>
            </div>
          </div>
          <div class="empty-emp" *ngIf="recentEmployees().length === 0">
            <mat-icon>people_outline</mat-icon>
            <p>No employees yet. Add your first employee to get started.</p>
          </div>
        </div>
      </div>

      <!-- Performance Overview -->
      <div class="card glass animate-up stagger-4">
        <div class="card-header-sec">
          <mat-icon class="amber-text">insights</mat-icon>
          <div>
            <div class="card-title">Performance Overview</div>
            <div class="card-sub">Employee participation metrics</div>
          </div>
        </div>
        <div class="perf-grid">
          <div class="perf-card glass-inner">
            <div class="perf-val sky-text">{{ avgParticipation() }}%</div>
            <div class="perf-label">Avg. Participation</div>
            <div class="perf-bar-bg"><div class="perf-bar sky-bar" [style.width]="avgParticipation() + '%'"></div></div>
          </div>
          <div class="perf-card glass-inner">
            <div class="perf-val emerald-text">{{ topPerformer()?.name || 'N/A' }}</div>
            <div class="perf-label">Top Performer</div>
          </div>
          <div class="perf-card glass-inner">
            <div class="perf-val violet-text">{{ completionRate() }}%</div>
            <div class="perf-label">Completion Rate</div>
            <div class="perf-bar-bg"><div class="perf-bar violet-bar" [style.width]="completionRate() + '%'"></div></div>
          </div>
          <div class="perf-card glass-inner">
            <div class="perf-val amber-text">{{ satisfactionScore() }}/5</div>
            <div class="perf-label">Satisfaction Score</div>
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

    .btn-primary {
      display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem;
      background: linear-gradient(135deg,#0ea5e9,#0284c7); color: white; border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(14,165,233,0.3); transition: all 0.25s;
    }
    .btn-primary mat-icon { font-size: 18px; width:18px; height:18px; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14,165,233,0.4); }
    .hover-pop:hover { transform: translateY(-2px); }

    /* KPI */
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

    /* Cards */
    .glass { background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06); }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); }
    .glass-inner { background: rgba(248,250,252,0.6); border: 1px solid rgba(226,232,240,0.5); }
    :host-context(.dark-theme) .glass-inner { background: rgba(15,23,42,0.3); border-color: rgba(255,255,255,0.06); }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    @media(max-width:800px){.two-col{grid-template-columns:1fr;}}

    .card { border-radius: 20px; padding: 1.5rem; }
    .card-header-sec { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
    .card-header-sec mat-icon { font-size: 22px; width:22px; height:22px; flex-shrink: 0; margin-top: 2px; }
    .card-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
    :host-context(.dark-theme) .card-title { color: #f8fafc; }
    .card-sub { font-size: 0.78rem; color: #94a3b8; margin-top: 0.1rem; }

    /* Action List */
    .action-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .action-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.875rem 1rem; border-radius: 12px; border: 1px solid rgba(226,232,240,0.5);
      background: rgba(248,250,252,0.5); cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;
    }
    :host-context(.dark-theme) .action-item { background: rgba(15,23,42,0.3); border-color: rgba(255,255,255,0.06); }
    .action-item:hover { transform: translateX(4px); border-color: rgba(14,165,233,0.3); background: rgba(14,165,233,0.04); }
    .action-item.primary { border-color: rgba(14,165,233,0.2); }
    .action-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .action-icon mat-icon { font-size: 20px; width:20px; height:20px; color: white; }
    .action-text { flex: 1; }
    .action-title { font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    :host-context(.dark-theme) .action-title { color: #f1f5f9; }
    .action-sub { font-size: 0.75rem; color: #94a3b8; }
    .action-arrow { font-size: 16px; width:16px; height:16px; color: #94a3b8; }

    /* Dept */
    .dept-list { display: flex; flex-direction: column; gap: 0.875rem; }
    .dept-row { display: flex; align-items: center; gap: 0.75rem; }
    .dept-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dept-left { display: flex; align-items: center; gap: 0.5rem; min-width: 110px; }
    .dept-name { font-size: 0.8rem; font-weight: 600; color: #334155; }
    :host-context(.dark-theme) .dept-name { color: #cbd5e1; }
    .dept-bar-wrap { flex: 1; height: 8px; background: rgba(226,232,240,0.6); border-radius: 999px; overflow: hidden; }
    :host-context(.dark-theme) .dept-bar-wrap { background: rgba(255,255,255,0.08); }
    .dept-bar { height: 100%; border-radius: 999px; transition: width 0.8s ease; }
    .dept-count { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; min-width: 80px; text-align: right; }

    /* Employee List */
    .emp-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .emp-row { display: flex; align-items: center; gap: 1rem; padding: 0.875rem; border-radius: 12px; background: rgba(248,250,252,0.5); border: 1px solid rgba(226,232,240,0.4); transition: all 0.2s; }
    :host-context(.dark-theme) .emp-row { background: rgba(15,23,42,0.3); border-color: rgba(255,255,255,0.05); }
    .emp-row:hover { transform: translateX(4px); border-color: rgba(14,165,233,0.2); }
    .emp-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; color: white; flex-shrink: 0; }
    .emp-info { flex: 1; min-width: 0; }
    .emp-name { font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    :host-context(.dark-theme) .emp-name { color: #f1f5f9; }
    .emp-email { font-size: 0.75rem; color: #94a3b8; }
    .dept-badge { padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
    .badge-env   { background: rgba(16,185,129,0.1); color: #059669; }
    .badge-edu   { background: rgba(14,165,233,0.1); color: #0284c7; }
    .badge-health{ background: rgba(239,68,68,0.1);  color: #dc2626; }
    .badge-default{ background: rgba(100,116,139,0.1); color: #475569; }

    .emp-stats { display: flex; gap: 0.5rem; }
    .stat-chip { display: flex; align-items: center; gap: 0.2rem; font-size: 0.72rem; color: #94a3b8; white-space: nowrap; }
    .stat-chip mat-icon { font-size: 13px; width:13px; height:13px; }
    .emp-actions { display: flex; gap: 0.25rem; }
    .icon-btn { width: 30px; height: 30px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; background: transparent; transition: all 0.2s; }
    .icon-btn mat-icon { font-size: 16px; width:16px; height:16px; }
    .icon-btn.view   { color: #0ea5e9; } .icon-btn.view:hover   { background: rgba(14,165,233,0.1); }
    .icon-btn.assign { color: #8b5cf6; } .icon-btn.assign:hover { background: rgba(139,92,246,0.1); }
    .icon-btn.edit   { color: #10b981; } .icon-btn.edit:hover   { background: rgba(16,185,129,0.1); }

    .empty-emp { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem; text-align: center; color: #94a3b8; }
    .empty-emp mat-icon { font-size: 48px; width:48px; height:48px; }

    /* Performance */
    .perf-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
    @media(max-width:960px){.perf-grid{grid-template-columns:repeat(2,1fr);}}
    .perf-card { border-radius: 14px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .perf-val { font-size: 1.5rem; font-weight: 800; line-height: 1; letter-spacing: -0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .perf-label { font-size: 0.78rem; color: #94a3b8; }
    .perf-bar-bg { height: 6px; background: rgba(226,232,240,0.6); border-radius: 999px; overflow: hidden; margin-top: 0.25rem; }
    :host-context(.dark-theme) .perf-bar-bg { background: rgba(255,255,255,0.06); }
    .perf-bar { height: 100%; border-radius: 999px; transition: width 1s ease; }
    .sky-bar { background: linear-gradient(90deg,#38bdf8,#0284c7); }
    .violet-bar { background: linear-gradient(90deg,#a78bfa,#6d28d9); }

    .animate-up { animation: fade-up 0.5s ease both; }
    .stagger-1{animation-delay:0.08s;} .stagger-2{animation-delay:0.14s;} .stagger-3{animation-delay:0.2s;} .stagger-4{animation-delay:0.26s;}
    @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @media(max-width:768px){.page-wrapper{padding:1rem;} .page-header{flex-direction:column;}}
  `]
})
export class EmployeeManagementComponent {
  totalEmployees = signal(0);
  activeEmployees = signal<number>(0);
  bookingsThisMonth = signal<number>(0);
  departmentsCount = signal<number>(0);

  private avatarColors = ['#0ea5e9','#10b981','#8b5cf6','#f59e0b','#f43f5e','#06b6d4'];

  constructor(private employeesService: EmployeesService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    effect(() => {
      const employees = this.employeesService.employees().filter(e => e.role !== 'Volunteer');
      this.totalEmployees.set(employees.length);
      this.activeEmployees.set(employees.length);
      this.bookingsThisMonth.set(Math.floor(Math.random() * 20) + 5);
      this.departmentsCount.set(new Set(employees.map(e => e.department)).size);
    }, { allowSignalWrites: true });
  }

  recentEmployees() { return this.employeesService.employees().filter(e => e.role !== 'Volunteer').slice(0, 6); }

  initials(name: string) { return (name||'?').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase(); }
  getAvatarColor(name: string) { return this.avatarColors[(name||'').charCodeAt(0) % this.avatarColors.length]; }

  getDeptColor(dept: string): string {
    const d = (dept||'').toLowerCase();
    if (d.includes('environ')) return '#10b981';
    if (d.includes('educ')) return '#0ea5e9';
    if (d.includes('health')) return '#ef4444';
    if (d.includes('communit')) return '#f59e0b';
    return '#8b5cf6';
  }

  getDeptBadge(dept: string): string {
    const d = (dept||'').toLowerCase();
    return 'dept-badge ' + (d.includes('environ') ? 'badge-env' : d.includes('educ') ? 'badge-edu' : d.includes('health') ? 'badge-health' : 'badge-default');
  }

  departmentDistribution() {
    const employees = this.employeesService.employees().filter(e => e.role !== 'Volunteer');
    const total = employees.length;
    const departments = ['Environment', 'Education', 'Healthcare', 'Community'];
    return departments.map(dept => {
      const count = employees.filter(e => e.department === dept).length;
      return { name: dept, count, percentage: total > 0 ? Math.round((count/total)*100) : 0 };
    });
  }

  lastActivity(employee: Employee) { const days = Math.floor(Math.abs(Math.sin((employee.id||1)*337))*30+1); return days===1?'Today':`${days}d ago`; }
  getAssignedProjectsCount(e: Employee) { return e.assignedProjectIds ? e.assignedProjectIds.length : 0; }
  avgParticipation() { return 82; }
  topPerformer() { const employees = this.employeesService.employees().filter(e => e.role !== 'Volunteer'); return employees.length > 0 ? employees[0] : null; }
  completionRate() { return 88; }
  satisfactionScore() { return '4.3'; }

  addEmployee() {
    const ref = this.dialog.open(AddEmployeeDialogComponent, { width: '520px', data: { isVolunteer: false } });
    ref.afterClosed().subscribe(r => { if (r) this.snackBar.open('Employee created!', 'Close', { duration: 3000 }); });
  }
  exportEmployees() { this.snackBar.open('Exporting employee list...', 'Close', { duration: 2000 }); }
  bulkAssign() { this.snackBar.open('Bulk assignment coming soon!', 'Close', { duration: 3000 }); }
  viewEmployee(e: Employee) { this.snackBar.open(`Viewing: ${e.name}`, 'Close', { duration: 2000 }); }
  assignProject(e: Employee) { this.snackBar.open(`Assigning project to: ${e.name}`, 'Close', { duration: 2000 }); }
  editEmployee(e: Employee) { this.snackBar.open(`Editing: ${e.name}`, 'Close', { duration: 2000 }); }
}
