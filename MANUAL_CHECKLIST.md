# Owner release checklist

Items below need access to the product owner's store, Expo, domain, or review accounts. No credentials, project identifiers, account links, or approvals have been invented.

## iOS TestFlight release

- [x] Created and verified `@utkuacikgoz/tallsoon`; configured its real owner and project ID as defaults in `apps/mobile/app.config.ts`. Environment overrides remain available. See `docs/TESTFLIGHT_SETUP.md`.
- [x] Verified the RevenueCat production iOS app record `app5829101f0b` in project `40ce0c3d` for bundle ID `com.belevate.tallsoon`, with both Apple credentials valid in RevenueCat. This does not verify the numeric Apple ID or TestFlight upload.
- [x] Configured TallSoon's public iOS RevenueCat SDK key as GitHub Actions secret `EXPO_PUBLIC_RC_IOS_KEY`. Keep this separate from other apps' keys; it is not a private RevenueCat API key.
- [x] Verified and set numeric App Store Connect Apple ID `6824177611` as `ASC_APP_ID` for `com.belevate.tallsoon`. It is distinct from RevenueCat app record ID `app5829101f0b`.
- [x] Imported the Apple Distribution signing identity and configured `IOS_DISTRIBUTION_P12_BASE64` plus `IOS_DISTRIBUTION_P12_PASSWORD` in GitHub Actions.
- [x] Created and configured the App Store Connect distribution provisioning profile for bundle ID `com.belevate.tallsoon`, team `9D78WTZAD8`, and the matching Apple Distribution certificate.
- [x] Configured GitHub secrets `ASC_KEY_P8`, `ASC_KEY_ID`, and `ASC_ISSUER_ID` for the App Store Connect API key. Never add Apple passwords or 2FA codes.
- [x] Implemented and ran the TestFlight workflow with a `macos-26` runner, Xcode, Expo clean prebuild, CocoaPods, and Fastlane. It does not use EAS Build, EAS signing, or `EXPO_TOKEN`. Initial workflow run `39117605979` validated Apple API access, certificate import, profile installation, and pods, but archive failed on an unexpected `aps-environment` entitlement.
- [x] Fixed the Expo Notifications configuration for this local-reminders-only app; clean production prebuild now generates an empty entitlements file, and typecheck/lint pass.
- [ ] Retry the TestFlight archive and wait for Apple processing; no archive or upload is verified yet.
- [ ] After a processed build appears in TestFlight, install it on a device and verify onboarding, free prediction/paywall close, purchases, restore, and subscription/billing flows. Device and billing tests remain pending.

Store-listing and billing screenshots do not block the first binary upload to TestFlight; complete any required screenshots and metadata before App Store review.

## Optional EAS and Android releases

- [ ] Configure `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY` in EAS production only if using direct EAS production builds; the iOS EAS production key is currently absent. These are public SDK keys, not RevenueCat private API keys. A production EAS build fails if its platform key is missing.
- [ ] Set up the Google Play app, signing, and EAS Submit service-account access; confirm package ID `app.tallsoon`. The production submit profile targets the Play **internal** track.
- [ ] Verify EAS's initial remote build number after the first build; if the app already has a store build number, seed EAS with `eas build:version:set` before release. Production builds auto-increment developer-facing build numbers. Update the user-facing `version` in `app.config.ts` intentionally for each store release, and verify each build has the intended app variant and bundle/package identifier.
- [ ] If the Play developer account is a personal account created after Nov 13, 2023, complete a closed test with at least 12 opted-in testers for 14 continuous days, then apply for production access. Confirm the account-specific requirement in Play Console ([Google's current testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)).

## Store products and RevenueCat

- [x] Create the RevenueCat project, production iOS app record, and Apple credential connections. Verified record: project `40ce0c3d`, app `app5829101f0b`, iOS bundle `com.belevate.tallsoon`; both Apple credentials are valid.
- [ ] Connect and verify the Android app in RevenueCat; its package remains `app.tallsoon`.
- [ ] Keep RevenueCat private keys in RevenueCat. TestFlight uses only the public iOS SDK key stored in GitHub Actions; it is currently not configured.
- [ ] Configure RevenueCat entitlements `pro` and `multi_child`, plus the `default` offering.
- [ ] Put iOS subscription products in the intended single subscription group and verify upgrade/crossgrade behavior in the store sandbox.
- [ ] Create iOS products `app.pro.weekly`, `app.family.annual`, and `app.family.annual.trial`.
- [ ] Create Play subscriptions `pro_weekly` and `family_annual`; configure the 7-day trial as an offer on `family_annual` with the `optin-trial` tag.
- [ ] Set the intended localized store prices (reference values in the brief: $4.99/week and $39.99/year); ensure the actual price shown is supplied by the store through RevenueCat.
- [ ] Verify that Play offers have exactly one seven-day free phase followed by annual renewal, and that normal weekly/annual base plans have no introductory phases. Confirm Weekly-to-Annual replacement cancels the old plan and charges according to the native confirmation.
- [ ] Verify paywall packages, trial opt-in behavior, purchase, restore, manage subscription, cancellation, and the two-day trial reminder using store sandbox/test tracks.
- [ ] Provision an App Store sandbox tester and Play license tester. Keep account credentials in the respective consoles, never in this repository.

## Store declarations and public information

- [ ] Publish accurate privacy and terms pages at the URLs used by `AppConfig` (`https://tallsoon.app/privacy` and `https://tallsoon.app/terms` are placeholders today).
- [ ] Replace `support@tallsoon.app` with a working support address and publish a support page.
- [ ] Complete the current App Store age rating, privacy disclosures, subscription metadata, and review notes.
- [ ] Complete Play's target audience/content rating, Health apps declaration, Data safety form, Ads declaration, and Advertising ID declaration from the final binary and current SDK disclosures. Use `PLAY_DECLARATIONS.md` as a draft only.
- [ ] Verify the final Android manifest contains no `com.google.android.gms.permission.AD_ID` permission.
- [ ] Check the current Play target API requirement at submission; the Expo SDK 58 reference specifies compile SDK 37 and target SDK 36 for this app configuration. See [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) and [Google Play target API requirements](https://developer.android.com/google/play/requirements/target-sdk).

## Product and content readiness

- [ ] Replace all sample testimonial bubbles only with real testimonials that have documented, revocable consent. Keep placeholders clearly labelled until then.
- [ ] Obtain pediatric professional review for all content marked `REVIEW`, including the velocity bands; document the reviewer and resulting edits.
- [ ] Confirm the references and methods wording in the app match the actual bundled datasets and the provenance in `packages/reference/SOURCES.md`.
- [ ] Complete native iOS and Android review of the subscription flow, privacy disclosures, notifications, export/delete behavior, and accessibility before submission.
