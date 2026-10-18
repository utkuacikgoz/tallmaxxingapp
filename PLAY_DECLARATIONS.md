# Google Play declaration draft

These are draft answers for the current product scope, not submitted declarations. Confirm each answer against the finished binary, all bundled SDK disclosures, and the choices actually shown in Play Console. Google reviews the declared audience and data practices against the app.

## Target audience and content

- **Proposed target age groups:** 13–15, 16–17, and 18+. Do not select age groups 12 and under unless the product owner changes the intended audience and the app is redesigned and reviewed for that audience. The app can store a parent's locally entered information about a child aged 5–17; that does not by itself make the child the app user. Review the teen path and store listing carefully because Play may treat ages 13–17 as children in some locales.
- **Designed primarily for children under 13:** No, consistent with the product brief. The app is parent-first, with an optional teen experience for ages 13+.
- **Contains ads:** No. There is no ad SDK or advertising placement in the current app.
- **Content rating:** Complete the Play questionnaire from the actual release content; do not infer it from the target audience selection.

The actual target audience needs product-owner confirmation before submission because the brief also describes prediction for children aged 5–17 and a teen onboarding path. Google says to select only age groups for which the app is designed and appropriate, and notes that 13–15 and 16–17 can be considered children in some locales.

## Health apps

- **Complete the Health apps declaration:** Yes. Google requires the declaration even when an app has no health features, and this app includes health-related height tracking, growth references, and wellbeing habit content.
- **Draft feature areas to review in the form:** Health and fitness features involving activity/exercise, nutrition and weight management, and sleep management may apply to the plan content and tracking. Explain that height prediction and percentile display are informational estimates from published methods and reference data. Do not select medical-device, diagnosis, treatment, medication-management, or clinical-decision-support categories unless the product scope changes and the appropriate regulatory review supports it.
- **Health claim and risk disclosure:** Describe the app as a non-diagnostic estimate and general habits tracker. Keep the in-app limitations and pediatrician guidance visible. Confirm whether the product's prediction functionality changes the declaration category with Google Play before launch.
- **Privacy policy:** Play requires an active public privacy policy URL and a policy link or text in the app. The configured URL is `https://tallsoon.pro/privacy`; deployment and an HTTP 200 response are not yet verified. The policy and its data disclosures still need owner/legal review before release.

## Data safety — preliminary inventory

The local profile, name/nickname, date of birth, heights, weights, habit entries, and generated reports are stored and processed on device. Android backup is enabled in the current config, and platform backup behavior may depend on device and account settings; confirm its treatment in the form and privacy policy. The app's analytics implementation is currently a no-op. The app does not send those child measurements or profile fields to its developer or RevenueCat.

RevenueCat is a third-party subscription processor. The native SDK uses an anonymous app user ID and transmits purchase/subscription information so the app can retrieve entitlement status and offerings. RevenueCat's documentation says it collects purchase history. Play's form must reflect the actual SDK behavior and any processing by Google Play Billing and RevenueCat; do not claim “no data collected” solely because child data stays local. Review and record the current RevenueCat/Google Play SDK disclosures immediately before submission.

| Data area | Draft treatment | Verify before filing |
|---|---|---|
| Child profile and growth measurements | Not collected off device by the app; stored locally | Inspect the final binary/network behavior and all SDKs |
| Purchase history and anonymous subscription identifier | Collected/processed for subscription entitlement and restore | Map to Play's current data-type labels and provider/service-provider rules |
| Financial payment details | Processed by Play Billing; app does not receive card details | Confirm final billing integration and Google form guidance |
| Sharing with third parties | RevenueCat and store billing process subscription data as service providers; no ads or sale | Verify no dashboard integrations, analytics sink, or SDK added before release |
| Encryption in transit | Billing and RevenueCat connections use their SDK/network transport | Confirm in final SDK/provider documentation and runtime build |
| Account deletion | There is no app account; local app data can be deleted in app settings | Explain local deletion and RevenueCat anonymous customer retention in the privacy policy |

Do not copy this table as final form answers without checking platform backup behavior and the data collection/sharing categories for every included SDK version.

## Advertising ID

- **Does the app use Advertising ID?** No. The app contains no advertising SDK, does not use an ad identifier, and `app.config.ts` blocks `com.google.android.gms.permission.AD_ID`.
- Verify the merged release manifest has no AD_ID permission and answer consistently in Play Console.

## Official references

- [Target audience and app content settings](https://support.google.com/googleplay/android-developer/answer/9867159)
- [Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291)
- [Google Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Advertising ID policy](https://support.google.com/googleplay/android-developer/answer/6048248)
- [RevenueCat Apple App Privacy guidance](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy) (SDK data disclosure context; this is not a substitute for the Play form)
