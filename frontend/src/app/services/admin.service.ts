import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MockDbService } from './mock-db.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private db = inject(MockDbService);

  getAdminDashboard(): Observable<any> {
    const users = this.db.getUsers();
    const bikes = this.db.getBikes();
    const reports = this.db.getReports();

    const totalUsers = users.length;
    const buyers = users.filter(u => u.role === 'Buyer').length;
    const sellers = users.filter(u => u.role === 'Seller').length;
    const dealers = users.filter(u => u.role === 'Dealer').length;

    const totalListings = bikes.length;
    const activeListings = bikes.filter(b => b.status === 'Active').length;
    const pendingListings = bikes.filter(b => b.status === 'Pending').length;
    const rejectedListings = bikes.filter(b => b.status === 'Rejected').length;
    const soldBikes = bikes.filter(b => b.status === 'Sold').length;

    const totalReports = reports.length;
    const fraudAlerts = reports.filter(r => r.type === 'Fraud' && r.status === 'Pending').length;
    const revenue = soldBikes * 15000 + dealers * 25000;

    const recentActivities = this.db.getActivityLogs().slice(0, 5);

    return of({
      metrics: { totalUsers, buyers, sellers, dealers, totalListings, activeListings, pendingListings, rejectedListings, soldBikes, totalReports, fraudAlerts, revenue },
      recentActivities
    }).pipe(delay(300));
  }

  getDashboardStats(): Observable<any> {
    return this.getAdminDashboard();
  }

  getReportedListings(): Observable<any[]> {
    return of(this.db.getReports()).pipe(delay(300));
  }

  resolveReport(id: number): Observable<void> {
    const reports = this.db.getReports();
    const report = reports.find(r => r.id === id);
    if (report) {
      report.status = 'Dismissed';
      this.db.setReports(reports);
      this.db.logActivity(1, 'System Administrator', 'Report Resolved', `Report ID ${id} dismissed`);
    }
    return of(undefined).pipe(delay(200));
  }

  getAllBikes(): Observable<any[]> {
    return of(this.db.getBikes()).pipe(delay(300));
  }

  getAdminAnalytics(): Observable<any> {
    const bikes = this.db.getBikes();
    const active = bikes.filter(b => b.status === 'Active');

    const totalPrices = active.reduce((sum, b) => sum + b.price, 0);
    const avgSellingPrice = active.length > 0 ? Math.round(totalPrices / active.length) : 0;

    const totalMileage = active.reduce((sum, b) => sum + b.mileage, 0);
    const avgMileage = active.length > 0 ? Math.round(totalMileage / active.length) : 0;

    const brandsCount: Record<string, number> = {};
    active.forEach(b => { brandsCount[b.brand] = (brandsCount[b.brand] || 0) + 1; });

    const locationCount: Record<string, number> = {};
    active.forEach(b => { locationCount[b.location] = (locationCount[b.location] || 0) + 1; });

    const accuracyLog = [
      { month: 'Jan', errorMargin: 4.8 }, { month: 'Feb', errorMargin: 4.2 }, { month: 'Mar', errorMargin: 3.9 },
      { month: 'Apr', errorMargin: 3.5 }, { month: 'May', errorMargin: 3.1 }, { month: 'Jun', errorMargin: 2.8 }
    ];

    const monthlyGrowth = [
      { month: 'Jan', listings: 120 }, { month: 'Feb', listings: 145 }, { month: 'Mar', listings: 190 },
      { month: 'Apr', listings: 220 }, { month: 'May', listings: 280 }, { month: 'Jun', listings: 340 }
    ];

    return of({
      averagePrice: avgSellingPrice,
      averageMileage: avgMileage,
      brandDistribution: Object.entries(brandsCount).map(([brand, count]) => ({ name: brand, value: count })),
      locationDistribution: Object.entries(locationCount).map(([loc, count]) => ({ name: loc, value: count })),
      accuracyLog,
      monthlyGrowth
    }).pipe(delay(400));
  }

  approveBike(id: number): Observable<void> {
    const bikes = this.db.getBikes();
    const bike = bikes.find(b => b.id === id);
    if (bike) {
      bike.status = 'Active';
      this.db.setBikes(bikes);
      this.db.logActivity(1, 'System Administrator', 'Listing Approved', `Listing ID ${id} approved`);
    }
    return of(undefined).pipe(delay(200));
  }

  rejectBike(id: number): Observable<void> {
    const bikes = this.db.getBikes();
    const bike = bikes.find(b => b.id === id);
    if (bike) {
      bike.status = 'Rejected';
      this.db.setBikes(bikes);
      this.db.logActivity(1, 'System Administrator', 'Listing Rejected', `Listing ID ${id} rejected`);
    }
    return of(undefined).pipe(delay(200));
  }

  approveListing(id: number): Observable<void> {
    return this.approveBike(id);
  }

  rejectListing(id: number, reason: string): Observable<void> {
    const bikes = this.db.getBikes();
    const bike = bikes.find(b => b.id === id);
    if (bike) {
      bike.status = 'Rejected';
      this.db.setBikes(bikes);
      this.db.logActivity(1, 'System Administrator', 'Listing Rejected', `Listing ID ${id} rejected. Reason: ${reason}`);
    }
    return of(undefined).pipe(delay(200));
  }

  getActivityLogs(): Observable<any[]> {
    return of(this.db.getActivityLogs()).pipe(delay(200));
  }
}
