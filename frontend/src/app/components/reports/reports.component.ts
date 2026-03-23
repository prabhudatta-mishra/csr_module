import { Component, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ProjectsService } from '../../projects.service';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, NgxChartsModule, MatTabsModule
  ],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header animate-up">
        <div>
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-subtitle">Insight-driven metrics for CSR impact measurement</p>
        </div>
        <button class="btn-export hover-pop" (click)="exportAllReports()">
          <mat-icon>download</mat-icon>
          <span>Export Reports</span>
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid animate-up stagger-1">
        <div class="kpi-card glass">
          <div class="kpi-icon sky-grad"><mat-icon>work</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num sky-text">{{ totalProjects() }}</div>
            <div class="kpi-label">Total Projects</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon emerald-grad"><mat-icon>play_circle</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num emerald-text">{{ activeProjects() }}</div>
            <div class="kpi-label">Active Projects</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon violet-grad"><mat-icon>check_circle</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num violet-text">{{ completedProjects() }}</div>
            <div class="kpi-label">Completed</div>
          </div>
        </div>
        <div class="kpi-card glass">
          <div class="kpi-icon amber-grad"><mat-icon>currency_rupee</mat-icon></div>
          <div class="kpi-body">
            <div class="kpi-num amber-text">₹{{ totalBudget() | number }}</div>
            <div class="kpi-label">Total Budget</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row animate-up stagger-2">
        <div class="chart-card glass">
          <div class="chart-header">
            <div class="chart-title-wrap">
              <mat-icon class="sky-text">show_chart</mat-icon>
              <div>
                <div class="chart-title">Participation Trends</div>
                <div class="chart-sub">Monthly volunteer participation</div>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <ngx-charts-line-chart
              [results]="participationData"
              [scheme]="colorScheme"
              [xAxis]="true" [yAxis]="true"
              [gradient]="true" [legend]="true"
              [showXAxisLabel]="true" [showYAxisLabel]="true"
              [xAxisLabel]="'Month'" [yAxisLabel]="'Participants'"
              [animations]="true">
            </ngx-charts-line-chart>
          </div>
        </div>

        <div class="chart-card glass">
          <div class="chart-header">
            <div class="chart-title-wrap">
              <mat-icon class="violet-text">pie_chart</mat-icon>
              <div>
                <div class="chart-title">Department Distribution</div>
                <div class="chart-sub">Projects by department</div>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <ngx-charts-pie-chart
              [results]="departmentData"
              [scheme]="colorScheme"
              [gradient]="true"
              [legend]="true"
              [animations]="true">
            </ngx-charts-pie-chart>
          </div>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="filter-card glass animate-up stagger-3">
        <div class="filter-header">
          <mat-icon class="emerald-text">date_range</mat-icon>
          <div>
            <div class="chart-title">Custom Date Range</div>
            <div class="chart-sub">Filter reports by specific date range</div>
          </div>
        </div>
        <div class="filter-body">
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>From Date</mat-label>
            <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate">
            <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>To Date</mat-label>
            <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate">
            <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>
          <div class="filter-actions">
            <button class="btn-apply" (click)="applyDateFilter()">
              <mat-icon>filter_alt</mat-icon> Apply Filter
            </button>
            <button class="btn-clear" (click)="clearDateFilter()">
              <mat-icon>close</mat-icon> Clear
            </button>
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

    .btn-export {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.6rem 1.25rem;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white; border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 12px rgba(16,185,129,0.3); transition: all 0.25s;
    }
    .btn-export:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16,185,129,0.4); }
    .btn-export mat-icon { font-size: 18px; width:18px; height:18px; }
    .hover-pop:hover { transform: translateY(-2px); }

    /* KPI */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
    @media(max-width:960px) { .kpi-grid{grid-template-columns:repeat(2,1fr);} }
    @media(max-width:500px) { .kpi-grid{grid-template-columns:1fr;} }

    .kpi-card {
      border-radius: 18px; padding: 1.4rem;
      display: flex; gap: 1rem; align-items: center;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .kpi-card:hover { transform: translateY(-5px); }
    .kpi-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .kpi-icon mat-icon { font-size: 26px; width:26px; height:26px; color: white; }
    .sky-grad    { background: linear-gradient(135deg,#38bdf8,#0284c7); box-shadow: 0 6px 16px rgba(14,165,233,0.25); }
    .emerald-grad{ background: linear-gradient(135deg,#34d399,#059669); box-shadow: 0 6px 16px rgba(16,185,129,0.25); }
    .violet-grad { background: linear-gradient(135deg,#a78bfa,#6d28d9); box-shadow: 0 6px 16px rgba(139,92,246,0.25); }
    .amber-grad  { background: linear-gradient(135deg,#fbbf24,#d97706); box-shadow: 0 6px 16px rgba(245,158,11,0.25); }

    .kpi-body { display: flex; flex-direction: column; }
    .kpi-num { font-size: 1.75rem; font-weight: 800; line-height: 1; letter-spacing: -0.04em; }
    .kpi-label { font-size: 0.8rem; color: #64748b; font-weight: 500; margin-top: 0.2rem; }
    :host-context(.dark-theme) .kpi-label { color: #94a3b8; }
    .sky-text{color:#0284c7;} .emerald-text{color:#059669;} .violet-text{color:#6d28d9;} .amber-text{color:#d97706;}
    :host-context(.dark-theme) .sky-text{color:#38bdf8;} :host-context(.dark-theme) .emerald-text{color:#10b981;}
    :host-context(.dark-theme) .violet-text{color:#a78bfa;} :host-context(.dark-theme) .amber-text{color:#fbbf24;}

    /* Charts */
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    @media(max-width:800px) { .charts-row{grid-template-columns:1fr;} }

    .chart-card, .filter-card { border-radius: 20px; padding: 1.5rem; }
    .chart-header, .filter-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
    .chart-header mat-icon, .filter-header mat-icon { font-size: 22px; width:22px; height:22px; flex-shrink: 0; margin-top: 2px; }
    .chart-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
    :host-context(.dark-theme) .chart-title { color: #f8fafc; }
    .chart-sub { font-size: 0.78rem; color: #94a3b8; margin-top: 0.1rem; }
    .chart-title-wrap { display: flex; align-items: flex-start; gap: 0.75rem; }
    .chart-container { height: 300px; width: 100%; }
    :host ::ng-deep .ngx-charts text { fill: #64748b !important; font-size: 11px !important; }
    :host-context(.dark-theme) ::ng-deep .ngx-charts text { fill: #94a3b8 !important; }

    /* Date Filter */
    .filter-body { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
    .date-field { min-width: 180px; flex: 1; }
    .filter-actions { display: flex; gap: 0.75rem; flex-shrink: 0; }
    .btn-apply {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1.1rem; border-radius: 9px; border: none;
      background: linear-gradient(135deg,#0ea5e9,#0284c7); color: white;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.25s;
    }
    .btn-apply mat-icon { font-size: 16px; width:16px; height:16px; }
    .btn-apply:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14,165,233,0.3); }
    .btn-clear {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1rem; border-radius: 9px;
      border: 1.5px solid #e2e8f0; background: transparent;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; color: #64748b; transition: all 0.2s;
    }
    .btn-clear mat-icon { font-size: 16px; width:16px; height:16px; }
    .btn-clear:hover { border-color: #94a3b8; }

    /* Glass */
    .glass {
      background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06);
    }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); box-shadow: 0 4px 24px rgba(0,0,0,0.25); }

    .animate-up { animation: fade-up 0.5s ease both; }
    .stagger-1{animation-delay:0.08s;} .stagger-2{animation-delay:0.16s;} .stagger-3{animation-delay:0.24s;}
    @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @media(max-width:768px) { .page-wrapper{padding:1rem;} .page-header{flex-direction:column;} }
  `]
})
export class ReportsComponent {
  totalProjects = signal(0);
  activeProjects = signal(0);
  completedProjects = signal(0);
  totalBudget = signal(0);
  fromDate?: Date;
  toDate?: Date;

  colorScheme = { domain: ['#0ea5e9','#22c55e','#f59e0b','#ef4444'] } as any;

  participationData = [{
    name: 'Volunteers',
    series: [
      { name: 'Jan', value: 45 }, { name: 'Feb', value: 52 }, { name: 'Mar', value: 38 },
      { name: 'Apr', value: 65 }, { name: 'May', value: 72 }, { name: 'Jun', value: 89 }
    ]
  }];

  departmentData = [
    { name: 'Environment', value: 35 }, { name: 'Education', value: 28 },
    { name: 'Healthcare', value: 22 }, { name: 'Community', value: 15 }
  ];

  constructor(
    private projectsService: ProjectsService,
    private employeesService: EmployeesService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    effect(() => {
      const projects = this.projectsService.projects();
      this.totalProjects.set(projects.length);
      this.activeProjects.set(projects.filter(p => p.status === 'Ongoing').length);
      this.completedProjects.set(projects.filter(p => p.status === 'Completed').length);
      this.totalBudget.set(projects.reduce((sum, p) => sum + p.budget, 0));
    }, { allowSignalWrites: true });
  }

  applyDateFilter() {
    if (this.fromDate && this.toDate) {
      this.snackBar.open('Date filter applied!', 'Close', { duration: 3000 });
    } else {
      this.snackBar.open('Please select both from and to dates.', 'Close', { duration: 2000 });
    }
  }

  clearDateFilter() {
    this.fromDate = undefined;
    this.toDate = undefined;
    this.snackBar.open('Date filter cleared!', 'Close', { duration: 2000 });
  }

  exportAllReports() {
    const projects = this.projectsService.projects();
    const employees = this.employeesService.employees();
    const headers = ['Type','Name','Department','Budget','Status','Start Date'];
    const rows = [
      ...projects.map(p => ['Project', p.projectName, p.department, p.budget, p.status, p.startDate]),
      ...employees.map(e => ['Employee', e.name, e.department, 'N/A', 'N/A', 'N/A'])
    ];
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `csr-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.snackBar.open('Reports exported successfully!', 'Close', { duration: 3000 });
  }
}
