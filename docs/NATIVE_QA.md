# Native verification · 2026-10-17

## Confirmed

- Xcode 26.6 built the iOS Debug development variant successfully. CocoaPods installed 139 dependencies / 141 pods.
- Installed `app.tallsoon.dev` on a dedicated iPhone 17 simulator running iOS 26.5.
- Launched the JavaScript app from a dedicated Metro server on port 8101 without RevenueCat keys (debug mock purchases).
- Visually checked the native welcome screen: app icon, headline, feature list, Get Started button and legal links render.
- Local evidence is kept outside tracked source at `artifacts/native-smoke/`.

## Maestro attempt

Maestro 2.11 and Java 17 ran the six-flow suite. All six initial flows stopped before onboarding: `launchApp` with `clearState: true` clears Expo Dev Client's selected server, so the next screen is **Development Servers**, rather than the app's welcome screen. This is a harness/startup failure; it establishes neither a product-flow failure nor a passing native suite. Selecting the server also exposes Expo's first-run development-menu onboarding.

One bounded follow-up conditionally selected the discovered server and dismissed the first-run onboarding. Maestro then reached the app, but the Expo Dev Menu remained open over the welcome screen (Reload / Go home / Close), so the first app assertion still failed. The unverified helper change was reverted. No native product-flow assertions passed. Metro was stopped and the dedicated simulator was shut down afterward.

The app compiled and launched; the full native onboarding, purchase mock, check-in and deletion suite remains unverified. Use `.maestro/README.md` for startup and rerun instructions. Native release billing requires real sandbox products and keys.

## Still required before release

- Complete the native Maestro suite after development-client startup is handled, or use an installed bundled build with the appropriate entitlement configuration. A keyless native release build intentionally disables simulated purchases, so it cannot exercise the mock-purchase flow.
- Run Android emulator/device smoke checks; this session built iOS only.
- Inspect every screen at the largest system text size, with Reduce Motion and VoiceOver/TalkBack (see `ACCESSIBILITY.md`).
- Test permission prompts, notification scheduling, image/PDF export and real store trial/restore/replacement behavior on native devices.
