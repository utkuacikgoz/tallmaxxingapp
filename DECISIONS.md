# Decisions

- **TestFlight builds run on GitHub macOS with Xcode and Fastlane** (owner approved). Expo prebuild
  generates the native project locally on the runner. Signing uses a temporary keychain and an
  existing Apple Distribution certificate/profile; uploads use a separate TallSoon App Store Connect
  API key. EAS is optional and is not required by the TestFlight workflow.

- **Browser preview tabs:** Expo SDK 58's browser native-tabs implementation overlays screen headers
  with a floating top menu. A web-only Expo Router bottom-tab layout preserves usable preview/QA.
  Native iOS/Android continue to use the agreed system native tabs.

- **Missing native release store keys fail closed.** Debug builds and web may simulate purchases.
  A native release without a RevenueCat key keeps the free prediction and read-only paid history,
  but cannot show example purchase prices or grant Pro. Production EAS also rejects the build early.

- **Accessible text shades:** keep the brand tint on filled controls/graphics, using its existing
  darker shade for small light-mode text. Darken secondary, error, warning and apricot text shades
  where the approximate system palette missed AA; the brief's contrast requirement takes precedence.
  Large text uses the approved typed birth-date fallback instead of clipping wheel month names.

Choices made where the brief left room, or where the brief was deliberately departed from. Newest first.

- **Unknown-parent range widening is derived, not assumed** (owner asked for a published figure, replacing the prototype's 3.5 cm). The substituted parent's error has SD = the parent's weight in the formula × the SD of adult height for that sex. That SD comes from the bundled CDC 2000 stature-for-age LMS at 20 years (Kuczmarski et al. 2002): 7.14 cm for men, 6.47 cm for women, computed at runtime. It combines in quadrature with the method's own error: `halfWidth = z·√((base/z)² + (w·SD)²)`.
  - Mid-parental (z = 2 for Tanner's ±8.5 cm; w = ½): ±11.1 cm with the father unknown, ±10.7 cm with the mother unknown (was ±12.0).
  - Khamis–Roche (z = 1.645 for the 90% bounds; w = ½ × that row's midparent coefficient): about +1 cm or less.
  - The substituted mean is still NHANES 2015–2018 (161.3 / 175.3 cm, the brief's choice).
  - Still for product review: whether to use local population averages outside the US.
- **App name: TallSoon.** Set in `AppConfig.appName` and in `app.config.ts`.
- **Growth chart is drawn in SVG (react-native-svg + d3-shape), not victory-native/Skia.** The app and the pediatrician PDF draw from one data builder (`buildGrowthChart` in the engine), so they can never disagree. It also renders on web for QA. Tapping a point shows its percentile and z-score. Confetti still uses Skia (react-native-fast-confetti).
- **Native tabs** (`expo-router/native-tabs`): the system tab bar on each OS (SF Symbols on iOS, Material Symbols on Android).
- **Icons** come from `expo-symbols`. It provides SF Symbols on iOS and Material Symbols on Android and web, so there are no custom icon assets.
- **Khamis–Roche age handling:** the nearest half-year row, valid from 4.0 to 17.5 inclusive. Output and range are floored at today's height.
- **Lead method after 17.5 years:** percentile projection, which stays close to today's height. Mid-parental height is still shown. A genetic target below a grown teen's current height would be misleading as a headline.
- **Puberty step age gate:** girls 8–15 and boys 9–16, inclusive of the lower bound and exclusive of the upper (age < 16 and age < 17).
- **Velocity bands** (marked REVIEW): the typical value is the slope of the reference median over the same interval. "Fast" means ≥ max(1.5 × typical, typical + 2) between ages 8 and 17. "Slow" means < 0.5 × typical, when typical is ≥ 2 cm/yr.
- **Bedtime options are age-banded:** 19:30–21:00 under 9, 20:30–22:00 for ages 9–12, and the brief's 21:00–22:30 for teens.
- **Notifications:** at most 2 a day. The morning plan runs Monday–Saturday; Sunday's slot goes to the weekly score.
- **Paywall:** prices always come from the store. The mock service (no RevenueCat key, web, tests) shows "Example prices · placeholder".
- **Result exit for free users:** a plain "Maybe Later" button under the CTA, shown only on first reveal, leads to the tabs. The result stays reachable from Growth.
- **Web DB:** expo-sqlite's first synchronous open times out in browsers while WebAssembly loads, so `client.web.ts` warms up with an async open first. Native is unchanged.
- **Typed routes are off** to keep CI independent of `expo start`'s type generation.
