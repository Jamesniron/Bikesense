import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { AuthResponse, UserLogin, UserRegister, TokenPayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = 'http://localhost:5000/api/auth';

  readonly currentUser = signal<AuthResponse | null>(this.loadStoredUser());
  readonly isLoggedIn  = signal<boolean>(!!this.loadStoredUser());

  register(data: UserRegister): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(res => this.storeUser(res))
    );
  }

  login(data: UserLogin): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => this.storeUser(res)),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem('bs_user');
    localStorage.removeItem('bs_token');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('bs_token');
  }

  getRole(): string {
    return this.currentUser()?.role ?? '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'Administrator';
  }

  private storeUser(user: AuthResponse): void {
    localStorage.setItem('bs_token', user.token);
    localStorage.setItem('bs_user', JSON.stringify(user));
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  private loadStoredUser(): AuthResponse | null {
    try {
      const raw = localStorage.getItem('bs_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
