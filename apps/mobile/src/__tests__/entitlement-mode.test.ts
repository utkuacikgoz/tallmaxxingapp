import { expect, test } from '@jest/globals';
import { entitlementMode } from '@/services/entitlements/mode';
import { createUnavailableEntitlementService } from '@/services/entitlements/unavailable';

test('only debug and web may simulate purchases when store keys are missing', () => {
  expect(entitlementMode(true, false, undefined)).toBe('unavailable');
  expect(entitlementMode(true, false, '  ')).toBe('unavailable');
  expect(entitlementMode(true, true, undefined)).toBe('mock');
  expect(entitlementMode(false, false, undefined)).toBe('mock');
  expect(entitlementMode(true, false, 'public-sdk-key')).toBe('revenuecat');
});

test('a missing store configuration cannot grant Pro or offer a simulated purchase', async () => {
  const service = createUnavailableEntitlementService(true);
  expect(await service.getStatus()).toMatchObject({ isPro: false, hadPro: true });
  await expect(service.getOffering()).rejects.toThrow();
  await expect(service.purchase('annual', { trial: true })).rejects.toThrow();
  await expect(service.restore()).rejects.toThrow();
});
