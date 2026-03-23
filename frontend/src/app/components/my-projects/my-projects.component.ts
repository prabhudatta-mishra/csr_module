import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth.service';
import { EmployeesService } from '../../employees.service';
import { ProjectsService, Project } from '../../projects.service';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header animate-fade-in-up stagger-1">
        <h2 class="page-title">My Bookings</h2>
        <p class="page-subtitle">Projects you are registered for</p>
      </div>

      <ng-container *ngIf="projects.length; else noAssign">
        <div class="grid animate-fade-in-up stagger-2">
          <mat-card class="glass project-card hover-pop" *ngFor="let p of projects">
            <mat-card-header class="project-header">
              <mat-icon class="project-icon bg-gradient-brand">event_available</mat-icon>
              <div class="project-titles">
                <mat-card-title>{{ p.projectName }}</mat-card-title>
                <mat-card-subtitle>{{ p.department }}</mat-card-subtitle>
              </div>
              <div class="status-badge" [ngClass]="p.status.toLowerCase().replace(' ', '-')">
                {{ p.status }}
              </div>
            </mat-card-header>
            <mat-card-content class="project-content">
              <div class="detail-info">
                <mat-icon>monetization_on</mat-icon>
                <span>Budget: <strong>₹{{ p.budget | number }}</strong></span>
              </div>
              <div class="detail-info">
                <mat-icon>date_range</mat-icon>
                <span>{{ p.startDate | date:'MMM d, y' }} — {{ p.endDate | date:'MMM d, y' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>

      <ng-template #noAssign>
        <div class="empty glass animate-fade-in-up stagger-3">
          <mat-icon>work_outline</mat-icon>
          <h3>No bookings yet</h3>
          <p>You haven't booked any projects. Head over to CSR Events or Book Activity to get started!</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { padding: 1.5rem 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1rem; }
    .page-title { font-size: 2.25rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
    .page-subtitle { font-size: 1.1rem; color: #64748b; margin: 0.25rem 0 0 0; }
    :host-context(.dark-theme) .page-title { color: #f8fafc; }
    :host-context(.dark-theme) .page-subtitle { color: #94a3b8; }

    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
    
    .glass { background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06); }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); }

    .project-card { border-radius: 16px !important; padding: 0.5rem; overflow: hidden; display: flex; flex-direction: column; }
    .project-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; padding: 1rem 1rem 0; }
    
    .project-icon { width: 48px; height: 48px; font-size: 24px; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; }
    .bg-gradient-brand { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); }
    
    .project-titles { flex: 1; }
    mat-card-title { font-size: 1.25rem !important; font-weight: 700 !important; color: #0f172a; margin-bottom: 0.25rem; }
    :host-context(.dark-theme) mat-card-title { color: #f8fafc; }
    
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .active { background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2); }
    .ongoing { background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2); }
    .pending { background: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.2); }
    .planned { background: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.2); }
    .completed { background: rgba(14, 165, 233, 0.1); color: #0284c7; border: 1px solid rgba(14, 165, 233, 0.2); }
    :host-context(.dark-theme) .active, :host-context(.dark-theme) .ongoing { color: #34d399; }
    :host-context(.dark-theme) .pending, :host-context(.dark-theme) .planned { color: #fbbf24; }
    :host-context(.dark-theme) .completed { color: #38bdf8; }
    
    .project-content { padding: 0 1rem 1.5rem; display: flex; gap: 1.5rem; color: #64748b; font-weight: 500; font-size: 0.95rem; }
    :host-context(.dark-theme) .project-content { color: #94a3b8; }
    
    .detail-info { display: flex; align-items: center; gap: 0.5rem; }
    .detail-info mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; color: #94a3b8; }
    .detail-info strong { color: #0f172a; font-weight: 700; }
    :host-context(.dark-theme) .detail-info strong { color: #f8fafc; }

    .empty { text-align: center; padding: 4rem 2rem; border-radius: 16px; border: 1px dashed rgba(0,0,0,0.1); }
    :host-context(.dark-theme) .empty { border-color: rgba(255,255,255,0.1); }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #94a3b8; margin-bottom: 1rem; opacity: 0.5; }
    .empty h3 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
    .empty p { color: #64748b; font-size: 1.1rem; }
    :host-context(.dark-theme) .empty h3 { color: #f8fafc; }

    .hover-pop:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(15,23,42,0.08); }
    .animate-fade-in-up { animation: fade-up 0.5s ease both; }
    .stagger-1{animation-delay:0.08s;} .stagger-2{animation-delay:0.14s;} .stagger-3{animation-delay:0.2s;}
    @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  `]
})
export class MyProjectsComponent {
  projects: Project[] = [];
  private employeeId: number | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly employees: EmployeesService,
    private readonly projectsSvc: ProjectsService
  ) {
    const uid = this.auth.userId();
    if (uid == null) return;
    
    // Find true employee ID via profile email, fallback to uid
    const profile = this.auth.profile();
    let emp: any = null;
    if (profile && profile.email) {
      emp = this.employees.list().find((e: any) => e.email === profile.email);
    }
    if (!emp) {
      emp = this.employees.list().find((e: any) => e.id === uid);
    }

    if (!emp) return;
    this.employeeId = emp.id;

    const all = this.projectsSvc.list();
    this.projects = all.filter((p: any) => emp.assignedProjectIds.includes(p.id));

  }
}
