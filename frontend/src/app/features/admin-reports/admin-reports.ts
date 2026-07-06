import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css'
})
export class AdminReportsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  reports = signal<any[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.adminService.getReportedListings().subscribe({
      next: (data) => {
        this.reports.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  async resolveReport(report: any): Promise<void> {
    const confirm = await this.dialog.confirm({
      title: 'Resolve Report',
      message: `Mark report #${report.id} as resolved?`,
      confirmText: 'Resolve'
    });

    if (confirm) {
      this.adminService.resolveReport(report.id).subscribe(() => {
        this.toast.success('Report resolved');
        this.loadReports();
      });
    }
  }

  async rejectListing(report: any): Promise<void> {
    const confirm = await this.dialog.confirm({
      title: 'Reject Listing',
      message: `Reject the reported listing #${report.listingId}?`,
      confirmText: 'Reject',
      danger: true
    });

    if (confirm) {
      this.adminService.rejectListing(report.listingId, 'Rejected due to user report').subscribe(() => {
        this.toast.success('Listing rejected');
        // also mark report as resolved
        this.adminService.resolveReport(report.id).subscribe(() => {
           this.loadReports();
        });
      });
    }
  }
}
