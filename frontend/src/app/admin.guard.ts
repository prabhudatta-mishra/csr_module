import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Only allow access if user IS admin
  if (!authService.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
