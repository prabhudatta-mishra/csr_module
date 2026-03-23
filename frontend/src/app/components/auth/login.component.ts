import { Component, HostListener, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmployeesService } from '../../employees.service';
import { AuthService } from '../../auth.service';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import { actionCodeSettings } from '../../../environments/firebase';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatSnackBarModule, MatDialogModule],
  template: `
    <div class="login-layout">
      <!-- Left side: Brand/Visual -->
      <div class="brand-panel">
        <div class="brand-content animate-fade-in-up stagger-1">
          <div class="logo-circle">
            <mat-icon class="logo-icon">public</mat-icon>
          </div>
          <h1>CSR Hub Pro</h1>
          <p class="tagline">Empowering change through streamlined corporate social responsibility management.</p>
          
          <div class="features stagger-2">
            <div class="feature-item">
              <mat-icon>trending_up</mat-icon>
              <span>Track impact metrics in real-time</span>
            </div>
            <div class="feature-item">
              <mat-icon>groups</mat-icon>
              <span>Manage volunteer networks easily</span>
            </div>
            <div class="feature-item">
              <mat-icon>account_balance_wallet</mat-icon>
              <span>Optimize budget allocations</span>
            </div>
          </div>
        </div>
        <div class="mesh-bg"></div>
      </div>

      <!-- Right side: Login Form -->
      <div class="form-panel">
        <div class="form-container animate-fade-in-up stagger-2">
          
          <div class="form-header">
            <h2>{{ isSignUp() ? 'Create an Account' : 'Welcome Back' }}</h2>
            <p>{{ isSignUp() ? 'Fill in your details to join.' : 'Please enter your details to sign in.' }}</p>
          </div>

          <div class="mode-selector stagger-3">
            <button 
              class="mode-btn" 
              [class.active]="mode() === 'employee'" 
              (click)="setMode('employee')">
              <mat-icon>person</mat-icon>
              Employee
            </button>
            <button 
              class="mode-btn volunteer" 
              [class.active]="mode() === 'volunteer'" 
              (click)="setMode('volunteer')">
              <mat-icon>volunteer_activism</mat-icon>
              Volunteer
            </button>
            <button 
              class="mode-btn admin" 
              [class.active]="mode() === 'admin'" 
              (click)="setMode('admin')">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin
            </button>
          </div>

          <iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>
          <form #loginFormEl id="loginForm" target="dummyframe" [formGroup]="form" (ngSubmit)="submit()" class="login-form stagger-4" action="/" method="post">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ isSignUp() ? 'Username' : 'Username or Email' }}</mat-label>
              <mat-icon matPrefix>account_circle</mat-icon>
              <input matInput formControlName="username" required placeholder="Enter username or email" id="username" name="username" autocomplete="username">
              <mat-hint *ngIf="form.controls['username'].invalid && form.controls['username'].touched">Username is required</mat-hint>
            </mat-form-field>

            <ng-container *ngIf="isSignUp() && (mode() === 'employee' || mode() === 'volunteer')">
              <div class="flex-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Full name</mat-label>
                  <input matInput formControlName="name" id="name" name="name" autocomplete="name">
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Profession</mat-label>
                  <input matInput formControlName="profession" placeholder="e.g. Engineer">
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email address</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput type="email" formControlName="email" id="email" name="email" autocomplete="email">
              </mat-form-field>
            </ng-container>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" (keyup)="onPasswordKey($event)" required id="password" name="password" [attr.autocomplete]="isSignUp() ? 'new-password' : 'current-password'">
              <button mat-icon-button matSuffix type="button" (click)="toggleShowPassword()" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint *ngIf="capsLock()" class="warn">Caps Lock is ON</mat-hint>
            </mat-form-field>

            <!-- Strength meter -->
            <div class="strength" *ngIf="form.controls['password'].value as pw">
              <div class="bar" [class.on]="strength()>=1"></div>
              <div class="bar" [class.on]="strength()>=2"></div>
              <div class="bar" [class.on]="strength()>=3"></div>
              <div class="bar" [class.on]="strength()>=4"></div>
              <span class="label">{{ strengthLabel() }}</span>
            </div>

            <!-- Admin logic hardcoded below -->

            <!-- Removed Volunteer PIN field as requested -->

            <div class="error" *ngIf="error()">
              <mat-icon>error_outline</mat-icon>
              {{ error() }}
            </div>

             <div class="form-options">
              <mat-checkbox formControlName="remember" color="primary">Remember me</mat-checkbox>
              <a href="#" class="forgot-link" (click)="prevent($event)">Forgot password?</a>
            </div>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="submit-btn hover-pop stagger-5"
              [disabled]="form.invalid || cooldown() > 0">
              {{ cooldown() > 0 ? 'Retry in ' + cooldown() + 's' : (isSignUp() ? 'Sign Up As ' : 'Sign In To ') + modeLabel() }}
              <mat-icon *ngIf="cooldown() === 0">arrow_forward</mat-icon>
            </button>
            
            <div class="toggle-mode-link stagger-5" *ngIf="mode() !== 'admin'">
              <span class="text-muted">{{ isSignUp() ? 'Already have an account?' : 'Don\\'t have an account?' }}</span>
              <a href="#" class="action-link" (click)="toggleSignUp($event)">
                {{ isSignUp() ? 'Log in' : 'Sign up' }}
              </a>
            </div>
            
            <button 
              *ngIf="mode() === 'employee'"  
              mat-stroked-button 
              color="primary" 
              type="button" 
              class="magic-link-btn hover-pop stagger-5"
              (click)="sendMagicLink()">
              <mat-icon>mark_email_read</mat-icon>
              Sign in with Email Link
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Full-Screen Split Layout ===== */
    :host { display: block; height: 100vh; width: 100vw; overflow: hidden; }

    .login-layout {
      display: flex; height: 100%; width: 100%;
    }

    /* ===== Left Brand Panel ===== */
    .brand-panel {
      flex: 1; position: relative; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0ea5e9 100%);
      color: white; overflow: hidden; padding: 3rem;
    }
    .mesh-bg {
      position: absolute; inset: 0;
      background: radial-gradient(circle at 30% 70%, rgba(14,165,233,0.25) 0%, transparent 50%),
                  radial-gradient(circle at 70% 30%, rgba(99,102,241,0.2) 0%, transparent 50%);
      pointer-events: none;
    }
    .brand-content { position: relative; z-index: 1; max-width: 420px; }
    .logo-circle {
      width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
      margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.2);
    }
    .logo-icon { font-size: 36px !important; width: 36px !important; height: 36px !important; color: white; }
    .brand-content h1 {
      font-size: 2.75rem; font-weight: 800; margin: 0 0 0.75rem 0; letter-spacing: -0.03em; line-height: 1.1;
    }
    .tagline { font-size: 1.15rem; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 2.5rem 0; }
    .features { display: flex; flex-direction: column; gap: 1rem; }
    .feature-item {
      display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; font-weight: 500;
      color: rgba(255,255,255,0.85); padding: 0.6rem 1rem; border-radius: 12px;
      background: rgba(255,255,255,0.08); backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease;
    }
    .feature-item:hover { background: rgba(255,255,255,0.15); transform: translateX(4px); }
    .feature-item mat-icon { font-size: 22px; width: 22px; height: 22px; color: #38bdf8; }

    /* ===== Right Form Panel ===== */
    .form-panel {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: #f8fafc; padding: 3rem; overflow-y: auto;
    }
    :host-context(.dark-theme) .form-panel { background: #0f172a; }

    .form-container { width: 100%; max-width: 440px; }

    .form-header h2 {
      font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem 0; letter-spacing: -0.02em;
    }
    .form-header p { color: #64748b; font-size: 1.05rem; margin: 0 0 2rem 0; }
    :host-context(.dark-theme) .form-header h2 { color: #f8fafc; }
    :host-context(.dark-theme) .form-header p { color: #94a3b8; }

    /* ===== Mode Selector Tabs ===== */
    .mode-selector {
      display: flex; gap: 0.75rem; margin-bottom: 2rem;
    }
    .mode-btn {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 12px;
      background: transparent; color: #64748b; font-weight: 600; font-size: 0.95rem;
      cursor: pointer; transition: all 0.3s ease;
    }
    .mode-btn:hover { border-color: #94a3b8; color: #334155; }
    .mode-btn.active {
      border-color: #0ea5e9; color: #0ea5e9; background: rgba(14,165,233,0.05);
    }
    .mode-btn.admin.active {
      border-color: #8b5cf6; color: #8b5cf6; background: rgba(139,92,246,0.05);
    }
    .mode-btn.volunteer.active {
      border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.05);
    }
    :host-context(.dark-theme) .mode-btn { border-color: #334155; color: #94a3b8; }
    :host-context(.dark-theme) .mode-btn:hover { border-color: #64748b; color: #e2e8f0; }
    :host-context(.dark-theme) .mode-btn.active { border-color: #0ea5e9; color: #38bdf8; background: rgba(14,165,233,0.1); }
    :host-context(.dark-theme) .mode-btn.admin.active { border-color: #8b5cf6; color: #a78bfa; background: rgba(139,92,246,0.1); }
    :host-context(.dark-theme) .mode-btn.volunteer.active { border-color: #10b981; color: #34d399; background: rgba(16,185,129,0.1); }
    .mode-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }

    /* ===== Form Fields ===== */
    .login-form { display: flex; flex-direction: column; }
    .full-width { width: 100%; }
    .half-width { flex: 1; }
    .flex-row { display: flex; gap: 1rem; }

    /* ===== Error Alert ===== */
    .error {
      background: #fee2e2; color: #b91c1c; padding: 0.75rem 1rem; border-radius: 8px;
      display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem;
    }
    :host-context(.dark-theme) .error { background: rgba(185, 28, 28, 0.2); color: #fca5a5; }

    /* ===== Password Strength Meter ===== */
    .strength { display: flex; gap: 4px; align-items: center; padding: 0 4px; margin-bottom: 1.5rem; margin-top: -0.5rem; }
    .bar { height: 4px; flex: 1; background: #e2e8f0; border-radius: 2px; transition: 0.3s; }
    :host-context(.dark-theme) .bar { background: #334155; }
    .bar.on { background: #10b981; }
    .label { font-size: 11px; color: #64748b; margin-left: 8px; width: 60px; text-align: right; }
    .warn { color: #f59e0b; }

    /* ===== Form Options Row ===== */
    .form-options {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
    }
    .forgot-link {
      color: #0ea5e9; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s;
    }
    .forgot-link:hover { color: #0284c7; text-decoration: underline; }

    /* ===== Submit Button ===== */
    .submit-btn {
      width: 100%; padding: 0.85rem !important; font-size: 1.05rem !important; font-weight: 700 !important;
      border-radius: 12px !important; letter-spacing: 0.02em;
      display: flex !important; align-items: center; justify-content: center; gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .toggle-mode-link {
      text-align: center; margin-bottom: 1rem; font-size: 0.9rem;
    }
    .text-muted { color: #64748b; margin-right: 0.5rem; }
    .action-link { color: #0ea5e9; font-weight: 700; text-decoration: none; transition: color 0.2s; }
    .action-link:hover { color: #0284c7; text-decoration: underline; }
    
    .magic-link-btn {
      width: 100%; padding: 0.75rem !important; font-size: 0.95rem !important; font-weight: 600 !important;
      border-radius: 12px !important;
      display: flex !important; align-items: center; justify-content: center; gap: 0.5rem;
    }

    .admin-pin mat-hint { color: #64748b; font-size: 0.8rem; }

    /* ===== Responsive ===== */
    @media (max-width: 900px) {
      .login-layout { flex-direction: column; }
      .brand-panel { flex: none; padding: 2rem; min-height: auto; }
      .brand-content h1 { font-size: 1.75rem; }
      .tagline { font-size: 0.95rem; margin-bottom: 1.5rem; }
      .features { gap: 0.5rem; }
      .feature-item { padding: 0.4rem 0.75rem; font-size: 0.85rem; }
      .form-panel { padding: 2rem 1.5rem; }
    }
  `]
})
export class LoginComponent {
  @ViewChild('loginFormEl') loginFormEl!: ElementRef<HTMLFormElement>;

  form: FormGroup;
  mode = signal<'admin'|'employee'|'volunteer'>(localStorage.getItem('auth.mode') === 'volunteer' ? 'volunteer' : localStorage.getItem('auth.mode') === 'employee' ? 'employee' : 'admin');
  isSignUp = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  capsLock = signal<boolean>(false);
  error = signal<string>('');
  strength = signal<number>(0);
  private fails = 0;
  cooldown = signal<number>(0);
  private cooldownTimer?: any;

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly router: Router, private readonly employees: EmployeesService, private readonly snack: MatSnackBar, private readonly dialog: MatDialog) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      // extra fields for user mode
      name: [''],
      email: [''],
      profession: [''],
      remember: [localStorage.getItem('login.remember') === '1']
    });
    // Apply validators according to initial mode (default admin)
    this.applyModeValidators();
    // Prefill remembered values
    if (this.form.controls['remember'].value) {
      const rememberedUsername = localStorage.getItem('login.username') || '';
      const rememberedEmail = localStorage.getItem('login.email') || '';
      if (rememberedUsername) this.form.controls['username'].setValue(rememberedUsername);
      if (rememberedEmail) this.form.controls['email'].setValue(rememberedEmail);
    }
    // Strength meter subscribe
    this.form.controls['password'].valueChanges.subscribe((pw: string) => {
      this.strength.set(this.computeStrength(pw || ''));
    });
  }

  setMode(m: 'admin'|'employee'|'volunteer') {
    this.mode.set(m);
    localStorage.setItem('auth.mode', m);
    this.applyModeValidators();
  }

  toggleSignUp(e: Event) {
    e.preventDefault();
    this.isSignUp.set(!this.isSignUp());
    this.applyModeValidators();
  }

  private applyModeValidators() {
    const m = this.mode();
    const signup = this.isSignUp();
    const name = this.form.controls['name'];
    const email = this.form.controls['email'];
    const profession = this.form.controls['profession'];
    if (signup && (m === 'employee' || m === 'volunteer')) {
      name.setValidators([Validators.required]);
      email.setValidators([Validators.required, Validators.email]);
      profession.setValidators([Validators.required]);
    } else {
      name.clearValidators();
      email.clearValidators();
      profession.clearValidators();
      name.setValue(name.value || '');
      email.setValue(email.value || '');
      profession.setValue(profession.value || '');
    }
    name.updateValueAndValidity();
    email.updateValueAndValidity();
    profession.updateValueAndValidity();
  }
  modeLabel() {
    return this.mode() === 'admin' ? 'Admin Dashboard' : this.mode() === 'volunteer' ? 'Volunteer Dashboard' : 'Dashboard';
  }
  toggleShowPassword() { this.showPassword.update(v => !v); }
  onPasswordKey(e: KeyboardEvent) { this.capsLock.set(e.getModifierState && e.getModifierState('CapsLock')); }
  strengthLabel() {
    const s = this.strength();
    return s <= 1 ? 'Weak' : s === 2 ? 'Fair' : s === 3 ? 'Good' : 'Strong';
  }
  private computeStrength(pw: string) {
    let s = 0;
    if (pw.length >= 6) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 10) s++;
    return Math.min(4, s);
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent) {
    // Only allow mode switching with Ctrl/Cmd to avoid toggling while typing PIN
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key === '1') { e.preventDefault(); this.setMode('employee'); }
    if (mod && e.key === '2') { e.preventDefault(); this.setMode('admin'); }
    if (e.key === 'Enter' && !this.form.invalid && this.cooldown() === 0) this.submit();
  }

  async submit() {
    this.error.set('');
    const { username, password } = this.form.getRawValue();

    if (this.mode() === 'admin') {
      if (username !== 'prabhu' || password !== '1234') {
        this.onFail('Invalid admin credentials. Username must be prabhu and password 1234.');
        return;
      }
    }
    const role = this.mode();
    localStorage.setItem('auth.mode', role);
    let profile: any = undefined;

    if (role === 'employee' || role === 'volunteer') {
      if (this.isSignUp()) {
        profile = {
          name: this.form.controls['name'].value as string,
          email: this.form.controls['email'].value as string,
          profession: this.form.controls['profession'].value as string,
        };
        if (!profile.name || !profile.email || !profile.profession || this.form.controls['email'].invalid) {
          this.onFail('Please fill name, valid email, and profession to complete sign up');
          return;
        }
      } else {
        // Find existing employee profile using username (treat username as email or name)
        const qs = username!.toLowerCase();
        const expectedRole = role === 'volunteer' ? 'Volunteer' : 'Employee';
        let existing = this.employees.employees().find(e => 
          (e.role === expectedRole || !e.role) && 
          (e.email.toLowerCase() === qs || e.name.toLowerCase() === qs)
        );
        
        if (existing) {
           profile = { name: existing.name, email: existing.email, profession: existing.department || 'General' };
        } else {
           this.onFail(`Account not found or incorrect role selected. Please sign up or try again.`);
           return;
        }
      }
    }

    if (await this.auth.login(username!, password!, role, profile)) {
      // remember me
      if (this.form.controls['remember'].value) {
        localStorage.setItem('login.remember', '1');
        localStorage.setItem('login.username', String(username || ''));
        if (profile?.email) localStorage.setItem('login.email', String(profile.email));
      } else {
        localStorage.removeItem('login.remember');
        localStorage.removeItem('login.username');
        localStorage.removeItem('login.email');
      }
      // Ensure user exists in Roster with the correct role
      if ((role === 'employee' || role === 'volunteer') && profile) {
        this.employees.addOrGet({ 
          name: profile.name, 
          email: profile.email, 
          profession: profile.profession,
          role: role === 'volunteer' ? 'Volunteer' : 'Employee'
        });
      }
      
      const proceed = () => {
        if (role === 'admin') this.router.navigateByUrl('/dashboard');
        else if (role === 'volunteer') this.router.navigateByUrl('/volunteer-dashboard');
        else this.router.navigateByUrl('/events');
        this.fails = 0; this.cooldown.set(0); if (this.cooldownTimer) { clearInterval(this.cooldownTimer); this.cooldownTimer = undefined; }
      };

      // Force a native browser form submission into the hidden iframe 
      // This is the most reliable way to trigger the browser's "Save Password" prompt in SPAs
      if (this.loginFormEl?.nativeElement) {
        this.loginFormEl.nativeElement.submit();
      }

      // Small delay to allow the native post to register before Angular destroys the component and navigates away
      setTimeout(() => proceed(), 50);
    } else {
      this.onFail('Login failed');
    }
  }

  private onFail(msg: string) {
    this.error.set(msg);
    this.fails++;
    if (this.fails >= 3 && this.cooldown() === 0) {
      let left = 10;
      this.cooldown.set(left);
      this.cooldownTimer = setInterval(() => {
        left -= 1; this.cooldown.set(left);
        if (left <= 0) { clearInterval(this.cooldownTimer); this.cooldownTimer = undefined; this.cooldown.set(0); this.fails = 0; }
      }, 1000);
    }
  }

  async sendMagicLink() {
    try {
      if (this.mode() !== 'employee') return;
      const emailCtrl = this.form.controls['email'];
      const nameCtrl = this.form.controls['name'];
      const usernameCtrl = this.form.controls['username'];
      const professionCtrl = this.form.controls['profession'];
      emailCtrl.markAsTouched();
      if (emailCtrl.invalid) { this.error.set('Enter a valid email first'); return; }
      const email = String(emailCtrl.value || '').trim();
      const auth = getAuth();
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('pendingEmail', email);
      if (nameCtrl.value) window.localStorage.setItem('pendingName', String(nameCtrl.value));
      if (usernameCtrl.value) window.localStorage.setItem('pendingUsername', String(usernameCtrl.value));
      if (professionCtrl.value) window.localStorage.setItem('pendingProfession', String(professionCtrl.value));
      this.error.set('');
      this.snack.open('Verification link sent. Check your email.', 'OK', { duration: 3000 });
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to send link');
    }
  }

  prevent(e: Event) {
    e.preventDefault();
  }
}
