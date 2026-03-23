import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { AuthService } from '../../auth.service';
import { EmployeesService } from '../../employees.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="wrap">
      <mat-card appearance="outlined">
        <mat-card-title>Email Verification</mat-card-title>
        <mat-card-content>
          <div *ngIf="state==='working'" class="center">
            <mat-spinner diameter="36"></mat-spinner>
            <p>Completing sign-in...</p>
          </div>
          <div *ngIf="state==='needEmail'">
            <p>For security, please re-enter your email to finish sign-in.</p>
            <div class="row">
              <input class="input" type="email" [(ngModel)]="email" placeholder="you@example.com" />
              <button mat-raised-button color="primary" (click)="finish()">Continue</button>
            </div>
          </div>
          <div *ngIf="state==='error'">
            <p class="err">{{ error }}</p>
            <button mat-stroked-button color="primary" (click)="goLogin()">Back to login</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .wrap { min-height: 60vh; display: grid; place-items: center; padding: 1rem; }
    .center { display: grid; place-items: center; gap: .5rem; }
    .row { display: flex; gap: .5rem; align-items: center; }
    .input { padding: .5rem .75rem; border: 1px solid rgba(0,0,0,.2); border-radius: 6px; min-width: 240px; }
    .err { color: #b91c1c; }
  `]
})
export class VerifyComponent implements OnInit {
  state: 'working' | 'needEmail' | 'error' = 'working';
  email = '';
  error = '';

  constructor(
    private readonly router: Router,
    private readonly authSvc: AuthService,
    private readonly employees: EmployeesService,
    private readonly notifications: NotificationService
  ) {}

  ngOnInit(): void {
    const stored = window.localStorage.getItem('pendingEmail');
    if (stored) this.email = stored;
    this.finish();
  }

  async finish() {
    try {
      const auth = getAuth();
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        this.state = 'error';
        this.error = 'Invalid or expired link.';
        return;
      }
      if (!this.email) {
        this.state = 'needEmail';
        return;
      }
      await signInWithEmailLink(auth, this.email, window.location.href);
      window.localStorage.removeItem('pendingEmail');
      const pendingName = window.localStorage.getItem('pendingName') || '';
      const pendingUsername = window.localStorage.getItem('pendingUsername') || '';
      const pendingProfession = window.localStorage.getItem('pendingProfession') || '';
      // Mark logged in & verified in local auth
      this.authSvc.loginWithEmail({ email: this.email, name: pendingName });
      // Ensure employee exists and notify admin
      const emp = this.employees.addOrGet({ name: pendingName || this.email.split('@')[0], email: this.email });
      this.notifications.push(`${emp.name || this.email} verified email and signed in`);
      // Persist to Spring Boot (MySQL upsert)
      try {
        await fetch('http://localhost:8080/api/users/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: pendingName || emp.name,
            username: pendingUsername || undefined,
            profession: pendingProfession || undefined,
            email: this.email,
            verifiedAt: new Date().toISOString()
          })
        });
      } catch {}
      // Go to events
      this.router.navigateByUrl('/events');
    } catch (e: any) {
      this.state = 'error';
      this.error = e?.message || 'Verification failed';
    }
  }

  goLogin() { this.router.navigateByUrl('/login'); }
}
