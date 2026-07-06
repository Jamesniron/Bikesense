import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BikeService } from '../../services/bike.service';
import { Bike, BikeFilter } from '../../models/models';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent implements OnInit {
  private bikeService = inject(BikeService);

  bikes     = signal<Bike[]>([]);
  loading   = signal(true);
  total     = signal(0);
  page      = signal(1);
  limit     = 12;

  // Filter state
  filter: BikeFilter = { page: 1, limit: 12 };
  searchBrand = '';
  filterType  = '';
  filterCond  = '';
  maxPrice    = 0;
  minPrice    = 0;
  minYear     = 0;
  maxYear     = 0;
  location    = '';
  
  sortBy      = 'newest';
  viewMode    = signal<'grid' | 'list'>('grid');

  readonly brands     = ['Honda', 'Yamaha', 'Bajaj', 'Suzuki', 'TVS', 'Hero', 'KTM', 'Vespa'];
  readonly bikeTypes  = ['Motorbikes', 'Scooters', 'Superbikes', 'Cruisers'];
  readonly conditions = ['Excellent', 'Good', 'Fair', 'Poor'];

  totalPages = computed(() => Math.ceil(this.total() / this.limit));

  ngOnInit(): void { this.loadBikes(); }

  loadBikes(): void {
    this.loading.set(true);
    const f: BikeFilter = { page: this.page(), limit: this.limit, status: 'Active' };
    if (this.searchBrand) f.brand = this.searchBrand;
    if (this.filterType)  f.bikeType = this.filterType;
    if (this.filterCond)  f.condition = this.filterCond;
    if (this.minPrice > 0) f.minPrice = this.minPrice;
    if (this.maxPrice > 0) f.maxPrice = this.maxPrice;
    if (this.minYear > 0) f.minYear = this.minYear;
    if (this.maxYear > 0) f.maxYear = this.maxYear;
    if (this.location) f.location = this.location;

    this.bikeService.getBikes(f).subscribe({
      next: res => {
        let items = res.items ?? [];
        if (this.sortBy === 'price_low') items.sort((a, b) => a.price - b.price);
        if (this.sortBy === 'price_high') items.sort((a, b) => b.price - a.price);
        
        this.bikes.set(items);
        this.total.set(res.totalRecords ?? items.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadBikes();
  }

  clearFilters(): void {
    this.searchBrand = '';
    this.filterType  = '';
    this.filterCond  = '';
    this.maxPrice    = 0;
    this.minPrice    = 0;
    this.minYear     = 0;
    this.maxYear     = 0;
    this.location    = '';
    this.sortBy      = 'newest';
    this.page.set(1);
    this.loadBikes();
  }

  goPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadBikes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  formatPrice(price: number): string {
    if (price >= 100000) {
      return `L ${(price / 100000).toFixed(2)}`;
    }
    return `Rs. ${price.toLocaleString()}`;
  }

  getConditionClass(cond: string): string {
    const map: Record<string,string> = {
      'Excellent': 'badge-emerald',
      'Good':      'badge-cyan',
      'Fair':      'badge-amber',
      'Poor':      'badge-rose'
    };
    return map[cond] ?? 'badge-gray';
  }

  getImageFallback(bike: Bike): string {
    const fallbacks: Record<string, string> = {
      'Honda':  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format',
      'Yamaha': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format',
      'Bajaj':  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format',
      'Suzuki': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&auto=format',
    };
    return bike.imageUrls?.[0] || fallbacks[bike.brand] ||
      'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600&auto=format';
  }
}
