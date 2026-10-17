import type { EntitlementService } from './types';
import { FREE_STATUS } from './types';

/** Keep the free app usable when a native release has no store configuration. */
export function createUnavailableEntitlementService(hadPro: boolean): EntitlementService {
  const status = { ...FREE_STATUS, hadPro };
  const unavailable = async (): Promise<never> => { throw new Error('RevenueCat SDK configuration is unavailable.'); };
  return {
    kind: 'unavailable',
    configure: async () => {},
    getStatus: async () => status,
    getOffering: unavailable,
    purchase: unavailable,
    restore: unavailable,
    onChange: () => () => {},
    manageSubscriptions: unavailable,
    requestRefund: async () => 'unsupported',
  };
}
