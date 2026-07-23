import { Meter, Transaction, FamilyMember, RentalProperty, KplcBreakdown } from './types';

// Realistically calculate KPLC Token units and itemized Kenyan taxes
export function calculateKplcBreakdown(amount: number): { kwh: number; breakdown: KplcBreakdown } {
  // Rough estimate of pricing in Kenya (approx 29 KES per kWh average)
  // VAT: 16%
  // Rural Electrification (RERA): 5%
  // EPRA Levy: 0.08 KES per kWh
  // REP Levy: 0.8%
  // Fuel Cost Charge & Forex fluctuate, say roughly 25% of the total cost
  
  const vatRate = 0.16;
  const reraRate = 0.05;
  const repRate = 0.008;
  
  // Back-calculate from gross amount
  // Gross = Net + VAT(Net + Fuel + Forex + Inflation) + RERA(Net) + EPRA(kWh) + REP(Net)
  // Let's model a simplified but highly authentic approximation:
  const tokenValue = Math.round(amount * 0.58 * 100) / 100;
  const fuelCost = Math.round(amount * 0.16 * 100) / 100;
  const forex = Math.round(amount * 0.06 * 100) / 100;
  const inflation = Math.round(amount * 0.02 * 100) / 100;
  const rera = Math.round(tokenValue * reraRate * 100) / 100;
  const rep = Math.round(tokenValue * repRate * 100) / 100;
  
  // EPRA is a flat rate per kWh, let's say:
  const epraRate = 0.12; // KES per kWh
  // Total levies before VAT
  const baseForVat = tokenValue + fuelCost + forex + inflation;
  const vat = Math.round(baseForVat * vatRate * 100) / 100;
  
  // Epra is calculated on units, let's solve for kWh
  // Average cost per kWh in Kenya is around 32 KES currently for domestic consumers
  const estimatedKwh = Math.round((tokenValue / 18.5) * 100) / 100;
  const epra = Math.round(estimatedKwh * epraRate * 100) / 100;
  
  const breakdown: KplcBreakdown = {
    tokenValue,
    vat,
    fuelCost,
    forex,
    inflation,
    rera,
    epra,
    rep
  };

  return {
    kwh: estimatedKwh,
    breakdown
  };
}

// Generate an authentic 20-digit KPLC prepaid token code
export function generateKplcToken(): string {
  const segment = () => Math.floor(1000 + Math.random() * 9000).toString();
  return `${segment()}-${segment()}-${segment()}-${segment()}-${segment()}`;
}

export const seedMeters: Meter[] = [
  {
    id: 'm1',
    meterNumber: '3712-8495-021',
    nickname: 'Home (Nairobi West)',
    address: 'Block C, Apartment 4B, Nairobi West',
    balanceKwh: 12.4,
    averageDailyKwh: 4.2,
    status: 'warning',
    ownerId: 'u1',
    isRental: false
  },
  {
    id: 'm2',
    meterNumber: '1409-2849-184',
    nickname: "Mom's Shamba (Eldoret)",
    address: 'Farm 12, Kapseret, Eldoret',
    balanceKwh: 148.5,
    averageDailyKwh: 2.8,
    status: 'active',
    ownerId: 'u1',
    isRental: false
  },
  {
    id: 'm3',
    meterNumber: '5410-9482-710',
    nickname: 'Rental Unit A (Kilimani)',
    address: 'Kilimani Heights, Unit A2, Wood Avenue',
    balanceKwh: 3.8,
    averageDailyKwh: 5.5,
    status: 'low',
    ownerId: 'u1',
    isRental: true,
    tenantName: 'Brian Kiprop',
    tenantPhone: '+254 712 345 678'
  }
];

export const seedTransactions: Transaction[] = [
  {
    id: 't1',
    meterId: 'm1',
    meterNumber: '3712-8495-021',
    meterNickname: 'Home (Nairobi West)',
    amount: 1000,
    kwh: 31.4,
    tokenCode: '4820-1948-2849-5830-1049',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'completed',
    receiptNumber: 'KPLC-MPESA-2948104',
    breakdown: calculateKplcBreakdown(1000).breakdown
  },
  {
    id: 't2',
    meterId: 'm2',
    meterNumber: '1409-2849-184',
    meterNickname: "Mom's Shamba (Eldoret)",
    amount: 2500,
    kwh: 78.5,
    tokenCode: '8592-0491-3850-2910-4820',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: 'completed',
    receiptNumber: 'KPLC-MPESA-1849204',
    breakdown: calculateKplcBreakdown(2500).breakdown
  },
  {
    id: 't3',
    meterId: 'm1',
    meterNumber: '3712-8495-021',
    meterNickname: 'Home (Nairobi West)',
    amount: 500,
    kwh: 15.7,
    tokenCode: '1049-2840-5819-2048-9582',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    status: 'completed',
    receiptNumber: 'KPLC-MPESA-0492814',
    breakdown: calculateKplcBreakdown(500).breakdown
  }
];

export const seedFamilyMembers: FamilyMember[] = [
  {
    id: 'f1',
    name: 'Faith Omondi',
    relation: 'Spouse',
    phone: '+254 722 999 888',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    allowedMeters: ['m1', 'm2'],
    spendingLimit: 5000,
    spentThisMonth: 1500
  },
  {
    id: 'f2',
    name: 'Kelvin Omondi',
    relation: 'Son',
    phone: '+254 701 123 456',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    allowedMeters: ['m1'],
    spendingLimit: 1000,
    spentThisMonth: 0
  }
];

export const seedRentalProperties: RentalProperty[] = [
  {
    id: 'rp1',
    propertyName: 'Kilimani Heights',
    unitNumber: 'Apartment A2',
    meterId: 'm3',
    meterNumber: '5410-9482-710',
    tenantName: 'Brian Kiprop',
    tenantPhone: '+254 712 345 678',
    currentKwh: 3.8,
    lastPaymentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    autoNotify: true,
    warningThreshold: 10
  }
];
