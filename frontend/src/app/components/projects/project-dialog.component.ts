import { Component, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Project, ProjectStatus } from '../../projects.service';
import { ProjectsService } from '../../projects.service';

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatAutocompleteModule],
  template: `
    <!-- ── Hero header ── -->
    <div class="dlg-header">
      <div class="dlg-header-icon">
        <mat-icon>{{ data.id ? 'edit_note' : 'add_task' }}</mat-icon>
      </div>
      <div>
        <h2 class="dlg-title">{{ data.id ? 'Edit Project' : 'New Project' }}</h2>
        <p class="dlg-sub">{{ data.id ? 'Update the project details below' : 'Fill in the details to create a CSR project' }}</p>
      </div>
      <button class="dlg-close" mat-icon-button type="button" (click)="dialogRef.close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="save()" class="dlg-body">

      <!-- ── Section: Project Info ── -->
      <div class="section-label">
        <mat-icon class="section-icon sky">info_outline</mat-icon>
        <span>Project Information</span>
      </div>
      <div class="grid">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Project Name</mat-label>
          <mat-icon matPrefix class="prefix-icon">work_outline</mat-icon>
          <input matInput formControlName="projectName" placeholder="e.g. Green Campus Drive" required cdkFocusInitial>
          <mat-error *ngIf="form.get('projectName')?.hasError('required')">Name is required</mat-error>
          <mat-error *ngIf="form.get('projectName')?.hasError('exists')">Name already exists</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Department</mat-label>
          <mat-icon matPrefix class="prefix-icon">apartment</mat-icon>
          <input matInput formControlName="department" [matAutocomplete]="deptAuto" placeholder="e.g. Environment" required>
          <mat-autocomplete #deptAuto="matAutocomplete">
            <mat-option *ngFor="let d of departments" [value]="d">{{ d }}</mat-option>
          </mat-autocomplete>
          <mat-error *ngIf="form.get('department')?.hasError('required')">Department is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Status</mat-label>
          <mat-icon matPrefix class="prefix-icon">flag_circle</mat-icon>
          <mat-select formControlName="status" required>
            <mat-option *ngFor="let s of statuses" [value]="s">
              <div class="status-opt">
                <span class="dot" [class]="s.toLowerCase()"></span>{{ s }}
              </div>
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('status')?.hasError('required')">Status is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Seats Available</mat-label>
          <mat-icon matPrefix class="prefix-icon">people_outline</mat-icon>
          <input matInput type="number" min="0" formControlName="seats" placeholder="e.g. 25">
        </mat-form-field>
      </div>

      <!-- ── Section: Budget ── -->
      <div class="section-label">
        <mat-icon class="section-icon emerald">account_balance_wallet</mat-icon>
        <span>Budget</span>
      </div>
      <div class="grid">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Total Budget (₹)</mat-label>
          <mat-icon matPrefix class="prefix-icon">currency_rupee</mat-icon>
          <input matInput type="number" formControlName="budget" placeholder="0" required>
          <mat-error *ngIf="form.get('budget')?.hasError('required')">Budget is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Used Budget (₹)</mat-label>
          <mat-icon matPrefix class="prefix-icon">receipt_long</mat-icon>
          <input matInput type="number" formControlName="usedBudget" placeholder="0">
          <mat-error *ngIf="form.get('usedBudget')?.hasError('lteBudget')">Used must be ≤ Budget</mat-error>
        </mat-form-field>
      </div>

      <!-- Budget progress bar -->
      <div class="budget-bar-wrap" *ngIf="form.get('budget')?.value > 0">
        <div class="budget-bar-labels">
          <span class="budget-used-label">Used: ₹{{ form.get('usedBudget')?.value | number }}</span>
          <span class="budget-remaining-label">Remaining: ₹{{ remainingBudget() | number }}</span>
        </div>
        <div class="budget-track">
          <div class="budget-fill" [style.width.%]="budgetPercent()" [class.danger]="budgetPercent() >= 90"></div>
        </div>
        <span class="budget-pct">{{ budgetPercent() }}%</span>
      </div>

      <!-- ── Quick Budget chips ── -->
      <div class="chip-row">
        <span class="chip-label"><mat-icon>bolt</mat-icon>Quick Budget</span>
        <button class="chip" type="button" (click)="setBudget(50000)">₹50k</button>
        <button class="chip" type="button" (click)="setBudget(100000)">₹1L</button>
        <button class="chip" type="button" (click)="setBudget(500000)">₹5L</button>
      </div>

      <!-- ── Section: Schedule ── -->
      <div class="section-label">
        <mat-icon class="section-icon amber">calendar_month</mat-icon>
        <span>Schedule</span>
      </div>
      <div class="grid">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Start Date</mat-label>
          <mat-icon matPrefix class="prefix-icon">event</mat-icon>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate" required>
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
          <mat-error *ngIf="form.get('startDate')?.hasError('required')">Start date is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>End Date</mat-label>
          <mat-icon matPrefix class="prefix-icon">event_available</mat-icon>
          <input matInput [matDatepicker]="endPicker" formControlName="endDate" required>
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
          <mat-error *ngIf="form.get('endDate')?.hasError('required')">End date is required</mat-error>
          <mat-error *ngIf="form.get('endDate')?.hasError('gteStart')">End ≥ Start date required</mat-error>
        </mat-form-field>
      </div>

      <!-- ── Quick Date chips ── -->
      <div class="chip-row">
        <span class="chip-label"><mat-icon>schedule</mat-icon>Quick Dates</span>
        <button class="chip" type="button" (click)="setDates(0,7)">This week</button>
        <button class="chip" type="button" (click)="setDates(0,30)">+30 days</button>
        <button class="chip" type="button" (click)="setDates(1,90)">Next quarter</button>
      </div>

      <!-- ── Section: Description ── -->
      <div class="section-label">
        <mat-icon class="section-icon violet">description</mat-icon>
        <span>Description</span>
      </div>
      <mat-form-field appearance="outline" class="field full">
        <mat-label>Project Description</mat-label>
        <textarea matInput formControlName="description" rows="3" placeholder="Describe the project goals, scope, and expected impact…"></textarea>
      </mat-form-field>

      <!-- ── Template strip ── -->
      <div class="template-row">
        <mat-icon class="tmpl-icon">bookmark_border</mat-icon>
        <span class="tmpl-label">Template</span>
        <button class="chip ghost" type="button" (click)="applyTemplate()">Apply last</button>
        <button class="chip ghost" type="button" (click)="saveTemplate()">Save template</button>
      </div>

      <!-- ── Footer actions ── -->
      <div class="dlg-footer">
        <button class="btn-cancel" mat-button type="button" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon> Cancel
        </button>
        <button class="btn-save" type="submit" [disabled]="form.invalid">
          <mat-icon>{{ data.id ? 'save' : 'add_task' }}</mat-icon>
          {{ data.id ? 'Save Changes' : 'Create Project' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    /* ── Dialog header ── */
    .dlg-header {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.25rem 1.5rem 0;
    }
    .dlg-header-icon {
      width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px #0ea5e940;
    }
    .dlg-header-icon mat-icon { color: #fff; font-size: 26px; width: 26px; height: 26px; }
    .dlg-title { font-size: 1.2rem; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: -.02em; }
    .dlg-sub { font-size: .78rem; color: #94a3b8; margin: .1rem 0 0; }
    .dlg-close { margin-left: auto; color: #94a3b8; }

    /* dark mode header */
    :host-context(.dark-theme) .dlg-title { color: #f1f5f9; }

    /* ── Body ── */
    .dlg-body { display: flex; flex-direction: column; gap: .75rem; padding: 1rem 1.5rem; max-height: 65vh; overflow-y: auto; }

    /* ── Section labels ── */
    .section-label {
      display: flex; align-items: center; gap: .45rem;
      font-size: .72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .07em; color: #64748b; margin-top: .25rem;
    }
    .section-icon { font-size: 16px; width: 16px; height: 16px; }
    .section-icon.sky    { color: #0ea5e9; }
    .section-icon.emerald{ color: #10b981; }
    .section-icon.amber  { color: #f59e0b; }
    .section-icon.violet { color: #8b5cf6; }

    /* ── Grid ── */
    .grid { display: grid; gap: .6rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .field { width: 100%; }
    .full  { width: 100%; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }

    /* prefix icons inside mat-form-field */
    .prefix-icon { font-size: 18px; width: 18px; height: 18px; color: #94a3b8; margin-right: 2px; }

    /* ── Status option dots ── */
    .status-opt { display: flex; align-items: center; gap: .5rem; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.planned   { background: #3b82f6; }
    .dot.ongoing   { background: #10b981; }
    .dot.completed { background: #8b5cf6; }

    /* ── Budget bar ── */
    .budget-bar-wrap { display: flex; flex-direction: column; gap: .25rem; padding: 0 .1rem; }
    .budget-bar-labels { display: flex; justify-content: space-between; font-size: .72rem; color: #64748b; }
    .budget-used-label { font-weight: 600; color: #0ea5e9; }
    .budget-remaining-label { color: #10b981; font-weight: 600; }
    .budget-track {
      height: 6px; border-radius: 999px; background: #e2e8f0; overflow: hidden;
    }
    :host-context(.dark-theme) .budget-track { background: #ffffff14; }
    .budget-fill {
      height: 100%; border-radius: 999px;
      background: linear-gradient(90deg, #0ea5e9, #10b981);
      transition: width .4s cubic-bezier(.4,0,.2,1);
    }
    .budget-fill.danger { background: linear-gradient(90deg, #f59e0b, #ef4444); }
    .budget-pct { font-size: .68rem; color: #94a3b8; text-align: right; }

    /* ── Chip rows ── */
    .chip-row, .template-row {
      display: flex; align-items: center; gap: .45rem; flex-wrap: wrap;
    }
    .chip-label, .tmpl-label {
      display: flex; align-items: center; gap: .25rem;
      font-size: .72rem; font-weight: 700; color: #64748b; white-space: nowrap;
    }
    .chip-label mat-icon, .tmpl-icon {
      font-size: 15px; width: 15px; height: 15px; color: #94a3b8;
    }
    .chip {
      padding: .25rem .75rem; border-radius: 999px;
      border: 1.5px solid #e2e8f0; background: transparent;
      font-size: .75rem; font-weight: 600; color: #334155; cursor: pointer;
      transition: all .18s ease;
    }
    .chip:hover {
      background: #0ea5e9; color: #fff; border-color: #0ea5e9;
      transform: translateY(-1px); box-shadow: 0 3px 10px #0ea5e940;
    }
    .chip.ghost { color: #64748b; }
    .chip.ghost:hover { background: #64748b; color: #fff; border-color: #64748b; box-shadow: none; }
    :host-context(.dark-theme) .chip { border-color: #ffffff1a; color: #cbd5e1; }
    :host-context(.dark-theme) .chip:hover { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }

    /* ── Footer ── */
    .dlg-footer {
      display: flex; justify-content: flex-end; gap: .75rem;
      padding-top: .75rem; border-top: 1px solid #e2e8f024; margin-top: .25rem;
    }
    .btn-cancel {
      display: flex; align-items: center; gap: .3rem;
      padding: .5rem 1rem; border-radius: 10px; border: 1.5px solid #e2e8f0;
      background: transparent; font-size: .85rem; font-weight: 600;
      color: #64748b; cursor: pointer; transition: all .2s;
    }
    .btn-cancel:hover { border-color: #94a3b8; }
    .btn-cancel mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .btn-save {
      display: flex; align-items: center; gap: .4rem;
      padding: .55rem 1.4rem;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: #fff; border: none; border-radius: 10px;
      font-size: .875rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 14px #0ea5e94d; transition: all .25s ease;
    }
    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px); box-shadow: 0 8px 22px #0ea5e966;
    }
    .btn-save:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-save mat-icon { font-size: 19px; width: 19px; height: 19px; }
  `]
})
export class ProjectDialogComponent {
  form: FormGroup;
  statuses: ProjectStatus[] = ['Planned', 'Ongoing', 'Completed'];
  departments: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<ProjectDialogComponent, Project>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Project>,
    private readonly svc: ProjectsService
  ) {
    this.form = this.fb.group({
      projectName: [data?.projectName ?? '', [Validators.required, this.uniqueNameValidator()]],
      department: [data?.department ?? '', Validators.required],
      budget: [data?.budget ?? 0, [Validators.required, Validators.min(0)]],
      usedBudget: [data?.usedBudget ?? 0, [this.usedLteBudgetValidator()]],
      seats: [data?.seats ?? 0, [Validators.min(0)]],
      startDate: [data?.startDate ? new Date(data.startDate as any) : null, Validators.required],
      endDate: [data?.endDate ? new Date(data.endDate as any) : null, [Validators.required, this.endGteStartValidator()]],
      status: [data?.status ?? 'Planned', Validators.required],
      description: [data?.description ?? '']
    });

    // preload departments suggestions
    const list = this.svc.list();
    this.departments = Array.from(new Set(list.map(p => p.department).filter(Boolean))).sort();

    // restore draft
    const draftRaw = localStorage.getItem('project.dialog.draft');
    if (!data?.id && draftRaw) {
      try { this.form.patchValue(this.inflateDraft(JSON.parse(draftRaw))); } catch {}
    }

    // auto status + draft save
    this.form.valueChanges.subscribe(() => {
      this.autoStatus();
      localStorage.setItem('project.dialog.draft', JSON.stringify(this.deflateDraft()));
    });
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const toIso = (d: any) => d instanceof Date ? d.toISOString().slice(0,10) : (typeof d === 'string' ? d : '');
    const payload: Project = {
      ...(this.data as any),
      projectName: value.projectName!,
      department: value.department!,
      budget: value.budget!,
      usedBudget: value.usedBudget ?? 0,
      seats: value.seats ?? 0,
      startDate: toIso(value.startDate),
      endDate: toIso(value.endDate),
      status: value.status!,
      description: value.description ?? ''
    } as Project;
    // clear draft after successful save
    localStorage.removeItem('project.dialog.draft');
    this.dialogRef.close(payload);
  }

  // Keyboard quick actions
  @HostListener('document:keydown.escape') onEsc() { this.dialogRef.close(); }

  // Helpers
  remainingBudget() {
    const b = Number(this.form.get('budget')?.value || 0);
    const u = Number(this.form.get('usedBudget')?.value || 0);
    return Math.max(0, b - u);
  }

  budgetPercent() {
    const b = Number(this.form.get('budget')?.value || 0);
    const u = Number(this.form.get('usedBudget')?.value || 0);
    if (!b) return 0;
    return Math.min(100, Math.round((u / b) * 100));
  }

  setBudget(val: number) {
    this.form.get('budget')?.setValue(val);
    if (Number(this.form.get('usedBudget')?.value || 0) > val) this.form.get('usedBudget')?.setValue(val);
  }

  setDates(offsetStartDays: number, durationDays: number) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() + offsetStartDays);
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    this.form.get('startDate')?.setValue(start);
    this.form.get('endDate')?.setValue(end);
    this.autoStatus();
  }

  autoStatus() {
    const s = this.form.get('startDate')?.value as Date | null;
    const e = this.form.get('endDate')?.value as Date | null;
    if (!s || !e) return;
    const today = new Date();
    const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const sd = day(s), ed = day(e), td = day(today);
    let next: ProjectStatus = 'Planned';
    if (ed < td) next = 'Completed';
    else if (sd <= td && td <= ed) next = 'Ongoing';
    else next = 'Planned';
    if (this.form.get('status')?.value !== next) this.form.get('status')?.setValue(next);
  }

  // Templates
  saveTemplate() { localStorage.setItem('project.dialog.template', JSON.stringify(this.deflateDraft())); }
  applyTemplate() {
    const raw = localStorage.getItem('project.dialog.template');
    if (!raw) return;
    try { this.form.patchValue(this.inflateDraft(JSON.parse(raw))); this.autoStatus(); } catch {}
  }

  deflateDraft() {
    const v = this.form.getRawValue();
    const sd = v.startDate instanceof Date ? v.startDate.toISOString() : v.startDate;
    const ed = v.endDate instanceof Date ? v.endDate.toISOString() : v.endDate;
    return { ...v, startDate: sd, endDate: ed };
  }
  inflateDraft(obj: any) {
    const toDate = (x: any) => (x ? new Date(x) : null);
    return { ...obj, startDate: toDate(obj?.startDate), endDate: toDate(obj?.endDate) };
  }

  // Validators
  uniqueNameValidator() {
    const existing = new Set(this.svc.list().map(p => (p.projectName || '').toLowerCase()));
    const currentId = (this.data as any)?.id;
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const name = String(ctrl.value || '').toLowerCase().trim();
      if (!name) return null;
      // allow same name if editing same project id
      if (currentId) return null;
      return existing.has(name) ? { exists: true } : null;
    };
  }

  usedLteBudgetValidator() {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const used = Number(ctrl.value || 0);
      const b = Number(this.form?.get('budget')?.value || 0);
      return used > b ? { lteBudget: true } : null;
    };
  }

  endGteStartValidator() {
    return (_: AbstractControl): ValidationErrors | null => {
      const s = this.form?.get('startDate')?.value as Date | null;
      const e = this.form?.get('endDate')?.value as Date | null;
      if (!s || !e) return null;
      const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return day(e) < day(s) ? { gteStart: true } : null;
    };
  }
}
