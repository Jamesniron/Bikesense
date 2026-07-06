import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ActivityLog } from '../../models/models';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-logs.html',
  styleUrl: './activity-logs.css'
})
export class ActivityLogsComponent implements OnInit {
  private adminService = inject(AdminService);

  logs = signal<ActivityLog[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.adminService.getActivityLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getActionClass(action: string): string {
    if (action.includes('Approved') || action.includes('Created')) return 'text-emerald';
    if (action.includes('Suspended') || action.includes('Rejected') || action.includes('Deleted')) return 'text-rose';
    if (action.includes('Updated') || action.includes('Modified')) return 'text-amber';
    return 'text-cyan';
  }
}
