// ─── Bike Domain Models ────────────────────────────────────────────────
export interface Bike {
  id: number;
  title: string;
  brand: string;
  model: string;
  variant?: string; // Step 1
  bikeType: string;
  year: number;
  regYear?: number; // Step 1
  mileage: number;
  engineCC: number;
  fuelType: string;
  transmission: string;
  color: string;
  price: number;
  condition: string;
  ownerCount: number;
  insurance: string;
  registration: string;
  serviceHistory: string;
  accidentHistory: string;
  description?: string;
  location: string;
  sellerId: number;
  sellerName: string;
  sellerPhone: string;
  isSuspicious: boolean;
  createdDate: string;
  imageUrls: string[];
  
  // Enterprise Details & Mock Fields
  status?: 'Active' | 'Pending' | 'Rejected' | 'Sold' | 'Archived';
  chassisNumber?: string; // Step 2
  engineNumber?: string;  // Step 2
  documents?: {           // Step 3
    regBook?: string;
    insuranceCert?: string;
    emissionReport?: string;
    serviceRecords?: string;
  };
  views?: number;
  wishlistCount?: number;
  isFeatured?: boolean;
  enquiries?: Enquiry[];
  additionalFeatures?: string[]; // Step 6
}

export interface Enquiry {
  id: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  date: string;
}

export interface BikeFilter {
  brand?: string;
  bikeType?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  isVerified?: boolean;
  location?: string;
  minYear?: number;
  maxYear?: number;
  page?: number;
  limit?: number;
  status?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BikeCreate {
  title: string;
  brand: string;
  model: string;
  variant?: string;
  bikeType: string;
  year: number;
  regYear?: number;
  mileage: number;
  engineCC: number;
  fuelType: string;
  transmission: string;
  color: string;
  price: number;
  condition: string;
  ownerCount: number;
  insurance: string;
  registration: string;
  serviceHistory: string;
  accidentHistory: string;
  description?: string;
  location: string;
  chassisNumber?: string;
  engineNumber?: string;
  documents?: {
    regBook?: string;
    insuranceCert?: string;
    emissionReport?: string;
    serviceRecords?: string;
  };
  imageUrls?: string[];
  additionalFeatures?: string[];
}

// ─── Auth Models ──────────────────────────────────────────────────────────
export interface UserRegister {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  role: string;
  fullName: string;
  email: string;
  userId: number;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  userId: number;
  exp: number;
  iat: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Buyer' | 'Seller' | 'Dealer' | 'Administrator';
  status: 'Active' | 'Suspended';
  phoneNumber?: string;
  createdDate: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────
export interface Report {
  id: number;
  bikeId: number;
  bikeTitle: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  type: 'Fraud' | 'Spam' | 'Offensive' | 'Other';
  status: 'Pending' | 'Investigated' | 'Dismissed';
  createdDate: string;
}

// ─── System Notifications ──────────────────────────────────────────────────
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  date: string;
  type: 'listing_approved' | 'listing_rejected' | 'price_changed' | 'bike_sold' | 'recommendation_updated' | 'enquiry';
}

// ─── Valuation Models ─────────────────────────────────────────────────────
export interface ValuationRequest {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  engineCC: number;
  condition: string;
  ownerCount: number;
  serviceHistory: string;
  accidentHistory: string;
}

export interface DepreciationPoint {
  yearsPassed: number;
  projectedValue: number;
}

export interface ValuationResult {
  predictedPrice: number;
  healthScore: number;
  dealRating: string;
  depreciationCurve: DepreciationPoint[];
  suggestedBargainPrice: number;
  annualFuelCost: number;
  annualMaintenanceCost: number;
  annualInsuranceCost: number;
  annualLicenseCost: number;
}

// ─── Recommendation Models ────────────────────────────────────────────────
export interface RecommendRequest {
  budget: number;
  usageType: string;
  preferredBrand?: string;
  mileagePriority: string;
  maxCC?: number;
}

export interface RecommendedBike {
  brand: string;
  model: string;
  yearRange: string;
  cc: number;
  score: number;
  reason: string;
  estimatedPrice: number;
}

export interface RecommendResponse {
  recommendations: RecommendedBike[];
  budget: number;
  usageProfile: string;
}

// ─── Activity Log Models ───────────────────────────────────────────────────
export interface ActivityLog {
  id: number;
  userId?: number;
  userName?: string;
  action: string;
  details: string;
  timestamp: string;
  targetId?: number;
  ipAddress?: string;
}
