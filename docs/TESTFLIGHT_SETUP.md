# TestFlight and RevenueCat setup

## Confirmed account records

| Service | Record |
| --- | --- |
| Expo | [`@utkuacikgoz/tallsoon`](https://expo.dev/accounts/utkuacikgoz/projects/tallsoon) |
| EAS project ID | `830cb434-572b-47bf-a88f-6e909f4141ff` |
| RevenueCat | [`TallSoon`](https://app.revenuecat.com/projects/40ce0c3d/overview) |
| Production bundle ID | `app.tallsoon` |

Expo project creation and CLI project linkage are verified. RevenueCat project creation is verified;
its catalog, Apple connection and SDK key still need verification. No TestFlight build is uploaded yet.

## App Store Connect

1. Register the explicit production bundle ID `app.tallsoon` in the correct Apple Developer team.
2. Create an iOS app named TallSoon, primary language English (U.S.), SKU `tallsoon-ios`. Record its
   numeric Apple ID as `ascAppId` under `submit.production.ios` in `apps/mobile/eas.json`.
3. Resolve any Apple agreement notice in the account before creating purchases. The account holder
   must review the actual agreement; do not infer agreement acceptance from successful sign-in.
4. Create a single subscription group. Configure the following products using the brief's USD
   reference prices; the app displays localized prices supplied by the store.

| Product ID | Duration | Reference price | Introductory offer | RevenueCat entitlements |
| --- | --- | --- | --- | --- |
| `app.pro.weekly` | 1 week | $4.99 | None | `pro` |
| `app.family.annual` | 1 year | $39.99 | None | `pro`, `multi_child` |
| `app.family.annual.trial` | 1 year | $39.99 | Free for 7 days | `pro`, `multi_child` |

Provide subscription localizations, review metadata and any required screenshots. Verify the group's
upgrade/crossgrade levels and trial eligibility in the sandbox. The annual trial is an explicit,
separate product so Annual without the toggle never silently selects an introductory offer.

## RevenueCat

1. Verify/create entitlements with the exact identifiers `pro` and `multi_child`.
2. Add an Apple App Store app for `app.tallsoon` in the TallSoon project. Connect the correct App Store
   Connect app and configure its In-App Purchase key and App Store Connect API integration. Credentials
   must be selected for this account and destination; never commit `.p8`, signing keys or private API keys.
3. Import the three App Store products and attach entitlements according to the table above.
4. Create the current offering `default` with these packages:

| Package identifier | Store product |
| --- | --- |
| `$rc_weekly` | `app.pro.weekly` |
| `$rc_annual` | `app.family.annual` |
| `annual_trial` | `app.family.annual.trial` |

5. Set the actual **Apple app public SDK key** as `EXPO_PUBLIC_RC_IOS_KEY` in the EAS production
   environment. Never substitute a Test Store key or a private RevenueCat API key.

## Build and upload

From `apps/mobile`, with the supported Node version:

```sh
npx eas-cli@latest project:info
npx eas-cli@latest credentials --platform ios
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production --id <verified-ios-build-id>
```

Use the `production` build profile for TestFlight: it uses the real bundle ID, store distribution,
and actual RevenueCat integration. The `preview` profile has a different bundle ID and internal
signing; it is not this TestFlight app. EAS production builds reject a missing platform SDK key.
Validate the first remote build number before building. Upload only the verified completed iOS build.
EAS Submit uploads to App Store Connect; verify Apple processing and the build's availability in
TestFlight separately. Public App Store release and external tester invitations are separate actions.

## Verify in TestFlight

- Free prediction and paywall close work before any purchase.
- Weekly/Annual show the exact sandbox product prices and durations.
- Annual without trial charges the non-introductory product; eligible opt-in trial selects the
  separate seven-day product. Ineligible and unknown eligibility never fall back to a charge.
- Weekly grants `pro`; both annual products grant `pro` and `multi_child`.
- Purchases appear as sandbox transactions in this RevenueCat project. Test cancel, renew, restore,
  expiration, upgrade and reinstall behavior using the Apple sandbox setup.
- Check the two-day trial reminder, image/PDF exports, notifications and deletion on a native device.

Sources: [Expo iOS submission](https://docs.expo.dev/submit/ios/),
[RevenueCat In-App Purchase key](https://www.revenuecat.com/docs/service-credentials/itunesconnect-app-specific-shared-secret/in-app-purchase-key-configuration),
[RevenueCat TestFlight testing](https://www.revenuecat.com/docs/test-and-launch/sandbox/apple-app-store).
