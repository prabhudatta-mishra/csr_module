import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/auth/login.component';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { BookProjectComponent } from './components/book-project/book-project.component';
import { authGuard, adminGuard, verifiedGuard } from './auth.guard';
import { employeeGuard } from './employee.guard';
import { volunteerGuard } from './volunteer.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'verify', loadComponent: () => import('./components/auth/verify.component').then(m => m.VerifyComponent) },
  { 
    path: '', 
    component: MainLayoutComponent,
    canActivate: [authGuard, verifiedGuard],
    children: [
      // Admin Routes
      { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
      { path: 'projects', canActivate: [adminGuard], loadComponent: () => import('./components/projects/projects.component').then(m => m.ProjectsComponent) },
      { path: 'projects/grid', canActivate: [adminGuard], loadComponent: () => import('./components/projects/projects-grid.component').then(m => m.ProjectsGridComponent) },
      { path: 'projects/board', canActivate: [adminGuard], loadComponent: () => import('./components/projects/projects-board.component').then(m => m.ProjectsBoardComponent) },
      { path: 'employees', canActivate: [adminGuard], loadComponent: () => import('./components/employees/employees.component').then(m => m.EmployeesComponent) },
      { path: 'volunteers', canActivate: [adminGuard], loadComponent: () => import('./components/volunteers/volunteers-cards.component').then(m => m.VolunteersCardsComponent) },
      { path: 'reports', canActivate: [adminGuard], loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'assignments', canActivate: [adminGuard], loadComponent: () => import('./components/admin/assignments.component').then(m => m.AssignmentsComponent) },
      // Employee Routes
      { path: 'book-project', component: BookProjectComponent, canActivate: [employeeGuard] },
      { path: 'events', loadComponent: () => import('./components/events/events.component').then(m => m.EventsComponent) },
      { path: 'my-projects', loadComponent: () => import('./components/my-projects/my-projects.component').then(m => m.MyProjectsComponent) },
      // Volunteer Routes
      { path: 'volunteer-dashboard', loadComponent: () => import('./components/volunteers/volunteer-dashboard.component').then(m => m.VolunteerDashboardComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
