import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Bike } from '../models/models';
import { MockDbService } from './mock-db.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class SellerService {
  private db = inject(MockDbService);
  // Using injector for NotificationService if needed to avoid circular dependency
  // but we can inject it directly if no circular deps exist.

  getSellerBikes(sellerId: number): Observable<Bike[]> {
    const bikes = this.db.getBikes().filter(b => b.sellerId === sellerId);
    return of(bikes).pipe(delay(300));
  }

  createBike(data: any): Observable<Bike> {
    const bikes = this.db.getBikes();
    const currentUser = JSON.parse(localStorage.getItem('bs_user') || 'null');
    
    const newBike: Bike = {
      ...data,
      id: bikes.length > 0 ? Math.max(...bikes.map(b => b.id)) + 1 : 1,
      sellerId: currentUser?.userId || 2,
      sellerName: currentUser?.fullName || 'Rushan Perera',
      sellerPhone: currentUser?.phoneNumber || '+94719876543',
      isSuspicious: false, // We could add logic for this
      createdDate: new Date().toISOString(),
      status: 'Pending',
      views: 0,
      wishlistCount: 0,
      enquiries: []
    };

    bikes.push(newBike);
    this.db.setBikes(bikes);
    this.db.logActivity(newBike.sellerId, newBike.sellerName, 'Listing Created', `Created listing for ${newBike.title}`);
    return of(newBike).pipe(delay(500));
  }

  updateBike(id: number, data: Partial<Bike>): Observable<Bike> {
    const bikes = this.db.getBikes();
    const index = bikes.findIndex(b => b.id === id);
    if (index === -1) return of({} as Bike);
    
    const updatedBike = { ...bikes[index], ...data };
    bikes[index] = updatedBike;
    this.db.setBikes(bikes);
    this.db.logActivity(updatedBike.sellerId, updatedBike.sellerName, 'Listing Updated', `Updated listing for ${updatedBike.title}`);
    return of(updatedBike).pipe(delay(500));
  }

  deleteBike(id: number): Observable<void> {
    let bikes = this.db.getBikes();
    const bike = bikes.find(b => b.id === id);
    bikes = bikes.filter(b => b.id !== id);
    this.db.setBikes(bikes);
    if (bike) {
      this.db.logActivity(bike.sellerId, bike.sellerName, 'Listing Deleted', `Deleted listing for ${bike.title}`);
    }
    return of(undefined).pipe(delay(400));
  }

  duplicateBike(id: number): Observable<Bike> {
    const bikes = this.db.getBikes();
    const original = bikes.find(b => b.id === id);
    if (!original) return of({} as Bike);

    const duplicate: Bike = {
      ...original,
      id: Math.max(...bikes.map(b => b.id)) + 1,
      title: `${original.title} (Duplicate)`,
      createdDate: new Date().toISOString(),
      views: 0,
      wishlistCount: 0,
      status: 'Pending',
      enquiries: []
    };
    bikes.push(duplicate);
    this.db.setBikes(bikes);
    this.db.logActivity(duplicate.sellerId, duplicate.sellerName, 'Listing Duplicated', `Duplicated listing ${original.title}`);
    return of(duplicate).pipe(delay(400));
  }

  getDashboardStats(sellerId: number): Observable<any> {
    const bikes = this.db.getBikes().filter(b => b.sellerId === sellerId);
    
    const stats = {
      totalListings: bikes.length,
      activeListings: bikes.filter(b => b.status === 'Active').length,
      pendingApproval: bikes.filter(b => b.status === 'Pending').length,
      rejectedListings: bikes.filter(b => b.status === 'Rejected').length,
      soldBikes: bikes.filter(b => b.status === 'Sold').length,
      totalViews: bikes.reduce((sum, b) => sum + (b.views || 0), 0)
    };

    const charts = {
      monthlyListings: [
        { month: 'Jan', count: 2 }, { month: 'Feb', count: 4 }, { month: 'Mar', count: 1 },
        { month: 'Apr', count: 5 }, { month: 'May', count: 3 }, { month: 'Jun', count: 6 }
      ],
      bikeViews: [
        { name: 'Mon', value: 120 }, { name: 'Tue', value: 150 }, { name: 'Wed', value: 90 },
        { name: 'Thu', value: 200 }, { name: 'Fri', value: 180 }, { name: 'Sat', value: 300 }, { name: 'Sun', value: 250 }
      ],
      soldBikesTrend: [
        { month: 'Jan', count: 1 }, { month: 'Feb', count: 2 }, { month: 'Mar', count: 0 },
        { month: 'Apr', count: 3 }, { month: 'May', count: 2 }, { month: 'Jun', count: 4 }
      ]
    };

    return of({ stats, charts }).pipe(delay(300));
  }
}
