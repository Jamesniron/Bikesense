import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/models';
import { MockDbService } from './mock-db.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private db = inject(MockDbService);

  getUsers(): Observable<User[]> {
    return of(this.db.getUsers()).pipe(delay(300));
  }

  getAllUsers(): Observable<User[]> {
    return this.getUsers();
  }

  createUser(data: Omit<User, 'id' | 'createdDate'>): Observable<User> {
    const users = this.db.getUsers();
    const newUser: User = {
      ...data,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      createdDate: new Date().toISOString()
    };
    users.push(newUser);
    this.db.setUsers(users);
    this.db.logActivity(1, 'System Administrator', 'User Created', `Created user ${newUser.email}`);
    return of(newUser).pipe(delay(400));
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    const users = this.db.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return of({} as User);
    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    this.db.setUsers(users);
    this.db.logActivity(1, 'System Administrator', 'User Updated', `Updated user ${updatedUser.email}`);
    return of(updatedUser).pipe(delay(300));
  }

  updateUserStatus(id: number, isSuspended: boolean): Observable<User> {
    const status: 'Active' | 'Suspended' = isSuspended ? 'Suspended' : 'Active';
    const users = this.db.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return of({} as User);
    
    const updatedUser = { ...users[index], status };
    users[index] = updatedUser;
    this.db.setUsers(users);
    
    const action = isSuspended ? 'User Suspended' : 'User Activated';
    this.db.logActivity(1, 'System Administrator', action, `User ${updatedUser.email} status changed to ${status}`);
    
    return of(updatedUser).pipe(delay(300));
  }

  deleteUser(id: number): Observable<void> {
    let users = this.db.getUsers();
    const user = users.find(u => u.id === id);
    users = users.filter(u => u.id !== id);
    this.db.setUsers(users);
    if (user) {
      this.db.logActivity(1, 'System Administrator', 'User Deleted', `Deleted user ${user.email}`);
    }
    return of(undefined).pipe(delay(300));
  }
}
