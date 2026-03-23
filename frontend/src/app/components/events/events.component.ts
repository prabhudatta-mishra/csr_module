import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventsService } from '../../events.service';
import { AuthService } from '../../auth.service';
import { ProjectsService, Project } from '../../projects.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="section">
      <div class="header-row animate-fade-in-up stagger-1">
        <div>
          <h2 class="dashboard-title">Available Projects</h2>
          <p class="dashboard-subtitle">Book your participation in upcoming CSR initiatives</p>
        </div>
        <div class="tools">
          <mat-form-field appearance="outline" class="search-input">
            <mat-label>Search projects...</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="q" (ngModelChange)="apply()" />
          </mat-form-field>
        </div>
      </div>

      <ng-container *ngIf="loading; else gridBlock">
        <div class="grid">
          <mat-card class="glass project-card" *ngFor="let i of [1,2,3,4]">
            <div class="sk-title"></div>
            <div class="sk-sub"></div>
            <div class="sk-line"></div>
            <div class="actions"><span class="sk-btn"></span></div>
          </mat-card>
        </div>
      </ng-container>
      <ng-template #gridBlock>
        <ng-container *ngIf="shown.length; else emptyState">
          <div class="grid animate-fade-in-up stagger-2">
            <mat-card class="glass project-card hover-pop" *ngFor="let p of shown">
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
                <div class="seats-info">
                  <mat-icon>groups</mat-icon>
                  <span>Seats available: <strong>{{ p.seats ?? 0 }}</strong></span>
                </div>
                <div class="budget-info">
                  <mat-icon>monetization_on</mat-icon>
                  <span>Budget: ₹{{ (p.budget || 0) | number }}</span>
                </div>
              </mat-card-content>
              <div class="actions">
                <button mat-flat-button class="book-btn" [disabled]="(p.seats ?? 0) <= 0" (click)="book(p)">
                  {{ (p.seats ?? 0) > 0 ? 'Book Project' : 'Fully Booked' }}
                </button>
              </div>
            </mat-card>
          </div>
        </ng-container>
        <ng-template #emptyState>
          <div class="empty glass animate-fade-in-up stagger-3">
            <mat-icon>search_off</mat-icon>
            <h3>No projects found</h3>
            <p>Try adjusting your search or check back later.</p>
          </div>
        </ng-template>
      </ng-template>

      <ng-container *ngIf="auth.isAdmin()">
        <div class="header-row mt-4 animate-fade-in-up stagger-4">
          <h3 class="dashboard-title text-xl">Recent Bookings Timeline</h3>
        </div>
        <div class="grid animate-fade-in-up stagger-5">
          <mat-card class="glass booking-card hover-pop" *ngFor="let b of bookings()">
            <mat-card-content>
              <div class="booking-row">
                <div class="booking-icon"><mat-icon>how_to_reg</mat-icon></div>
                <div class="booking-details">
                  <div class="booking-user">{{ b.name || 'Unknown User' }}</div>
                  <div class="booking-meta">{{ b.profession || 'Volunteer' }} <span *ngIf="b.email">• {{ b.email }}</span></div>
                </div>
                <div class="booking-time">{{ b.date | date:'shortTime' }}<br/>{{ b.date | date:'MMM d' }}</div>
              </div>
              <div class="booking-project">
                <strong>Project: </strong> {{ projectTitle(b.eventId) }}
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .section { padding: 1rem 2rem 2rem; display: flex; flex-direction: column; gap: 2rem; max-width: 1400px; margin: 0 auto; }
    
    .header-row { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; }
    .dashboard-title { font-size: 2.25rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
    .dashboard-subtitle { font-size: 1.1rem; color: #64748b; margin: 0.25rem 0 0 0; }
    .text-xl { font-size: 1.5rem !important; }
    .mt-4 { margin-top: 2rem; }
    
    :host-context(.dark-theme) .dashboard-title { color: #f8fafc; }
    :host-context(.dark-theme) .dashboard-subtitle { color: #94a3b8; }
    
    .tools { width: 100%; max-width: 400px; }
    .search-input { width: 100%; }
    
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
    
    /* Project Cards */
    .project-card { border-radius: 16px !important; padding: 0.5rem; overflow: hidden; display: flex; flex-direction: column; }
    .project-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; padding: 1rem 1rem 0; }
    
    .project-icon { 
      width: 48px; height: 48px; font-size: 24px; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center;
    }
    .bg-gradient-brand { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); }
    
    .project-titles { flex: 1; }
    mat-card-title { font-size: 1.25rem !important; font-weight: 700 !important; color: #0f172a; margin-bottom: 0.25rem; }
    :host-context(.dark-theme) mat-card-title { color: #f8fafc; }
    
    .status-badge { 
      padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .active { background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2); }
    .pending { background: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.2); }
    .completed { background: rgba(14, 165, 233, 0.1); color: #0284c7; border: 1px solid rgba(14, 165, 233, 0.2); }
    
    :host-context(.dark-theme) .active { color: #34d399; }
    :host-context(.dark-theme) .pending { color: #fbbf24; }
    :host-context(.dark-theme) .completed { color: #38bdf8; }
    
    .project-content { padding: 0 1rem; display: flex; gap: 1.5rem; color: #64748b; font-weight: 500; font-size: 0.95rem; }
    :host-context(.dark-theme) .project-content { color: #94a3b8; }
    
    .seats-info, .budget-info { display: flex; align-items: center; gap: 0.5rem; }
    .seats-info mat-icon, .budget-info mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; color: #94a3b8; }
    .seats-info strong { color: #0f172a; font-weight: 700; }
    :host-context(.dark-theme) .seats-info strong { color: #f8fafc; }
    
    .actions { padding: 1rem; margin-top: auto; display: flex; justify-content: flex-end; border-top: 1px solid rgba(0,0,0,0.05); }
    :host-context(.dark-theme) .actions { border-top-color: rgba(255,255,255,0.05); }
    
    .book-btn { background: #0f172a !important; color: white !important; border-radius: 8px; padding: 0 1.5rem; font-weight: 600; transition: all 0.3s ease; }
    .book-btn:not([disabled]):hover { background: #0ea5e9 !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }
    :host-context(.dark-theme) .book-btn { background: #3b82f6 !important; }
    :host-context(.dark-theme) .book-btn:not([disabled]):hover { background: #60a5fa !important; }
    .book-btn[disabled] { background: rgba(0,0,0,0.1) !important; color: rgba(0,0,0,0.3) !important; }
    :host-context(.dark-theme) .book-btn[disabled] { background: rgba(255,255,255,0.1) !important; color: rgba(255,255,255,0.3) !important; }

    /* Admin Booking Cards */
    .booking-card { border-radius: 12px !important; padding: 0; }
    .booking-row { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
    :host-context(.dark-theme) .booking-row { border-bottom-color: rgba(255,255,255,0.05); }
    
    .booking-icon { width: 40px; height: 40px; border-radius: 50%; background: rgba(14, 165, 233, 0.1); color: #0ea5e9; display: flex; align-items: center; justify-content: center; }
    
    .booking-details { flex: 1; }
    .booking-user { font-weight: 700; color: #0f172a; font-size: 1.05rem; }
    .booking-meta { color: #64748b; font-size: 0.85rem; font-weight: 500; }
    :host-context(.dark-theme) .booking-user { color: #f8fafc; }
    :host-context(.dark-theme) .booking-meta { color: #94a3b8; }
    
    .booking-time { text-align: right; color: #64748b; font-size: 0.85rem; font-weight: 600; line-height: 1.2; }
    .booking-project { padding: 1rem; color: #334155; font-weight: 500; }
    :host-context(.dark-theme) .booking-project { color: #cbd5e1; }

    /* Empty State */
    .empty { text-align: center; padding: 4rem 2rem; border-radius: 16px; border: 1px dashed rgba(0,0,0,0.1); }
    :host-context(.dark-theme) .empty { border-color: rgba(255,255,255,0.1); }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #94a3b8; margin-bottom: 1rem; opacity: 0.5; }
    .empty h3 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
    .empty p { color: #64748b; font-size: 1.1rem; }
    :host-context(.dark-theme) .empty h3 { color: #f8fafc; }

    /* Skeleton Loading */
    .sk-title { height: 24px; width: 60%; border-radius: 8px; margin: 16px 16px 8px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    :host-context(.dark-theme) .sk-title { background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.10) 37%, rgba(255,255,255,.06) 63%); background-size: 400% 100%; }
    .sk-sub { height: 16px; width: 40%; border-radius: 6px; margin: 0 16px 24px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    :host-context(.dark-theme) .sk-sub { background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.10) 37%, rgba(255,255,255,.06) 63%); background-size: 400% 100%; }
    .sk-line { height: 16px; width: 80%; border-radius: 6px; margin: 8px 16px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    :host-context(.dark-theme) .sk-line { background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.10) 37%, rgba(255,255,255,.06) 63%); background-size: 400% 100%; }
    .sk-btn { display: inline-block; height: 40px; width: 120px; border-radius: 8px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    :host-context(.dark-theme) .sk-btn { background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.10) 37%, rgba(255,255,255,.06) 63%); background-size: 400% 100%; }
    @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
  `]
})
export class EventsComponent {
  q = '';
  shown: Project[] = [];
  loading = true;

  constructor(private readonly snack: MatSnackBar, private readonly svc: EventsService, private readonly projects: ProjectsService, public readonly auth: AuthService, private readonly router: Router) {
    this.shown = this.projects.list();
    setTimeout(() => { this.loading = false; }, 350);
  }

  apply() {
    const q = this.q.trim().toLowerCase();
    const all = this.projects.list();
    this.shown = all.filter(p => !q || (p.projectName || '').toLowerCase().includes(q) || (p.department || '').toLowerCase().includes(q));
  }

  book(p: Project) {
    if ((p.seats ?? 0) <= 0) return;
    const res = this.svc.bookProject(p.id);
    if (res.ok) {
      this.generatePDF(p);
      this.snack.open('Booked successfully! PDF downloaded.', 'OK', { duration: 3000 });
      this.router.navigate(['/my-projects']);
    } else {
      this.snack.open(res.message || 'Booking failed', 'Dismiss', { duration: 2500 });
    }
  }

  generatePDF(p: Project) {
    const user = this.auth.profile() || { name: 'Employee', email: '', profession: '' };
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    const id = `BK${Date.now()}`;
    
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233);
    doc.text('CSR Hub Pro', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Project Booking Confirmation', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Booking ID: ${id}`, 20, 45);
    doc.text(`Date: ${date}`, 20, 52);
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Project Details', 20, 70);
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${p.projectName}`, 20, 80);
    doc.text(`Department: ${p.department}`, 20, 87);
    doc.text(`Budget: Rs. ${(p.budget || 0).toLocaleString()}`, 20, 94);
    doc.text(`Status: ${p.status}`, 20, 101);
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Participant Details', 20, 120);
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${user.name}`, 20, 130);
    doc.text(`Email: ${user.email || 'N/A'}`, 20, 137);
    doc.text(`Role: ${user.profession || 'N/A'}`, 20, 144);
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for booking this CSR project!', 20, 170);
    doc.text('This confirmation serves as your official registration.', 20, 176);
    
    doc.save(`CSR-Booking-${id}.pdf`);
  }

  bookings = () => this.svc.listBookings();
  projectTitle = (id: number) => {
    const asStr = String(id);
    const p = this.projects.list().find(x => String(x.id) === asStr);
    if (p) return p.projectName;
    const e = this.svc.list().find(x => String(x.id) === asStr);
    if (e) return e.title;
    return `#${id}`;
  };
}
