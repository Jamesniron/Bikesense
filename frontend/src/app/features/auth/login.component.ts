import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="auth-page">
  <div class="auth-bg">
    <div class="auth-orb auth-orb-1"></div>
    <div class="auth-orb auth-orb-2"></div>
  </div>
  <div class="auth-card card animate-in">
    <div class="auth-logo">⚡ Bike<span>Sense</span></div>
    <h2 class="auth-title">Welcome Back</h2>
    <p class="auth-subtitle">Sign in to your account to continue</p>

    @if (error()) {
      <div class="alert alert-error mb-4">{{ error() }}</div>
    }

    <form (ngSubmit)="login()" class="auth-form">
      <div class="form-group">
        <label class="form-label" for="login-email">Email</label>
        <input type="email" class="form-control" id="login-email"
               [(ngModel)]="email" name="email" placeholder="you@example.com" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="login-password">Password</label>
        <input type="password" class="form-control" id="login-password"
               [(ngModel)]="password" name="password" placeholder="••••••••" required>
      </div>
      <button type="submit" class="btn btn-primary w-full btn-lg" id="btn-login" [disabled]="loading()">
        @if (loading()) { <span class="spinner"></span> Signing in... }
        @else { Sign In }
      </button>
    </form>

    <div class="auth-divider"><span>or</span></div>

    <div class="auth-demo">
      <p class="text-sm text-muted mb-3">Demo Accounts:</p>
      <button class="demo-btn" id="btn-demo-buyer" (click)="fillDemo('buyer')">👤 Buyer Demo</button>
      <button class="demo-btn" id="btn-demo-seller" (click)="fillDemo('seller')">🏪 Seller Demo</button>
      <button class="demo-btn" id="btn-demo-admin" (click)="fillDemo('admin')">🛡️ Admin Demo</button>
    </div>

    <p class="auth-switch">
      Don't have an account?
      <a routerLink="/auth/register" id="link-to-register">Create one →</a>
    </p>
  </div>
</div>
  `,
  styleUrl: './auth.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = ''; password = '';
  loading = signal(false);
  error   = signal('');

  fillDemo(role: string) {
    const demos: Record<string, { email: string, password: string }> = {
      buyer:  { email: 'admin@bikesense.lk', password: 'AdminPass123!' },
      seller: { email: 'seller@bikesense.lk', password: 'SellerPass123!' },
      admin:  { email: 'admin@bikesense.lk', password: 'AdminPass123!' },
    };
    const d = demos[role];
    if (d) { this.email = d.email; this.password = d.password; }
  }

  login() {
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/']); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Invalid credentials. Please try again.');
      }
    });
  }
}
