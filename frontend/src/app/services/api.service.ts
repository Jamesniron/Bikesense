import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Bike, BikeCreate, BikeFilter, PagedResult, User, Report, Notification, Enquiry } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';

  constructor() {
    this.seedMockData();
  }

  // ─── LocalStorage Mock Database Management ──────────────────
  private seedMockData(): void {
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
      localStorage.setItem('bs_bikes_mock', JSON.stringify(initialBikes));
    }

    if (!localStorage.getItem('bs_users_mock')) {
      const initialUsers: User[] = [
        { id: 1, fullName: 'System Administrator', email: 'admin@bikesense.lk', role: 'Administrator', status: 'Active', phoneNumber: '+94112233445', createdDate: '2025-01-01T00:00:00Z' },
        { id: 2, fullName: 'Rushan Perera', email: 'seller@bikesense.lk', role: 'Seller', status: 'Active', phoneNumber: '+94719876543', createdDate: '2025-02-15T12:00:00Z' },
        { id: 3, fullName: 'Apex Auto Dealers', email: 'dealer@bikesense.lk', role: 'Dealer', status: 'Active', phoneNumber: '+94112998877', createdDate: '2025-03-10T08:30:00Z' },
        { id: 4, fullName: 'Nimna Silva', email: 'buyer@bikesense.lk', role: 'Buyer', status: 'Active', phoneNumber: '+94773829103', createdDate: '2025-04-20T14:15:00Z' },
        { id: 5, fullName: 'Fake Account User', email: 'fakeuser@domain.com', role: 'Seller', status: 'Suspended', phoneNumber: '+94709823412', createdDate: '2025-05-18T10:00:00Z' }
      ];
      localStorage.setItem('bs_users_mock', JSON.stringify(initialUsers));
    }

    if (!localStorage.getItem('bs_reports_mock')) {
      const initialReports: Report[] = [
        { id: 1, bikeId: 5, bikeTitle: 'Suzuki Gixxer SF 2020 Blue', reporterName: 'Janaka Bandara', reporterEmail: 'janaka@yahoo.com', reason: 'Listed price is suspiciously low and mileage appears tampered.', type: 'Fraud', status: 'Pending', createdDate: new Date().toISOString() }
      ];
      localStorage.setItem('bs_reports_mock', JSON.stringify(initialReports));
    }

    if (!localStorage.getItem('bs_wishlist_mock')) {
      localStorage.setItem('bs_wishlist_mock', JSON.stringify([1, 3]));
    }

    if (!localStorage.getItem('bs_notifications_mock')) {
      const initialNotifications: Notification[] = [
        { id: 1, userId: 2, title: 'Listing Approved', message: 'Your Yamaha FZ V3 ABS listing has been approved by the admin.', read: false, date: new Date(Date.now() - 4 * 3600000).toISOString(), type: 'listing_approved' },
        { id: 2, userId: 2, title: 'New Enquiry Received', message: 'You have a new buyer enquiry for your Honda Dio.', read: false, date: new Date().toISOString(), type: 'enquiry' }
      ];
      localStorage.setItem('bs_notifications_mock', JSON.stringify(initialNotifications));
    }
  }

  private getStoredBikes(): Bike[] {
    return JSON.parse(localStorage.getItem('bs_bikes_mock') || '[]');
  }

  private saveStoredBikes(bikes: Bike[]): void {
    localStorage.setItem('bs_bikes_mock', JSON.stringify(bikes));
  }

  private getStoredUsers(): User[] {
    return JSON.parse(localStorage.getItem('bs_users_mock') || '[]');
  }

  private saveStoredUsers(users: User[]): void {
    localStorage.setItem('bs_users_mock', JSON.stringify(users));
  }

  private getStoredReports(): Report[] {
    return JSON.parse(localStorage.getItem('bs_reports_mock') || '[]');
  }

  private saveStoredReports(reports: Report[]): void {
    localStorage.setItem('bs_reports_mock', JSON.stringify(reports));
  }

  private getStoredNotifications(): Notification[] {
    return JSON.parse(localStorage.getItem('bs_notifications_mock') || '[]');
  }

  private saveStoredNotifications(notifs: Notification[]): void {
    localStorage.setItem('bs_notifications_mock', JSON.stringify(notifs));
  }

  // ─── Bikes CRUD ──────────────────────────────────────────────
  getBikes(filter: BikeFilter = {}): Observable<PagedResult<Bike>> {
    let bikes = this.getStoredBikes();

    // Filtering logic
    if (filter.brand) {
      bikes = bikes.filter(b => b.brand.toLowerCase() === filter.brand!.toLowerCase());
    }
    if (filter.bikeType) {
      bikes = bikes.filter(b => b.bikeType.toLowerCase() === filter.bikeType!.toLowerCase());
    }
    if (filter.minPrice) {
      bikes = bikes.filter(b => b.price >= filter.minPrice!);
    }
    if (filter.maxPrice) {
      bikes = bikes.filter(b => b.price <= filter.maxPrice!);
    }
    if (filter.condition) {
      bikes = bikes.filter(b => b.condition.toLowerCase() === filter.condition!.toLowerCase());
    }
    if (filter.location) {
      bikes = bikes.filter(b => b.location.toLowerCase().includes(filter.location!.toLowerCase()));
    }
    if (filter.minYear) {
      bikes = bikes.filter(b => b.year >= filter.minYear!);
    }
    if (filter.maxYear) {
      bikes = bikes.filter(b => b.year <= filter.maxYear!);
    }
    if (filter.status) {
      bikes = bikes.filter(b => b.status === filter.status);
    } else {
      // By default, buyers only see Active listings
      bikes = bikes.filter(b => b.status === 'Active' || !b.status);
    }

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
    }).pipe(delay(400));
  }

  getBikeById(id: number): Observable<Bike> {
    const bikes = this.getStoredBikes();
    const bike = bikes.find(b => b.id === id);
    if (bike) {
      // Record view increment
      bike.views = (bike.views || 0) + 1;
      this.saveStoredBikes(bikes);
      return of({ ...bike }).pipe(delay(200));
    }
    return this.http.get<Bike>(`${this.baseUrl}/bikes/${id}`); // Fallback
  }

  createBike(data: any): Observable<Bike> {
    const bikes = this.getStoredBikes();
    const currentUser = JSON.parse(localStorage.getItem('bs_user') || 'null');
    
    const newBike: Bike = {
      ...data,
      id: bikes.length > 0 ? Math.max(...bikes.map(b => b.id)) + 1 : 1,
      sellerId: currentUser?.userId || 2,
      sellerName: currentUser?.fullName || 'Rushan Perera',
      sellerPhone: currentUser?.phoneNumber || '+94719876543',
      isSuspicious: (data.mileage < 500 && (new Date().getFullYear() - data.year) > 5) || data.price < 50000,
      createdDate: new Date().toISOString(),
      status: 'Pending',
      views: 0,
      wishlistCount: 0,
      enquiries: []
    };

    bikes.push(newBike);
    this.saveStoredBikes(bikes);
    return of(newBike).pipe(delay(500));
  }

  updateBike(id: number, data: Partial<Bike>): Observable<Bike> {
    const bikes = this.getStoredBikes();
    const index = bikes.findIndex(b => b.id === id);
    if (index === -1) {
      return of({} as Bike);
    }
    const updatedBike = { ...bikes[index], ...data };
    bikes[index] = updatedBike;
    this.saveStoredBikes(bikes);
    return of(updatedBike).pipe(delay(500));
  }

  deleteBike(id: number): Observable<void> {
    let bikes = this.getStoredBikes();
    bikes = bikes.filter(b => b.id !== id);
    this.saveStoredBikes(bikes);
    return of(undefined).pipe(delay(400));
  }

  duplicateBike(id: number): Observable<Bike> {
    const bikes = this.getStoredBikes();
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
    this.saveStoredBikes(bikes);
    return of(duplicate).pipe(delay(400));
  }

  // ─── Enquiries ──────────────────────────────────────────────
  addEnquiry(bikeId: number, enquiry: Omit<Enquiry, 'id' | 'date'>): Observable<Enquiry> {
    const bikes = this.getStoredBikes();
    const bike = bikes.find(b => b.id === bikeId);
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: Math.floor(Math.random() * 10000),
      date: new Date().toISOString()
    };

    if (bike) {
      bike.enquiries = bike.enquiries || [];
      bike.enquiries.push(newEnquiry);
      this.saveStoredBikes(bikes);

      // Create notification for seller
      this.createNotification(bike.sellerId, 'New Enquiry Received', 
        `Buyer ${enquiry.buyerName} enquired about your ${bike.brand} ${bike.model}.`, 'enquiry');
    }

    return of(newEnquiry).pipe(delay(300));
  }

  // ─── Reports ────────────────────────────────────────────────
  reportListing(bikeId: number, report: { reporterName: string, reporterEmail: string, reason: string, type: string }): Observable<Report> {
    const reports = this.getStoredReports();
    const bikes = this.getStoredBikes();
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
    this.saveStoredReports(reports);
    return of(newReport).pipe(delay(300));
  }

  getReports(): Observable<Report[]> {
    return of(this.getStoredReports()).pipe(delay(300));
  }

  updateReportStatus(id: number, status: 'Investigated' | 'Dismissed'): Observable<Report> {
    const reports = this.getStoredReports();
    const report = reports.find(r => r.id === id);
    if (report) {
      report.status = status;
      this.saveStoredReports(reports);
      return of(report).pipe(delay(200));
    }
    return of({} as Report);
  }

  // ─── Wishlist ───────────────────────────────────────────────
  getWishlist(): Observable<Bike[]> {
    const listIds: number[] = JSON.parse(localStorage.getItem('bs_wishlist_mock') || '[]');
    const bikes = this.getStoredBikes();
    const wishlistBikes = bikes.filter(b => listIds.includes(b.id));
    return of(wishlistBikes).pipe(delay(300));
  }

  addToWishlist(bikeId: number): Observable<number[]> {
    const listIds: number[] = JSON.parse(localStorage.getItem('bs_wishlist_mock') || '[]');
    if (!listIds.includes(bikeId)) {
      listIds.push(bikeId);
      localStorage.setItem('bs_wishlist_mock', JSON.stringify(listIds));
      
      const bikes = this.getStoredBikes();
      const bike = bikes.find(b => b.id === bikeId);
      if (bike) {
        bike.wishlistCount = (bike.wishlistCount || 0) + 1;
        this.saveStoredBikes(bikes);
      }
    }
    return of(listIds).pipe(delay(200));
  }

  removeFromWishlist(bikeId: number): Observable<number[]> {
    let listIds: number[] = JSON.parse(localStorage.getItem('bs_wishlist_mock') || '[]');
    listIds = listIds.filter(id => id !== bikeId);
    localStorage.setItem('bs_wishlist_mock', JSON.stringify(listIds));

    const bikes = this.getStoredBikes();
    const bike = bikes.find(b => b.id === bikeId);
    if (bike && bike.wishlistCount && bike.wishlistCount > 0) {
      bike.wishlistCount--;
      this.saveStoredBikes(bikes);
    }
    return of(listIds).pipe(delay(200));
  }

  isInWishlist(bikeId: number): boolean {
    const listIds: number[] = JSON.parse(localStorage.getItem('bs_wishlist_mock') || '[]');
    return listIds.includes(bikeId);
  }

  // ─── Users CRUD (Admin) ──────────────────────────────────────
  getUsers(): Observable<User[]> {
    return of(this.getStoredUsers()).pipe(delay(300));
  }

  createUser(data: Omit<User, 'id' | 'createdDate'>): Observable<User> {
    const users = this.getStoredUsers();
    const newUser: User = {
      ...data,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      createdDate: new Date().toISOString()
    };
    users.push(newUser);
    this.saveStoredUsers(users);
    return of(newUser).pipe(delay(400));
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    const users = this.getStoredUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return of({} as User);
    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    this.saveStoredUsers(users);
    return of(updatedUser).pipe(delay(300));
  }

  deleteUser(id: number): Observable<void> {
    let users = this.getStoredUsers();
    users = users.filter(u => u.id !== id);
    this.saveStoredUsers(users);
    return of(undefined).pipe(delay(300));
  }

  // ─── Notifications ──────────────────────────────────────────
  getNotifications(userId: number): Observable<Notification[]> {
    const notifs = this.getStoredNotifications().filter(n => n.userId === userId);
    return of(notifs).pipe(delay(200));
  }

  markNotificationAsRead(id: number): Observable<void> {
    const notifs = this.getStoredNotifications();
    const notif = notifs.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveStoredNotifications(notifs);
    }
    return of(undefined);
  }

  createNotification(userId: number, title: string, message: string, type: Notification['type']): void {
    const notifs = this.getStoredNotifications();
    const newNotif: Notification = {
      id: notifs.length > 0 ? Math.max(...notifs.map(n => n.id)) + 1 : 1,
      userId, title, message, read: false, date: new Date().toISOString(), type
    };
    notifs.push(newNotif);
    this.saveStoredNotifications(notifs);
  }

  // ─── Dashboards & Analytics Mock Endpoints ──────────────────
  getSellerDashboard(sellerId: number): Observable<any> {
    const bikes = this.getStoredBikes().filter(b => b.sellerId === sellerId);
    const totalListings = bikes.length;
    const activeListings = bikes.filter(b => b.status === 'Active').length;
    const soldBikes = bikes.filter(b => b.status === 'Sold').length;
    const pendingApproval = bikes.filter(b => b.status === 'Pending').length;
    const totalViews = bikes.reduce((sum, b) => sum + (b.views || 0), 0);
    const wishlistCount = bikes.reduce((sum, b) => sum + (b.wishlistCount || 0), 0);
    const buyerEnquiries = bikes.reduce((sum, b) => sum + (b.enquiries?.length || 0), 0);

    // Dynamic historical view data for charts
    const performanceChart = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      views: [12, 19, 3, 5, 2, 3, 9].map(v => v * (activeListings + 1)),
      enquiries: [1, 2, 0, 1, 0, 0, 2]
    };

    return of({
      cards: { totalListings, activeListings, soldBikes, pendingApproval, totalViews, wishlistCount, buyerEnquiries },
      performanceChart
    }).pipe(delay(300));
  }

  getAdminDashboard(): Observable<any> {
    const users = this.getStoredUsers();
    const bikes = this.getStoredBikes();
    const reports = this.getStoredReports();

    const totalUsers = users.length;
    const buyers = users.filter(u => u.role === 'Buyer').length;
    const sellers = users.filter(u => u.role === 'Seller').length;
    const dealers = users.filter(u => u.role === 'Dealer').length;

    const totalListings = bikes.length;
    const activeListings = bikes.filter(b => b.status === 'Active').length;
    const pendingListings = bikes.filter(b => b.status === 'Pending').length;
    const rejectedListings = bikes.filter(b => b.status === 'Rejected').length;
    const soldBikes = bikes.filter(b => b.status === 'Sold').length;

    const totalReports = reports.length;
    const fraudAlerts = reports.filter(r => r.type === 'Fraud' && r.status === 'Pending').length;
    const revenue = soldBikes * 15000 + dealers * 25000; // Simulated subscription/commission revenue

    const recentActivities = [
      { id: 1, action: 'User suspension', detail: 'User ID 5 suspended due to fraud alerts.', time: '2 hours ago' },
      { id: 2, action: 'Listing submitted', detail: 'New TVS Apache RTR 160 submitted by seller Apex Auto.', time: '4 hours ago' },
      { id: 3, action: 'Report filed', detail: 'Janaka reported listing ID 5 for suspected fraud.', time: '1 day ago' },
      { id: 4, action: 'Listing approved', detail: 'Yamaha FZ V3 ABS listing approved by Admin.', time: '1 day ago' }
    ];

    return of({
      metrics: { totalUsers, buyers, sellers, dealers, totalListings, activeListings, pendingListings, rejectedListings, soldBikes, totalReports, fraudAlerts, revenue },
      recentActivities
    }).pipe(delay(300));
  }

  getAdminAnalytics(): Observable<any> {
    const bikes = this.getStoredBikes();
    const active = bikes.filter(b => b.status === 'Active');

    const totalPrices = active.reduce((sum, b) => sum + b.price, 0);
    const avgSellingPrice = active.length > 0 ? Math.round(totalPrices / active.length) : 0;

    const totalMileage = active.reduce((sum, b) => sum + b.mileage, 0);
    const avgMileage = active.length > 0 ? Math.round(totalMileage / active.length) : 0;

    const brandsCount: Record<string, number> = {};
    active.forEach(b => {
      brandsCount[b.brand] = (brandsCount[b.brand] || 0) + 1;
    });

    const locationCount: Record<string, number> = {};
    active.forEach(b => {
      locationCount[b.location] = (locationCount[b.location] || 0) + 1;
    });

    const accuracyLog = [
      { month: 'Jan', errorMargin: 4.8 },
      { month: 'Feb', errorMargin: 4.2 },
      { month: 'Mar', errorMargin: 3.9 },
      { month: 'Apr', errorMargin: 3.5 },
      { month: 'May', errorMargin: 3.1 },
      { month: 'Jun', errorMargin: 2.8 }
    ];

    const monthlyGrowth = [
      { month: 'Jan', listings: 120 },
      { month: 'Feb', listings: 145 },
      { month: 'Mar', listings: 190 },
      { month: 'Apr', listings: 220 },
      { month: 'May', listings: 280 },
      { month: 'Jun', listings: 340 }
    ];

    return of({
      averagePrice: avgSellingPrice,
      averageMileage: avgMileage,
      brandDistribution: Object.entries(brandsCount).map(([brand, count]) => ({ name: brand, value: count })),
      locationDistribution: Object.entries(locationCount).map(([loc, count]) => ({ name: loc, value: count })),
      accuracyLog,
      monthlyGrowth
    }).pipe(delay(400));
  }

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
