import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import { Bike } from '../../models/models';

@Component({
  selector: 'app-motorcycle-management',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './motorcycle-management.html',
  styleUrl: './motorcycle-management.css'
})
export class MotorcycleManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  bikes = signal<Bike[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadBikes();
  }

  loadBikes(): void {
    this.loading.set(true);
    this.adminService.getAllBikes().subscribe({
      next: (data) => {
        this.bikes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  async approveBike(bike: Bike): Promise<void> {
    const confirm = await this.dialog.confirm({
      title: 'Approve Listing',
      message: `Approve the listing "${bike.title}"?`,
      confirmText: 'Approve'
    });

    if (confirm) {
      this.adminService.approveListing(bike.id).subscribe(() => {
        this.toast.success('Listing approved');
        this.loadBikes();
      });
    }
  }

  async rejectBike(bike: Bike): Promise<void> {
    const confirm = await this.dialog.confirm({
      title: 'Reject Listing',
      message: `Reject the listing "${bike.title}"?`,
      confirmText: 'Reject',
      danger: true
    });

    if (confirm) {
      this.adminService.rejectListing(bike.id, 'Violation of terms').subscribe(() => {
        this.toast.success('Listing rejected');
        this.loadBikes();
      });
    }
  }

  formatPrice(p: number): string {
    return `Rs. ${p.toLocaleString()}`;
  }
}
