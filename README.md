# TallSoon

TallSoon is a local-first height prediction and growth-habits app built with Expo SDK 58, React Native, and TypeScript. The first prediction is free; a RevenueCat-backed subscription unlocks tracking and the daily plan. The app stores and processes child profiles locally and has no profile-sync backend. Platform backup behavior depends on the device and account settings. RevenueCat receives subscription and purchase information, but the app does not send child names, ages, heights, weights, or parent measurements.

## Requirements

- Node.js 22.22 or Node.js 24.3+ (Node 24 LTS is used in CI) and pnpm 10 (`packageManager` is pinned in the root `package.json`).
- An iOS simulator with Xcode, or an Android emulator with Android Studio, for native development.
- An Expo account and EAS project for cloud builds. EAS project identifiers and signing credentials have not been provisioned in this repository.

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
`pnpm exec playwright install chromium`. No website has been deployed; support details, legal
review and real store links remain owner release tasks.

## Check the project

```sh
pnpm -r typecheck
pnpm --filter @tallsoon/engine test
pnpm --filter @tallsoon/content test
```

The mobile package also defines `typecheck`, `test`, and `lint` scripts. Run `pnpm --filter @tallsoon/mobile typecheck`, `pnpm --filter @tallsoon/mobile test`, and `pnpm --filter @tallsoon/mobile lint` as needed. Native flows in `.maestro/flows/` cover parent onboarding, teen paths at 13+ and under 13, paywall close, measurement logging, and delete-all-data. Run them with `maestro test .maestro` on an emulator or simulator with the development build installed; see [.maestro/README.md](.maestro/README.md). No native Maestro run is claimed here.

## EAS build and submit

Run EAS commands from `apps/mobile`. Link the app to the real Expo project first (`npx eas-cli@latest project:init`), then configure the actual `EAS_OWNER` and `EAS_PROJECT_ID` values used by `app.config.ts`. No project ID, signing credential, App Store Connect app ID, or Play service-account credential is included in this repo.

Configure `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY` as app-specific RevenueCat SDK keys in the matching EAS environments. The public SDK keys are embedded in the app; do not put RevenueCat secret API keys or store service-account JSON in these variables. When EAS evaluates a production build (`APP_VARIANT=production`, `EAS_BUILD=true`), `app.config.ts` requires the key matching `EAS_BUILD_PLATFORM` and stops the build if it is missing. Debug builds and web previews may omit keys and use the mock. Native release builds, including the preview profile, show store-unavailable messaging when keys are missing; they cannot simulate a purchase. Verified store products are still required before a production release.

```sh
cd apps/mobile
npx eas-cli@latest build --profile development --platform all
npx eas-cli@latest build --profile preview --platform all
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --profile production --platform ios
npx eas-cli@latest submit --profile production --platform android
```

The production profile uses [EAS remote build-number management](https://docs.expo.dev/build-reference/app-versions/) and auto-increments developer-facing build numbers. Keep the user-facing `version` in `app.config.ts` under owner control and update it intentionally for store releases. EAS initializes the remote build number on the first build; if the app already has a store build number, seed the remote value with `eas build:version:set` before release. The production submit profile sends Android to Play's internal track. EAS Submit needs access to the real App Store Connect app and Google Play service-account credentials; configure these through the EAS prompts/project before submitting. The first Android submission may need a manual upload to establish the Play app/API access. These commands build or submit only; they do not publish a store release.

See [REVIEW_NOTES.md](REVIEW_NOTES.md), [PLAY_DECLARATIONS.md](PLAY_DECLARATIONS.md), and [MANUAL_CHECKLIST.md](MANUAL_CHECKLIST.md) before preparing store submissions. URLs in `AppConfig` currently use the `tallsoon.app` placeholder and must be live and accurate before review.
