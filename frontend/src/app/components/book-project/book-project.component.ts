import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../../projects.service';
import { EventsService } from '../../events.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-project',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatDatepickerModule, MatNativeDateModule, FormsModule
  ],
  template: `
    <div class="page-wrapper">
      <!-- Hero Banner -->
      <div class="hero-banner animate-up">
        <div class="hero-content">
          <div class="hero-badge">
            <mat-icon>volunteer_activism</mat-icon>
            <span>Employee Portal</span>
          </div>
          <h1 class="hero-title">Book a CSR Project</h1>
          <p class="hero-subtitle">Select a project and register your participation to make a difference in the community</p>
        </div>
        <div class="hero-illustration">
          <div class="hero-icon-big">
            <mat-icon>eco</mat-icon>
          </div>
          <div class="hero-ring r1"></div>
          <div class="hero-ring r2"></div>
          <div class="hero-ring r3"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-grid">
        <!-- Booking Form -->
        <div class="form-card glass animate-up stagger-1">
          <div class="form-header">
            <mat-icon class="form-icon sky-text">assignment</mat-icon>
            <div>
              <div class="form-title">Project Booking</div>
              <div class="form-sub">Fill in your details to register</div>
            </div>
          </div>

          <div class="form-grid">
            <!-- Project Select -->
            <div class="input-group full-width">
              <label class="input-label">
                <mat-icon>work</mat-icon> Select Project
              </label>
              <mat-form-field appearance="outline" class="custom-field">
                <mat-select [(ngModel)]="selectedProjectId">
                  <mat-option value="">Choose a project...</mat-option>
                  <mat-option *ngFor="let project of availableProjects()" [value]="project.id">
                    {{ project.projectName }} — {{ project.department }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Name -->
            <div class="input-group">
              <label class="input-label"><mat-icon>person</mat-icon> Full Name</label>
              <mat-form-field appearance="outline" class="custom-field">
                <input matInput [(ngModel)]="bookingForm.name" placeholder="Enter your full name">
              </mat-form-field>
            </div>

            <!-- Email -->
            <div class="input-group">
              <label class="input-label"><mat-icon>email</mat-icon> Email Address</label>
              <mat-form-field appearance="outline" class="custom-field">
                <input matInput [(ngModel)]="bookingForm.email" placeholder="your.email@example.com">
              </mat-form-field>
            </div>

            <!-- Phone -->
            <div class="input-group">
              <label class="input-label"><mat-icon>phone</mat-icon> Phone Number</label>
              <mat-form-field appearance="outline" class="custom-field">
                <input matInput [(ngModel)]="bookingForm.phone" placeholder="+91 98765 43210">
              </mat-form-field>
            </div>

            <!-- Date -->
            <div class="input-group">
              <label class="input-label"><mat-icon>calendar_today</mat-icon> Preferred Date</label>
              <mat-form-field appearance="outline" class="custom-field">
                <input matInput [matDatepicker]="picker" [(ngModel)]="bookingForm.date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Comments -->
            <div class="input-group full-width">
              <label class="input-label"><mat-icon>chat_bubble</mat-icon> Additional Comments</label>
              <mat-form-field appearance="outline" class="custom-field">
                <textarea matInput [(ngModel)]="bookingForm.comments" placeholder="Any special requirements or notes..." rows="3"></textarea>
              </mat-form-field>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button class="btn-clear" (click)="resetForm()">
              <mat-icon>refresh</mat-icon> Clear Form
            </button>
            <button class="btn-book" (click)="bookProject()" [disabled]="!isFormValid()">
              <mat-icon>book</mat-icon>
              Book Project
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Project Details -->
          <div class="details-card glass animate-up stagger-2" *ngIf="projectDetails">
            <div class="details-header" [style.background]="getDeptGradient(projectDetails.department)">
              <mat-icon>{{ getDeptIcon(projectDetails.department) }}</mat-icon>
              <div>
                <div class="details-title">{{ projectDetails.projectName }}</div>
                <div class="details-dept">{{ projectDetails.department }}</div>
              </div>
            </div>
            <div class="details-body">
              <div class="detail-row">
                <span class="detail-label"><mat-icon>currency_rupee</mat-icon> Budget</span>
                <span class="detail-value budget">₹{{ projectDetails.budget | number }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><mat-icon>schedule</mat-icon> Status</span>
                <span class="status-badge" [class]="'status-badge ' + projectDetails.status.toLowerCase()">
                  <span class="status-dot"></span>{{ projectDetails.status }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><mat-icon>event</mat-icon> Start</span>
                <span class="detail-value">{{ projectDetails.startDate | date:'mediumDate' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label"><mat-icon>event_busy</mat-icon> End</span>
                <span class="detail-value">{{ projectDetails.endDate | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>

          <!-- No Project Selected Placeholder -->
          <div class="placeholder-card glass animate-up stagger-2" *ngIf="!projectDetails">
            <mat-icon>work_outline</mat-icon>
            <div class="placeholder-title">Select a Project</div>
            <div class="placeholder-sub">Project details will appear here once you select one from the form</div>
          </div>

          <!-- Tips -->
          <div class="tips-card glass animate-up stagger-3">
            <div class="tips-header">
              <mat-icon class="amber-text">lightbulb</mat-icon>
              <div class="form-title">Booking Tips</div>
            </div>
            <ul class="tips-list">
              <li><mat-icon>check_circle</mat-icon> Choose a project aligned with your interests</li>
              <li><mat-icon>check_circle</mat-icon> Fill accurate contact details</li>
              <li><mat-icon>check_circle</mat-icon> A confirmation will be downloaded as a PDF</li>
              <li><mat-icon>check_circle</mat-icon> Stay available on your preferred date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { padding: 1.5rem 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 1200px; margin: 0 auto; }

    /* Hero */
    .hero-banner {
      border-radius: 24px;
      background: linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 50%, #10b981 100%);
      padding: 2rem 2.5rem;
      display: flex; align-items: center; justify-content: space-between;
      overflow: hidden; position: relative;
      min-height: 160px;
    }
    .hero-content { display: flex; flex-direction: column; gap: 0.75rem; z-index: 1; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.85rem; border-radius: 999px;
      background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
      font-size: 0.78rem; font-weight: 600; color: white; width: fit-content;
    }
    .hero-badge mat-icon { font-size: 15px; width:15px; height:15px; }
    .hero-title { font-size: 2rem; font-weight: 800; color: white; margin: 0; letter-spacing: -0.03em; }
    .hero-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.8); margin: 0; max-width: 420px; line-height: 1.5; }

    .hero-illustration { position: relative; flex-shrink: 0; width: 120px; height: 120px; }
    .hero-icon-big {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 64px; height: 64px; border-radius: 50%;
      background: rgba(255,255,255,0.25); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 2;
    }
    .hero-icon-big mat-icon { font-size: 36px; width:36px; height:36px; color: white; }
    .hero-ring {
      position: absolute; top: 50%; left: 50%; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      transform: translate(-50%,-50%);
      animation: ring-pulse 3s infinite;
    }
    .r1 { width: 80px; height: 80px; animation-delay: 0s; }
    .r2 { width: 100px; height: 100px; animation-delay: 0.7s; }
    .r3 { width: 120px; height: 120px; animation-delay: 1.4s; }
    @keyframes ring-pulse { 0%,100%{opacity:1;} 50%{opacity:0.2;} }

    /* Content Grid */
    .content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; align-items: start; }
    @media(max-width:900px){.content-grid{grid-template-columns:1fr;}}

    /* Form */
    .form-card { border-radius: 20px; padding: 1.75rem; }
    .glass { background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06); }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); }

    .form-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.5rem; }
    .form-icon { font-size: 24px; width:24px; height:24px; margin-top: 2px; flex-shrink: 0; }
    .form-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
    :host-context(.dark-theme) .form-title { color: #f8fafc; }
    .form-sub { font-size: 0.78rem; color: #94a3b8; margin-top: 0.1rem; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1rem; }
    @media(max-width:600px){.form-grid{grid-template-columns:1fr;}}
    .input-group { display: flex; flex-direction: column; margin-bottom: 0.25rem; }
    .input-group.full-width { grid-column: 1 / -1; }
    .input-label { display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 600; color: #64748b; margin-bottom: 0.25rem; }
    .input-label mat-icon { font-size: 15px; width:15px; height:15px; }
    .custom-field { width: 100%; }
    :host-context(.dark-theme) .input-label { color: #94a3b8; }

    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid rgba(226,232,240,0.6); }
    :host-context(.dark-theme) .form-actions { border-top-color: rgba(255,255,255,0.06); }
    .btn-clear { display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 10px; border: 1.5px solid #e2e8f0; background: transparent; font-size: 0.875rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .btn-clear:hover { border-color: #94a3b8; }
    .btn-clear mat-icon { font-size: 18px; width:18px; height:18px; }
    .btn-book {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.6rem 1.5rem;
      background: linear-gradient(135deg,#0ea5e9,#0284c7); color: white; border: none; border-radius: 10px;
      font-size: 0.9rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 16px rgba(14,165,233,0.35); transition: all 0.25s;
    }
    .btn-book:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,165,233,0.45); }
    .btn-book:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-book mat-icon { font-size: 20px; width:20px; height:20px; }

    /* Sidebar */
    .sidebar { display: flex; flex-direction: column; gap: 1.25rem; }

    .details-card { border-radius: 20px; overflow: hidden; }
    .details-header { padding: 1.25rem; display: flex; align-items: center; gap: 0.75rem; }
    .details-header mat-icon { font-size: 28px; width:28px; height:28px; color: white; }
    .details-title { font-size: 0.95rem; font-weight: 700; color: white; }
    .details-dept { font-size: 0.75rem; color: rgba(255,255,255,0.8); margin-top: 0.1rem; }
    .details-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; }
    .detail-label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: #64748b; }
    .detail-label mat-icon { font-size: 15px; width:15px; height:15px; }
    .detail-value { font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    :host-context(.dark-theme) .detail-value { color: #f1f5f9; }
    .detail-value.budget { color: #059669; }

    .status-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .status-badge.ongoing   { background: rgba(16,185,129,0.1); color: #059669; }
    .status-badge.planned   { background: rgba(59,130,246,0.1); color: #2563eb; }
    .status-badge.completed { background: rgba(100,116,139,0.1); color: #475569; }

    .placeholder-card { border-radius: 20px; padding: 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; }
    .placeholder-card mat-icon { font-size: 48px; width:48px; height:48px; color: #cbd5e1; }
    .placeholder-title { font-size: 0.95rem; font-weight: 700; color: #334155; }
    :host-context(.dark-theme) .placeholder-title { color: #94a3b8; }
    .placeholder-sub { font-size: 0.78rem; color: #94a3b8; line-height: 1.5; }

    .tips-card { border-radius: 20px; padding: 1.25rem; }
    .tips-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
    .tips-header mat-icon { font-size: 20px; width:20px; height:20px; }
    .tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
    .tips-list li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.8rem; color: #64748b; line-height: 1.4; }
    :host-context(.dark-theme) .tips-list li { color: #94a3b8; }
    .tips-list mat-icon { font-size: 16px; width:16px; height:16px; color: #10b981; flex-shrink: 0; margin-top: 1px; }

    .sky-text{ color: #0284c7; } .amber-text{ color: #d97706; }

    .animate-up { animation: fade-up 0.5s ease both; }
    .stagger-1{animation-delay:0.08s;} .stagger-2{animation-delay:0.14s;} .stagger-3{animation-delay:0.2s;}
    @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @media(max-width:768px){
      .page-wrapper{padding:1rem;}
      .hero-banner{padding:1.5rem;} .hero-title{font-size:1.4rem;} .hero-illustration{display:none;}
    }
  `]
})
export class BookProjectComponent {
  selectedProjectId: number | null = null;
  bookingForm = { name: '', email: '', phone: '', date: null as Date | null, comments: '' };

  constructor(private projectsService: ProjectsService, private snackBar: MatSnackBar, private events: EventsService, private router: Router) {}

  availableProjects() {
    return this.projectsService.projects().filter(p => p.status === 'Ongoing' || p.status === 'Planned');
  }

  get projectDetails() {
    if (!this.selectedProjectId) return null;
    return this.projectsService.projects().find(p => p.id === this.selectedProjectId);
  }

  isFormValid(): boolean {
    return !!(this.selectedProjectId && this.bookingForm.name.trim() && this.bookingForm.email.trim() && this.bookingForm.phone.trim() && this.bookingForm.date);
  }

  getDeptGradient(dept: string): string {
    const d = (dept||'').toLowerCase();
    if (d.includes('environ')) return 'linear-gradient(135deg, #059669, #10b981)';
    if (d.includes('educ')) return 'linear-gradient(135deg, #0284c7, #38bdf8)';
    if (d.includes('health')) return 'linear-gradient(135deg, #dc2626, #f87171)';
    if (d.includes('communit')) return 'linear-gradient(135deg, #d97706, #fbbf24)';
    return 'linear-gradient(135deg, #6d28d9, #a78bfa)';
  }

  getDeptIcon(dept: string): string {
    const d = (dept||'').toLowerCase();
    if (d.includes('environ')) return 'eco';
    if (d.includes('educ')) return 'school';
    if (d.includes('health')) return 'local_hospital';
    if (d.includes('communit')) return 'groups';
    return 'work';
  }

  bookProject() {
    if (!this.isFormValid() || !this.selectedProjectId) return;
    const res = this.events.bookProject(this.selectedProjectId);
    if (!res.ok) {
      this.snackBar.open(res.message || 'Booking failed', 'Close', { duration: 3000 });
      return;
    }
    const bookingData = { project: this.projectDetails, booking: this.bookingForm, bookingId: 'BK' + Date.now(), timestamp: new Date() };
    this.generatePDF(bookingData);
    this.snackBar.open('Project booked successfully! Confirmation downloaded.', 'Close', { duration: 5000 });
    this.resetForm();
    this.router.navigate(['/my-projects']);
  }

  generatePDF(data: any) {
    const doc = new jsPDF();
    const date = data.timestamp.toLocaleDateString();
    
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233);
    doc.text('CSR Hub Pro', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Project Booking Confirmation', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Booking ID: ${data.bookingId}`, 20, 45);
    doc.text(`Date: ${date}`, 20, 52);
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Project Details', 20, 70);
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${data.project.projectName}`, 20, 80);
    doc.text(`Department: ${data.project.department}`, 20, 87);
    doc.text(`Budget: Rs. ${data.project.budget.toLocaleString()}`, 20, 94);
    doc.text(`Status: ${data.project.status}`, 20, 101);
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Participant Details', 20, 120);
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${data.booking.name}`, 20, 130);
    doc.text(`Email: ${data.booking.email}`, 20, 137);
    doc.text(`Phone: ${data.booking.phone}`, 20, 144);
    doc.text(`Preferred Date: ${data.booking.date.toLocaleDateString()}`, 20, 151);
    doc.text(`Comments: ${data.booking.comments || 'None'}`, 20, 158);
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for participating in this CSR project!', 20, 180);
    doc.text('This confirmation serves as your official registration.', 20, 186);
    
    doc.save(`CSR-Booking-${data.bookingId}.pdf`);
  }

  resetForm() {
    this.selectedProjectId = null;
    this.bookingForm = { name: '', email: '', phone: '', date: null, comments: '' };
  }
}
