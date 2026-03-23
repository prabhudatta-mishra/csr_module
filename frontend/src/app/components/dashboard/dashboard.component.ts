import { Component, signal, effect, ViewChild, ElementRef, AfterViewInit, NgZone, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { ProjectsService } from '../../projects.service';
import { EmployeesService } from '../../employees.service';
import { ActivityService, SystemActivity } from '../../activity.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatChipsModule, MatFormFieldModule, MatInputModule, NgxChartsModule],
  template: `
    <div class="dash-wrapper">
      <!-- Page Header -->
      <div class="page-header animate-up">
        <div class="header-text">
          <h1 class="page-title">Overview Dashboard</h1>
          <p class="page-subtitle">Real-time metrics for your CSR initiatives</p>
        </div>
        <div class="header-right">
          <div class="status-badge" [class.online]="online()">
            <span class="status-dot"></span>
            <span>{{ online() ? 'System Online' : 'Offline' }}</span>
          </div>
          <div class="live-time">{{ currentTime }}</div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card glass animate-up stagger-1">
          <div class="kpi-icon-wrap sky-grad">
            <mat-icon>corporate_fare</mat-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-num sky-text">{{ displayedProjects }}</div>
            <div class="kpi-label">Active Projects</div>
            <div class="kpi-trend up"><mat-icon>trending_up</mat-icon> +12% this month</div>
          </div>
        </div>

        <div class="kpi-card glass animate-up stagger-2">
          <div class="kpi-icon-wrap emerald-grad">
            <mat-icon>volunteer_activism</mat-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-num emerald-text">{{ displayedVolunteers }}</div>
            <div class="kpi-label">Total Volunteers</div>
            <div class="kpi-trend up"><mat-icon>trending_up</mat-icon> +8% this month</div>
          </div>
        </div>

        <div class="kpi-card glass animate-up stagger-3">
          <div class="kpi-icon-wrap violet-grad">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-num violet-text">₹{{ displayedBudget | number }}</div>
            <div class="kpi-label">Total Budget Allocated</div>
            <div class="kpi-trend up"><mat-icon>trending_up</mat-icon> +5% this month</div>
          </div>
        </div>

        <div class="kpi-card glass animate-up stagger-4">
          <div class="kpi-icon-wrap amber-grad">
            <mat-icon>people</mat-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-num amber-text">{{ displayedEmployees }}</div>
            <div class="kpi-label">Total Employees</div>
            <div class="kpi-trend up"><mat-icon>trending_up</mat-icon> +3% this month</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row animate-up stagger-5">
        <div class="chart-card glass">
          <div class="chart-header">
            <div class="chart-title-wrap">
              <mat-icon class="chart-icon sky-text">show_chart</mat-icon>
              <div>
                <div class="chart-title">Monthly CSR Spending</div>
                <div class="chart-sub">12-month spending trend</div>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-dot sky-bg"></span>
              <span class="legend-label">Budget Used</span>
            </div>
          </div>
          <div #lineChartContainer class="chart-container">
            <ngx-charts-line-chart
              [view]="lineChartView"
              [results]="spendingData"
              [scheme]="colorScheme"
              [gradient]="true"
              [xAxis]="true"
              [yAxis]="true"
              [legend]="false"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              [xAxisLabel]="'Month'"
              [yAxisLabel]="'Budget (₹)'"
              [animations]="true"
              [curve]="curve">
            </ngx-charts-line-chart>
          </div>
        </div>

        <div class="chart-card glass">
          <div class="chart-header">
            <div class="chart-title-wrap">
              <mat-icon class="chart-icon emerald-text">bar_chart</mat-icon>
              <div>
                <div class="chart-title">Projects by Department</div>
                <div class="chart-sub">Distribution overview</div>
              </div>
            </div>
          </div>
          <div #barChartContainer class="chart-container">
            <ngx-charts-bar-vertical
              [view]="barChartView"
              [results]="deptData"
              [scheme]="barScheme"
              [gradient]="true"
              [xAxis]="true"
              [yAxis]="true"
              [legend]="false"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              [xAxisLabel]="'Department'"
              [yAxisLabel]="'Projects'"
              [animations]="true">
            </ngx-charts-bar-vertical>
          </div>
        </div>
      </div>

      <!-- Recent Activity Feed -->
      <div class="activity-section glass animate-up stagger-5">
        <div class="activity-header">
          <mat-icon class="chart-icon violet-text">history</mat-icon>
          <div>
            <div class="chart-title">Recent Activity</div>
            <div class="chart-sub">Latest system events</div>
          </div>
        </div>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let item of activityFeed(); let i = index" [style.animation-delay]="(i * 80) + 'ms'">
            <div class="activity-icon" [class]="item.iconClass">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="activity-body">
              <div class="activity-title">{{ item.title }}</div>
              <div class="activity-meta">{{ item.meta }}</div>
            </div>
            <div class="activity-time">{{ getTimeAgo(item.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .dash-wrapper {
      padding: 1.5rem 2rem 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    :host-context(.dark-theme) .page-title {
      background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }
    .page-subtitle { font-size: 0.95rem; color: #64748b; margin: 0.2rem 0 0 0; }
    :host-context(.dark-theme) .page-subtitle { color: #94a3b8; }

    .header-right { display: flex; align-items: center; gap: 1rem; }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      background: rgba(239,68,68,0.1);
      color: #dc2626;
      border: 1px solid rgba(239,68,68,0.2);
    }
    .status-badge.online {
      background: rgba(16,185,129,0.1);
      color: #059669;
      border-color: rgba(16,185,129,0.2);
    }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse-dot 2s infinite;
    }
    @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

    .live-time {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      font-variant-numeric: tabular-nums;
    }
    :host-context(.dark-theme) .live-time { color: #94a3b8; }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .kpi-grid { grid-template-columns: 1fr; } }

    .kpi-card {
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
      cursor: default;
    }
    .kpi-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
    }

    .kpi-icon-wrap {
      width: 60px; height: 60px;
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon-wrap mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }

    .sky-grad    { background: linear-gradient(135deg,#38bdf8,#0284c7); box-shadow: 0 8px 20px rgba(14,165,233,0.3); }
    .emerald-grad{ background: linear-gradient(135deg,#34d399,#059669); box-shadow: 0 8px 20px rgba(16,185,129,0.3); }
    .violet-grad { background: linear-gradient(135deg,#a78bfa,#6d28d9); box-shadow: 0 8px 20px rgba(139,92,246,0.3); }
    .amber-grad  { background: linear-gradient(135deg,#fbbf24,#d97706); box-shadow: 0 8px 20px rgba(245,158,11,0.3); }

    .kpi-body { display: flex; flex-direction: column; gap: 0.15rem; }
    .kpi-num {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .kpi-label { font-size: 0.85rem; color: #64748b; font-weight: 500; margin-top: 0.2rem; }
    :host-context(.dark-theme) .kpi-label { color: #94a3b8; }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 0.3rem;
      color: #059669;
    }
    .kpi-trend mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .kpi-trend.up { color: #059669; }
    :host-context(.dark-theme) .kpi-trend.up { color: #34d399; }

    .sky-text    { color: #0284c7; }
    .emerald-text{ color: #059669; }
    .violet-text { color: #6d28d9; }
    .amber-text  { color: #d97706; }
    :host-context(.dark-theme) .sky-text    { color: #38bdf8; }
    :host-context(.dark-theme) .emerald-text{ color: #10b981; }
    :host-context(.dark-theme) .violet-text { color: #a78bfa; }
    :host-context(.dark-theme) .amber-text  { color: #fbbf24; }

    /* Charts */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 960px) { .charts-row { grid-template-columns: 1fr; } }

    .chart-card {
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .chart-title-wrap {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .chart-title-wrap mat-icon { margin-top: 2px; font-size: 22px; width: 22px; height: 22px; }
    .chart-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
    :host-context(.dark-theme) .chart-title { color: #f8fafc; }
    .chart-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 0.1rem; }

    .chart-legend { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #64748b; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
    .sky-bg { background: #0ea5e9; }
    .chart-icon { flex-shrink: 0; }

    .chart-container { width: 100%; height: 280px; display: block; }
    :host ::ng-deep ngx-charts-line-chart,
    :host ::ng-deep ngx-charts-bar-vertical { display: block; width: 100%; }
    :host ::ng-deep .ngx-charts text { fill: #64748b !important; font-family: 'Poppins',sans-serif; font-size: 11px !important; }
    :host-context(.dark-theme) ::ng-deep .ngx-charts text { fill: #94a3b8 !important; }
    :host ::ng-deep .ngx-charts .gridline-path { stroke: rgba(148,163,184,0.15) !important; }

    /* Activity Feed */
    .activity-section {
      border-radius: 20px;
      padding: 1.5rem;
    }
    .activity-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .activity-header mat-icon { margin-top: 2px; font-size: 22px; width: 22px; height: 22px; flex-shrink: 0; }

    .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1rem;
      border-radius: 12px;
      background: rgba(248,250,252,0.6);
      border: 1px solid rgba(226,232,240,0.6);
      transition: all 0.2s ease;
      animation: slide-in 0.4s ease both;
    }
    :host-context(.dark-theme) .activity-item {
      background: rgba(30,41,59,0.4);
      border-color: rgba(255,255,255,0.05);
    }
    .activity-item:hover {
      transform: translateX(4px);
      border-color: rgba(14,165,233,0.3);
      background: rgba(14,165,233,0.04);
    }
    @keyframes slide-in { from{ opacity:0; transform:translateX(-12px) } to{ opacity:1; transform:none } }

    .activity-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .activity-icon mat-icon { font-size: 18px; width: 18px; height: 18px; color: white; }
    .activity-icon.sky    { background: rgba(14,165,233,0.15); }
    .activity-icon.sky mat-icon { color: #0ea5e9; }
    .activity-icon.emerald{ background: rgba(16,185,129,0.15); }
    .activity-icon.emerald mat-icon { color: #10b981; }
    .activity-icon.violet { background: rgba(139,92,246,0.15); }
    .activity-icon.violet mat-icon { color: #8b5cf6; }
    .activity-icon.amber  { background: rgba(245,158,11,0.15); }
    .activity-icon.amber mat-icon { color: #f59e0b; }
    .activity-icon.rose   { background: rgba(244,63,94,0.15); }
    .activity-icon.rose mat-icon { color: #f43f5e; }

    .activity-body { flex: 1; min-width: 0; }
    .activity-title { font-size: 0.875rem; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    :host-context(.dark-theme) .activity-title { color: #e2e8f0; }
    .activity-meta { font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }

    .activity-time { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; font-weight: 500; }

    /* Glass */
    .glass {
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(16px) saturate(1.6);
      -webkit-backdrop-filter: blur(16px) saturate(1.6);
      border: 1px solid rgba(255,255,255,0.6);
      box-shadow: 0 4px 24px rgba(15,23,42,0.06);
    }
    :host-context(.dark-theme) .glass {
      background: rgba(30,41,59,0.55);
      border-color: rgba(255,255,255,0.08);
      box-shadow: 0 4px 24px rgba(0,0,0,0.25);
    }

    /* Animations */
    .animate-up { animation: fade-up 0.5s ease both; }
    .stagger-1 { animation-delay: 0.05s; }
    .stagger-2 { animation-delay: 0.1s; }
    .stagger-3 { animation-delay: 0.15s; }
    .stagger-4 { animation-delay: 0.2s; }
    .stagger-5 { animation-delay: 0.25s; }
    @keyframes fade-up {
      from{ opacity:0; transform:translateY(20px) }
      to{ opacity:1; transform:none }
    }
  `]
})
export class DashboardComponent implements AfterViewInit, OnInit, OnDestroy {
  protected readonly online = signal<boolean>(false);
  private timer?: any;
  private clockTimer?: any;
  protected readonly totalProjects = signal<number>(0);
  protected readonly totalVolunteers = signal<number>(0);
  protected readonly totalBudget = signal<number>(0);
  protected readonly totalEmployees = signal<number>(0);

  // Animated display values
  displayedProjects = 0;
  displayedVolunteers = 0;
  displayedBudget = 0;
  displayedEmployees = 0;
  currentTime = '';

  @ViewChild('lineChartContainer', { static: false }) lineChartContainer?: ElementRef<HTMLElement>;
  @ViewChild('barChartContainer', { static: false }) barChartContainer?: ElementRef<HTMLElement>;
  private resizeObs?: ResizeObserver;

  curve: any = (ctx: any) => {
    const d3 = (window as any).d3;
    return d3 ? d3.curveCatmullRom(ctx) : ctx;
  };

  spendingData = [{
    name: 'Budget Used',
    series: [
      { name: 'Jan', value: 12000 }, { name: 'Feb', value: 17500 },
      { name: 'Mar', value: 14200 }, { name: 'Apr', value: 21000 },
      { name: 'May', value: 18800 }, { name: 'Jun', value: 22400 },
      { name: 'Jul', value: 20100 }, { name: 'Aug', value: 23000 },
      { name: 'Sep', value: 19500 }, { name: 'Oct', value: 24500 },
      { name: 'Nov', value: 26000 }, { name: 'Dec', value: 28000 },
    ]
  }];

  deptData = [
    { name: 'Environ.', value: 8 },
    { name: 'Education', value: 6 },
    { name: 'Health', value: 5 },
    { name: 'Community', value: 4 },
    { name: 'Other', value: 2 },
  ];

  colorScheme: any = { domain: ['#0ea5e9'] };
  barScheme: any = { domain: ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e'] };
  lineChartView: [number, number] = [700, 280];
  barChartView: [number, number] = [360, 280];

  protected readonly activityFeed = inject(ActivityService).activities;

  getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  ngAfterViewInit(): void {
    this.setupChartResize();
  }

  private setupChartResize() {
    const lineEl = this.lineChartContainer?.nativeElement;
    const barEl = this.barChartContainer?.nativeElement;
    if (!lineEl && !barEl) return;
    const update = () => {
      if (lineEl) {
        const w = Math.max(300, lineEl.clientWidth || 600);
        this.lineChartView = [w, 280];
      }
      if (barEl) {
        const w = Math.max(200, barEl.clientWidth || 360);
        this.barChartView = [w, 280];
      }
    };
    update();
    this.resizeObs = new ResizeObserver(() => this.zone.run(update));
    if (lineEl) this.resizeObs.observe(lineEl);
    if (barEl) this.resizeObs.observe(barEl);
  }

  constructor(
    private readonly http: HttpClient,
    private readonly snack: MatSnackBar,
    private readonly projects: ProjectsService,
    private readonly employees: EmployeesService,
    private readonly zone: NgZone
  ) {
    effect(() => {
      const ps = this.projects.projects();
      const es = this.employees.employees();
      const target_p = ps.length;
      const target_v = es.length;
      const target_b = ps.reduce((s: number, p: any) => s + (p.budget || 0), 0);
      const target_e = es.length;
      this.totalProjects.set(target_p);
      this.totalVolunteers.set(target_v);
      this.totalBudget.set(target_b);
      this.totalEmployees.set(target_e);
      this.animateNumber('displayedProjects', target_p);
      this.animateNumber('displayedVolunteers', target_v);
      this.animateNumber('displayedBudget', target_b);
      this.animateNumber('displayedEmployees', target_e);
    }, { allowSignalWrites: true });
  }

  private animateNumber(key: 'displayedProjects' | 'displayedVolunteers' | 'displayedBudget' | 'displayedEmployees', target: number) {
    const start = (this as any)[key] as number;
    const diff = target - start;
    if (diff === 0) return;
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      (this as any)[key] = Math.round(start + (diff * (step / steps)));
      if (step >= steps) { clearInterval(interval); (this as any)[key] = target; }
    }, 16);
  }

  ngOnInit() {
    this.online.set(true);
    this.updateClock();
    this.clockTimer = setInterval(() => this.updateClock(), 1000);
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.clockTimer) clearInterval(this.clockTimer);
    if (this.resizeObs) this.resizeObs.disconnect();
  }
}
