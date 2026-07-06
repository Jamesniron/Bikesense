import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Bike, BikeFilter, PagedResult } from '../models/models';
import { MockDbService } from './mock-db.service';

@Injectable({ providedIn: 'root' })
export class BikeService {
  private db = inject(MockDbService);

  getBikes(filter: BikeFilter = {}): Observable<PagedResult<Bike>> {
    let bikes = this.db.getBikes();

    if (filter.brand) bikes = bikes.filter(b => b.brand.toLowerCase() === filter.brand!.toLowerCase());
    if (filter.bikeType) bikes = bikes.filter(b => b.bikeType.toLowerCase() === filter.bikeType!.toLowerCase());
    if (filter.minPrice) bikes = bikes.filter(b => b.price >= filter.minPrice!);
    if (filter.maxPrice) bikes = bikes.filter(b => b.price <= filter.maxPrice!);
    if (filter.condition) bikes = bikes.filter(b => b.condition.toLowerCase() === filter.condition!.toLowerCase());
    if (filter.location) bikes = bikes.filter(b => b.location.toLowerCase().includes(filter.location!.toLowerCase()));
    if (filter.minYear) bikes = bikes.filter(b => b.year >= filter.minYear!);
    if (filter.maxYear) bikes = bikes.filter(b => b.year <= filter.maxYear!);
    
    // Status filter
    if (filter.status) {
      bikes = bikes.filter(b => b.status === filter.status);
    } else {
      bikes = bikes.filter(b => b.status === 'Active' || !b.status); // Default active only
    }

    // Additional advanced filters for Buyer Module
    // Note: To support dynamic keyword search from marketplace
    // we would extend this filter here if 'keyword' is added to BikeFilter
    
    const page = filter.page || 1;
    const limit = filter.limit || 12;
    const startIndex = (page - 1) * limit;
    const paginatedItems = bikes.slice(startIndex, startIndex + limit);

    return of({
      items: paginatedItems,
      totalRecords: bikes.length,
      page,
      limit,
      totalPages: Math.ceil(bikes.length / limit)
    }).pipe(delay(300));
  }

  getBikeById(id: number): Observable<Bike | undefined> {
    const bikes = this.db.getBikes();
    const bike = bikes.find(b => b.id === id);
    if (bike) {
      bike.views = (bike.views || 0) + 1;
      this.db.setBikes(bikes);
    }
    return of(bike).pipe(delay(200));
  }
}
