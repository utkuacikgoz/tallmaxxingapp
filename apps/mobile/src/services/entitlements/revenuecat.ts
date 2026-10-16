import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

import { AppConfig } from '@/config/app-config';
import { FREE_STATUS, type EntitlementService, type EntitlementStatus, type Offering, type PlanPackage } from './types';

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

/**
 * RevenueCat behind the EntitlementService interface (brief §5.6). Anonymous app user IDs only;
 * no attributes about the child are ever sent.
 */
export function createRevenueCatService(apiKey: string): EntitlementService {
  let offeringCache: Offering | null = null;

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
      if (offeringCache) return offeringCache;
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) throw new Error('No current offering');
      const byId = (id: string) => current.availablePackages.find((p) => p.identifier === id) ?? null;
      const annual = current.annual ?? byId(AppConfig.packages.annual);
      const weekly = current.weekly ?? byId(AppConfig.packages.weekly);
      if (!annual || !weekly) throw new Error('Offering is missing a plan');
      // iOS: a separate annual product carries the intro trial. Play: the trial is an offer on the same base plan.
      const annualTrial = Platform.OS === 'ios' ? byId(AppConfig.packages.annualTrial) : annual;
      offeringCache = {
        annual: toPackage('annual', annual),
        annualTrial: annualTrial ? toPackage('annual', annualTrial) : null,
        weekly: toPackage('weekly', weekly),
        isExample: false,
      };
      return offeringCache;
    },
    async purchase(plan, { trial }) {
      const offering = await this.getOffering();
      try {
        let info: CustomerInfo;
        if (plan === 'annual' && trial && offering.annualTrial) {
          const pkg = offering.annualTrial.ref as PurchasesPackage;
          const option =
            Platform.OS === 'android'
              ? pkg.product.subscriptionOptions?.find((o) => o.tags.includes(AppConfig.playTrialOfferTag))
              : undefined;
          info = option ? (await Purchases.purchaseSubscriptionOption(option)).customerInfo : (await Purchases.purchasePackage(pkg)).customerInfo;
        } else {
          const pkg = (plan === 'annual' ? offering.annual : offering.weekly).ref as PurchasesPackage;
          // Play: buy the base plan without the trial offer when the toggle is off.
          const base = Platform.OS === 'android' ? pkg.product.subscriptionOptions?.find((o) => o.isBasePlan) : undefined;
          info = base ? (await Purchases.purchaseSubscriptionOption(base)).customerInfo : (await Purchases.purchasePackage(pkg)).customerInfo;
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
