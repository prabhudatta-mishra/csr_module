import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface Student {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-student-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.id ? 'Edit' : 'Add' }} Student</h2>
    <form [formGroup]="form" (ngSubmit)="save()" class="form">
      <mat-form-field appearance="outline" class="field">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" required>
        <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
        <mat-error *ngIf="form.get('name')?.hasError('minlength')">Name must be at least 2 characters</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="field">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" required type="email">
        <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
        <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
      </mat-form-field>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
      </div>
    </form>
  `,
  styles: [`
    .form { display: grid; gap: 1rem; padding-top: .5rem; }
    .field { width: 100%; }
  `]
})
export class StudentDialogComponent {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<StudentDialogComponent, Student>,
    @Inject(MAT_DIALOG_DATA) public data: Student
  ) {
    this.form = this.fb.group({
      id: [this.data.id ?? 0],
      name: [this.data.name ?? '', [Validators.required, Validators.minLength(2)]],
      email: [this.data.email ?? '', [Validators.required, Validators.email]]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue() as Student);
    }
  }
}
