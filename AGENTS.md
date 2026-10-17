# TallSoon: brief for the coding agent (Codex)

You are continuing an app that is already well along. Do not restart it or rearchitect it. Ship the
remaining work to the same quality bar.

**TallSoon**: an honest, parent-first child height predictor and growth-habits app for iOS and Android
(one Expo codebase). The prediction is **free**. The paid **Pro** subscription sells a daily growth
plan plus tracking.

## 1. Read first (in this order)
1. `PROGRESS.md`: what is done, plus the ordered **Next up** list. Update it with every commit.
2. `DECISIONS.md`: choices already made. Don't reverse them without asking.
3. `docs/BRIEF.md`: the full product spec. **§13 wins on design, inputs, on-screen copy and paywall
   layout**, then §11, §12, §5, §4.6. `docs/prototype/shots/v2/*.png` (L- light, D- dark) and
   `docs/prototype/index.html` are the visual source of truth.
4. `apps/mobile/AGENTS.md`: Expo-specific rules. Expo SDK 58 is newer than your training data, so check
   the types in `node_modules` before using any Expo or React Native API.

## 2. Repo map
```
apps/mobile/            Expo SDK 58, RN 0.88, expo-router (routes in src/app), TypeScript strict
  src/app/              screens: onboarding/*, result, paywall, success, (tabs)/{today,growth,plan,family},
                        sheets: method, share, log, name, score, legal/[doc], routine/[key], guide/[id], grocery, personalize
  src/ui/               design system (Text, Button, List/Row/Section, MeasureField, MonthYearWheel,
                        SegmentedControl, Banner, Sheet, Icon, Celebrate, Layout). Reuse these; don't add new primitives casually
  src/features/         onboarding draft/flow, result, paywall, growth chart, plan habits, child data hooks
  src/services/         entitlements (RevenueCat + mock), notifications, pdf, files, links, haptics, analytics (no-op)
  src/db/               Drizzle schema, migrations (drizzle/), repos; client.web.ts = web-only async warm-up
  src/state/            Zustand + MMKV settings
  src/i18n/en.ts        ALL user-facing copy. Teen variants use the `_teen` suffix (useT() picks them)
  src/theme/            tokens (§13.2), type scale (HIG / Material 3)
packages/engine/        pure TS prediction engine, no React (47 Jest tests)
packages/reference/     CDC 2000 / WHO 2007 LMS tables + Khamis–Roche coefficients (+ SOURCES.md)
packages/content/       plan content: habits, routines, meals, guides, notifications (58 Jest tests)
scripts/qa/             serve.js (static server with COOP/COEP) + flow.js (Playwright walkthrough)
.github/workflows/ci.yml  typecheck, unit tests, testimonials consent gate, web bundle smoke test
```

## 3. Commands
```bash
pnpm install                                   # pnpm 10, Node 22, node-linker=hoisted
pnpm -r typecheck                              # must be clean
pnpm --filter @tallsoon/engine test
pnpm --filter @tallsoon/content test
cd apps/mobile && npx expo install <pkg>       # always use this instead of pnpm add for RN/Expo packages
cd apps/mobile && CI=1 npx expo export --platform web   # bundle check + web build for QA
node scripts/qa/serve.js apps/mobile/dist 8099 & node scripts/qa/flow.js light   # screenshots L-*.png
cd apps/mobile && npx drizzle-kit generate     # after any schema change
```

## 4. Hard rules (don't break these)
- **The prediction is never behind the paywall.** The paywall never appears before the first result.
- **Paywall (§13.6):** exactly two plans, Annual (preselected, unlimited children) and Weekly (up to 2
  children).
  - The billed amount is always the most prominent price.
  - "Save N%" is computed from the real store prices.
  - The only trial is an opt-in 7-day trial on Annual, off by default.
  - The X is top-right and visible from the first frame.
  - Never add countdowns, "people joined today" counts, decoy plans, fake testimonials or confetti.
  - Prices come from RevenueCat only; the mock service is for dev and web.
- **Medical honesty:** no guaranteed or quantified height gains, no "stretch to grow taller", no AI or
  accuracy-percentage claims, no institution logos.
  - Results are shown the same way for tall and short.
  - Disclaimers stay everywhere §6.3 lists them.
  - Never type medical numbers from memory: Khamis–Roche coefficients and LMS data load from
    `packages/reference` only.
- **Privacy:** no accounts and no network except RevenueCat. Never send child data (heights, ages,
  names) anywhere, including analytics. Notification permission is only asked from a user action
  after the first result.
- **Design:** native HIG on iOS and Material 3 on Android. Use the tokens and type scale in
  `src/theme`; the one tint is #2F7D6D / #5FB8A5, and apricot appears only where §13.1 allows.
  - Confirmations use banners (`showBanner`), never toasts.
  - Tap targets are at least 44 pt on iOS and 48 dp on Android.
  - Everything must respect Reduce Motion and Dynamic Type.
  - No gradients on content and no novelty controls.
- **Copy is the most important part of this product.** All strings go in `src/i18n/en.ts`, never
  inline.
  - Voice: an energetic coach who knows the science (§4.6). Parent copy says "them", teen copy says "you".
  - No AI-slop words (journey, unlock your potential, elevate, seamless, empower, supercharge,
    delve…). Avoid em dashes in copy; use en dashes for number ranges.
- **Engineering:** TypeScript strict with no `any` escape hatches unless commented.
  - The engine stays pure (no React, no Expo).
  - Reuse `src/ui` primitives.
  - Keep `testID`s on interactive elements (Maestro and Playwright use them).
  - Every screen works offline.
- **Git:** small, focused commits with clear messages, authored as the repo owner. **No AI or assistant
  attribution in commits, PRs, code comments or docs.** Work on a branch and keep CI green.

## 5. Gotchas already solved (don't reintroduce)
- **Web uses expo-sqlite's async warm-up** (`src/db/client.web.ts`); its sync open times out while
  WASM loads. Native uses `client.ts`.
- **Skia (react-native-fast-confetti) crashes on web** without CanvasKit, so `src/ui/Celebrate.web.tsx`
  returns null.
- **`BackHandler` is Android-only.** Guard it with `Platform.OS === 'android'`.
- **RN 0.88 ref types:** use `useRef<ComponentRef<typeof View>>()` (same for TextInput).
- **Default units follow the locale** (US → ft/in, lb). QA scripts must tap `cm`/`kg` first, or fill
  `height-field-ft` / `height-field-in`.
- **The `@react-native-segmented-control` class typings predate React 19**, so the component is cast in
  `src/ui/SegmentedControl.tsx`.

## 6. Your task list (in order; tick each one off in PROGRESS.md when done)
1. **Visual QA pass.** Run `scripts/qa/flow.js` (light and dark) through welcome → onboarding → result
   → paywall → purchase (mock) → success → Today/Growth/Plan/Family.
   - Compare each screenshot with the matching `docs/prototype/shots/v2/` image and fix every
     difference in layout, spacing, hierarchy and copy.
   - Pay extra attention to the paywall (`L-13`, `D-13`), result (`L-10`), Today (`L-17`), Growth
     (`L-19`) and Family (`L-21`).
   - Fix any console errors along the way.
2. **Mobile unit tests** (jest-expo + @testing-library/react-native). Cover:
   - the `savePercent` and price/CTA/terms text for annual, weekly and trial;
   - the ChoiceList double-tap lock;
   - MeasureField: switching units keeps full precision (152 cm → ft/in → 152);
   - the parents "Don't know" rule (only one parent may be unknown);
   - the puberty exclusive options.
   Add `test` and `typecheck` to CI for mobile.
3. **Maestro E2E** in `.maestro/`:
   - onboarding on the parent path and the teen path (the teen path includes the under-13 hand-off);
   - the result is visible with no paywall;
   - the paywall X is visible and closes it;
   - logging a measurement;
   - Delete All Data.
   Use the existing testIDs.
4. **`apps/web`** (brief §10): a static Astro site that imports `@tallsoon/engine`.
   - Pages: `/` (hero plus an embedded calculator), `/height-predictor`, `/method`, `/pricing`, `/privacy`,
     `/terms`, `/support`, plus share-card landing `/r?h=171-181&u=cm`.
   - Add schema.org `WebApplication` and `FAQPage` markup.
   - Calculation is client-side only; no data is sent anywhere.
5. **Assets.** Render a 1024 px app icon, the splash image and the Android adaptive layers (foreground,
   background, monochrome) from the leaf mark in `src/features/brand/AppIcon.tsx` (sage-teal gradient
   tile, white leaf, no text). Wire them in `app.config.ts`.
6. **`eas.json`**: development, preview and production profiles (`APP_VARIANT`), with EAS Submit for App
   Store Connect and the Play internal track. Document the env vars `EXPO_PUBLIC_RC_IOS_KEY` and
   `EXPO_PUBLIC_RC_ANDROID_KEY`.
7. **Docs.**
   - `README.md`: setup, run, test and release.
   - `REVIEW_NOTES.md`: App Review notes (methods and citations, no account, how to reach the paywall,
     sandbox tester).
   - `PLAY_DECLARATIONS.md`: draft answers for Target audience 13+ and 18+, Health apps, Data safety,
     Ads (none) and Advertising ID (none).
   - `MANUAL_CHECKLIST.md`, for the owner:
     - store products and prices (`app.pro.weekly`, `app.family.annual`, `app.family.annual.trial`;
       Play `pro_weekly`, and `family_annual` with offer `trial-7d` tagged `optin-trial`);
     - RevenueCat project, entitlements `pro` and `multi_child`, offering `default`;
     - privacy and terms URLs;
     - real consented testimonials;
     - pediatric review of content marked `REVIEW`;
     - a Play closed test with 12 testers for 14 days.
8. **Accessibility pass.**
   - Every screen at the largest text size: nothing truncates numbers, and layouts reflow.
   - VoiceOver/TalkBack labels, roles and states.
   - Reduce Motion: cross-fades, no confetti, static bubbles, instant count-up.
   - Color contrast: AA for `label2` on `bg` and `onTint` on `tint`, in both modes.
9. **Retention extras** (§12):
   - milestone share cards for 7/30/100-day streaks and the first check-in (9:16, nickname only);
   - a "switch to Annual" card for Weekly subscribers after week 2;
   - Day-3 and Day-7 touchpoints.
10. **Demo data mode** (debug builds only): seed a child with 6 measurements and habits, for store
    screenshots at 6.9″, 6.5″ and Android phone sizes.

## 7. Definition of done (for each task)
- Typecheck is clean, all tests pass, and CI is green.
- The web export bundles, and the QA flow runs with no console errors.
- Any UI change is compared against the prototype in light and dark mode.
- No new copy outside `en.ts`, and the copy follows the voice rules.
- `PROGRESS.md` is updated. Any judgment call is added to `DECISIONS.md`.

## 8. Open items for the product owner (don't decide these yourself; list them in your summary)
- Population averages outside the US for an unknown parent (currently US NHANES).
- Domain and support email (`tallsoon.app` and `support@tallsoon.app` are placeholders in `AppConfig`).
- A pediatric professional's review of all content marked `REVIEW`, including the velocity bands.
