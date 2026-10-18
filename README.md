# TallSoon

TallSoon is a local-first height prediction and growth-habits app built with Expo SDK 58, React Native, and TypeScript. The first prediction is free; a RevenueCat-backed subscription unlocks tracking and the daily plan. The app stores and processes child profiles locally and has no profile-sync backend. Platform backup behavior depends on the device and account settings. RevenueCat receives subscription and purchase information, but the app does not send child names, ages, heights, weights, or parent measurements.

## Requirements

- Node.js 22.22 or Node.js 24.3+ (Node 24 LTS is used in CI) and pnpm 10 (`packageManager` is pinned in the root `package.json`).
- An iOS simulator with Xcode, or an Android emulator with Android Studio, for native development.
- Access to the linked Expo project only if using optional EAS cloud builds. The current iOS TestFlight workflow uses GitHub Actions, Xcode, and Fastlane.

## Install and run

```sh
pnpm install
pnpm mobile
```

The Expo Go path is not sufficient for native RevenueCat and MMKV behavior. Build and install a development client with the EAS `development` profile, then start Metro with `cd apps/mobile && npx expo start --dev-client`. The mobile package includes `expo-dev-client`. Native development builds can use platform-matching RevenueCat test keys from `apps/mobile/.env` or the EAS `development` environment. The local `.env` file is ignored by Git.

The web app can be used for development and scripted QA with `cd apps/mobile && CI=1 npx expo export --platform web`; serve `apps/mobile/dist` through `scripts/qa/serve.js` so the required cross-origin isolation headers are present.

## Companion website

The static Astro site shares the mobile prediction engine and English catalog. Run `pnpm web` for
local development, `pnpm --filter @tallsoon/web build` to export `apps/web/dist`, and
`pnpm --filter @tallsoon/web test:e2e` for browser checks after installing Chromium with
`pnpm exec playwright install chromium`. The site is live at `https://tallsoon.pro`; `/privacy`,
`/terms`, `/support`, `/health-disclaimer`, and `/sitemap.xml` were verified to return HTTP 200,
with `www.tallsoon.pro` redirecting to the apex domain.

## Check the project

```sh
pnpm -r typecheck
pnpm --filter @tallsoon/engine test
pnpm --filter @tallsoon/content test
```

The mobile package also defines `typecheck`, `test`, and `lint` scripts. Run `pnpm --filter @tallsoon/mobile typecheck`, `pnpm --filter @tallsoon/mobile test`, and `pnpm --filter @tallsoon/mobile lint` as needed. Native flows in `.maestro/flows/` cover parent onboarding, teen paths at 13+ and under 13, paywall close, measurement logging, and delete-all-data. Run them with `maestro test .maestro` on an emulator or simulator with the development build installed; see [.maestro/README.md](.maestro/README.md). The full product-flow suite has not passed on native yet; screenshot-only navigation was run for the current native preview captures.

## EAS cloud build and submit (optional)

Run optional EAS cloud build commands from `apps/mobile`. The app is linked to [`@utkuacikgoz/tallsoon`](https://expo.dev/accounts/utkuacikgoz/projects/tallsoon); `EAS_OWNER` and `EAS_PROJECT_ID` may explicitly override that linkage. The confirmed production iOS bundle ID is `com.belevate.tallsoon`; Android remains `app.tallsoon`. The automated TestFlight path uses GitHub's macOS runner, Xcode, and Fastlane; it does not call EAS Build or require an Expo token. See [TestFlight setup](docs/TESTFLIGHT_SETUP.md) for its signing assets and remaining owner setup.

For optional EAS cloud builds, configure `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY` in the matching EAS environments. The public SDK keys are embedded in the app; do not put RevenueCat private API keys or store service-account JSON in these variables. When EAS evaluates a production build (`APP_VARIANT=production`, `EAS_BUILD=true`), `app.config.ts` requires the platform-matching key and stops if it is missing. Debug builds and web previews may omit keys and use the mock. Native release builds with missing keys show store-unavailable billing. The current GitHub TestFlight workflow receives TallSoon's public iOS SDK key from GitHub secret `EXPO_PUBLIC_RC_IOS_KEY`; keep it separate from other apps' keys. The signing/API secrets and Apple app ID are configured. Workflow run `39126029888` uploaded version `1.0.0 (2)`, which Apple processed and the owner installed from TestFlight. This upload does not submit an App Store release.

```sh
cd apps/mobile
npx eas-cli@latest build --profile development --platform all
npx eas-cli@latest build --profile preview --platform all
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --profile production --platform ios
npx eas-cli@latest submit --profile production --platform android
```

The production profile uses [EAS remote build-number management](https://docs.expo.dev/build-reference/app-versions/) and auto-increments developer-facing build numbers. Keep the user-facing `version` in `app.config.ts` under owner control and update it intentionally for store releases. EAS initializes the remote build number on the first build; if the app already has a store build number, seed the remote value with `eas build:version:set` before release. The production submit profile sends Android to Play's internal track. EAS Submit needs access to the real App Store Connect app and Google Play service-account credentials; configure these through the EAS prompts/project before submitting. The first Android submission may need a manual upload to establish the Play app/API access. These commands build or submit only; they do not publish a public store release.

The **TestFlight** GitHub Actions workflow targets a `macos-26` runner with Xcode, clean Expo prebuild, CocoaPods, and Fastlane archive/upload. It runs after successful `CI` runs from pushes to `main` and supports manual dispatch on `main`. It checks the Apple app and signing/API inputs before building, then uploads the archive to App Store Connect and confirms Apple's processing status. Missing setup skips the build; failed or unconfirmed processing fails the workflow. This path does not use EAS Build, EAS credentials, or `EXPO_TOKEN`. Version `1.0.0 (2)` was processed and installed by the owner from TestFlight. See [TestFlight setup](docs/TESTFLIGHT_SETUP.md).

See [REVIEW_NOTES.md](REVIEW_NOTES.md), [PLAY_DECLARATIONS.md](PLAY_DECLARATIONS.md), and [MANUAL_CHECKLIST.md](MANUAL_CHECKLIST.md) before preparing store submissions. App Store Connect now has marketing URL `https://tallsoon.pro`, support URL `https://tallsoon.pro/support`, privacy URL `https://tallsoon.pro/privacy`, copyright `2026 Bosphorus Elevate LLC`, and build 2 (`1.0.0`) selected. The privacy disclosure currently appears as published in App Store Connect; its visible label lists Purchase History as not linked to identity, used for App Functionality and Analytics, and not used for tracking. Owner/legal review, screenshots, billing sandbox validation, and review submission remain pending. The support contact is `support@tallsoon.pro`; its mail delivery has not been verified.
