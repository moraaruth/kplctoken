export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  biometricEnabled: boolean;
  pinSet: boolean;
  currency: string; // "KES"
  darkMode: boolean;
  textScale: 'sm' | 'md' | 'lg' | 'xl';
  lowTokenAlert: boolean;
  lowTokenThreshold: number; // in kWh
}

export interface Meter {
  id: string;
  meterNumber: string;
  nickname: string;
  address: string;
  balanceKwh: number;
  averageDailyKwh: number;
  status: 'active' | 'warning' | 'low';
  ownerId: string;
  isRental: boolean;
  tenantName?: string;
  tenantPhone?: string;
}

export interface KplcBreakdown {
  tokenValue: number;    // Net value going to actual power
  vat: number;           // Value Added Tax (16%)
  fuelCost: number;      // Fuel Energy Charge
  forex: number;         // Forex Adjustment
  inflation: number;     // Inflation Adjustment
  rera: number;          // Rural Electrification Charge (5%)
  epra: number;          // EPRA Levy (approx 0.08 Kes per Kwh)
  rep: number;           // REP Levy (approx 0.8%)
}

export interface Transaction {
  id: string;
  meterId: string;
  meterNumber: string;
  meterNickname: string;
  amount: number;
  kwh: number;
  tokenCode: string | null; // e.g. "4820-1948-2849-5830-1049"
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  checkoutRequestId?: string;
  breakdown: KplcBreakdown;
  receiptNumber: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // "Spouse" | "Child" | "Parent" | "Househelp"
  phone: string;
  avatarUrl: string;
  allowedMeters: string[]; // meterIds
  spendingLimit: number; // monthly limit in KES
  spentThisMonth: number;
}

export interface RentalProperty {
  id: string;
  propertyName: string; // e.g. "Nairobi West Heights"
  unitNumber: string;   // e.g. "House 4B"
  meterId: string;
  meterNumber: string;
  tenantName: string;
  tenantPhone: string;
  currentKwh: number;
  lastPaymentDate?: string;
  autoNotify: boolean;
  warningThreshold: number; // kWh
}

export interface STKPushRequest {
  phone: string;
  amount: number;
  meterId: string;
}

export interface STKPushStatus {
  checkoutRequestId: string;
  status: 'pending' | 'completed' | 'failed';
  tokenCode?: string;
  error?: string;
}
