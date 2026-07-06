import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Bike } from '../models/models';
import { MockDbService } from './mock-db.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private db = inject(MockDbService);

  getWishlist(): Observable<Bike[]> {
    const listIds = this.db.getWishlist();
    const bikes = this.db.getBikes();
    const wishlistBikes = bikes.filter(b => listIds.includes(b.id));
    return of(wishlistBikes).pipe(delay(300));
  }

  addToWishlist(bikeId: number): Observable<number[]> {
    const listIds = this.db.getWishlist();
    if (!listIds.includes(bikeId)) {
      listIds.push(bikeId);
      this.db.setWishlist(listIds);
      
      const bikes = this.db.getBikes();
      const bike = bikes.find(b => b.id === bikeId);
      if (bike) {
        bike.wishlistCount = (bike.wishlistCount || 0) + 1;
        this.db.setBikes(bikes);
      }
    }
    return of(listIds).pipe(delay(200));
  }

  removeFromWishlist(bikeId: number): Observable<number[]> {
    let listIds = this.db.getWishlist();
    listIds = listIds.filter(id => id !== bikeId);
    this.db.setWishlist(listIds);

    const bikes = this.db.getBikes();
    const bike = bikes.find(b => b.id === bikeId);
    if (bike && bike.wishlistCount && bike.wishlistCount > 0) {
      bike.wishlistCount--;
      this.db.setBikes(bikes);
    }
    return of(listIds).pipe(delay(200));
  }

  isInWishlist(bikeId: number): boolean {
    const listIds = this.db.getWishlist();
    return listIds.includes(bikeId);
  }
}
