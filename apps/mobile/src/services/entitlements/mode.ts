/** Missing store configuration must never turn a native release into a simulated purchase. */
export function entitlementMode(isNative: boolean, development: boolean, key: string | undefined) {
  if (key?.trim()) return 'revenuecat' as const;
  return !isNative || development ? 'mock' as const : 'unavailable' as const;
}
