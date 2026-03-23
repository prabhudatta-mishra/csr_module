import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommandPaletteComponent } from './components/shared/command-palette.component';
import { NotificationPanelComponent } from './components/shared/notification-panel.component';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterOutlet,
    MatDialogModule,
  ],
  template: `
    <!-- Show either login page OR authenticated app - completely separate -->
    <router-outlet />
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .layout { height: 100vh; }
    .toolbar { position: sticky; top: 0; z-index: 2; }
    .sidenav { width: 240px; }
    .brand { font-weight: 600; padding: 1rem; }
    .content { padding: 1rem; }
    a.active { background: rgba(0,0,0,0.06); }
    @media (max-width: 960px) { .sidenav { width: 200px; } }
    .spacer { flex: 1 1 auto; }
    .toolbar .notif { position: relative; }
    .toolbar .notif .badge { position: absolute; top: 0; right: 0; transform: translate(30%, -30%); background: #ef4444; color: white; border-radius: 9999px; font-size: 10px; padding: 0 6px; line-height: 16px; }
    .search-field { width: 280px; margin-right: .5rem; }
  `]
})
export class App {
  protected readonly title = signal('csr-module');
  protected readonly dark = signal<boolean>(false);
  protected search = '';

  constructor(
    private readonly dialog: MatDialog, 
    public readonly notifications: NotificationService, 
    private readonly router: Router, 
    public readonly auth: AuthService
  ) {
    const saved = localStorage.getItem('theme.dark') === '1';
    this.dark.set(saved);
    this.applyTheme();
    window.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
    });
  }

  toggleTheme() {
    this.dark.update(v => !v);
    localStorage.setItem('theme.dark', this.dark() ? '1' : '0');
    this.applyTheme();
  }

  private applyTheme() {
    const cls = 'dark-theme';
    if (this.dark()) document.body.classList.add(cls); else document.body.classList.remove(cls);
  }

  private openCommandPalette() {
    this.dialog.open(CommandPaletteComponent, {
      width: '640px',
      data: { toggleTheme: () => this.toggleTheme() }
    }).afterClosed().subscribe((result) => {
      if (result === 'add-project') {
        // Navigate to projects; the Projects page handles the dialog
      }
    });
  }

  openNotifications() {
    this.dialog.open(NotificationPanelComponent, { width: '620px' });
  }

  submitSearch() {
    const q = (this.search || '').trim();
    if (!q) return;
    this.router.navigate(['/projects'], { queryParams: { q } });
  }

  logout() {
    this.auth.logout();
    // Don't redirect to login, just clear auth state
    // The router will automatically show login page when user tries to navigate
  }
}
