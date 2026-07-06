import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SellerService } from '../../services/seller.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import { Bike, Enquiry } from '../../models/models';

@Component({
  selector: 'app-seller-bikes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './seller-bikes.component.html',
  styleUrl: './seller-bikes.component.css'
})
export class SellerBikesComponent implements OnInit {
  private readonly sellerService = inject(SellerService);
  private readonly auth   = inject(AuthService);
  private readonly toast  = inject(ToastService);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);

  bikes = signal<Bike[]>([]);
  loading = signal<boolean>(true);
  currentTab = signal<string>('All');
  tabs = ['All', 'Active', 'Pending', 'Sold', 'Archived', 'Rejected'];

  // Enquiry View State
  activeEnquiries = signal<Enquiry[]>([]);
  selectedBikeTitle = signal<string>('');
  showEnquiryModal = signal<boolean>(false);

  ngOnInit(): void {
    this.loadBikes();
  }

  loadBikes(): void {
    this.loading.set(true);
    const userId = this.auth.currentUser()?.userId || 2;
    
    this.sellerService.getSellerBikes(userId).subscribe({
      next: (allBikes) => {
        if (this.currentTab() === 'All') {
          this.bikes.set(allBikes);
        } else {
          this.bikes.set(allBikes.filter(b => b.status === this.currentTab()));
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  selectTab(tab: string): void {
    this.currentTab.set(tab);
    this.loadBikes();
  }

  async changeStatus(id: number, status: 'Active' | 'Sold' | 'Archived' | 'Pending'): Promise<void> {
    const messages = {
      'Sold': 'Are you sure you want to mark this motorcycle as SOLD? This will disable enquiries.',
      'Archived': 'This will hide the listing from search results. You can restore it later.',
      'Active': 'Are you sure you want to reactivate this listing?',
      'Pending': 'Submit for review?'
    };

    const confirm = await this.dialog.confirm({
      title: `Mark as ${status}?`,
      message: messages[status],
      confirmText: `Yes, ${status}`,
      danger: false
    });

    if (confirm) {
      this.sellerService.updateBike(id, { status }).subscribe({
        next: () => {
          this.toast.success(`Listing status updated to ${status}.`);
          this.loadBikes();
        },
        error: () => this.toast.error('Could not update listing status.')
      });
    }
  }

  duplicateBike(id: number): void {
    this.sellerService.duplicateBike(id).subscribe({
      next: (dup) => {
        this.toast.success(`Listing duplicated as: ${dup.title}`);
        this.loadBikes();
      },
      error: () => this.toast.error('Could not duplicate listing.')
    });
  }

  async deleteBike(id: number): Promise<void> {
    const confirm = await this.dialog.confirm({
      title: 'Delete Listing?',
      message: 'Are you sure you want to delete this listing permanently? This action CANNOT be undone.',
      confirmText: 'Delete Permanently',
      cancelText: 'Keep Listing',
      danger: true
    });

    if (confirm) {
      this.sellerService.deleteBike(id).subscribe({
        next: () => {
          this.toast.success('Listing deleted permanently.');
          this.loadBikes();
        },
        error: () => this.toast.error('Failed to delete listing.')
      });
    }
  }

  viewEnquiries(bike: Bike): void {
    this.selectedBikeTitle.set(`${bike.brand} ${bike.model}`);
    this.activeEnquiries.set(bike.enquiries || []);
    this.showEnquiryModal.set(true);
  }

  closeEnquiryModal(): void {
    this.showEnquiryModal.set(false);
    this.activeEnquiries.set([]);
  }

  editBike(id: number): void {
    this.router.navigate(['/seller/add-bike'], { queryParams: { id } });
  }

  formatPrice(p: number): string {
    return `Rs. ${p.toLocaleString()}`;
  }
}
