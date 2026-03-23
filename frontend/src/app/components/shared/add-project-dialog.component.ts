import { Component, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectsService, Project } from '../../projects.service';

@Component({
  selector: 'app-add-project-dialog',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="elite-wizard-shell">
      <!-- Decorative Background Elements -->
      <div class="glass-blob-1"></div>
      <div class="glass-blob-2"></div>

      <div class="wizard-container glass-morphism">
        <!-- Sidebar: Steps & Preview -->
        <aside class="wizard-sidebar">
          <div class="sidebar-header">
            <mat-icon class="pulse-icon">rocket_launch</mat-icon>
            <div>
              <h3>New Project</h3>
              <p>Step {{ currentStep() }} of 3</p>
            </div>
          </div>

          <nav class="step-nav">
            <div class="nav-item" [class.active]="currentStep() === 1" [class.done]="currentStep() > 1">
              <span class="step-num">1</span>
              <span>Identity</span>
            </div>
            <div class="nav-item" [class.active]="currentStep() === 2" [class.done]="currentStep() > 2">
              <span class="step-num">2</span>
              <span>Resources</span>
            </div>
            <div class="nav-item" [class.active]="currentStep() === 3" [class.done]="currentStep() > 3">
              <span class="step-num">3</span>
              <span>Timeline</span>
            </div>
          </nav>

          <div class="preview-section">
            <label>LIVE PREVIEW</label>
            <div class="preview-card-wrap">
              <div class="preview-project-card" [style.border-left-color]="getDeptColor()">
                <div class="p-header">
                   <mat-icon>{{ getDeptIcon() }}</mat-icon>
                   <span class="p-dept">{{ form.get('department')?.value || 'Select Dept' }}</span>
                </div>
                <div class="p-name">{{ form.get('projectName')?.value || 'Project Title' }}</div>
                <div class="p-budget">₹{{ (form.get('budget')?.value || 0) | number }} Budget</div>
                <div class="p-status" [class]="form.get('status')?.value?.toLowerCase()">
                  {{ form.get('status')?.value }}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Form Area -->
        <main class="wizard-form-area">
          <header class="form-header">
             <h2>{{ getStepTitle() }}</h2>
             <button mat-icon-button mat-dialog-close class="close-btn"><mat-icon>close</mat-icon></button>
          </header>

          <form [formGroup]="form" class="wizard-form-body">
            
            <!-- Step 1: Identity -->
            <div class="step-content" *ngIf="currentStep() === 1">
              <div class="input-group">
                <mat-form-field appearance="outline" class="elite-field full">
                  <mat-label>Project Name</mat-label>
                  <mat-icon matPrefix>edit_note</mat-icon>
                  <input matInput formControlName="projectName" required placeholder="What are we building?">
                </mat-form-field>
              </div>

              <div class="input-grid">
                <mat-form-field appearance="outline" class="elite-field">
                  <mat-label>Department</mat-label>
                  <mat-icon matPrefix>category</mat-icon>
                  <mat-select formControlName="department" required>
                    <mat-option value="Environment"><mat-icon color="primary">eco</mat-icon> Environment</mat-option>
                    <mat-option value="Education"><mat-icon color="primary">school</mat-icon> Education</mat-option>
                    <mat-option value="Healthcare"><mat-icon color="warn">local_hospital</mat-icon> Healthcare</mat-option>
                    <mat-option value="Community"><mat-icon color="accent">groups</mat-icon> Community</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="elite-field">
                  <mat-label>Initial Status</mat-label>
                  <mat-select formControlName="status" required>
                    <mat-option value="Planned">Planned</mat-option>
                    <mat-option value="Ongoing">Ongoing</mat-option>
                    <mat-option value="Completed">Completed</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="elite-field full">
                <mat-label>Mission Description</mat-label>
                <textarea matInput formControlName="description" rows="4" placeholder="Briefly describe the mission..."></textarea>
              </mat-form-field>
            </div>

            <!-- Step 2: Resources -->
            <div class="step-content" *ngIf="currentStep() === 2">
              <div class="resource-layout">
                <div class="input-group">
                  <mat-form-field appearance="outline" class="elite-field full">
                    <mat-label>Total Budget (₹)</mat-label>
                    <mat-icon matPrefix>payments</mat-icon>
                    <input matInput type="number" formControlName="budget" required>
                  </mat-form-field>
                  <div class="elite-quick-btns">
                    <button type="button" (click)="setBudget(50000)">50k</button>
                    <button type="button" (click)="setBudget(100000)">1L</button>
                    <button type="button" (click)="setBudget(500000)">5L</button>
                  </div>
                </div>

                <div class="input-grid">
                  <mat-form-field appearance="outline" class="elite-field">
                    <mat-label>Used Budget</mat-label>
                    <mat-icon matPrefix>account_balance_wallet</mat-icon>
                    <input matInput type="number" formControlName="usedBudget" required>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="elite-field">
                    <mat-label>Capacity (Seats)</mat-label>
                    <mat-icon matPrefix>groups</mat-icon>
                    <input matInput type="number" formControlName="seats" required>
                  </mat-form-field>
                </div>

                <div class="budget-analysis-card">
                  <div class="analysis-row">
                    <span>Remaining Budget</span>
                    <strong [style.color]="remainingBudget() < 0 ? '#ef4444' : '#10b981'">₹{{ remainingBudget() | number }}</strong>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" [style.width]="getBudgetUsage() + '%'" [style.background]="remainingBudget() < 0 ? '#ef4444' : '#0ea5e9'"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Timeline -->
            <div class="step-content" *ngIf="currentStep() === 3">
              <div class="input-grid">
                <mat-form-field appearance="outline" class="elite-field">
                  <mat-label>Start Date</mat-label>
                  <input matInput [matDatepicker]="sp" formControlName="startDate" required>
                  <mat-datepicker-toggle matSuffix [for]="sp"></mat-datepicker-toggle>
                  <mat-datepicker #sp></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="elite-field">
                  <mat-label>End Date</mat-label>
                  <input matInput [matDatepicker]="ep" formControlName="endDate" required>
                  <mat-datepicker-toggle matSuffix [for]="ep"></mat-datepicker-toggle>
                  <mat-datepicker #ep></mat-datepicker>
                </mat-form-field>
              </div>

              <div class="date-presets">
                <button type="button" class="preset-pill" (click)="setDates('week')">This Week</button>
                <button type="button" class="preset-pill" (click)="setDates('30')">+30 Days</button>
                <button type="button" class="preset-pill" (click)="setDates('quarter')">Next Quarter</button>
              </div>

              <div class="finalize-cta">
                <mat-icon>auto_awesome</mat-icon>
                <p>Everything looks good. Ready to launch this initiative?</p>
              </div>
            </div>
          </form>

          <footer class="wizard-footer">
            <button mat-button *ngIf="currentStep() > 1" (click)="prev()">Back</button>
            <div class="spacer"></div>
            <button mat-flat-button color="primary" class="next-btn" *ngIf="currentStep() < 3" (click)="next()" [disabled]="!isStepValid()">
              Continue <mat-icon>arrow_forward</mat-icon>
            </button>
            <button mat-flat-button color="warn" class="launch-btn" *ngIf="currentStep() === 3" (click)="save()" [disabled]="form.invalid">
              <mat-icon>rocket</mat-icon> Launch Project
            </button>
          </footer>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .elite-wizard-shell {
      position: relative; width: 900px; max-width: 95vw; min-height: 550px;
      padding: 20px; box-sizing: border-box; font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    /* Glass Effects */
    .glass-morphism {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 30px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
      display: flex; height: 100%; overflow: hidden;
    }

    .glass-blob-1 { position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, #0ea5e955 0%, transparent 70%); top: -100px; left: -100px; z-index: -1; pointer-events: none; }
    .glass-blob-2 { position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, #8b5cf633 0%, transparent 70%); bottom: -100px; right: -100px; z-index: -1; pointer-events: none; }

    /* Sidebar */
    .wizard-sidebar {
      width: 280px; background: rgba(15, 23, 42, 0.03); border-right: 1px solid rgba(0, 0, 0, 0.05);
      padding: 40px 30px; display: flex; flex-direction: column; gap: 40px;
    }
    .sidebar-header { display: flex; align-items: center; gap: 15px; }
    .sidebar-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
    .sidebar-header p { margin: 0; font-size: 0.85rem; color: #64748b; }
    .pulse-icon { color: #0ea5e9; font-size: 32px; width: 32px; height: 32px; animation: icon-pulse 2s infinite; }
    @keyframes icon-pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }

    .step-nav { display: flex; flex-direction: column; gap: 20px; }
    .nav-item { display: flex; align-items: center; gap: 12px; color: #94a3b8; font-weight: 600; font-size: 0.95rem; transition: 0.3s; }
    .step-num { width: 28px; height: 28px; border-radius: 50%; border: 2px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
    .nav-item.active { color: #0ea5e9; }
    .nav-item.done { color: #10b981; }
    .nav-item.done .step-num { background: #10b981; border-color: #10b981; color: white; }

    /* Preview Card */
    .preview-section label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.1em; display: block; margin-bottom: 15px; }
    .preview-project-card {
      background: white; border-radius: 16px; padding: 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.05);
      border-left: 5px solid #e2e8f0; transition: 0.4s; transform: rotate(-2deg);
    }
    .p-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .p-header mat-icon { font-size: 16px; width: 16px; height: 16px; color: #64748b; }
    .p-dept { font-size: 0.75rem; color: #64748b; font-weight: 600; }
    .p-name { font-size: 0.9rem; font-weight: 800; color: #0f172a; margin-bottom: 10px; min-height: 2.4em; }
    .p-budget { font-size: 0.8rem; font-weight: 700; color: #0ea5e9; margin-bottom: 8px; }
    .p-status { font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 99px; display: inline-block; background: #f1f5f9; }
    .p-status.ongoing { background: #10b98122; color: #10b981; }

    /* Form Area */
    .wizard-form-area { flex: 1; padding: 40px; display: flex; flex-direction: column; }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .form-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #0f172a; }
    .wizard-form-body { flex: 1; }
    
    .elite-field { margin-bottom: 5px; }
    .elite-field.full { width: 100%; }
    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .elite-quick-btns { display: flex; gap: 10px; margin-top: -5px; margin-bottom: 15px; }
    .elite-quick-btns button { 
      background: white; border: 1px solid #e2e8f0; padding: 4px 12px; font-size: 0.75rem; 
      font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.2s;
    }
    .elite-quick-btns button:hover { border-color: #0ea5e9; color: #0ea5e9; background: #f0f9ff; }

    .budget-analysis-card { background: #f8fafc; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0; margin-top: 20px; }
    .analysis-row { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; }
    .progress-track { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

    .date-presets { display: flex; gap: 10px; margin-top: 15px; }
    .preset-pill { background: #f1f5f9; border: none; padding: 6px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
    .preset-pill:hover { background: #0ea5e9; color: white; }

    .finalize-cta { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 15px; padding: 30px; border: 2px dashed #cbd5e1; border-radius: 20px; color: #64748b; margin-top: 20px; }
    .finalize-cta mat-icon { font-size: 40px; width: 40px; height: 40px; color: #8b5cf6; }

    .wizard-footer { display: flex; align-items: center; margin-top: 30px; }
    .next-btn, .launch-btn { border-radius: 12px; padding: 10px 24px; font-weight: 700; }
    .launch-btn { background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important; color: white !important; }

    /* Layout overrides for mat-dialog */
    .mat-mdc-dialog-container .mdc-dialog__surface { background: transparent !important; box-shadow: none !important; }
    .mat-mdc-dialog-content { padding: 0 !important; max-height: unset !important; }
  `]
})
export class AddProjectDialogComponent {
  form: FormGroup;
  currentStep = signal(1);

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private dialogRef: MatDialogRef<AddProjectDialogComponent>
  ) {
    this.form = this.fb.group({
      projectName: ['', Validators.required],
      department: ['', Validators.required],
      budget: [0, [Validators.required, Validators.min(0)]],
      usedBudget: [0, [Validators.required, Validators.min(0)]],
      seats: [0, [Validators.required, Validators.min(0)]],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      status: ['Planned', Validators.required],
      description: ['']
    });
  }

  getStepTitle() {
    if (this.currentStep() === 1) return 'Project Identity';
    if (this.currentStep() === 2) return 'Resource Allocation';
    return 'Finalize Launch';
  }

  isStepValid() {
    if (this.currentStep() === 1) return this.form.get('projectName')?.valid && this.form.get('department')?.valid;
    if (this.currentStep() === 2) return this.form.get('budget')?.valid && this.form.get('usedBudget')?.valid && this.form.get('seats')?.valid;
    return this.form.valid;
  }

  next() { if (this.isStepValid()) this.currentStep.update(s => s + 1); }
  prev() { if (this.currentStep() > 1) this.currentStep.update(s => s - 1); }

  remainingBudget() {
    return (this.form.get('budget')?.value || 0) - (this.form.get('usedBudget')?.value || 0);
  }

  getBudgetUsage() {
    const total = this.form.get('budget')?.value || 1;
    const used = this.form.get('usedBudget')?.value || 0;
    return Math.min(100, (used / total) * 100);
  }

  getDeptColor() {
    const d = (this.form.get('department')?.value || '').toLowerCase();
    if (d.includes('environ')) return '#10b981';
    if (d.includes('educ')) return '#0ea5e9';
    if (d.includes('health')) return '#ef4444';
    if (d.includes('communit')) return '#f59e0b';
    return '#cbd5e1';
  }

  getDeptIcon() {
    const d = (this.form.get('department')?.value || '').toLowerCase();
    if (d.includes('environ')) return 'eco';
    if (d.includes('educ')) return 'school';
    if (d.includes('health')) return 'local_hospital';
    if (d.includes('communit')) return 'groups';
    return 'help_outline';
  }

  setBudget(amount: number) { this.form.patchValue({ budget: amount }); }

  setDates(preset: string) {
    const start = new Date();
    const end = new Date();
    if (preset === 'week') end.setDate(start.getDate() + 7);
    else if (preset === '30') end.setDate(start.getDate() + 30);
    else if (preset === 'quarter') end.setMonth(start.getMonth() + 3);
    this.form.patchValue({ startDate: start, endDate: end });
  }

  save() {
    if (this.form.valid) {
      const val = this.form.value;
      const projectData: Omit<Project, 'id'> = {
        ...val,
        location: '',
        startDate: val.startDate ? (val.startDate instanceof Date ? val.startDate.toISOString().split('T')[0] : val.startDate) : '',
        endDate: val.endDate ? (val.endDate instanceof Date ? val.endDate.toISOString().split('T')[0] : val.endDate) : '',
        latitude: 0,
        longitude: 0
      };
      const newProject = this.projectsService.add(projectData);
      this.dialogRef.close(newProject);
    }
  }
}


