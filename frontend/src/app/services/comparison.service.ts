import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MockDbService } from './mock-db.service';

@Injectable({ providedIn: 'root' })
export class ComparisonService {
  private db = inject(MockDbService);

  getComparisonAnalytics(): Observable<any> {
    return of({
      mostCompared: [
        { name: 'Yamaha FZ V3', count: 184 },
        { name: 'Honda Dio', count: 142 },
        { name: 'Bajaj Pulsar 150', count: 129 },
        { name: 'TVS Apache RTR 160', count: 98 }
      ],
      preferenceTrends: [
        { category: 'Fuel Efficient Scooters', percentage: 42 },
        { category: 'Sports Commuters (150cc)', percentage: 38 },
        { category: 'Premium / Adventure Bikes', percentage: 20 }
      ],
      healthScoreDistribution: [
        { range: '90-100 (Prisinte)', percentage: 25 },
        { range: '75-89 (Healthy)', percentage: 48 },
        { range: '50-74 (Average)', percentage: 22 },
        { range: 'Below 50 (Critical)', percentage: 5 }
      ]
    }).pipe(delay(300));
  }
}
