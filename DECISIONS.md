# Decisions

Choices made where the brief left room, or where the brief was deliberately departed from. Newest first.

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
