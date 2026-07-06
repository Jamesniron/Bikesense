import { Injectable } from '@angular/core';
import { Bike, User, Report, Notification, ActivityLog } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MockDbService {
  constructor() {
    this.seed();
  }

  private seed(): void {
    if (!localStorage.getItem('bs_bikes_mock')) {
      const initialBikes: Bike[] = [
        {
          id: 1, title: 'Honda Dio 2018 Blue Excellent', brand: 'Honda', model: 'Dio', variant: 'DLX',
          bikeType: 'Scooters', year: 2018, regYear: 2018, mileage: 24000, engineCC: 110,
          fuelType: 'Petrol', transmission: 'Auto', color: 'Blue', price: 420000, condition: 'Excellent',
          ownerCount: 1, insurance: 'Full Option', registration: 'Registered', serviceHistory: 'Full',
          accidentHistory: 'None', description: 'Well maintained Honda Dio, first owner, full service records.',
          location: 'Gampaha', sellerId: 2, sellerName: 'Rushan Perera', sellerPhone: '+94719876543',
          isSuspicious: false, createdDate: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
          imageUrls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format'],
          status: 'Active', chassisNumber: 'ME4JF56A9J810332', engineNumber: 'JF56E-8291032',
          views: 142, wishlistCount: 12, additionalFeatures: ['Tubeless Tyres', 'Alloy Wheels', 'Digital Console'],
          enquiries: [
            { id: 1, buyerName: 'Anil Silva', buyerEmail: 'anil@gmail.com', buyerPhone: '+94771234567', message: 'Is the price negotiable?', date: new Date().toISOString() }
          ]
        },
        {
          id: 2, title: 'Bajaj Pulsar 150 Neon 2020 Red', brand: 'Bajaj', model: 'Pulsar', variant: 'Neon',
          bikeType: 'Motorbikes', year: 2020, regYear: 2020, mileage: 18000, engineCC: 150,
          fuelType: 'Petrol', transmission: 'Manual', color: 'Red', price: 580000, condition: 'Good',
          ownerCount: 2, insurance: 'Third Party', registration: 'Registered', serviceHistory: 'Partial',
          accidentHistory: 'None', description: 'Smooth Pulsar 150, engine is perfect, new rear tyre.',
          location: 'Colombo', sellerId: 2, sellerName: 'Rushan Perera', sellerPhone: '+94719876543',
          isSuspicious: false, createdDate: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
          imageUrls: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format'],
          status: 'Active', chassisNumber: 'MD2A11CY3L910243', engineNumber: 'DJX150-109283',
          views: 290, wishlistCount: 24, additionalFeatures: ['LED DRLs', 'Split Seats', 'Engine Kill Switch'],
          enquiries: []
        },
        {
          id: 3, title: 'Yamaha FZ V3 ABS 2021 Black', brand: 'Yamaha', model: 'FZ', variant: 'Version 3',
          bikeType: 'Motorbikes', year: 2021, regYear: 2021, mileage: 12000, engineCC: 149,
          fuelType: 'Petrol', transmission: 'Manual', color: 'Matt Black', price: 790000, condition: 'Excellent',
          ownerCount: 1, insurance: 'Full Option', registration: 'Registered', serviceHistory: 'Full',
          accidentHistory: 'None', description: 'Low mileage Yamaha FZ V3 with ABS. Pristine condition.',
          location: 'Kandy', sellerId: 3, sellerName: 'Apex Auto Dealers', sellerPhone: '+94112998877',
          isSuspicious: false, createdDate: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
          imageUrls: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format'],
          status: 'Active', chassisNumber: 'ME1RG06A5J029312', engineNumber: 'G3J4E-029412',
          views: 450, wishlistCount: 45, additionalFeatures: ['Single-Channel ABS', 'Fuel Injection', 'LED Headlight'],
          enquiries: []
        },
        {
          id: 4, title: 'TVS Apache RTR 160 4V 2022', brand: 'TVS', model: 'Apache', variant: 'RTR 160 4V',
          bikeType: 'Motorbikes', year: 2022, regYear: 2022, mileage: 8000, engineCC: 160,
          fuelType: 'Petrol', transmission: 'Manual', color: 'Racing Red', price: 720000, condition: 'Excellent',
          ownerCount: 1, insurance: 'Full Option', registration: 'Registered', serviceHistory: 'Full',
          accidentHistory: 'None', description: 'Almost new TVS Apache 160 4V. Fully loaded spec.',
          location: 'Colombo', sellerId: 3, sellerName: 'Apex Auto Dealers', sellerPhone: '+94112998877',
          isSuspicious: false, createdDate: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
          imageUrls: ['https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600&auto=format'],
          status: 'Pending', chassisNumber: 'MD3TR45A8K290483', engineNumber: 'RTR160-281032',
          views: 12, wishlistCount: 1, additionalFeatures: ['Riding Modes', 'SmartXonnect Bluetooth', 'GTT Tech'],
          enquiries: []
        },
        {
          id: 5, title: 'Suzuki Gixxer SF 2020 Blue', brand: 'Suzuki', model: 'Gixxer', variant: 'SF',
          bikeType: 'Motorbikes', year: 2020, regYear: 2020, mileage: 22000, engineCC: 155,
          fuelType: 'Petrol', transmission: 'Manual', color: 'Blue Pearl', price: 650000, condition: 'Good',
          ownerCount: 2, insurance: 'Third Party', registration: 'Registered', serviceHistory: 'Partial',
          accidentHistory: 'Minor', description: 'Gixxer SF with minor repaired scratches. Running smooth.',
          location: 'Negombo', sellerId: 2, sellerName: 'Rushan Perera', sellerPhone: '+94719876543',
          isSuspicious: true, createdDate: new Date(Date.now() - 12 * 24 * 3600000).toISOString(),
          imageUrls: ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&auto=format'],
          status: 'Active', chassisNumber: 'MD8DF21CYM291830', engineNumber: 'GX155-281033',
          views: 198, wishlistCount: 8, additionalFeatures: ['Full Fairing', 'Clip-on Handlebars', 'LED Tail Lamp'],
          enquiries: []
        }
      ];
      this.setBikes(initialBikes);
    }

    if (!localStorage.getItem('bs_users_mock')) {
      const initialUsers: User[] = [
        { id: 1, fullName: 'System Administrator', email: 'admin@bikesense.lk', role: 'Administrator', status: 'Active', phoneNumber: '+94112233445', createdDate: '2025-01-01T00:00:00Z' },
        { id: 2, fullName: 'Rushan Perera', email: 'seller@bikesense.lk', role: 'Seller', status: 'Active', phoneNumber: '+94719876543', createdDate: '2025-02-15T12:00:00Z' },
        { id: 3, fullName: 'Apex Auto Dealers', email: 'dealer@bikesense.lk', role: 'Dealer', status: 'Active', phoneNumber: '+94112998877', createdDate: '2025-03-10T08:30:00Z' },
        { id: 4, fullName: 'Nimna Silva', email: 'buyer@bikesense.lk', role: 'Buyer', status: 'Active', phoneNumber: '+94773829103', createdDate: '2025-04-20T14:15:00Z' },
        { id: 5, fullName: 'Fake Account User', email: 'fakeuser@domain.com', role: 'Seller', status: 'Suspended', phoneNumber: '+94709823412', createdDate: '2025-05-18T10:00:00Z' }
      ];
      this.setUsers(initialUsers);
    }

    if (!localStorage.getItem('bs_reports_mock')) {
      const initialReports: Report[] = [
        { id: 1, bikeId: 5, bikeTitle: 'Suzuki Gixxer SF 2020 Blue', reporterName: 'Janaka Bandara', reporterEmail: 'janaka@yahoo.com', reason: 'Listed price is suspiciously low and mileage appears tampered.', type: 'Fraud', status: 'Pending', createdDate: new Date().toISOString() }
      ];
      this.setReports(initialReports);
    }

    if (!localStorage.getItem('bs_wishlist_mock')) {
      localStorage.setItem('bs_wishlist_mock', JSON.stringify([1, 3]));
    }

    if (!localStorage.getItem('bs_notifications_mock')) {
      const initialNotifications: Notification[] = [
        { id: 1, userId: 2, title: 'Listing Approved', message: 'Your Yamaha FZ V3 ABS listing has been approved by the admin.', read: false, date: new Date(Date.now() - 4 * 3600000).toISOString(), type: 'listing_approved' },
        { id: 2, userId: 2, title: 'New Enquiry Received', message: 'You have a new buyer enquiry for your Honda Dio.', read: false, date: new Date().toISOString(), type: 'enquiry' }
      ];
      this.setNotifications(initialNotifications);
    }

    if (!localStorage.getItem('bs_activity_logs_mock')) {
      const initialLogs: ActivityLog[] = [
        { id: 1, userId: 1, userName: 'System Administrator', action: 'User suspension', details: 'User ID 5 suspended due to fraud alerts.', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), targetId: 5, ipAddress: '192.168.1.1' },
        { id: 2, userId: 3, userName: 'Apex Auto Dealers', action: 'Listing submitted', details: 'New TVS Apache RTR 160 submitted by seller Apex Auto.', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), targetId: 4, ipAddress: '192.168.1.5' },
        { id: 3, userId: 4, userName: 'Nimna Silva', action: 'Report filed', details: 'Janaka reported listing ID 5 for suspected fraud.', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), targetId: 5, ipAddress: '192.168.1.10' },
        { id: 4, userId: 1, userName: 'System Administrator', action: 'Listing approved', details: 'Yamaha FZ V3 ABS listing approved by Admin.', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), targetId: 3, ipAddress: '192.168.1.1' }
      ];
      this.setActivityLogs(initialLogs);
    }
  }

  getBikes(): Bike[] { return JSON.parse(localStorage.getItem('bs_bikes_mock') || '[]'); }
  setBikes(bikes: Bike[]): void { localStorage.setItem('bs_bikes_mock', JSON.stringify(bikes)); }

  getUsers(): User[] { return JSON.parse(localStorage.getItem('bs_users_mock') || '[]'); }
  setUsers(users: User[]): void { localStorage.setItem('bs_users_mock', JSON.stringify(users)); }

  getReports(): Report[] { return JSON.parse(localStorage.getItem('bs_reports_mock') || '[]'); }
  setReports(reports: Report[]): void { localStorage.setItem('bs_reports_mock', JSON.stringify(reports)); }

  getNotifications(): Notification[] { return JSON.parse(localStorage.getItem('bs_notifications_mock') || '[]'); }
  setNotifications(notifs: Notification[]): void { localStorage.setItem('bs_notifications_mock', JSON.stringify(notifs)); }

  getActivityLogs(): ActivityLog[] { return JSON.parse(localStorage.getItem('bs_activity_logs_mock') || '[]'); }
  setActivityLogs(logs: ActivityLog[]): void { localStorage.setItem('bs_activity_logs_mock', JSON.stringify(logs)); }

  getWishlist(): number[] { return JSON.parse(localStorage.getItem('bs_wishlist_mock') || '[]'); }
  setWishlist(ids: number[]): void { localStorage.setItem('bs_wishlist_mock', JSON.stringify(ids)); }

  logActivity(userId: number | undefined, userName: string | undefined, action: string, details: string): void {
    const logs = this.getActivityLogs();
    logs.unshift({
      id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      userId, userName, action, details, timestamp: new Date().toISOString()
    });
    this.setActivityLogs(logs);
  }
}
