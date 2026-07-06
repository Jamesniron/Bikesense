import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Notification } from '../models/models';
import { MockDbService } from './mock-db.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private db = inject(MockDbService);

  getNotifications(userId: number): Observable<Notification[]> {
    const notifs = this.db.getNotifications().filter(n => n.userId === userId);
    return of(notifs).pipe(delay(200));
  }

  markNotificationAsRead(id: number): Observable<void> {
    const notifs = this.db.getNotifications();
    const notif = notifs.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.db.setNotifications(notifs);
    }
    return of(undefined);
  }

  createNotification(userId: number, title: string, message: string, type: Notification['type']): void {
    const notifs = this.db.getNotifications();
    const newNotif: Notification = {
      id: notifs.length > 0 ? Math.max(...notifs.map(n => n.id)) + 1 : 1,
      userId, title, message, read: false, date: new Date().toISOString(), type
    };
    notifs.push(newNotif);
    this.db.setNotifications(notifs);
  }
}
