import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { AssignmentService } from '../../assignment.service';
import { EmployeesService, Employee } from '../../employees.service';
import { EventsService, EventBooking } from '../../events.service';
import { ProjectsService, Project } from '../../projects.service';

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatCardModule, MatSelectModule, MatSnackBarModule],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header animate-fade-in-up">
        <div>
          <h1 class="page-title">
            <span class="gradient-title">Volunteer Dashboard</span>
          </h1>
          <p class="page-subtitle">Welcome, {{ profile()?.name || 'Volunteer' }} · Manage your assigned employees</p>
        </div>
        <div class="header-pills">
          <div class="pill emerald">
            <mat-icon>people</mat-icon>
            {{ assignedEmployees().length }} Assigned
          </div>
          <div class="pill sky">
            <mat-icon>event</mat-icon>
            {{ totalBookings() }} Total Bookings
          </div>
        </div>
      </div>

      <!-- Top Status Area: Booked Projects or No Assignment -->
      <div class="top-status-area animate-fade-in-up" *ngIf="!assignment()">
        <div class="empty-state glass" *ngIf="bookedProjects().length === 0">
          <mat-icon>assignment_ind</mat-icon>
          <h3>No Projects Booked</h3>
          <p>You haven't booked any projects yet, but you can explore and participate below.</p>
        </div>

        <div class="section-container" *ngIf="bookedProjects().length > 0">
          <h2 class="section-title">My Booked Projects <span class="badge-pending" style="color:#059669; background:rgba(16,185,129,0.15)">Assigned</span></h2>
          <div class="projects-grid">
            <div class="project-card glass" *ngFor="let p of bookedProjects()">
              <div class="proj-card-header" [style.background]="getDeptGradient(p.department)">
                 <div class="proj-dept-badge">{{ p.department }}</div>
                 <h3 class="proj-title">{{ p.projectName }}</h3>
              </div>
              <div class="proj-card-body">
                 <div class="proj-detail"><mat-icon>currency_rupee</mat-icon> ₹{{ p.budget | number }}</div>
                 <div class="proj-detail"><mat-icon>event</mat-icon> {{ p.startDate | date }} - {{ p.endDate | date }}</div>
                 <div class="applied-badge-text">
                   <mat-icon>check_circle</mat-icon> Event Booked
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Activity: My Own Bookings -->
      <div class="section-container animate-fade-in-up" *ngIf="myPersonalBookings().length > 0">
        <h2 class="section-title">My Personal Activity</h2>
        <div class="personal-bookings-grid">
          <div class="booking-row personal-booking glass" *ngFor="let b of myPersonalBookings()">
            <div class="booking-info">
              <div class="booking-title">{{ getEventTitle(b.eventId) }}</div>
              <div class="booking-date">{{ b.date | date:'MMM d, y, h:mm a' }}</div>
            </div>
            <div class="status-chip" [class]="getStatusClass(b.status || 'Pending')">
              {{ b.status || 'Pending' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Assigned Employees -->
      <div class="employees-grid" *ngIf="assignment()">
        <div class="emp-card glass animate-fade-in-up" *ngFor="let emp of assignedEmployees(); let i = index" [style.animation-delay]="(i * 0.1) + 's'">
          <div class="emp-card-header">
            <div class="avatar" [style.background]="avatarColor(emp.name)">{{ initials(emp.name) }}</div>
            <div class="emp-info">
              <div class="emp-name">{{ emp.name }}</div>
              <div class="emp-email">{{ emp.email }}</div>
            </div>
            <div class="dept-badge">{{ emp.department }}</div>
          </div>

          <div class="bookings-section">
            <div class="bookings-label">
              <mat-icon>event_note</mat-icon>
              CSR Bookings ({{ getEmployeeBookings(emp.id).length }})
            </div>

            <div class="no-bookings" *ngIf="getEmployeeBookings(emp.id).length === 0">
              <mat-icon>inbox</mat-icon> No bookings yet
            </div>

            <div class="booking-row" *ngFor="let b of getEmployeeBookings(emp.id)">
              <div class="booking-info">
                <div class="booking-title">{{ getEventTitle(b.eventId) }}</div>
                <div class="booking-date">{{ b.date | date:'MMM d, y' }}</div>
              </div>
              <div class="booking-status-wrap">
                <select class="status-select" [class]="getStatusClass(b.status || 'Pending')"
                        [(ngModel)]="b.status" (change)="updateStatus(b)">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Projects -->
      <div class="section-container animate-fade-in-up mt-4">
        <h2 class="section-title">Available Projects</h2>
        <div class="projects-grid">
          <div class="project-card glass" *ngFor="let p of availableProjects()">
            <div class="proj-card-header" [style.background]="getDeptGradient(p.department)">
               <div class="proj-dept-badge">{{ p.department }}</div>
               <h3 class="proj-title">{{ p.projectName }}</h3>
            </div>
            <div class="proj-card-body">
               <div class="proj-detail"><mat-icon>currency_rupee</mat-icon> ₹{{ p.budget | number }}</div>
               <div class="proj-detail"><mat-icon>event</mat-icon> {{ p.startDate | date }} - {{ p.endDate | date }}</div>
               <div class="proj-detail"><mat-icon>info</mat-icon> {{ p.status }}</div>
               <button class="btn-primary apply-btn" (click)="bookProject(p.id)">
                 <mat-icon>event_available</mat-icon> Book Project
               </button>
            </div>
          </div>
          <div class="empty-state glass" *ngIf="availableProjects().length === 0">
            <mat-icon>inbox</mat-icon>
            <p>No more projects available to book at the moment.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { padding: 1.5rem 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 1200px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.85rem; font-weight: 800; margin: 0; letter-spacing: -0.03em; }
    .gradient-title {
      background: linear-gradient(135deg, #10b981, #059669);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .page-subtitle { font-size: 0.9rem; color: #64748b; margin: 0.25rem 0 0; }
    :host-context(.dark-theme) .page-subtitle { color: #94a3b8; }

    .header-pills { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .pill {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.4rem 0.85rem; border-radius: 999px;
      font-size: 0.82rem; font-weight: 600;
    }
    .pill mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .pill.emerald { background: rgba(16,185,129,0.1); color: #059669; border: 1px solid rgba(16,185,129,0.2); }
    .pill.sky { background: rgba(14,165,233,0.1); color: #0284c7; border: 1px solid rgba(14,165,233,0.2); }

    /* Glass card */
    .glass {
      background: rgba(255,255,255,0.8); backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06);
      border-radius: 20px;
    }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem 2rem; gap: 0.75rem; text-align: center;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #10b981; opacity: 0.4; }
    .empty-state h3 { font-size: 1.25rem; font-weight: 700; color: #334155; margin: 0; }
    :host-context(.dark-theme) .empty-state h3 { color: #f1f5f9; }
    .empty-state p { color: #94a3b8; margin: 0; }

    .employees-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.25rem; }

    .emp-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

    .emp-card-header { display: flex; align-items: center; gap: 1rem; }
    .avatar {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem; color: white; flex-shrink: 0;
    }
    .emp-info { flex: 1; min-width: 0; }
    .emp-name { font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    :host-context(.dark-theme) .emp-name { color: #f1f5f9; }
    .emp-email { font-size: 0.78rem; color: #94a3b8; }
    .dept-badge {
      padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
      background: rgba(16,185,129,0.1); color: #059669; white-space: nowrap;
    }

    .bookings-section { display: flex; flex-direction: column; gap: 0.5rem; }
    .bookings-label {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.82rem; font-weight: 600; color: #64748b; padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(226,232,240,0.5);
    }
    :host-context(.dark-theme) .bookings-label { color: #94a3b8; border-bottom-color: rgba(255,255,255,0.06); }
    .bookings-label mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .no-bookings {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.82rem; color: #94a3b8; padding: 0.75rem;
      background: rgba(0,0,0,0.02); border-radius: 8px; justify-content: center;
    }
    :host-context(.dark-theme) .no-bookings { background: rgba(255,255,255,0.02); }
    .no-bookings mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .booking-row {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      padding: 0.65rem 0.75rem; border-radius: 10px;
      background: rgba(248,250,252,0.8); border: 1px solid rgba(226,232,240,0.4);
      transition: background 0.15s;
    }
    :host-context(.dark-theme) .booking-row { background: rgba(15,23,42,0.3); border-color: rgba(255,255,255,0.06); }
    .booking-title { font-weight: 600; font-size: 0.85rem; color: #0f172a; }
    :host-context(.dark-theme) .booking-title { color: #f1f5f9; }
    .booking-date { font-size: 0.75rem; color: #94a3b8; }

    .status-select {
      padding: 0.3rem 0.65rem; border-radius: 999px; border: 1.5px solid;
      font-size: 0.78rem; font-weight: 600; cursor: pointer; background: transparent;
      outline: none; transition: all 0.2s;
    }
    .status-select.pending { border-color: #f59e0b; color: #d97706; background: rgba(245,158,11,0.08); }
    .status-select.in-progress { border-color: #0ea5e9; color: #0284c7; background: rgba(14,165,233,0.08); }
    .status-select.completed { border-color: #10b981; color: #059669; background: rgba(16,185,129,0.08); }
    .status-select option { background: white; color: #0f172a; }
    :host-context(.dark-theme) .status-select option { background: #1e293b; color: #f1f5f9; }

    .mt-4 { margin-top: 2rem; }
    .section-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; }
    :host-context(.dark-theme) .section-title { color: #f1f5f9; }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    .project-card { border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
    .proj-card-header { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; justify-content: flex-end; min-height: 80px; position: relative; }
    .proj-dept-badge { position: absolute; top: 1rem; right: 1rem; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: rgba(255,255,255,0.25); color: white; backdrop-filter: blur(4px); }
    .proj-title { font-size: 1.1rem; font-weight: 800; color: white; margin: 0; }
    .proj-card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
    .proj-detail { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #64748b; font-weight: 500; }
    :host-context(.dark-theme) .proj-detail { color: #94a3b8; }
    .proj-detail mat-icon { font-size: 16px; width: 16px; height: 16px; color: #94a3b8; }
    .btn-primary.apply-btn { margin-top: auto; justify-content: center; padding: 0.65rem; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; font-weight: 700; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
    .btn-primary.apply-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16,185,129,0.4); }
    .btn-primary.apply-btn:disabled { background: #cbd5e1; color: #64748b; cursor: not-allowed; box-shadow: none; opacity: 0.8; }
    :host-context(.dark-theme) .btn-primary.apply-btn:disabled { background: #334155; color: #94a3b8; }
    .btn-primary.apply-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .applied-badge-text { display: flex; align-items: center; gap: 0.4rem; padding: 0.65rem; background: rgba(16,185,129,0.1); color: #059669; border-radius: 10px; font-weight: 700; font-size: 0.85rem; margin-top: auto; }
    .badge-pending { font-size: 0.75rem; background: rgba(245,158,11,0.15); color: #d97706; padding: 0.2rem 0.6rem; border-radius: 999px; vertical-align: middle; margin-left: 0.5rem; }

    .personal-bookings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .personal-booking { border: 1.5px solid rgba(16,185,129,0.1) !important; padding: 1rem !important; }
    .status-chip { 
      padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; 
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .status-chip.pending { background: rgba(245,158,11,0.1); color: #d97706; }
    .status-chip.in-progress { background: rgba(14,165,233,0.1); color: #0284c7; }
    .status-chip.completed { background: rgba(16,185,129,0.1); color: #059669; }
  `]
})
export class VolunteerDashboardComponent {
  private avatarColors = ['#0ea5e9','#10b981','#8b5cf6','#f59e0b','#f43f5e','#06b6d4'];

  profile = computed(() => this.auth.profile());
  
  volunteerId = computed(() => {
    let uid = this.auth.userId();
    const profile = this.auth.profile();
    
    // Attempt to match the addOrGet logic from EventsService exactly
    if (profile) {
      let pEmail = profile.email;
      // If the dashboard used volunteer@csr.com as fallback, check if there's a match
      if (!pEmail) {
        const defaultMatch = this.empSvc.employees().find(x => x.role === 'Volunteer');
        if (defaultMatch) return defaultMatch.id;
      }
      const e = this.empSvc.employees().find(x => x.email.toLowerCase() === (pEmail || '').toLowerCase());
      if (e) return e.id;
      
      // If they booked an event recently, addOrGet might have created userX@local
      // Let's find the most recently created Volunteer that matches the name
      const nameMatch = this.empSvc.employees().slice().reverse().find(x => x.name === profile.name && x.role === 'Volunteer');
      if (nameMatch) return nameMatch.id;
    }

    if (uid === 999) {
      let e = this.empSvc.employees().find(x => x.role === 'Volunteer');
      return e ? e.id : 999;
    }
    return uid || 999;
  });

  assignment = computed(() => this.assignmentSvc.getByVolunteer(this.volunteerId()));
  assignedEmployees = computed(() => {
    const a = this.assignment();
    if (!a) return [];
    const all = this.empSvc.employees();
    return all.filter(e => a.employeeIds.includes(e.id));
  });
  totalBookings = computed(() => {
    const empIds = this.assignedEmployees().map(e => e.id);
    return this.eventsSvc.bookings().filter(b => empIds.includes(b.userId ?? -1)).length;
  });

  bookedProjects = computed(() => {
    const myProfile = this.me();
    if (!myProfile || !myProfile.assignedProjectIds) return [];
    return this.projectsSvc.projects().filter(p => myProfile.assignedProjectIds.includes(p.id));
  });

  availableProjects = computed(() => {
    const myProfile = this.me();
    const bookedIds = myProfile?.assignedProjectIds || [];
    return this.projectsSvc.projects().filter(p => !bookedIds.includes(p.id) && p.status !== 'Completed');
  });

  myPersonalBookings = computed(() => {
    const vid = this.volunteerId();
    return this.eventsSvc.bookings().filter(b => b.userId === vid);
  });
  
  me = computed(() => {
    const vid = this.volunteerId();
    return this.empSvc.employees().find(e => e.id === vid);
  });

  constructor(
    public auth: AuthService,
    private assignmentSvc: AssignmentService,
    private empSvc: EmployeesService,
    public eventsSvc: EventsService,
    private projectsSvc: ProjectsService,
    private snack: MatSnackBar
  ) {}

  initials(name: string) {
    return (name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    return this.avatarColors[(name || '').charCodeAt(0) % this.avatarColors.length];
  }

  getEmployeeBookings(empId: number): EventBooking[] {
    const assignedProjectIds = this.me()?.assignedProjectIds || [];
    const allBookings = this.eventsSvc.bookings().filter(b => b.userId === empId);
    const unique = new Map<number, EventBooking>();
    for (const b of allBookings) {
       if (assignedProjectIds.includes(b.eventId) && !unique.has(b.eventId)) {
         if (!b.status) b.status = 'Pending';
         unique.set(b.eventId, b);
       }
    }
    return Array.from(unique.values());
  }

  getEventTitle(eventId: number): string {
    const ev = this.eventsSvc.events().find(e => e.id === eventId);
    if(ev) return ev.title;
    const proj = this.projectsSvc.projects().find(p => p.id === eventId);
    if(proj) return proj.projectName;
    return `Activity #${eventId}`;
  }

  getStatusClass(status: string): string {
    if (status === 'Completed') return 'completed';
    if (status === 'In Progress') return 'in-progress';
    return 'pending';
  }

  updateStatus(booking: EventBooking) {
    const bookings = this.eventsSvc.bookings().map(b => b.id === booking.id ? { ...b, status: booking.status } : b);
    this.eventsSvc.bookings.set(bookings);
    localStorage.setItem('events.bookings', JSON.stringify(bookings));
    this.snack.open('Status updated!', 'Close', { duration: 2000 });
  }

  getDeptGradient(dept: string): string {
    const d = (dept||'').toLowerCase();
    if (d.includes('environ')) return 'linear-gradient(135deg, #059669, #10b981)';
    if (d.includes('educ')) return 'linear-gradient(135deg, #0284c7, #38bdf8)';
    if (d.includes('health')) return 'linear-gradient(135deg, #dc2626, #f87171)';
    if (d.includes('communit')) return 'linear-gradient(135deg, #d97706, #fbbf24)';
    return 'linear-gradient(135deg, #6d28d9, #a78bfa)';
  }

  hasBooked(projectId: number): boolean {
    const myProfile = this.me();
    return myProfile?.assignedProjectIds?.includes(projectId) || false;
  }

  bookProject(projectId: number) {
    const res = this.eventsSvc.bookProject(projectId);
    if (res.ok) {
      this.snack.open('Successfully booked project!', 'Close', { duration: 3000 });
    } else {
      this.snack.open(res.message || 'Booking failed', 'Dismiss', { duration: 2500 });
    }
  }
}
