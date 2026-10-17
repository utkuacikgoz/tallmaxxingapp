# Owner release checklist

Items below need access to the product owner's store, Expo, domain, or review accounts. No credentials, project identifiers, account links, or approvals have been invented.

## EAS and native releases

- [ ] Create/link the Expo project and configure its real `owner` and `projectId` for `apps/mobile/app.config.ts` (`EAS_OWNER`, `EAS_PROJECT_ID`).
- [ ] Configure real app-specific RevenueCat SDK keys for `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY` in the EAS production environment. The production EAS build now fails during config evaluation if the key for its `EAS_BUILD_PLATFORM` is missing; only debug builds and web previews may simulate purchases. Native preview/release builds need platform-matching SDK keys to test billing; a missing key shows store-unavailable messaging.
- [ ] Set up EAS iOS signing and App Store Connect access; confirm the actual bundle ID `app.tallsoon` is registered and select the correct app in EAS Submit.
- [ ] Set up the Google Play app, signing, and EAS Submit service-account access; confirm package ID `app.tallsoon`. The production submit profile targets the Play **internal** track.
- [ ] Verify EAS's initial remote build number after the first build; if the app already has a store build number, seed EAS with `eas build:version:set` before release. Production builds auto-increment developer-facing build numbers. Update the user-facing `version` in `app.config.ts` intentionally for each store release, and verify each build has the intended app variant and bundle/package identifier.
- [ ] If the Play developer account is a personal account created after Nov 13, 2023, complete a closed test with at least 12 opted-in testers for 14 continuous days, then apply for production access. Confirm the account-specific requirement in Play Console ([Google's current testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)).

## Store products and RevenueCat

- [ ] Create the RevenueCat project and connect the real App Store Connect and Play apps.
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
