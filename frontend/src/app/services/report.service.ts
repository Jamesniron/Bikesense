import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Report } from '../models/models';
import { MockDbService } from './mock-db.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private db = inject(MockDbService);

  reportListing(bikeId: number, report: { reporterName: string, reporterEmail: string, reason: string, type: string }): Observable<Report> {
    const reports = this.db.getReports();
    const bikes = this.db.getBikes();
    const bike = bikes.find(b => b.id === bikeId);
    
    const newReport: Report = {
      id: reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1,
      bikeId,
      bikeTitle: bike?.title || 'Unknown',
      reporterName: report.reporterName,
      reporterEmail: report.reporterEmail,
      reason: report.reason,
      type: report.type as any,
      status: 'Pending',
      createdDate: new Date().toISOString()
    };

    reports.push(newReport);
    this.db.setReports(reports);
    this.db.logActivity(undefined, report.reporterName, 'Report Filed', `Report filed for listing ID ${bikeId}`);
    return of(newReport).pipe(delay(300));
  }

  getReports(): Observable<Report[]> {
    return of(this.db.getReports()).pipe(delay(300));
  }

  updateReportStatus(id: number, status: 'Investigated' | 'Dismissed'): Observable<Report> {
    const reports = this.db.getReports();
    const report = reports.find(r => r.id === id);
    if (report) {
      report.status = status;
      this.db.setReports(reports);
      this.db.logActivity(1, 'System Administrator', 'Report Updated', `Report ID ${id} status updated to ${status}`);
      return of(report).pipe(delay(200));
    }
    return of({} as Report);
  }
}
