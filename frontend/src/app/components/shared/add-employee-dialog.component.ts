import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeesService, Employee } from '../../employees.service';
import { ProjectsService, Project } from '../../projects.service';

export interface EmployeeDialogData {
  isVolunteer?: boolean;
  employee?: Employee; // if provided, we are editing
}

@Component({
  selector: 'app-add-employee-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatIconModule, ReactiveFormsModule
  ],
  template: `
    <div class="dialog-wrap">
      <!-- Gradient Header -->
      <div class="dialog-header" [class.volunteer-header]="isVolunteer" [class.edit-header]="isEditing">
        <div class="header-icon">
          <mat-icon>{{ isEditing ? 'edit' : (isVolunteer ? 'volunteer_activism' : 'person_add') }}</mat-icon>
        </div>
        <div class="header-text">
          <h2 class="dialog-title">{{ isEditing ? 'Edit Employee' : (isVolunteer ? 'Add Volunteer' : 'Add Employee') }}</h2>
          <p class="dialog-sub">{{ isEditing ? 'Update the details below' : 'Fill in the details below to create a new ' + (isVolunteer ? 'volunteer' : 'employee') + ' profile' }}</p>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" class="dialog-form">
        <div class="field-group">
          <div class="field-label"><mat-icon>person</mat-icon> Full Name</div>
          <mat-form-field appearance="outline" class="field">
            <input matInput formControlName="name" placeholder="Enter full name">
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="field-group">
          <div class="field-label"><mat-icon>email</mat-icon> Email Address</div>
          <mat-form-field appearance="outline" class="field">
            <input matInput type="email" formControlName="email" placeholder="name@company.com">
            <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email format</mat-error>
          </mat-form-field>
        </div>

        <div class="row-fields">
          <div class="field-group">
            <div class="field-label"><mat-icon>business</mat-icon> Department</div>
            <mat-form-field appearance="outline" class="field">
              <mat-select formControlName="department">
                <mat-option value="Engineering">Engineering</mat-option>
                <mat-option value="Marketing">Marketing</mat-option>
                <mat-option value="Human Resources">Human Resources</mat-option>
                <mat-option value="Operations">Operations</mat-option>
                <mat-option value="Sales">Sales</mat-option>
                <mat-option value="Environment">Environment</mat-option>
                <mat-option value="Education">Education</mat-option>
                <mat-option value="Healthcare">Healthcare</mat-option>
                <mat-option value="External" *ngIf="isVolunteer">External (Volunteer)</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="field-group">
            <div class="field-label"><mat-icon>badge</mat-icon> Role / Title</div>
            <mat-form-field appearance="outline" class="field">
              <input matInput formControlName="role" placeholder="e.g. Software Engineer">
            </mat-form-field>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label"><mat-icon>assignment</mat-icon> Assign Project</div>
          <mat-form-field appearance="outline" class="field">
            <mat-select formControlName="assignedProjectId" placeholder="None (Optional)">
              <mat-option [value]="null">None</mat-option>
              <mat-option *ngFor="let p of availableProjects" [value]="p.id">
                {{ p.projectName }} ({{ p.department }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </form>

      <!-- Actions -->
      <div class="dialog-actions">
        <button class="btn-cancel" mat-dialog-close>
          <mat-icon>close</mat-icon> Cancel
        </button>
        <button class="btn-save" [class.btn-volunteer]="isVolunteer" [class.btn-edit]="isEditing" [disabled]="form.invalid" (click)="save()">
          <mat-icon>{{ isEditing ? 'save' : (isVolunteer ? 'volunteer_activism' : 'person_add') }}</mat-icon>
          {{ isEditing ? 'Save Changes' : ('Save ' + (isVolunteer ? 'Volunteer' : 'Employee')) }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrap { min-width: 480px; max-width: 560px; display: flex; flex-direction: column; }

    /* Header */
    .dialog-header {
      padding: 1.5rem 1.75rem;
      background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(16,185,129,0.08));
      border-bottom: 1px solid rgba(226,232,240,0.6);
      display: flex; align-items: center; gap: 1rem;
    }
    .dialog-header.volunteer-header {
      background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(139,92,246,0.08));
    }
    .dialog-header.edit-header {
      background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(14,165,233,0.08));
    }
    .header-icon {
      width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 16px rgba(14,165,233,0.25);
    }
    .edit-header .header-icon {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 6px 16px rgba(245,158,11,0.25);
    }
    .volunteer-header .header-icon {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 6px 16px rgba(16,185,129,0.25);
    }
    .header-icon mat-icon { font-size: 26px; width:26px; height:26px; color: white; }
    .dialog-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
    .dialog-sub { font-size: 0.78rem; color: #94a3b8; margin: 0.2rem 0 0; line-height: 1.4; }

    /* Form */
    .dialog-form { padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .field-group { display: flex; flex-direction: column; gap: 0.2rem; }
    .field-label {
      display: flex; align-items: center; gap: 0.35rem;
      font-size: 0.78rem; font-weight: 600; color: #64748b; margin-bottom: 0.1rem;
    }
    .field-label mat-icon { font-size: 15px; width:15px; height:15px; }
    .field { width: 100%; }
    .row-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    @media(max-width:480px){.row-fields{grid-template-columns:1fr;} .dialog-wrap{min-width:auto;}}

    /* Actions */
    .dialog-actions {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.75rem 1.5rem;
      border-top: 1px solid rgba(226,232,240,0.5);
    }
    .btn-cancel {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1.1rem; border-radius: 9px;
      border: 1.5px solid #e2e8f0; background: transparent;
      font-size: 0.875rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { border-color: #94a3b8; }
    .btn-cancel mat-icon { font-size: 18px; width:18px; height:18px; }
    .btn-save {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1.4rem; border-radius: 9px; border: none;
      background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white;
      font-size: 0.875rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 12px rgba(14,165,233,0.3); transition: all 0.25s;
    }
    .btn-save.btn-volunteer {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    }
    .btn-save.btn-edit {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 4px 12px rgba(245,158,11,0.3);
    }
    .btn-save:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(14,165,233,0.4); }
    .btn-save.btn-volunteer:hover { box-shadow: 0 8px 20px rgba(16,185,129,0.4); }
    .btn-save.btn-edit:hover { box-shadow: 0 8px 20px rgba(245,158,11,0.4); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-save mat-icon { font-size: 18px; width:18px; height:18px; }
  `]
})
export class AddEmployeeDialogComponent {
  form: FormGroup;
  isVolunteer: boolean;
  isEditing: boolean;
  availableProjects: Project[] = [];
  private employee: Employee | undefined;

  constructor(
    private fb: FormBuilder,
    private employeesService: EmployeesService,
    private projectsService: ProjectsService,
    private dialogRef: MatDialogRef<AddEmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeDialogData
  ) {
    this.isVolunteer = data?.isVolunteer || false;
    this.isEditing = !!data?.employee;
    this.employee = data?.employee;
    this.availableProjects = this.projectsService.projects();

    this.form = this.fb.group({
      name: [this.employee?.name || '', Validators.required],
      email: [this.employee?.email || '', [Validators.required, Validators.email]],
      department: [this.employee?.department || (this.isVolunteer ? 'External' : ''), Validators.required],
      role: [this.employee?.role || '', Validators.required],
      assignedProjectId: [this.employee?.assignedProjectIds?.[0] || null]
    });
  }

  save() {
    if (this.form.valid) {
      const val = this.form.value;
      if (this.isEditing && this.employee) {
        // Update existing employee
        this.employeesService.update(this.employee.id, {
          name: val.name,
          email: val.email,
          department: val.department,
          role: val.role,
          assignedProjectIds: val.assignedProjectId ? [Number(val.assignedProjectId)] : []
        });
        this.dialogRef.close({ updated: true, employee: { ...this.employee, ...val } });
      } else {
        // Create new employee
        const newEmployee = this.employeesService.addOrGet({
          name: val.name,
          email: val.email,
          profession: val.role,
          department: val.department,
          role: this.isVolunteer ? 'Volunteer' : 'Employee'
        });
        this.employeesService.update(newEmployee.id, {
          assignedProjectIds: val.assignedProjectId ? [Number(val.assignedProjectId)] : []
        });
        this.dialogRef.close(newEmployee);
      }
    }
  }
}
