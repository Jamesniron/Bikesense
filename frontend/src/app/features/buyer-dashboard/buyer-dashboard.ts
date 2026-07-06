import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BuyerService } from '../../services/buyer.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Bike, Notification } from '../../models/models';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './buyer-dashboard.html',
  styleUrl: './buyer-dashboard.css'
})
export class BuyerDashboardComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private notificationService = inject(NotificationService);
  private auth = inject(AuthService);

  loading = signal(true);
  dashboardData = signal<any>(null);
  notifications = signal<Notification[]>([]);

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId || 4; // Mock buyer ID
    
    this.buyerService.getDashboardData(userId).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.notificationService.getNotifications(userId).subscribe({
      next: (notifs) => this.notifications.set(notifs)
    });
  }

  formatPrice(p: number): string {
    return `Rs. ${p.toLocaleString()}`;
  }

  markAsRead(id: number): void {
    this.notificationService.markNotificationAsRead(id).subscribe(() => {
      const current = this.notifications();
      const n = current.find(x => x.id === id);
      if (n) n.read = true;
      this.notifications.set([...current]);
    });
  }
}
