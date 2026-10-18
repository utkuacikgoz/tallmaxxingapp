# Owner release checklist

Items below need access to the product owner's store, Expo, domain, or review accounts. No credentials, project identifiers, account links, or approvals have been invented.

## iOS TestFlight release

- [x] Created and verified `@utkuacikgoz/tallsoon`; configured its real owner and project ID as defaults in `apps/mobile/app.config.ts`. Environment overrides remain available. See `docs/TESTFLIGHT_SETUP.md`.
- [x] Verified the RevenueCat production iOS app record `app5829101f0b` in project `40ce0c3d` for bundle ID `com.belevate.tallsoon`, with both Apple credentials valid in RevenueCat.
- [x] Configured TallSoon's public iOS RevenueCat SDK key as GitHub Actions secret `EXPO_PUBLIC_RC_IOS_KEY`. Keep this separate from other apps' keys; it is not a private RevenueCat API key.
- [x] Verified and set numeric App Store Connect Apple ID `6824177611` as `ASC_APP_ID` for `com.belevate.tallsoon`. It is distinct from RevenueCat app record ID `app5829101f0b`.
- [x] Imported the Apple Distribution signing identity and configured `IOS_DISTRIBUTION_P12_BASE64` plus `IOS_DISTRIBUTION_P12_PASSWORD` in GitHub Actions.
- [x] Created and configured the App Store Connect distribution provisioning profile for bundle ID `com.belevate.tallsoon`, team `9D78WTZAD8`, and the matching Apple Distribution certificate.
- [x] Configured GitHub secrets `ASC_KEY_P8`, `ASC_KEY_ID`, and `ASC_ISSUER_ID` for the App Store Connect API key. Never add Apple passwords or 2FA codes.
- [x] Implemented the TestFlight workflow with a `macos-26` runner, Xcode, Expo clean prebuild, CocoaPods, and Fastlane. It does not use EAS Build, EAS signing, or `EXPO_TOKEN`.
- [x] Uploaded version `1.0.0 (2)` in workflow run `39126029888`; Apple processed it and the owner installed it from TestFlight.
- [ ] Complete native billing and restore tests with the App Store sandbox. Purchase, restore, cancellation/renewal and subscription edge cases remain pending.

The TestFlight binary is available to the owner. Store listing screenshots and the subscription review screenshot remain pending; the new screenshot set has not been approved or uploaded. Complete required screenshots and metadata before App Store review.

## Optional EAS and Android releases

- [ ] Configure `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY` in EAS production only if using direct EAS production builds. These are public SDK keys, not RevenueCat private API keys. A production EAS build fails if its platform key is missing. EAS is optional for the current GitHub/Fastlane iOS pipeline.
- [ ] Set up the Google Play app, signing, and EAS Submit service-account access; confirm package ID `app.tallsoon`. The production submit profile targets the Play **internal** track.
- [ ] Verify EAS's initial remote build number after the first build; if the app already has a store build number, seed EAS with `eas build:version:set` before release. Production builds auto-increment developer-facing build numbers. Update the user-facing `version` in `app.config.ts` intentionally for each store release, and verify each build has the intended app variant and bundle/package identifier.
- [ ] If the Play developer account is a personal account created after Nov 13, 2023, complete a closed test with at least 12 opted-in testers for 14 continuous days, then apply for production access. Confirm the account-specific requirement in Play Console ([Google's current testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)).

## Store products and RevenueCat

- [x] Create the RevenueCat project, production iOS app record, and Apple credential connections. Verified record: project `40ce0c3d`, app `app5829101f0b`, iOS bundle `com.belevate.tallsoon`; both Apple credentials are valid.
- [ ] Connect and verify the Android app in RevenueCat; its package remains `app.tallsoon`.
- [x] Keep RevenueCat private keys in RevenueCat. TestFlight uses TallSoon's public iOS SDK key stored in GitHub Actions.
- [x] Configure RevenueCat entitlements `pro` and `multi_child`, plus the `default` offering with weekly, annual, and optional annual-trial packages.
- [x] Create iOS products `app.pro.weekly`, `app.family.annual`, and `app.family.annual.trial` in the `TallSoon Pro` subscription group; set their intended price/availability and the opt-in seven-day annual trial. See `docs/TESTFLIGHT_SETUP.md` for verified details.
- [ ] Verify localized prices and eligibility with the App Store sandbox before release.
- [ ] Create Play subscriptions `pro_weekly` and `family_annual`; configure the 7-day trial as an offer on `family_annual` with the `optin-trial` tag.
- [x] Set the U.S. starting prices to $4.99/week and $39.99/year for annual plans, with availability configured for all 175 App Store regions; ensure the actual price shown is supplied by the store through RevenueCat.
- [ ] Verify that Play offers have exactly one seven-day free phase followed by annual renewal, and that normal weekly/annual base plans have no introductory phases. Confirm Weekly-to-Annual replacement cancels the old plan and charges according to the native confirmation.
- [ ] Verify paywall packages, trial opt-in behavior, purchase, restore, manage subscription, cancellation, and the two-day trial reminder using store sandbox/test tracks.
- [ ] Complete App Store sandbox tester setup and validate purchase/restore flows. Keep account credentials in App Store Connect, never in this repository.
- [ ] Set up a Google Play license tester and validate purchase/restore flows.

## Store declarations and public information

- [ ] Deploy and verify `https://tallsoon.pro`, `/privacy`, `/terms`, and `/support` return HTTP 200 before using them for store submission. These are the configured URLs; deployment/live response has not yet been confirmed.
- [ ] Verify mail delivery for `support@tallsoon.pro`; the owner chose this address, but its MX/mail service has not been verified.
- [ ] Complete the current App Store age rating, privacy disclosures, subscription metadata, and review notes.
- [ ] Publish the App Store privacy disclosure only after owner/legal review; its current draft remains unpublished.
- [ ] Complete App Store agreement, banking, tax, and content-rights owner steps as applicable; do not accept a new binding agreement without owner action.
- [ ] Complete Play's target audience/content rating, Health apps declaration, Data safety form, Ads declaration, and Advertising ID declaration from the final binary and current SDK disclosures. Use `PLAY_DECLARATIONS.md` as a draft only.
- [ ] Verify the final Android manifest contains no `com.google.android.gms.permission.AD_ID` permission.
- [ ] Check the current Play target API requirement at submission; the Expo SDK 58 reference specifies compile SDK 37 and target SDK 36 for this app configuration. See [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) and [Google Play target API requirements](https://developer.android.com/google/play/requirements/target-sdk).

## Product and content readiness

- [ ] Replace all sample testimonial bubbles only with real testimonials that have documented, revocable consent. Keep placeholders clearly labelled until then.
- [ ] Obtain pediatric professional review for all content marked `REVIEW`, including the velocity bands; document the reviewer and resulting edits.
- [ ] Confirm the references and methods wording in the app match the actual bundled datasets and the provenance in `packages/reference/SOURCES.md`.
- [ ] Complete native iOS and Android review of the subscription flow, privacy disclosures, notifications, export/delete behavior, and accessibility before submission.
