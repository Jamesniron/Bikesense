import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../services/toast.service';
import { Bike } from '../../models/models';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);

  bikes = signal<Bike[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading.set(true);
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.bikes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  removeFromWishlist(id: number): void {
    this.wishlistService.removeFromWishlist(id).subscribe(() => {
      this.toast.success('Removed from wishlist');
      this.loadWishlist();
    });
  }

  formatPrice(p: number): string {
    return `Rs. ${p.toLocaleString()}`;
  }
}
