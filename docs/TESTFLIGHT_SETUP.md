# TestFlight setup

## Verified records and current status

| Item | Status |
| --- | --- |
| RevenueCat project | [`TallSoon`](https://app.revenuecat.com/projects/40ce0c3d/overview), project `40ce0c3d` |
| RevenueCat iOS app record | `app5829101f0b`, bundle ID `com.belevate.tallsoon` |
| RevenueCat Apple credentials | Both Apple credentials are valid in RevenueCat |
| Android package | `app.tallsoon` |
| Apple Developer team | `9D78WTZAD8` |
| TestFlight automation | Xcode/Fastlane GitHub workflow implemented; waiting for credentials and first signed run |
| GitHub Actions credentials | Required secrets and `ASC_APP_ID` are not configured |
| RevenueCat iOS SDK key | Not configured for the TestFlight workflow |
| TestFlight build | No upload or processed build is verified |

The TestFlight binary uses iOS bundle ID `com.belevate.tallsoon`; Android stays `app.tallsoon`. The numeric App Store Connect Apple ID is a separate value from RevenueCat app record `app5829101f0b`.

## GitHub Actions configuration

The workflow uses a GitHub-hosted `macos-26` runner, Xcode, Expo prebuild, CocoaPods, and Fastlane. Expo SDK 58 requires Xcode 26.4 or newer; the workflow pins Xcode 26.6 and prints its version before building. The `macos-26` image currently provides Xcode 26.6 by default. The workflow does not use EAS Build, EAS signing, an Expo access token, or EAS environment variables.

Add these repository **Actions secrets** in GitHub under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `ASC_KEY_P8` | Full raw App Store Connect API `.p8` PEM, including PEM headers and newlines |
| `ASC_KEY_ID` | App Store Connect API key ID (use a dedicated TallSoon team key with App Manager access) |
| `ASC_ISSUER_ID` | App Store Connect API issuer ID |
| `IOS_DISTRIBUTION_P12_BASE64` | Base64 of a password-protected PKCS#12 file containing the Apple Distribution certificate and its private key |
| `IOS_DISTRIBUTION_P12_PASSWORD` | Password used to export that `.p12` file |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64 of the App Store Connect distribution `.mobileprovision` for `com.belevate.tallsoon` and the selected certificate |
| `EXPO_PUBLIC_RC_IOS_KEY` | TallSoon's public iOS SDK key from the production RevenueCat app record |

Add this repository **Actions variable**:

| Variable | Value |
| --- | --- |
| `ASC_APP_ID` | Numeric Apple ID from the App Store Connect app's General Information page |

The App Store Connect `.p8` key, signing `.p12`, and its password are sensitive credentials. Never commit them, print them in CI logs, or put Apple passwords/2FA codes or RevenueCat private API keys in GitHub. Use a TallSoon-specific RevenueCat SDK key rather than another app's key. The iOS SDK key is public to the app binary, but it is stored as a GitHub secret so CI can inject it without committing it.

## Create the iOS signing assets

Use an active Apple Distribution signing identity from team `9D78WTZAD8`. If none is available with its private key on the Mac, create an Apple Distribution certificate in the Apple Developer account using a Certificate Signing Request generated from **Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority**. Download Apple's `.cer` and double-click it to add it to the keychain. Avoid revoking existing team certificates to set up CI.

To export the signing identity:

1. Open **Keychain Access**, select the `login` keychain and **My Certificates**.
2. Find the `Apple Distribution` certificate for team `9D78WTZAD8` and expand it. Confirm its private key appears beneath it. A `.cer` without its matching private key cannot sign the build.
3. Select the certificate and its private key, then choose **File → Export Items**. Save as `.p12`, set a strong export password, and store that password in `IOS_DISTRIBUTION_P12_PASSWORD`. The `.p12` must contain both the certificate and private key.

Create the matching provisioning profile in the [Apple Developer account](https://developer.apple.com/account/resources/profiles/list):

1. Choose **Profiles → + → Distribution → App Store Connect**.
2. Select the explicit App ID for `com.belevate.tallsoon`.
3. Select the same Apple Distribution certificate included in the `.p12`, generate the profile, then download the `.mobileprovision` file.

Apple's profile instructions require an App Store Connect distribution profile, an explicit matching App ID, and a selected distribution certificate. A development, ad hoc, or wildcard profile is not suitable for this TestFlight upload. See [Apple's App Store Connect profile guide](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile/) and [certificate overview](https://developer.apple.com/help/account/certificates/certificates-overview/).

Convert each binary signing file to base64 on macOS and send it directly to the clipboard. Replace the example paths with the files you downloaded; the commands do not print the encoded secrets in Terminal:

```sh
base64 -i "/path/to/TallSoon-Distribution.p12" | pbcopy
```

Paste the clipboard into GitHub secret `IOS_DISTRIBUTION_P12_BASE64`. Repeat for the provisioning profile:

```sh
base64 -i "/path/to/TallSoon-AppStore.mobileprovision" | pbcopy
```

Paste into `IOS_PROVISIONING_PROFILE_BASE64`. Enter the `.p12` export password separately in `IOS_DISTRIBUTION_P12_PASSWORD`. Keep secure owner backups of the original files and password. For the App Store Connect API key, paste the raw `.p8` PEM into `ASC_KEY_P8`; do not base64-encode it unless the workflow instructions change.

## Build and upload behavior

The **TestFlight** workflow at `.github/workflows/testflight.yml` runs after successful `CI` on a push to `main` and supports manual dispatch on `main`. A prerequisite check reports missing secrets/variables and skips the build instead of starting with incomplete signing inputs.

The release job will validate that `ASC_APP_ID` belongs to `com.belevate.tallsoon`, that the supplied signing profile and certificate match the production app, and that the RevenueCat SDK key is a production key rather than a `test_` key. It uses Node/pnpm, selects the pinned Xcode version, runs a clean Expo iOS prebuild without installing packages, runs `pod install`, then uses Fastlane to archive and upload with the App Store Connect API key. GitHub-provided certificate/profile material is used for codesigning. It does not invoke EAS Build or require `EXPO_TOKEN`.

The workflow waits for the archive/upload operation and checks Apple's processing status. It only reports the build as ready after Apple confirms processing; a failure or timeout is reported as a failure and needs an App Store Connect check. Uploading to TestFlight does not submit an App Store release or invite testers. Credentials are not configured, so no signed build or upload has been verified.

Store listing and billing screenshots are not blockers for the initial TestFlight binary upload. Complete any required store metadata and screenshots before App Store review.

## Optional EAS and Android paths

EAS remains available for optional cloud development/preview/production builds and Android submission. Those paths may use EAS credentials, `EXPO_TOKEN`, and platform-specific RevenueCat keys in EAS environments; they are separate from the GitHub TestFlight pipeline. For direct EAS production builds, `app.config.ts` requires the matching EAS environment RevenueCat key. The iOS production key is currently absent there. Android remains on package `app.tallsoon` and its existing Play internal-track/EAS setup is not changed by this iOS pipeline.

## RevenueCat product checks before tester validation

Verify these products, entitlements, and packages in the TallSoon RevenueCat project before testing purchase paths:

| App Store product | Duration | Offer | Entitlements |
| --- | --- | --- | --- |
| `app.pro.weekly` | 1 week | None | `pro` |
| `app.family.annual` | 1 year | None | `pro`, `multi_child` |
| `app.family.annual.trial` | 1 year | Optional 7-day trial product | `pro`, `multi_child` |

The current offering should be `default`, with `$rc_weekly` → `app.pro.weekly`, `$rc_annual` → `app.family.annual`, and `annual_trial` → `app.family.annual.trial`. Verify store metadata, localized prices, eligibility, restore, cancel, renewal, expiration, and upgrades using Apple's sandbox. The first prediction remains free, and the paywall must not appear before it.

## Verify the TestFlight build

- Confirm the processed build uses bundle ID `com.belevate.tallsoon` and the intended version/build number.
- Confirm a free prediction and paywall close work without purchasing.
- Confirm weekly and annual prices and durations match the sandbox products. Opt-in trial selects the separate trial product; ineligible or unknown trial status must not fall back to a charge.
- Confirm RevenueCat grants `pro` for weekly, and `pro` plus `multi_child` for both annual products.
- Test purchase, restore, cancellation, renewal, expiration, upgrade, reinstall, reminders, export, notifications, and delete-all-data on a native device.
- Treat the build as available to testers only after App Store processing completes and it appears in TestFlight.

Sources: [Expo SDK 58 requirements](https://docs.expo.dev/versions/v58.0.0/), [Apple App Store Connect provisioning profiles](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile/), [Apple certificates](https://developer.apple.com/help/account/certificates/certificates-overview/), [Apple Keychain export](https://support.apple.com/guide/keychain-access/kyca35961/mac), and [RevenueCat TestFlight testing](https://www.revenuecat.com/docs/test-and-launch/sandbox/apple-app-store).
