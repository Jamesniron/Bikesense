import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ValuationRequest, ValuationResult,
  RecommendRequest, RecommendResponse
} from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BikeMlService {
  private readonly http = inject(HttpClient);

  /** Backend ASP.NET API (which proxies to Python ML or uses its own fallback) */
  private readonly backendUrl = `${environment.apiUrl}/valuation`;

  /** Direct Python FastAPI (optional direct hit) */
  private readonly mlUrl = environment.mlServiceUrl;

  valuate(request: ValuationRequest, listPrice?: number): Observable<ValuationResult> {
    let url = `${this.backendUrl}/valuate`;
    if (listPrice !== undefined && listPrice > 0) {
      url += `?listPrice=${listPrice}`;
    }
    return this.http.post<ValuationResult>(url, request);
  }

  recommend(request: RecommendRequest): Observable<RecommendResponse> {
    return this.http.post<RecommendResponse>(`${environment.apiUrl}/recommendations`, {
      Budget:          request.budget,
      UsageType:       request.usageType,
      PreferredBrand:  request.preferredBrand,
      MileagePriority: request.mileagePriority,
      MaxCC:           request.maxCC
    }).pipe(
      map((res: any) => ({
        budget:          res.budget,
        usageProfile:    res.usage_profile,
        recommendations: (res.recommendations || []).map((r: any) => ({
          brand:          r.brand,
          model:          r.model,
          yearRange:      r.year_range,
          cc:             r.cc,
          score:          r.score,
          reason:         r.reason,
          estimatedPrice: r.estimated_price
        }))
      })),
      catchError(() => of({
        budget:          request.budget,
        usageProfile:    request.usageType,
        recommendations: []
      }))
    );
  }

  checkMlHealth(): Observable<boolean> {
    return this.http.get<any>(`${this.mlUrl}/health`).pipe(
      map(res => res?.status === 'healthy'),
      catchError(() => of(false))
    );
  }
}
