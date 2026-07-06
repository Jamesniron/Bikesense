import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Bike } from '../models/models';
import { MockDbService } from './mock-db.service';

@Injectable({ providedIn: 'root' })
export class BuyerService {
  private db = inject(MockDbService);

  getDashboardData(userId: number): Observable<any> {
    const bikes = this.db.getBikes();
    const activeBikes = bikes.filter(b => b.status === 'Active');
    
    // Simulate recently viewed (random 3)
    const recentlyViewed = activeBikes.slice(0, 3);
    
    // Simulate recommended bikes (random 3)
    const recommended = activeBikes.slice(3, 6);
    
    // Simulate saved searches
    const savedSearches = [
      { name: 'Honda Scooters under 500k', url: '/marketplace?brand=Honda&bikeType=Scooters&maxPrice=500000' },
      { name: 'Sports bikes in Colombo', url: '/marketplace?location=Colombo&bikeType=Motorbikes' }
    ];

    const favCategories = [
      { name: 'Scooters', icon: 'electric_scooter', count: 42 },
      { name: 'Cruisers', icon: 'motorcycle', count: 18 }
    ];

    return of({
      recentlyViewed,
      recommended,
      savedSearches,
      favCategories
    }).pipe(delay(300));
  }

  getSimilarBikes(bikeId: number): Observable<Bike[]> {
    const bikes = this.db.getBikes();
    const target = bikes.find(b => b.id === bikeId);
    if (!target) return of([]);

    const similar = bikes.filter(b => 
      b.id !== bikeId && b.status === 'Active' &&
      (b.brand === target.brand || b.engineCC === target.engineCC || Math.abs(b.price - target.price) < 100000)
    ).slice(0, 4);

    return of(similar).pipe(delay(300));
  }
}
