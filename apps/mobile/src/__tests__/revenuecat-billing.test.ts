import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';
import type { PurchasesPackage, SubscriptionOption } from 'react-native-purchases';
import { createRevenueCatService } from '@/services/entitlements/revenuecat';

jest.mock('react-native-purchases', () => {
  const mockPurchases = {
    STORE_REPLACEMENT_MODE: { WITHOUT_PRORATION: 'WITHOUT_PRORATION' },
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    getCustomerInfo: jest.fn(),
    getOfferings: jest.fn(),
    checkTrialOrIntroductoryPriceEligibility: jest.fn(),
    purchasePackage: jest.fn(),
    purchaseSubscriptionOption: jest.fn(),
    restorePurchases: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
    showManageSubscriptions: jest.fn(),
    beginRefundRequestForActiveEntitlement: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPurchases,
    INTRO_ELIGIBILITY_STATUS: {
      INTRO_ELIGIBILITY_STATUS_UNKNOWN: 0,
      INTRO_ELIGIBILITY_STATUS_INELIGIBLE: 1,
      INTRO_ELIGIBILITY_STATUS_ELIGIBLE: 2,
      INTRO_ELIGIBILITY_STATUS_NO_INTRO_OFFER_EXISTS: 3,
    },
    LOG_LEVEL: { WARN: 'WARN' },
    STORE_REPLACEMENT_MODE: { WITHOUT_PRORATION: 'WITHOUT_PRORATION' },
    OFFER_PAYMENT_MODE: { FREE_TRIAL: 'FREE_TRIAL' },
    RECURRENCE_MODE: { INFINITE_RECURRING: 1, FINITE_RECURRING: 2, NON_RECURRING: 3 },
    PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR', PAYMENT_PENDING_ERROR: 'PAYMENT_PENDING_ERROR' },
  };
});

type AsyncMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;
const Purchases = (jest.requireMock('react-native-purchases') as { default: unknown }).default as {
  getCustomerInfo: AsyncMock;
  getOfferings: AsyncMock;
  checkTrialOrIntroductoryPriceEligibility: AsyncMock;
  purchasePackage: AsyncMock;
  purchaseSubscriptionOption: AsyncMock;
};

const eligible = { status: 2, description: 'eligible' };
const unknown = { status: 0, description: 'unknown' };
const ineligible = { status: 1, description: 'ineligible' };

function option(id: string, props: Record<string, unknown> = {}): SubscriptionOption {
  const billingPeriod = id === 'weekly' ? { unit: 'WEEK', value: 1, iso8601: 'P1W' } : { unit: 'YEAR', value: 1, iso8601: 'P1Y' };
  const fullPricePhase = props.fullPricePhase ?? {
    billingPeriod,
    recurrenceMode: 1,
    billingCycleCount: null,
    price: { formatted: '$42.99', amountMicros: 42_990_000, currencyCode: 'USD' },
    offerPaymentMode: null,
  };
  const freePhase = props.freePhase ?? null;
  return {
    id,
    productId: 'family_annual',
    storeProductId: 'family_annual:annual',
    tags: [],
    isBasePlan: false,
    billingPeriod,
    isPrepaid: false,
    fullPricePhase,
    freePhase,
    pricingPhases: props.pricingPhases ?? (freePhase ? [freePhase, fullPricePhase] : [fullPricePhase]),
    introPhase: null,
    presentedOfferingIdentifier: 'default',
    presentedOfferingContext: null,
    installmentsInfo: null,
    ...props,
  } as unknown as SubscriptionOption;
}

function storePackage(identifier: string, props: Record<string, unknown> = {}): PurchasesPackage {
  return {
    identifier,
    packageType: 'CUSTOM',
    offeringIdentifier: 'default',
    product: {
      identifier: identifier === 'annual_trial' ? 'family_annual_trial' : identifier,
      description: '',
      title: '',
      price: 39.99,
      priceString: '$39.99',
      currencyCode: 'USD',
      subscriptionPeriod: identifier === 'annual_trial' || identifier === '$rc_annual' ? 'P1Y' : 'P1W',
      introPrice: identifier === 'annual_trial'
        ? { price: 0, priceString: 'Free', cycles: 1, period: 'P7D', periodUnit: 'DAY', periodNumberOfUnits: 7 }
        : null,
      subscriptionOptions: null,
      ...props,
    },
    presentedOfferingContext: null,
  } as unknown as PurchasesPackage;
}

function setPlatform(os: 'ios' | 'android') {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
}

function setCurrent(annual: PurchasesPackage, weekly = storePackage('$rc_weekly')) {
  Purchases.getOfferings.mockResolvedValue({
    current: {
      annual,
      weekly,
      availablePackages: [annual, weekly, storePackage('annual_trial')],
    },
  });
}

describe('RevenueCat trial offer safety', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform('ios');
    Purchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: {}, all: {} }, managementURL: null });
    Purchases.checkTrialOrIntroductoryPriceEligibility.mockResolvedValue({ 'family_annual_trial': eligible });
    Purchases.purchasePackage.mockResolvedValue({ customerInfo: { entitlements: { active: {}, all: {} }, managementURL: null } });
    Purchases.purchaseSubscriptionOption.mockResolvedValue({ customerInfo: { entitlements: { active: {}, all: {} }, managementURL: null } });
  });

  it('shows the iOS annual trial only after positive eligibility and exact free 7-day annual terms', async () => {
    setCurrent(storePackage('$rc_annual'));
    const service = createRevenueCatService('test-key');
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: { priceString: '$39.99' } });
    expect(Purchases.checkTrialOrIntroductoryPriceEligibility).toHaveBeenCalledWith(['family_annual_trial']);

    for (const eligibility of [ineligible, unknown]) {
      Purchases.checkTrialOrIntroductoryPriceEligibility.mockResolvedValueOnce({ family_annual_trial: eligibility });
      await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: null });
    }

    Purchases.checkTrialOrIntroductoryPriceEligibility.mockRejectedValueOnce(new Error('eligibility unavailable'));
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: null });

    const weeklyTrial = storePackage('annual_trial', {
      introPrice: { price: 0, priceString: 'Free', cycles: 1, period: 'P1W', periodUnit: 'WEEK', periodNumberOfUnits: 1 },
    });
    Purchases.getOfferings.mockResolvedValue({ current: { annual: storePackage('$rc_annual'), weekly: storePackage('$rc_weekly'), availablePackages: [weeklyTrial] } });
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: { ref: weeklyTrial } });

    setCurrent(storePackage('$rc_annual'));
    const malformedTrial = storePackage('annual_trial', {
      introPrice: { price: 0, priceString: 'Free', cycles: 1, period: 'P14D', periodUnit: 'DAY', periodNumberOfUnits: 14 },
    });
    Purchases.getOfferings.mockResolvedValue({ current: { annual: storePackage('$rc_annual'), weekly: storePackage('$rc_weekly'), availablePackages: [malformedTrial] } });
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: null });
  });

  it('hides Android trials without the exact tagged zero-price seven-day option', async () => {
    setPlatform('android');
    const base = option('annual', { isBasePlan: true });
    const noTag = option('trial', {
      tags: [],
      freePhase: { billingPeriod: { unit: 'DAY', value: 7, iso8601: 'P7D' }, recurrenceMode: 2, billingCycleCount: 1, price: { formatted: 'Free', amountMicros: 0, currencyCode: 'USD' }, offerPaymentMode: 'FREE_TRIAL' },
    });
    const annual = storePackage('$rc_annual', { subscriptionOptions: [base, noTag] });
    setCurrent(annual, storePackage('$rc_weekly', { subscriptionOptions: [option('weekly', { isBasePlan: true })] }));
    const service = createRevenueCatService('test-key');
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: null });

    const wrongDuration = option('trial', {
      tags: ['optin-trial'],
      freePhase: { billingPeriod: { unit: 'DAY', value: 1, iso8601: 'P1D' }, recurrenceMode: 2, billingCycleCount: 1, price: { formatted: 'Free', amountMicros: 0, currencyCode: 'USD' }, offerPaymentMode: 'FREE_TRIAL' },
    });
    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [base, wrongDuration] }), storePackage('$rc_weekly', { subscriptionOptions: [option('weekly', { isBasePlan: true })] }));
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: null });

    const oneWeek = option('trial', {
      tags: ['optin-trial'],
      freePhase: { billingPeriod: { unit: 'WEEK', value: 1, iso8601: 'P1W' }, recurrenceMode: 2, billingCycleCount: 1, price: { formatted: 'Free', amountMicros: 0, currencyCode: 'USD' }, offerPaymentMode: 'FREE_TRIAL' },
    });
    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [base, oneWeek] }), storePackage('$rc_weekly', { subscriptionOptions: [option('weekly', { isBasePlan: true })] }));
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: { ref: oneWeek } });

    const twoFreeCycles = { ...oneWeek.freePhase!, billingCycleCount: 2 };
    const repeatedTrial = option('trial', {
      tags: ['optin-trial'],
      freePhase: twoFreeCycles,
      pricingPhases: [twoFreeCycles, oneWeek.fullPricePhase],
    });
    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [base, repeatedTrial] }), storePackage('$rc_weekly', { subscriptionOptions: [option('weekly', { isBasePlan: true })] }));
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: null });

    const introDiscount = {
      billingPeriod: { unit: 'YEAR', value: 1, iso8601: 'P1Y' },
      recurrenceMode: 2,
      billingCycleCount: 1,
      price: { formatted: '$19.99', amountMicros: 19_990_000, currencyCode: 'USD' },
      offerPaymentMode: 'DISCOUNTED_RECURRING_PAYMENT',
    };
    const withExtraIntro = option('trial', {
      tags: ['optin-trial'],
      freePhase: oneWeek.freePhase,
      pricingPhases: [oneWeek.freePhase, introDiscount, oneWeek.fullPricePhase],
    });
    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [base, withExtraIntro] }), storePackage('$rc_weekly', { subscriptionOptions: [option('weekly', { isBasePlan: true })] }));
    await expect(service.getOffering()).resolves.toMatchObject({ annualTrial: null });
  });

  it('uses the tagged Android trial option and its recurring price, never the package default', async () => {
    setPlatform('android');
    const base = option('annual', { isBasePlan: true, fullPricePhase: { ...option('annual').fullPricePhase!, price: { formatted: '€39,99', amountMicros: 39_990_000, currencyCode: 'EUR' } } });
    const trial = option('annual:optin-trial', {
      tags: ['optin-trial'],
      freePhase: { billingPeriod: { unit: 'DAY', value: 7, iso8601: 'P7D' }, recurrenceMode: 2, billingCycleCount: 1, price: { formatted: 'Free', amountMicros: 0, currencyCode: 'EUR' }, offerPaymentMode: 'FREE_TRIAL' },
      fullPricePhase: { ...option('annual').fullPricePhase!, price: { formatted: '€42,99', amountMicros: 42_990_000, currencyCode: 'EUR' } },
    });
    const weekly = storePackage('$rc_weekly', { subscriptionOptions: [option('weekly', { isBasePlan: true })] });
    setCurrent(storePackage('$rc_annual', { price: 0, priceString: 'Free', subscriptionOptions: [base, trial] }), weekly);
    const service = createRevenueCatService('test-key');
    const offering = await service.getOffering();
    expect(offering.annual.priceString).toBe('€39,99');
    expect(offering.annualTrial).toMatchObject({ priceString: '€42,99', price: 42.99, currencyCode: 'EUR' });

    await service.purchase('annual', { trial: true });
    expect(Purchases.purchaseSubscriptionOption).toHaveBeenCalledWith(trial, undefined);
    expect(Purchases.purchasePackage).not.toHaveBeenCalled();
  });

  it('purchases the exact eligible iOS annual trial package', async () => {
    const regular = storePackage('$rc_annual');
    const trial = storePackage('annual_trial');
    const weekly = storePackage('$rc_weekly');
    Purchases.getOfferings.mockResolvedValue({ current: { annual: regular, weekly, availablePackages: [regular, weekly, trial] } });
    const service = createRevenueCatService('test-key');
    await service.purchase('annual', { trial: true });
    expect(Purchases.purchasePackage).toHaveBeenCalledWith(trial);
    expect(Purchases.purchaseSubscriptionOption).not.toHaveBeenCalled();
  });

  it('rechecks iOS eligibility at purchase and throws instead of falling back to base price', async () => {
    setCurrent(storePackage('$rc_annual'));
    Purchases.checkTrialOrIntroductoryPriceEligibility
      .mockResolvedValueOnce({ family_annual_trial: eligible })
      .mockResolvedValueOnce({ family_annual_trial: ineligible });
    const service = createRevenueCatService('test-key');
    await service.getOffering();
    await expect(service.purchase('annual', { trial: true })).rejects.toThrow(/trial is no longer available/);
    expect(Purchases.purchasePackage).not.toHaveBeenCalled();
  });

  it('purchases only the explicit Android base plan when trial is off and fails if it is missing', async () => {
    setPlatform('android');
    const base = option('annual', { isBasePlan: true });
    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [base] }), storePackage('$rc_weekly', { subscriptionOptions: [option('weekly', { isBasePlan: true })] }));
    const service = createRevenueCatService('test-key');
    await service.purchase('annual', { trial: false });
    expect(Purchases.purchaseSubscriptionOption).toHaveBeenCalledWith(base, undefined);
    expect(Purchases.purchasePackage).not.toHaveBeenCalled();

    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [] }));
    await expect(service.purchase('annual', { trial: false })).rejects.toThrow(/valid annual or weekly Google Play base plan/);
    expect(Purchases.purchasePackage).not.toHaveBeenCalled();
  });

  it('fails closed when regular plan periods or opt-out intro terms do not match disclosure', async () => {
    const service = createRevenueCatService('test-key');
    setPlatform('ios');
    setCurrent(storePackage('$rc_annual', { subscriptionPeriod: 'P6M' }));
    await expect(service.getOffering()).rejects.toThrow(/plan periods or opt-out terms/);

    setCurrent(storePackage('$rc_annual', { introPrice: { price: 0, priceString: 'Free', cycles: 1, period: 'P7D', periodUnit: 'DAY', periodNumberOfUnits: 7 } }));
    await expect(service.getOffering()).rejects.toThrow(/plan periods or opt-out terms/);

    setPlatform('android');
    const annualBase = option('annual', { isBasePlan: true });
    const wrongWeeklyBase = option('weekly', { isBasePlan: true, fullPricePhase: option('annual').fullPricePhase });
    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [annualBase] }), storePackage('$rc_weekly', { subscriptionOptions: [wrongWeeklyBase] }));
    await expect(service.getOffering()).rejects.toThrow(/valid annual or weekly Google Play base plan/);

    const prepaidWeeklyBase = option('weekly', { isBasePlan: true, isPrepaid: true });
    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [annualBase] }), storePackage('$rc_weekly', { subscriptionOptions: [prepaidWeeklyBase] }));
    await expect(service.getOffering()).rejects.toThrow(/valid annual or weekly Google Play base plan/);
  });

  it('replaces an active Android weekly plan using its exact plan ID and the documented replacement mode', async () => {
    setPlatform('android');
    const entitlement = { productIdentifier: 'pro_weekly', productPlanIdentifier: 'weekly', periodType: 'NORMAL', willRenew: true, expirationDate: null };
    Purchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: { pro: entitlement }, all: { pro: entitlement } }, managementURL: null });
    const base = option('annual', { isBasePlan: true });
    setCurrent(storePackage('$rc_annual', { subscriptionOptions: [base] }), storePackage('$rc_weekly', { subscriptionOptions: [option('weekly', { isBasePlan: true })] }));
    const service = createRevenueCatService('test-key');
    await service.purchase('annual', { trial: false });
    expect(Purchases.purchaseSubscriptionOption).toHaveBeenCalledWith(base, {
      oldProductIdentifier: 'pro_weekly:weekly',
      replacementMode: 'WITHOUT_PRORATION',
    });

    const qualified = { ...entitlement, productPlanIdentifier: 'pro_weekly:weekly' };
    Purchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: { pro: qualified }, all: { pro: qualified } }, managementURL: null });
    await service.purchase('annual', { trial: false });
    expect(Purchases.purchaseSubscriptionOption).toHaveBeenLastCalledWith(base, {
      oldProductIdentifier: 'pro_weekly:weekly',
      replacementMode: 'WITHOUT_PRORATION',
    });

    const storeQualified = { ...entitlement, productIdentifier: 'pro_weekly:weekly' };
    Purchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: { pro: storeQualified }, all: { pro: storeQualified } }, managementURL: null });
    await service.purchase('annual', { trial: false });
    expect(Purchases.purchaseSubscriptionOption).toHaveBeenLastCalledWith(base, {
      oldProductIdentifier: 'pro_weekly:weekly',
      replacementMode: 'WITHOUT_PRORATION',
    });

    const missingPlan = { ...entitlement, productPlanIdentifier: null };
    Purchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: { pro: missingPlan }, all: { pro: missingPlan } }, managementURL: null });
    await expect(service.purchase('annual', { trial: false })).rejects.toThrow(/active subscription plan/);
    expect(Purchases.purchaseSubscriptionOption).toHaveBeenCalledTimes(3);
  });
});
