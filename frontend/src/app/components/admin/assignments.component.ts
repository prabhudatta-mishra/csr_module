import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AssignmentService, Assignment } from '../../assignment.service';
import { EmployeesService, Employee } from '../../employees.service';

interface VolunteerProfile { id: number; name: string; email: string; }

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSelectModule, MatSnackBarModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header animate-fade-in-up">
        <div>
          <h1 class="page-title"><span class="gradient-title">Volunteer Assignments</span></h1>
          <p class="page-subtitle">Assign one volunteer to multiple employees manually</p>
        </div>
        <div class="header-pills">
          <div class="pill violet">
            <mat-icon>assignment_ind</mat-icon>
            {{ assignments().length }} Active Assignments
          </div>
        </div>
      </div>

      <!-- Assignment Form Card -->
      <div class="form-card glass animate-fade-in-up">
        <div class="form-card-header">
          <div class="form-card-icon">
            <mat-icon>person_add</mat-icon>
          </div>
          <div>
            <h3>Create / Update Assignment</h3>
            <p>Select a volunteer and pick the employees they will manage</p>
          </div>
        </div>

        <div class="form-row">
          <div class="field-group">
            <label class="field-label"><mat-icon>volunteer_activism</mat-icon> Select Volunteer</label>
            <select class="custom-select" [(ngModel)]="selectedVolunteerId" (change)="onVolunteerChange()">
              <option value="">-- Select a Volunteer --</option>
              <option [value]="v.id" *ngFor="let v of volunteers()">{{ v.name }} ({{ v.email }})</option>
            </select>
          </div>

          <div class="field-group" *ngIf="selectedVolunteerId">
            <label class="field-label"><mat-icon>groups</mat-icon> Select Employees to Assign</label>
            <div class="employee-checkboxes">
              <label class="check-row" *ngFor="let emp of employees()">
                <input type="checkbox" [value]="emp.id" [checked]="isSelected(emp.id)" (change)="toggleEmployee(emp.id)">
                <div class="check-avatar" [style.background]="avatarColor(emp.name)">{{ initials(emp.name) }}</div>
                <div class="check-info">
                  <div class="check-name">{{ emp.name }}</div>
                  <div class="check-dept">{{ emp.department }}</div>
                </div>
                <div class="check-already" *ngIf="isAssignedElsewhere(emp.id)">
                  <mat-icon>warning</mat-icon> Already assigned
                </div>
              </label>
            </div>
          </div>

          <button class="btn-assign" (click)="saveAssignment()" *ngIf="selectedVolunteerId">
            <mat-icon>save</mat-icon>
            Save Assignment ({{ selectedEmployeeIds.length }} employees)
          </button>
        </div>
      </div>

      <!-- Current Assignments Table -->
      <div class="table-card glass animate-fade-in-up" *ngIf="assignments().length > 0">
        <div class="table-header">
          <h3>Current Assignments</h3>
        </div>
        <table class="assign-table">
          <thead>
            <tr>
              <th>Volunteer</th>
              <th>Assigned Employees</th>
              <th>Employee Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of assignments()">
              <td>
                <div class="vol-cell">
                  <div class="vol-avatar">{{ a.volunteerName.charAt(0) }}</div>
                  {{ a.volunteerName }}
                </div>
              </td>
              <td>
                <div class="emp-chips">
                  <span class="emp-chip" *ngFor="let eId of a.employeeIds">
                    {{ getEmployeeName(eId) }}
                  </span>
                  <span class="emp-chip empty" *ngIf="a.employeeIds.length === 0">None</span>
                </div>
              </td>
              <td><span class="count-badge">{{ a.employeeIds.length }}</span></td>
              <td>
                <div class="action-btns">
                  <button class="btn-icon edit" (click)="editAssignment(a)" title="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="btn-icon delete" (click)="removeAssignment(a.volunteerId)" title="Remove">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { padding: 1.5rem 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 1200px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.85rem; font-weight: 800; margin: 0; letter-spacing: -0.03em; }
    .gradient-title {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .page-subtitle { font-size: 0.9rem; color: #64748b; margin: 0.25rem 0 0; }
    :host-context(.dark-theme) .page-subtitle { color: #94a3b8; }

    .header-pills { display: flex; gap: 0.75rem; align-items: center; }
    .pill {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.4rem 0.85rem; border-radius: 999px;
      font-size: 0.82rem; font-weight: 600;
    }
    .pill mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .pill.violet { background: rgba(139,92,246,0.1); color: #7c3aed; border: 1px solid rgba(139,92,246,0.2); }

    .glass {
      background: rgba(255,255,255,0.8); backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 24px rgba(15,23,42,0.06);
      border-radius: 20px;
    }
    :host-context(.dark-theme) .glass { background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.08); }

    /* Form Card */
    .form-card { padding: 1.75rem; }
    .form-card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(226,232,240,0.5); }
    :host-context(.dark-theme) .form-card-header { border-bottom-color: rgba(255,255,255,0.06); }
    .form-card-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); display: flex; align-items: center; justify-content: center; }
    .form-card-icon mat-icon { color: white; }
    .form-card-header h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
    :host-context(.dark-theme) .form-card-header h3 { color: #f1f5f9; }
    .form-card-header p { font-size: 0.82rem; color: #94a3b8; margin: 0.2rem 0 0; }

    .form-row { display: flex; flex-direction: column; gap: 1.25rem; }
    .field-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .field-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; color: #64748b; }
    :host-context(.dark-theme) .field-label { color: #94a3b8; }
    .field-label mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .custom-select {
      padding: 0.65rem 1rem; border-radius: 12px; border: 1.5px solid #e2e8f0;
      background: rgba(248,250,252,0.8); font-size: 0.9rem; color: #334155;
      outline: none; -webkit-appearance: none; cursor: pointer;
      transition: border-color 0.2s;
    }
    :host-context(.dark-theme) .custom-select { background: rgba(15,23,42,0.4); border-color: rgba(255,255,255,0.1); color: #f1f5f9; }
    .custom-select:focus { border-color: #8b5cf6; }

    .employee-checkboxes { display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto; }
    .check-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.65rem 0.85rem; border-radius: 10px;
      border: 1.5px solid #e2e8f0; cursor: pointer;
      transition: all 0.2s; background: transparent;
    }
    :host-context(.dark-theme) .check-row { border-color: rgba(255,255,255,0.1); }
    .check-row:hover { border-color: #8b5cf6; background: rgba(139,92,246,0.03); }
    .check-row input[type=checkbox] { accent-color: #8b5cf6; width: 16px; height: 16px; }
    .check-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.78rem; color: white; flex-shrink: 0;
    }
    .check-name { font-weight: 600; font-size: 0.875rem; color: #0f172a; }
    :host-context(.dark-theme) .check-name { color: #f1f5f9; }
    .check-dept { font-size: 0.75rem; color: #94a3b8; }
    .check-already {
      margin-left: auto; display: flex; align-items: center; gap: 0.2rem;
      font-size: 0.72rem; color: #f59e0b; font-weight: 600;
    }
    .check-already mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .btn-assign {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-radius: 12px; border: none;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white;
      font-size: 0.9rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 12px rgba(139,92,246,0.35);
      transition: all 0.25s; align-self: flex-end;
    }
    .btn-assign:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(139,92,246,0.45); }

    /* Table */
    .table-card { overflow: hidden; }
    .table-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(226,232,240,0.5); }
    :host-context(.dark-theme) .table-header { border-bottom-color: rgba(255,255,255,0.06); }
    .table-header h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    :host-context(.dark-theme) .table-header h3 { color: #f1f5f9; }

    .assign-table { width: 100%; border-collapse: collapse; }
    .assign-table th {
      padding: 0.75rem 1.25rem; text-align: left;
      font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;
      background: rgba(248,250,252,0.8); border-bottom: 1px solid rgba(226,232,240,0.5);
    }
    :host-context(.dark-theme) .assign-table th { background: rgba(15,23,42,0.3); color: #94a3b8; border-bottom-color: rgba(255,255,255,0.06); }
    .assign-table td { padding: 0.9rem 1.25rem; border-bottom: 1px solid rgba(226,232,240,0.3); color: #334155; }
    :host-context(.dark-theme) .assign-table td { color: #cbd5e1; border-bottom-color: rgba(255,255,255,0.04); }

    .vol-cell { display: flex; align-items: center; gap: 0.65rem; font-weight: 600; }
    .vol-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; color: white; flex-shrink: 0;
    }

    .emp-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .emp-chip {
      padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
      background: rgba(14,165,233,0.1); color: #0284c7;
    }
    .emp-chip.empty { background: rgba(100,116,139,0.1); color: #64748b; }

    .count-badge {
      padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700;
      background: rgba(139,92,246,0.1); color: #7c3aed;
    }

    .action-btns { display: flex; gap: 0.35rem; }
    .btn-icon {
      width: 32px; height: 32px; border-radius: 8px; border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; background: transparent;
    }
    .btn-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .btn-icon.edit { color: #0ea5e9; }
    .btn-icon.edit:hover { background: rgba(14,165,233,0.1); }
    .btn-icon.delete { color: #ef4444; }
    .btn-icon.delete:hover { background: rgba(239,68,68,0.1); }
  `]
})
export class AssignmentsComponent {
  private avatarColors = ['#0ea5e9','#10b981','#8b5cf6','#f59e0b','#f43f5e','#06b6d4'];
  
  assignments = computed(() => this.assignmentSvc.listAll());
  employees = computed(() => this.empSvc.employees().filter(e => e.role !== 'Volunteer'));
  volunteers = computed<VolunteerProfile[]>(() => [
    ...this.empSvc.employees()
      .filter(e => e.role === 'Volunteer')
      .map(e => ({ id: e.id, name: e.name, email: e.email }))
  ]);

  selectedVolunteerId: number | string = '';
  selectedEmployeeIds: number[] = [];

  constructor(
    private assignmentSvc: AssignmentService,
    private empSvc: EmployeesService,
    private snack: MatSnackBar
  ) {}

  initials(name: string) {
    return (name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  }
  avatarColor(name: string) {
    return this.avatarColors[(name || '').charCodeAt(0) % this.avatarColors.length];
  }

  onVolunteerChange() {
    const existing = this.assignmentSvc.getByVolunteer(Number(this.selectedVolunteerId));
    this.selectedEmployeeIds = existing ? [...existing.employeeIds] : [];
  }

  isSelected(empId: number): boolean {
    return this.selectedEmployeeIds.includes(empId);
  }

  isAssignedElsewhere(empId: number): boolean {
    const all = this.assignmentSvc.listAll();
    return all.some(a => a.volunteerId !== Number(this.selectedVolunteerId) && a.employeeIds.includes(empId));
  }

  toggleEmployee(empId: number) {
    if (this.selectedEmployeeIds.includes(empId)) {
      this.selectedEmployeeIds = this.selectedEmployeeIds.filter(id => id !== empId);
    } else {
      this.selectedEmployeeIds = [...this.selectedEmployeeIds, empId];
    }
  }

  saveAssignment() {
    const volId = Number(this.selectedVolunteerId);
    if (!volId) { this.snack.open('Please select a volunteer', 'Close', { duration: 2000 }); return; }
    const vol = this.volunteers().find(v => v.id === volId);
    this.assignmentSvc.assign(volId, vol?.name || 'Volunteer', this.selectedEmployeeIds);
    this.snack.open('✔ Assignment saved successfully!', 'Close', { duration: 2500 });
  }

  editAssignment(a: Assignment) {
    this.selectedVolunteerId = a.volunteerId;
    this.selectedEmployeeIds = [...a.employeeIds];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  removeAssignment(volunteerId: number) {
    this.assignmentSvc.remove(volunteerId);
    this.snack.open('Assignment removed', 'Close', { duration: 2000 });
  }

  getEmployeeName(id: number): string {
    return this.empSvc.employees().find(e => e.id === id)?.name || `Employee #${id}`;
  }
}
