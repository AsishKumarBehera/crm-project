// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.isLoggedIn().pipe(
    map(() => true),         // ← cookie valid, allow access
    catchError(() => {
      router.navigate(['/login']);  // ← cookie invalid, redirect to login
      return of(false);
    })
  );
};