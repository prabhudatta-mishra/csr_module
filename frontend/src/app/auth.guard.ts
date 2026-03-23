import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.loggedIn()) return true;
  return router.parseUrl('/login');
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.loggedIn()) return router.parseUrl('/login');
  if (auth.role() !== 'admin') return router.parseUrl('/events');
  return true;
};

export const verifiedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.loggedIn()) return router.parseUrl('/login');
  // Only enforce for employee (user) role
  if (auth.role() === 'employee' && !auth.isVerified()) return router.parseUrl('/verify');
  return true;
};
