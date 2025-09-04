import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service'; // ✅ correct path

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user has a valid token
  if (authService.isLoggedIn()) {
    return true; // ✅ user logged in
  } else {
    router.navigate(['/login']); // ❌ not logged in → redirect
    return false;
  }
};
