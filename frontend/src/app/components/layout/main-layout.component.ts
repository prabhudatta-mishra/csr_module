import { Component, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { RouterOutlet } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';
import { NotificationService } from '../../notification.service';
import { Router } from '@angular/router';
import { NotificationPanelComponent } from '../shared/notification-panel.component';
import { ProjectsService } from '../../projects.service';
import { EmployeesService } from '../../employees.service';

interface SearchResult {
  type: 'project' | 'employee' | 'volunteer';
  id: number;
  label: string;
  sub: string;
  icon: string;
  route: string[];
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    MatDialogModule
  ],
  template: `
    <mat-sidenav-container class="layout">
      <mat-sidenav #sidenav mode="side" [opened]="true" class="sidenav">
        <div class="brand">
          <mat-icon>corporate_fare</mat-icon>
          <span>CSR Module</span>
        </div>
        <mat-nav-list>
          <!-- Admin Navigation -->
          <ng-container *ngIf="auth.isAdmin()">
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/projects" routerLinkActive="active" class="nav-item">
              <mat-icon>work</mat-icon>
              <span>Projects</span>
            </a>
            <a mat-list-item routerLink="/projects/board" routerLinkActive="active" class="nav-item">
              <mat-icon>view_kanban</mat-icon>
              <span>Projects Board</span>
            </a>
            <a mat-list-item routerLink="/projects/grid" routerLinkActive="active" class="nav-item">
              <mat-icon>grid_view</mat-icon>
              <span>Projects Grid</span>
            </a>
            <a mat-list-item routerLink="/employees" routerLinkActive="active" class="nav-item">
              <mat-icon>badge</mat-icon>
              <span>Employees</span>
            </a>
            <a mat-list-item routerLink="/volunteers" routerLinkActive="active" class="nav-item">
              <mat-icon>volunteer_activism</mat-icon>
              <span>Volunteers</span>
            </a>
            <a mat-list-item routerLink="/assignments" routerLinkActive="active" class="nav-item">
              <mat-icon>assignment_ind</mat-icon>
              <span>Assignments</span>
            </a>
            <a mat-list-item routerLink="/reports" routerLinkActive="active" class="nav-item">
              <mat-icon>bar_chart</mat-icon>
              <span>Reports</span>
            </a>
          </ng-container>

          <!-- Employee Navigation -->
          <ng-container *ngIf="auth.isEmployee()">
            <a mat-list-item routerLink="/events" routerLinkActive="active" class="nav-item">
              <mat-icon>event</mat-icon>
              <span>CSR Events</span>
            </a>
            <a mat-list-item routerLink="/book-project" routerLinkActive="active" class="nav-item">
              <mat-icon>book</mat-icon>
              <span>Book Activity</span>
            </a>
            <a mat-list-item routerLink="/my-projects" routerLinkActive="active" class="nav-item">
              <mat-icon>folder_special</mat-icon>
              <span>My Bookings</span>
            </a>
          </ng-container>

          <!-- Volunteer Navigation -->
          <ng-container *ngIf="auth.isVolunteer()">
            <a mat-list-item routerLink="/volunteer-dashboard" routerLinkActive="active" class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>My Dashboard</span>
            </a>
          </ng-container>

          <mat-divider class="nav-divider"></mat-divider>
          <a mat-list-item routerLink="/login" routerLinkActive="active" class="nav-item logout-item">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-toggle" aria-label="Toggle sidenav">
            <mat-icon>menu_open</mat-icon>
          </button>
          
          <div class="toolbar-title">
            <div class="title-icon-wrapper">
              <mat-icon class="title-icon">corporate_fare</mat-icon>
            </div>
            <span class="gradient-text">{{ title() }}</span>
          </div>
          
          <span class="spacer"></span>
          
          <!-- Global Search Bar -->
          <div class="search-wrapper" [class.has-results]="showDropdown && searchResults().length > 0">
            <mat-icon class="search-icon">search</mat-icon>
            <input type="text"
                   class="premium-search-input"
                   [(ngModel)]="search"
                   (ngModelChange)="onSearchChange()"
                   (keyup.enter)="submitSearch()"
                   (focus)="dropdownOpen = true"
                   placeholder="Search projects, people, reports…"
                   autocomplete="off">
            <button *ngIf="search" class="search-clear-btn" type="button" (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
            <div class="search-kbd" *ngIf="!search">
              <span>⌘</span><span>K</span>
            </div>

            <!-- Dropdown Results -->
            <div class="search-dropdown" *ngIf="showDropdown && searchResults().length > 0">
              <ng-container *ngFor="let group of groupedResults()">
                <div class="search-group-label">
                  <mat-icon class="group-icon" [class]="'gi-' + group.type">{{ group.icon }}</mat-icon>
                  <span>{{ group.label }}</span>
                  <span class="group-count">{{ group.items.length }}</span>
                </div>
                <div
                  class="search-result-item"
                  *ngFor="let item of group.items"
                  (mousedown)="navigateTo(item)"
                >
                  <mat-icon class="result-icon" [class]="'ri-' + group.type">{{ item.icon }}</mat-icon>
                  <div class="result-text">
                    <span class="result-title" [innerHTML]="highlight(item.label)"></span>
                    <span class="result-sub">{{ item.sub }}</span>
                  </div>
                  <mat-icon class="result-arrow">chevron_right</mat-icon>
                </div>
              </ng-container>
            </div>

            <!-- No results -->
            <div class="search-dropdown search-empty" *ngIf="showDropdown && search.trim().length >= 2 && searchResults().length === 0">
              <mat-icon>search_off</mat-icon>
              <span>No results for "{{ search }}"</span>
            </div>
          </div>
          
          <div class="toolbar-actions">
            <button mat-icon-button (click)="openNotifications()" class="action-btn hover-pop wrapper-btn" aria-label="Notifications">
              <mat-icon>notifications_none</mat-icon>
              <span class="notification-badge" *ngIf="notifications.unreadCount()">
                {{ notifications.unreadCount() }}
              </span>
            </button>
            
            <button mat-icon-button (click)="toggleTheme()" class="action-btn hover-pop wrapper-btn" aria-label="Toggle Theme">
              <mat-icon>brightness_4</mat-icon>
            </button>
            
            <button mat-icon-button (click)="logout()" class="action-btn logout-btn hover-pop wrapper-btn" aria-label="Logout">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host { 
      display: block; 
      height: 100%; 
      background: #f8fafc;
    }
    
    .layout { 
      height: 100vh; 
      background-color: #f8fafc;
      background-image: 
        radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
        linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 100% 100%, 30px 30px, 30px 30px;
      transition: background 0.3s ease;
    }
    
    :host-context(.dark-theme) .layout {
      background-color: #0f172a;
      background-image: 
        radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    }
    
    .toolbar { 
      position: sticky; 
      top: 0; 
      z-index: 20; /* Ensure it stays above content */
      background: rgba(255, 255, 255, 0.7) !important;
      backdrop-filter: blur(20px) saturate(1.8);
      -webkit-backdrop-filter: blur(20px) saturate(1.8);
      border-bottom: 1px solid rgba(255, 255, 255, 0.5);
      color: #0f172a !important; /* Deep slate */
      padding: 0 24px;
      height: 72px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05); /* Soft premium shadow */
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    :host-context(.dark-theme) .toolbar {
      background: rgba(15, 23, 42, 0.7) !important; /* Slate 900 */
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: #f8fafc !important; /* Slate 50 */
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    }
    
    .sidenav { 
      width: 280px;
      background: #ffffff !important;
      border-right: 1px solid #f1f5f9; /* Slate 100 */
      overflow: hidden;
      box-shadow: 4px 0 24px rgba(15, 23, 42, 0.04);
    }
    
    :host-context(.dark-theme) .sidenav {
      background: #1e293b !important; /* Slate 800 */
      border-right: 1px solid rgba(255,255,255,0.05);
    }
    
    .brand { 
      font-weight: 700; 
      padding: 1.5rem 1rem;
      font-size: 1.3rem;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
      background: transparent;
      letter-spacing: -0.02em;
    }
    
    :host-context(.dark-theme) .brand { color: #f8fafc; border-bottom-color: rgba(255,255,255,0.05); }

    .brand mat-icon {
      font-size: 1.75rem;
      width: 1.75rem;
      height: 1.75rem;
      color: #0ea5e9; /* Sky 500 */
    }
    
    .nav-item {
      color: #64748b !important; /* Slate 500 */
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      margin: 0.35rem 0.75rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      height: 50px;
      font-weight: 500;
      position: relative;
    }
    
    :host-context(.dark-theme) .nav-item { color: #94a3b8 !important; }
    
    .nav-item:hover {
      background: rgba(14, 165, 233, 0.05) !important;
      color: #0ea5e9 !important;
      transform: translateX(4px); /* Pushes the text right */
    }
    
    .nav-item.active {
      background: rgba(14, 165, 233, 0.1) !important;
      color: #0ea5e9 !important;
      font-weight: 600;
    }
    
    /* Adds the little colored bar to the left of the active item */
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: -0.75rem;
      top: 10%;
      height: 80%;
      width: 4px;
      background: #0ea5e9;
      border-radius: 0 4px 4px 0;
    }
    
    .nav-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .logout-item {
      margin-top: auto;
      color: #ef4444 !important; /* Red 500 */
    }
    
    .logout-item:hover {
      background: rgba(239, 68, 68, 0.05) !important;
      color: #dc2626 !important; /* Red 600 */
      transform: translateX(4px);
    }
    
    .nav-divider {
      margin: 1rem 0;
      background: rgba(0,0,0,0.05);
    }
    :host-context(.dark-theme) .nav-divider { background: rgba(255,255,255,0.06); }

    /* Force Material list item text to be visible in dark mode */
    :host-context(.dark-theme) ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text,
    :host-context(.dark-theme) ::ng-deep .mat-mdc-list-item span {
      color: #cbd5e1 !important;
    }
    :host-context(.dark-theme) ::ng-deep .mat-mdc-list-item.active .mdc-list-item__primary-text,
    :host-context(.dark-theme) ::ng-deep .mat-mdc-list-item.active span {
      color: #38bdf8 !important;
    }
    :host-context(.dark-theme) ::ng-deep .mat-mdc-list-item mat-icon {
      color: #94a3b8 !important;
    }
    :host-context(.dark-theme) ::ng-deep .mat-mdc-list-item.active mat-icon {
      color: #38bdf8 !important;
    }
    :host-context(.dark-theme) .nav-divider { background: rgba(255,255,255,0.05); }
    
    .content { 
      padding: 2rem; 
      background: transparent; /* Allows layout body background to show through */
      min-height: calc(100vh - 72px);
    }
    
    .menu-toggle {
      color: inherit;
      margin-right: 16px;
      transition: transform 0.2s ease;
    }
    .menu-toggle:hover {
      transform: scale(1.1);
    }
    
    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      font-weight: 800;
      font-size: 1.35rem;
      letter-spacing: -0.02em;
      margin-right: 24px;
    }
    
    .title-icon-wrapper {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(2,132,199,0.1));
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
    }
    
    .title-icon {
      font-size: 22px; width: 22px; height: 22px;
      color: #0ea5e9;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    :host-context(.dark-theme) .gradient-text {
      background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }
    
    /* Premium Search Bar */
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 360px;
      height: 44px;
      background: rgba(241, 245, 249, 0.6);
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-radius: 999px;
      padding: 0 1rem;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      margin-right: 2rem;
    }
    
    :host-context(.dark-theme) .search-wrapper {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .search-wrapper:focus-within {
      background: #ffffff;
      border-color: rgba(14, 165, 233, 0.4);
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
      width: 400px;
    }
    
    :host-context(.dark-theme) .search-wrapper:focus-within {
      background: #1e293b;
      border-color: rgba(56, 189, 248, 0.4);
      box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
    }
    
    .search-icon {
      color: #94a3b8;
      font-size: 20px; width: 20px; height: 20px;
      margin-right: 0.5rem;
    }
    
    .search-wrapper:focus-within .search-icon {
      color: #0ea5e9;
    }
    
    .premium-search-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-family: inherit;
      font-size: 0.9rem;
      color: #334155;
      padding: 0;
    }
    
    :host-context(.dark-theme) .premium-search-input {
      color: #f1f5f9;
    }
    
    .premium-search-input::placeholder {
      color: #94a3b8;
    }
    
    .search-kbd {
      display: flex;
      gap: 0.2rem;
      opacity: 0.7;
    }
    
    .search-kbd span {
      background: rgba(226, 232, 240, 0.8);
      color: #64748b;
      font-size: 0.7rem;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      border: 1px solid rgba(203, 213, 225, 0.8);
      font-family: monospace;
      font-weight: 600;
    }
    
    :host-context(.dark-theme) .search-kbd span {
      background: rgba(30, 41, 59, 0.8);
      color: #94a3b8;
      border-color: rgba(71, 85, 105, 0.8);
    }
    
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    
    .wrapper-btn {
      width: 44px !important;
      height: 44px !important;
      border-radius: 12px !important;
      background: rgba(241, 245, 249, 0.8) !important;
      border: 1px solid transparent !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    :host-context(.dark-theme) .wrapper-btn {
      background: rgba(30, 41, 59, 0.6) !important;
      color: #cbd5e1 !important;
    }
    
    .wrapper-btn:hover {
      background: #ffffff !important;
      border-color: rgba(14, 165, 233, 0.2) !important;
      color: #0ea5e9 !important;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15) !important;
    }
    
    :host-context(.dark-theme) .wrapper-btn:hover {
      background: rgba(15, 23, 42, 0.8) !important;
      border-color: rgba(56, 189, 248, 0.2) !important;
      color: #38bdf8 !important;
    }
    
    .logout-btn:hover {
      color: #ef4444; /* Red 500 */
      background: rgba(239, 68, 68, 0.08); /* Red 500 */
    }
    
    .notification-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 600;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .spacer { 
      flex: 1 1 auto; 
    }
    
    @media (max-width: 768px) { 
      .sidenav { width: 240px; }
      .toolbar-title span { display: none; }
      .brand span { display: none; }
      .content { padding: 1rem; }
    }

    /* ── Global Search Dropdown ── */
    .search-wrapper { position: relative; }
    .has-results {
      border-color: rgba(14, 165, 233, 0.4) !important;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1) !important;
    }
    .search-clear-btn {
      background: none; border: none; cursor: pointer; padding: 0;
      display: flex; align-items: center; color: #94a3b8;
      transition: color .15s;
    }
    .search-clear-btn:hover { color: #ef4444; }
    .search-clear-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0; right: 0;
      background: #fff;
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(15,23,42,0.12);
      z-index: 9999;
      overflow: hidden;
      max-height: 400px;
      overflow-y: auto;
    }
    :host-context(.dark-theme) .search-dropdown {
      background: #1e293b;
      border-color: rgba(255,255,255,0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .search-group-label {
      display: flex; align-items: center; gap: .4rem;
      padding: .5rem 1rem .3rem;
      font-size: .68rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .07em; color: #94a3b8;
      border-top: 1px solid rgba(226,232,240,.5);
    }
    .search-group-label:first-child { border-top: none; }
    :host-context(.dark-theme) .search-group-label { border-top-color: rgba(255,255,255,.06); }
    .group-icon { font-size: 14px; width: 14px; height: 14px; }
    .gi-project  { color: #0ea5e9; }
    .gi-employee { color: #10b981; }
    .gi-volunteer{ color: #8b5cf6; }
    .group-count {
      margin-left: auto;
      background: rgba(226,232,240,.6);
      border-radius: 999px;
      font-size: .65rem;
      padding: .05rem .4rem;
      color: #64748b;
    }
    :host-context(.dark-theme) .group-count { background: rgba(255,255,255,.08); color: #94a3b8; }
    .search-result-item {
      display: flex; align-items: center; gap: .7rem;
      padding: .6rem 1rem; cursor: pointer;
      transition: background .12s;
    }
    .search-result-item:hover { background: rgba(14,165,233,.06); }
    :host-context(.dark-theme) .search-result-item:hover { background: rgba(14,165,233,.12); }
    .result-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .ri-project  { color: #0ea5e9; }
    .ri-employee { color: #10b981; }
    .ri-volunteer{ color: #8b5cf6; }
    .result-text { flex: 1; display: flex; flex-direction: column; gap: .1rem; min-width: 0; }
    .result-title { font-size: .875rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    :host-context(.dark-theme) .result-title { color: #f1f5f9; }
    .result-title ::ng-deep mark { background: rgba(14,165,233,.2); color: #0ea5e9; border-radius: 2px; padding: 0 1px; }
    .result-sub { font-size: .74rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .result-arrow { font-size: 18px; width: 18px; height: 18px; color: #cbd5e1; margin-left: auto; flex-shrink: 0; }
    .search-empty {
      display: flex; align-items: center; gap: .6rem;
      padding: 1rem 1.25rem;
      font-size: .85rem; color: #94a3b8;
    }
    .search-empty mat-icon { font-size: 20px; width: 20px; height: 20px; color: #cbd5e1; }
  `]
})

export class MainLayoutComponent {
  protected readonly title = signal('csr-module');
  protected search = '';
  protected dropdownOpen = false;

  get showDropdown() { return this.dropdownOpen && this.search.trim().length >= 1; }

  readonly searchResults = computed<SearchResult[]>(() => {
    const q = this._searchQuery();
    if (!q || q.length < 1) return [];
    const results: SearchResult[] = [];
    const lower = q.toLowerCase();
    const isAdmin = this.auth.isAdmin();
    const isEmp = this.auth.isEmployee();
    const isVol = this.auth.isVolunteer();

    // Projects
    for (const p of this.projectsSvc.list()) {
      if (
        p.projectName?.toLowerCase().includes(lower) ||
        p.department?.toLowerCase().includes(lower) ||
        p.status?.toLowerCase().includes(lower)
      ) {
        // Employees and Volunteers see "Project" results but navigate to bookable views, not the admin list
        results.push({
          type: 'project',
          id: p.id,
          label: p.projectName,
          sub: `${p.department} · ${p.status}`,
          icon: 'work_outline',
          // Role-based routing
          route: isAdmin ? ['/projects'] : (isEmp ? ['/events'] : ['/volunteer-dashboard']),
          queryParams: { q: p.projectName }
        });
      }
    }

    // Employees & Volunteers
    for (const e of this.employeesSvc.list()) {
      if (
        e.name?.toLowerCase().includes(lower) ||
        e.email?.toLowerCase().includes(lower) ||
        e.department?.toLowerCase().includes(lower)
      ) {
        const eRole = (e.role || 'Employee').toLowerCase();
        const isActuallyVol = eRole === 'volunteer';
        
        // SECURITY: Non-admins shouldn't see people they aren't directly related to if they search
        // For now, let's at least ensure they can't navigate to the admin list
        if (!isAdmin && e.email !== this.auth.profile()?.email) {
           // Skip other people's results for regular users to prevent scraping/unwanted visibility
           // unless they are on the same project (complex to check here, keeping it simple)
           continue; 
        }

        results.push({
          type: isActuallyVol ? 'volunteer' : 'employee',
          id: e.id,
          label: e.name,
          sub: `${e.department} · ${e.email}`,
          icon: isActuallyVol ? 'volunteer_activism' : 'badge',
          // SECURITY: Only Admin can go to these lists.
          route: isAdmin ? (isActuallyVol ? ['/volunteers'] : ['/employees']) : (isActuallyVol ? ['/volunteer-dashboard'] : ['/events']),
          queryParams: { q: e.name }
        });
      }
    }

    return results.slice(0, 12);
  });

  readonly groupedResults = computed(() => {
    const res = this.searchResults();
    const groups: { type: string; label: string; icon: string; items: SearchResult[] }[] = [];
    const projects = res.filter(r => r.type === 'project');
    const employees = res.filter(r => r.type === 'employee');
    const volunteers = res.filter(r => r.type === 'volunteer');
    if (projects.length)  groups.push({ type: 'project',   label: 'Projects',   icon: 'work',              items: projects });
    if (employees.length) groups.push({ type: 'employee',  label: 'Employees',  icon: 'badge',             items: employees });
    if (volunteers.length)groups.push({ type: 'volunteer', label: 'Volunteers', icon: 'volunteer_activism', items: volunteers });
    return groups;
  });

  private readonly _searchQuery = signal('');

  constructor(
    public readonly auth: AuthService,
    public readonly notifications: NotificationService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly projectsSvc: ProjectsService,
    private readonly employeesSvc: EmployeesService
  ) {
    if (auth.loggedIn()) {
      if (auth.isAdmin()) this.title.set('CSR Admin Dashboard');
      else if (auth.isVolunteer()) this.title.set('Volunteer Dashboard');
      else this.title.set('CSR Employee Dashboard');
    }
  }

  onSearchChange() {
    this._searchQuery.set(this.search.trim());
    this.dropdownOpen = true;
  }

  clearSearch() {
    this.search = '';
    this._searchQuery.set('');
    this.dropdownOpen = false;
  }

  navigateTo(item: SearchResult) {
    this.router.navigate(item.route, { queryParams: item.queryParams });
    this.dropdownOpen = false;
    this.search = '';
    this._searchQuery.set('');
  }

  submitSearch() {
    const results = this.searchResults();
    if (results.length > 0) {
      this.navigateTo(results[0]);
    } else {
      const q = this.search.trim();
      if (q) this.router.navigate(['/projects'], { queryParams: { q } });
    }
  }

  highlight(text: string): string {
    const q = this._searchQuery();
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.search-wrapper')) {
      this.dropdownOpen = false;
    }
  }

  openNotifications() {
    this.dialog.open(NotificationPanelComponent, {
      width: '380px',
      position: { top: '76px', right: '24px' },
      panelClass: 'notification-dialog-container',
      backdropClass: 'notification-backdrop'
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
