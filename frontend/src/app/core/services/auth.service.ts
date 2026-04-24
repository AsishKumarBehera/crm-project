import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:5000/api';
  private tokenKey = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.setupStorageListener();  // ← NEW! Listen for changes
  }

  // ===== SETUP STORAGE LISTENER =====
  private setupStorageListener() {
    // Listen for changes in OTHER tabs
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === this.tokenKey) {
        console.log('📡 Storage changed in another tab!');
        
        if (event.newValue === null) {
          // Token was cleared (logout in another tab)
          console.log('❌ User logged out in another tab!');
          this.isAuthenticatedSubject.next(false);
          // Redirect to login
          window.location.href = '/login';
        } else if (event.newValue) {
          // Token was set (login in another tab)
          console.log('✅ User logged in in another tab!');
          this.isAuthenticatedSubject.next(true);
        }
      }
    });
  }

  // ===== TOKEN MANAGEMENT =====

  hasValidToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticatedSubject.next(true);
    console.log('✅ Token stored in localStorage');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    console.log('❌ Token cleared from localStorage');
  }

  // ===== API CALLS =====

  signup(data: any) {
    return this.http.post(`${this.API_URL}/auth/signup`, data, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  login(data: any) {
    return this.http.post(`${this.API_URL}/auth/login`, data, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.setToken('logged_in_' + Date.now());
      })
    );
  }

  logout() {
    return this.http.post(`${this.API_URL}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearToken();
      })
    );
  }

  isLoggedIn(): Observable<{ isAuthenticated: boolean }> {
    return this.http.get<{ isAuthenticated: boolean }>(
      `${this.API_URL}/auth/loggedIn`,
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        if (response.isAuthenticated) {
          this.setToken('verified_' + Date.now());
        }
      })
    );
  }
}