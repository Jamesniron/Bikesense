import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="auth-page">
  <div class="auth-bg">
    <div class="auth-orb auth-orb-1"></div>
    <div class="auth-orb auth-orb-2"></div>
  </div>
  <div class="auth-card card animate-in" style="max-width: 500px">
    <div class="auth-logo">⚡ Bike<span>Sense</span></div>
    <h2 class="auth-title">Create Account</h2>
    <p class="auth-subtitle">Join Sri Lanka's AI motorcycle marketplace</p>

    @if (error()) {
      <div class="alert alert-error mb-4">{{ error() }}</div>
    }
    @if (success()) {
      <div class="alert alert-success mb-4">✅ Account created! Redirecting...</div>
    }

    <form (ngSubmit)="register()" class="auth-form">
      <div class="form-group">
        <label class="form-label" for="reg-name">Full Name</label>
        <input type="text" class="form-control" id="reg-name"
               [(ngModel)]="form.fullName" name="fullName" placeholder="e.g. Rushan Perera" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-email">Email</label>
        <input type="email" class="form-control" id="reg-email"
               [(ngModel)]="form.email" name="email" placeholder="you@example.com" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-phone">Phone Number</label>
        <input type="tel" class="form-control" id="reg-phone"
               [(ngModel)]="form.phoneNumber" name="phoneNumber" placeholder="+94 71 234 5678">
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-role">Account Type</label>
        <select class="form-control" id="reg-role" [(ngModel)]="form.role" name="role">
          <option value="Buyer">Buyer</option>
          <option value="Seller">Seller</option>
          <option value="Dealer">Dealer</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-password">Password</label>
        <input type="password" class="form-control" id="reg-password"
               [(ngModel)]="form.password" name="password" placeholder="Min. 8 characters" required>
      </div>
      <button type="submit" class="btn btn-primary w-full btn-lg" id="btn-register" [disabled]="loading()">
        @if (loading()) { <span class="spinner"></span> Creating Account... }
        @else { 🚀 Create Account }
      </button>
    </form>

    <p class="auth-switch">
      Already have an account?
      <a routerLink="/auth/login" id="link-to-login">Sign in →</a>
    </p>
  </div>
</div>
  `,
  styleUrl: './auth.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error   = signal('');
  success = signal(false);

  form = {
    fullName: '', email: '', phoneNumber: '',
    password: '', role: 'Buyer'
  };

  register() {
    if (!this.form.fullName || !this.form.email || !this.form.password) {
      this.error.set('Please fill in all required fields.');
      return;
    }
    if (this.form.password.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    this.error.set('');
    this.loading.set(true);

    this.authService.register(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Registration failed. Email may already be in use.');
      }
    });
  }
}
