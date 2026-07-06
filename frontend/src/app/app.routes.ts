import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
  },
  {
    path: 'bike/:id',
    loadComponent: () => import('./features/bike-detail/bike-detail.component').then(m => m.BikeDetailComponent)
  },
  {
    path: 'valuation',
    loadComponent: () => import('./features/valuation/valuation.component').then(m => m.ValuationComponent)
  },
  {
    path: 'compare',
    loadComponent: () => import('./features/compare/compare.component').then(m => m.CompareComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  
  // ─── Seller Route Group ─────────────────────────────────────
  {
    path: 'seller/dashboard',
    loadComponent: () => import('./features/seller-dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent)
  },
  {
    path: 'seller/listings',
    loadComponent: () => import('./features/seller-bikes/seller-bikes.component').then(m => m.SellerBikesComponent)
  },
  {
    path: 'seller/add-bike',
    loadComponent: () => import('./features/add-bike/add-bike.component').then(m => m.AddBikeComponent)
  },

  // ─── Buyer Route Group ──────────────────────────────────────
  {
    path: 'buyer/dashboard',
    loadComponent: () => import('./features/buyer-dashboard/buyer-dashboard').then(m => m.BuyerDashboardComponent)
  },
  {
    path: 'buyer/wishlist',
    loadComponent: () => import('./features/wishlist/wishlist').then(m => m.WishlistComponent)
  },

  // ─── Admin Route Group ──────────────────────────────────────
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/user-management/user-management').then(m => m.UserManagementComponent)
  },
  {
    path: 'admin/motorcycles',
    loadComponent: () => import('./features/motorcycle-management/motorcycle-management').then(m => m.MotorcycleManagementComponent)
  },
  {
    path: 'admin/reports',
    loadComponent: () => import('./features/admin-reports/admin-reports').then(m => m.AdminReportsComponent)
  },
  {
    path: 'admin/analytics',
    loadComponent: () => import('./features/admin-analytics/admin-analytics').then(m => m.AdminAnalyticsComponent)
  },
  {
    path: 'admin/activity-logs',
    loadComponent: () => import('./features/activity-logs/activity-logs').then(m => m.ActivityLogsComponent)
  },

  {
    path: '**',
    redirectTo: ''
  }
];
