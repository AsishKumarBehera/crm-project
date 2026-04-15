import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (token) {
    return true; // ✅ allow access
  } else {
    router.navigate(['/']); // 🔥 redirect to login
    return false;
  }
};