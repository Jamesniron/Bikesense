import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BikeService } from '../../services/bike.service';
import { BuyerService } from '../../services/buyer.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReportService } from '../../services/report.service';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import { BikeMlService } from '../../services/bike-ml.service';
import { Bike, ValuationResult } from '../../models/models';

@Component({
  selector: 'app-bike-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bike-detail.component.html',
  styleUrl: './bike-detail.component.css'
})
export class BikeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bikeService = inject(BikeService);
  private buyerService = inject(BuyerService);
  private wishlistService = inject(WishlistService);
  private reportService = inject(ReportService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);
  private ml    = inject(BikeMlService);

  bike      = signal<Bike | null>(null);
  valuation = signal<ValuationResult | null>(null);
  loading   = signal(true);
  activeImg = signal(0);

  similarBikes = signal<Bike[]>([]);
  inWishlist = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadBikeDetails(id);
      }
    });
  }

  private loadBikeDetails(id: number): void {
    this.loading.set(true);
    this.bikeService.getBikeById(id).subscribe({
      next: b => {
        if (b) {
          this.bike.set(b);
          this.fetchValuation(b);
          this.loadSimilarBikes(b.id);
          this.inWishlist.set(this.wishlistService.isInWishlist(b.id));
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private loadSimilarBikes(id: number): void {
    this.buyerService.getSimilarBikes(id).subscribe({
      next: bikes => this.similarBikes.set(bikes)
    });
  }

  private fetchValuation(bike: Bike): void {
    this.ml.valuate({
      brand: bike.brand, model: bike.model, year: bike.year,
      mileage: bike.mileage, engineCC: bike.engineCC,
      condition: bike.condition, ownerCount: bike.ownerCount,
      serviceHistory: bike.serviceHistory, accidentHistory: bike.accidentHistory
    }, bike.price).subscribe({
      next: v  => this.valuation.set(v),
      error: () => {}
    });
  }

  toggleWishlist(): void {
    const b = this.bike();
    if (!b) return;

    if (this.inWishlist()) {
      this.wishlistService.removeFromWishlist(b.id).subscribe(() => {
        this.inWishlist.set(false);
        this.toast.success('Removed from wishlist');
      });
    } else {
      this.wishlistService.addToWishlist(b.id).subscribe(() => {
        this.inWishlist.set(true);
        this.toast.success('Added to wishlist');
      });
    }
  }

  async reportListing(): Promise<void> {
    const b = this.bike();
    if (!b) return;

    // Simulate opening a modal and getting a reason
    const confirm = await this.dialog.confirm({
      title: 'Report Listing',
      message: 'Are you sure you want to report this listing as fraudulent or inappropriate?',
      confirmText: 'Report',
      danger: true
    });

    if (confirm) {
      this.reportService.reportListing(b.id, {
        reporterName: 'Nimna Silva',
        reporterEmail: 'buyer@bikesense.lk',
        reason: 'Suspiciously low price or fake details.',
        type: 'Fraud'
      }).subscribe({
        next: () => this.toast.success('Report submitted successfully. Thank you.'),
        error: () => this.toast.error('Failed to submit report.')
      });
    }
  }

  formatPrice(p: number): string {
    if (p >= 100000) return `L ${(p / 100000).toFixed(2)}`;
    return `Rs. ${p.toLocaleString()}`;
  }

  getConditionClass(cond: string): string {
    const map: Record<string,string> = {
      'Excellent': 'badge-emerald', 'Good': 'badge-cyan',
      'Fair': 'badge-amber', 'Poor': 'badge-rose'
    };
    return map[cond] ?? 'badge-gray';
  }

  getDealClass(r: string): string {
    if (r === 'Excellent Deal') return 'deal-excellent';
    if (r === 'Overpriced')     return 'deal-overpriced';
    return 'deal-fair';
  }

  getDealIcon(r: string): string {
    if (r === 'Excellent Deal') return '🟢';
    if (r === 'Overpriced')     return '🔴';
    return '🟡';
  }

  getHealthColor(s: number): string {
    if (s >= 75) return '#10B981';
    if (s >= 50) return '#F59E0B';
    return '#F43F5E';
  }

  getImages(bike: Bike): string[] {
    return bike.imageUrls?.length ? bike.imageUrls : [
      `https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&auto=format`
    ];
  }

  copyContact(phone: string): void {
    navigator.clipboard?.writeText(phone);
    this.toast.success('Phone copied to clipboard');
  }
}
