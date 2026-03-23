import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const employeeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Only allow access if user is NOT admin (i.e., is employee)
  if (authService.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
