import { Platform } from 'react-native';
import Purchases, {
  INTRO_ELIGIBILITY_STATUS,
  LOG_LEVEL,
  OFFER_PAYMENT_MODE,
  PURCHASES_ERROR_CODE,
  RECURRENCE_MODE,
  type CustomerInfo,
  type PurchasesPackage,
  type StoreProductChangeInfo,
  type SubscriptionOption,
} from 'react-native-purchases';

import { AppConfig } from '@/config/app-config';
import { FREE_STATUS, type EntitlementService, type EntitlementStatus, type PlanPackage } from './types';

function toStatus(info: CustomerInfo): EntitlementStatus {
  const pro = info.entitlements.active[AppConfig.entitlements.pro];
  const multi = info.entitlements.active[AppConfig.entitlements.multiChild];
  const everPro = info.entitlements.all[AppConfig.entitlements.pro] != null;
  if (!pro) return { ...FREE_STATUS, hadPro: everPro, managementURL: info.managementURL };
  const productId = pro.productIdentifier.toLowerCase();
  const plan = productId.includes('weekly') ? 'weekly' : 'annual';
  return {
    isPro: true,
    multiChild: multi != null,
    plan,
    isTrial: pro.periodType === 'TRIAL',
    willRenew: pro.willRenew,
    expiresAt: pro.expirationDate,
    hadPro: true,
    managementURL: info.managementURL,
  };
}

function toPackage(plan: 'annual' | 'weekly', p: PurchasesPackage): PlanPackage {
  return { plan, priceString: p.product.priceString, price: p.product.price, currencyCode: p.product.currencyCode, ref: p };
}

function toOptionPackage(plan: 'annual' | 'weekly', option: SubscriptionOption): PlanPackage {
  const price = option.fullPricePhase?.price;
  if (!price) throw new Error(`RevenueCat ${plan} subscription option is missing its recurring price`);
  return { plan, priceString: price.formatted, price: price.amountMicros / 1_000_000, currencyCode: price.currencyCode, ref: option };
}

function isSevenDayFreeTrial(option: SubscriptionOption): boolean {
  const [free, recurring] = option.pricingPhases;
  const sevenDays = free?.billingPeriod.unit === 'DAY' && free.billingPeriod.value === 7;
  const oneWeek = free?.billingPeriod.unit === 'WEEK' && free.billingPeriod.value === 1;
  return Boolean(
    !option.isPrepaid && option.pricingPhases.length === 2 && free && free.price.amountMicros === 0 &&
    free.offerPaymentMode === OFFER_PAYMENT_MODE.FREE_TRIAL && free.recurrenceMode === RECURRENCE_MODE.FINITE_RECURRING &&
    free.billingCycleCount === 1 && (sevenDays || oneWeek) && recurring &&
    recurring.recurrenceMode === RECURRENCE_MODE.INFINITE_RECURRING && recurring.billingCycleCount === null &&
    recurring.price.amountMicros > 0 && recurring.billingPeriod.unit === 'YEAR' && recurring.billingPeriod.value === 1 &&
    option.fullPricePhase?.price.amountMicros === recurring.price.amountMicros &&
    option.fullPricePhase.billingPeriod.unit === recurring.billingPeriod.unit &&
    option.fullPricePhase.billingPeriod.value === recurring.billingPeriod.value,
  );
}

function isSevenDayIOSFreeTrial(pkg: PurchasesPackage): boolean {
  const intro = pkg.product.introPrice;
  const sevenDays = intro?.periodUnit === 'DAY' && intro.periodNumberOfUnits === 7;
  const oneWeek = intro?.periodUnit === 'WEEK' && intro.periodNumberOfUnits === 1;
  return Boolean(
    pkg.product.subscriptionPeriod === 'P1Y' && intro && intro.price === 0 && (sevenDays || oneWeek) && intro.cycles === 1,
  );
}

function hasAndroidBillingPeriod(option: SubscriptionOption, period: 'annual' | 'weekly'): boolean {
  if (option.isPrepaid || !option.billingPeriod || option.pricingPhases.length !== 1 || !option.fullPricePhase) return false;
  const recurring = option.pricingPhases[0];
  const periodMatches = period === 'annual'
    ? option.billingPeriod.unit === 'YEAR' && option.billingPeriod.value === 1
    : (option.billingPeriod.unit === 'WEEK' && option.billingPeriod.value === 1) ||
      (option.billingPeriod.unit === 'DAY' && option.billingPeriod.value === 7);
  return periodMatches && recurring?.recurrenceMode === RECURRENCE_MODE.INFINITE_RECURRING &&
    recurring.billingCycleCount === null && recurring.price.amountMicros > 0 &&
    recurring.billingPeriod.unit === option.billingPeriod.unit && recurring.billingPeriod.value === option.billingPeriod.value &&
    option.fullPricePhase.billingPeriod.unit === option.billingPeriod.unit &&
    option.fullPricePhase.billingPeriod.value === option.billingPeriod.value &&
    option.fullPricePhase.recurrenceMode === RECURRENCE_MODE.INFINITE_RECURRING &&
    option.fullPricePhase.billingCycleCount === null && option.fullPricePhase.price.amountMicros > 0;
}

function hasIOSBillingPeriod(pkg: PurchasesPackage, period: 'annual' | 'weekly'): boolean {
  return period === 'annual'
    ? pkg.product.subscriptionPeriod === 'P1Y'
    : pkg.product.subscriptionPeriod === 'P1W' || pkg.product.subscriptionPeriod === 'P7D';
}

/**
 * RevenueCat behind the EntitlementService interface (brief §5.6). Anonymous app user IDs only;
 * no attributes about the child are ever sent.
 */
export function createRevenueCatService(apiKey: string): EntitlementService {
  return {
    kind: 'revenuecat',
    async configure() {
      if (__DEV__) await Purchases.setLogLevel(LOG_LEVEL.WARN);
      Purchases.configure({ apiKey });
    },
    async getStatus() {
      return toStatus(await Purchases.getCustomerInfo());
    },
    async getOffering() {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) throw new Error('No current offering');
      const byId = (id: string) => current.availablePackages.find((p) => p.identifier === id) ?? null;
      const annual = current.annual ?? byId(AppConfig.packages.annual);
      const weekly = current.weekly ?? byId(AppConfig.packages.weekly);
      if (!annual || !weekly) throw new Error('Offering is missing a plan');

      if (Platform.OS === 'android') {
        const annualBase = annual.product.subscriptionOptions?.find((option) => option.isBasePlan);
        const weeklyBase = weekly.product.subscriptionOptions?.find((option) => option.isBasePlan);
        if (!annualBase || !weeklyBase || !hasAndroidBillingPeriod(annualBase, 'annual') || !hasAndroidBillingPeriod(weeklyBase, 'weekly')) {
          throw new Error('Offering is missing a valid annual or weekly Google Play base plan');
        }

        // Google returns available subscription options. Only show a trial when the tagged option
        // itself contains an exact seven-day, zero-price phase and annual recurring phase.
        const trialOption = annual.product.subscriptionOptions?.find(
          (option) => option.tags.includes(AppConfig.playTrialOfferTag) && isSevenDayFreeTrial(option),
        );
        return {
          annual: toOptionPackage('annual', annualBase),
          annualTrial: trialOption ? toOptionPackage('annual', trialOption) : null,
          weekly: toOptionPackage('weekly', weeklyBase),
          isExample: false,
        };
      }

      if (!hasIOSBillingPeriod(annual, 'annual') || annual.product.introPrice || !hasIOSBillingPeriod(weekly, 'weekly') || weekly.product.introPrice) {
        throw new Error('Offering does not match the disclosed App Store plan periods or opt-out terms');
      }

      // iOS eligibility is best-effort. Unknown and ineligible are shown as regular pricing.
      const annualTrial = Platform.OS === 'ios' ? byId(AppConfig.packages.annualTrial) : null;
      let eligibleTrial: PurchasesPackage | null = null;
      if (annualTrial && isSevenDayIOSFreeTrial(annualTrial)) {
        try {
          const eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility([annualTrial.product.identifier]);
          if (eligibility[annualTrial.product.identifier]?.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE) {
            eligibleTrial = annualTrial;
          }
        } catch {
          // Eligibility errors fail closed for trial disclosure while keeping regular pricing available.
        }
      }
      return {
        annual: toPackage('annual', annual),
        annualTrial: eligibleTrial ? toPackage('annual', eligibleTrial) : null,
        weekly: toPackage('weekly', weekly),
        isExample: false,
      };
    },
    async purchase(plan, { trial }) {
      let androidProductChange: StoreProductChangeInfo | undefined;
      if (Platform.OS === 'android' && plan === 'annual') {
        const customerInfo = await Purchases.getCustomerInfo();
        const currentPro = customerInfo.entitlements.active[AppConfig.entitlements.pro];
        if (currentPro && toStatus(customerInfo).plan === 'weekly') {
          const planIdentifier = currentPro.productPlanIdentifier;
          if (!planIdentifier) throw new Error('Google Play did not provide the active subscription plan needed for a safe plan change.');
          androidProductChange = {
            oldProductIdentifier: planIdentifier.includes(':')
              ? planIdentifier
              : currentPro.productIdentifier.includes(':')
                ? currentPro.productIdentifier
                : `${currentPro.productIdentifier}:${planIdentifier}`,
            replacementMode: Purchases.STORE_REPLACEMENT_MODE.WITHOUT_PRORATION,
          };
        }
      }
      const offering = await this.getOffering();
      try {
        let info: CustomerInfo;
        if (plan === 'annual' && trial) {
          const selected = offering.annualTrial;
          if (!selected) throw new Error('The exact eligible seven-day trial is no longer available');
          if (Platform.OS === 'android') {
            info = (await Purchases.purchaseSubscriptionOption(selected.ref as SubscriptionOption, androidProductChange)).customerInfo;
          } else {
            info = (await Purchases.purchasePackage(selected.ref as PurchasesPackage)).customerInfo;
          }
        } else {
          const selected = plan === 'annual' ? offering.annual : offering.weekly;
          if (Platform.OS === 'android') {
            // Never hand Google the package default: it can select an introductory offer implicitly.
            info = (await Purchases.purchaseSubscriptionOption(selected.ref as SubscriptionOption, androidProductChange)).customerInfo;
          } else {
            info = (await Purchases.purchasePackage(selected.ref as PurchasesPackage)).customerInfo;
          }
        }
        return { status: 'purchased', entitlement: toStatus(info) };
      } catch (e) {
        const err = e as { userCancelled?: boolean | null; code?: string };
        if (err.userCancelled || err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return { status: 'cancelled' };
        if (err.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return { status: 'pending' };
        throw e;
      }
    },
    async restore() {
      return toStatus(await Purchases.restorePurchases());
    },
    onChange(cb) {
      const listener = (info: CustomerInfo) => cb(toStatus(info));
      Purchases.addCustomerInfoUpdateListener(listener);
      return () => Purchases.removeCustomerInfoUpdateListener(listener);
    },
    async manageSubscriptions() {
      if (Platform.OS === 'ios') return Purchases.showManageSubscriptions();
      const status = await this.getStatus();
      const { Linking } = await import('react-native');
      await Linking.openURL(status.managementURL ?? 'https://play.google.com/store/account/subscriptions');
    },
    async requestRefund() {
      if (Platform.OS !== 'ios') return 'unsupported';
      await Purchases.beginRefundRequestForActiveEntitlement();
      return 'started';
    },
  };
}
