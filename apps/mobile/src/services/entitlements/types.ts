export type PlanId = 'annual' | 'weekly';

export interface PlanPackage {
  plan: PlanId;
  /** Billed amount as the store formats it, e.g. "$39.99". Never hardcoded in production. */
  priceString: string;
  price: number;
  currencyCode: string;
  /** Opaque store package for the purchase call. */
  ref: unknown;
}

export interface Offering {
  annual: PlanPackage;
  /** Same annual price with the opt-in 7-day trial (iOS: separate product; Play: tagged offer). */
  annualTrial: PlanPackage | null;
  weekly: PlanPackage;
  /** True when prices are placeholders (mock / no store). Shown as "Example prices". */
  isExample: boolean;
}

export interface EntitlementStatus {
  isPro: boolean;
  multiChild: boolean;
  plan: PlanId | null;
  isTrial: boolean;
  willRenew: boolean;
  expiresAt: string | null;
  /** Ever had Pro: lapsed users keep read-only access to their data (brief §3.5). */
  hadPro: boolean;
  managementURL: string | null;
}

export type PurchaseResult = { status: 'purchased'; entitlement: EntitlementStatus } | { status: 'cancelled' } | { status: 'pending' };

export interface EntitlementService {
  readonly kind: 'revenuecat' | 'mock' | 'unavailable';
  configure(): Promise<void>;
  getStatus(): Promise<EntitlementStatus>;
  getOffering(): Promise<Offering>;
  purchase(plan: PlanId, opts: { trial: boolean }): Promise<PurchaseResult>;
  restore(): Promise<EntitlementStatus>;
  onChange(cb: (s: EntitlementStatus) => void): () => void;
  manageSubscriptions(): Promise<void>;
  requestRefund(): Promise<'started' | 'unsupported'>;
}

export const FREE_STATUS: EntitlementStatus = {
  isPro: false,
  multiChild: false,
  plan: null,
  isTrial: false,
  willRenew: false,
  expiresAt: null,
  hadPro: false,
  managementURL: null,
};

/** ⌊(1 − annual ÷ (weekly × 52)) × 100⌋, or null when not computable (brief §11.6). */
export function savePercent(annual: number, weekly: number): number | null {
  if (!(annual > 0) || !(weekly > 0)) return null;
  const pct = Math.floor((1 - annual / (weekly * 52)) * 100);
  return pct > 0 && pct < 100 ? pct : null;
}

export function formatMoney(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}
