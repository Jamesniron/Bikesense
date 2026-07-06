import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SellerService } from '../../services/seller.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent implements OnInit {
  private readonly sellerService = inject(SellerService);
  private readonly auth = inject(AuthService);

  loading = signal<boolean>(true);
  cards = signal<any>({
    totalListings: 0,
    activeListings: 0,
    soldBikes: 0,
    pendingApproval: 0,
    rejectedListings: 0,
    totalViews: 0
  });

  chartData = signal<any>({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    views: [0, 0, 0, 0, 0, 0, 0],
    enquiries: [0, 0, 0, 0, 0, 0, 0] // dummy fallback
  });

  // SVG Chart Computations
  chartPoints = signal<string>('');
  enquiryPoints = signal<string>('');
  chartGridLines = signal<number[]>([]);

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId || 2;
    this.sellerService.getDashboardStats(userId).subscribe({
      next: (res) => {
        this.cards.set(res.stats);
        
        const labels = res.charts.bikeViews.map((c: any) => c.name);
        const views = res.charts.bikeViews.map((c: any) => c.value);
        const enquiries = res.charts.bikeViews.map((c: any) => Math.floor(c.value / 10)); // Just a mock derived array
        
        this.chartData.set({ labels, views, enquiries });
        
        this.generateSvgPaths(views, enquiries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private generateSvgPaths(views: number[], enquiries: number[]): void {
    if (!views || views.length === 0) return;
    
    const maxVal = Math.max(...views, 10);
    const chartWidth = 500;
    const chartHeight = 150;
    const padding = 10;
    
    // Grid line calculations
    const steps = 4;
    const grid: number[] = [];
    for (let i = 0; i <= steps; i++) {
      grid.push(padding + ((chartHeight - 2 * padding) / steps) * i);
    }
    this.chartGridLines.set(grid);

    // Compute view line points
    const viewPointsArr = views.map((val, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (views.length - 1);
      const y = chartHeight - padding - (val * (chartHeight - 2 * padding)) / maxVal;
      return `${x},${y}`;
    });
    this.chartPoints.set(viewPointsArr.join(' '));

    // Compute enquiry points
    const enquiryPointsArr = enquiries.map((val, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (enquiries.length - 1);
      const y = chartHeight - padding - (val * (chartHeight - 2 * padding)) / (Math.max(...enquiries, 1) || 5) * 0.4;
      return `${x},${y}`;
    });
    this.enquiryPoints.set(enquiryPointsArr.join(' '));
  }
}
