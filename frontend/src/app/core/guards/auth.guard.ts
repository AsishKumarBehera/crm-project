import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  console.log('🔐 Auth Guard triggered for:', state.url);

  // ✅ STEP 1: Check localStorage FIRST (instant, no HTTP call)
  if (auth.hasValidToken()) {
    console.log('✅ Token found in localStorage! Allowing access to:', state.url);
    return true;  // User is logged in, allow access
  }

  // ❌ STEP 2: No local token found, verify with backend
  console.log('⚠️  No local token. Checking with backend...');
  
  return auth.isLoggedIn().pipe(
    map((res: { isAuthenticated: boolean }) => {
      console.log('📡 Backend response:', res);
      
      if (res.isAuthenticated) {
        console.log('✅ Backend confirmed authentication! Allowing access');
        return true;  // Backend says user is logged in
      }

      // Backend says user is NOT logged in
      console.log('❌ Backend denied access. Redirecting to login');
      router.navigate(['/login']);
      return false;
    }),
    catchError((err) => {
      // Backend request failed (network error, server down, etc)
      console.log('❌ Backend check failed:', err.message);
      router.navigate(['/login']);
      return of(false);
    })
  );
};