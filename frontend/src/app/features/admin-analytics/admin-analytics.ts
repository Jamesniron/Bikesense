import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.html',
  styleUrl: './admin-analytics.css'
})
export class AdminAnalyticsComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  analytics = signal<any>(null);

  // SVG Chart Computations
  chartPoints = signal<string>('');
  chartGridLines = signal<number[]>([]);

  ngOnInit(): void {
    this.adminService.getAdminAnalytics().subscribe({
      next: (data: any) => {
        this.analytics.set(data);
        this.generateSvgPaths(data.monthlyGrowth.map((d: any) => d.listings));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private generateSvgPaths(values: number[]): void {
    if (!values || values.length === 0) return;
    
    const maxVal = Math.max(...values, 10);
    const chartWidth = 600;
    const chartHeight = 200;
    const padding = 10;
    
    const steps = 4;
    const grid: number[] = [];
    for (let i = 0; i <= steps; i++) {
      grid.push(padding + ((chartHeight - 2 * padding) / steps) * i);
    }
    this.chartGridLines.set(grid);

    const pointsArr = values.map((val, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (values.length - 1);
      const y = chartHeight - padding - (val * (chartHeight - 2 * padding)) / maxVal;
      return `${x},${y}`;
    });
    this.chartPoints.set(pointsArr.join(' '));
  }
}
