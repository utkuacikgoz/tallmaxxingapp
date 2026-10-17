# TallSoon: build progress and resume point

The source of truth for what is done and what comes next. Update it with every commit.
The product spec is `docs/BRIEF.md`; the approved prototype screenshots are in `docs/prototype/`.

## How to resume (for a new session)

1. Read `AGENTS.md` (agent brief), this file, then `DECISIONS.md`.
2. `pnpm install` at the repo root (pnpm 10, Node 24 LTS; Node 22.22 minimum).
3. Quick checks: `pnpm -r typecheck`, `pnpm --filter @tallsoon/engine test`, `pnpm --filter @tallsoon/content test`.
4. Visual QA on web: `cd apps/mobile && CI=1 EXPO_OFFLINE=1 npx expo export --platform web`, serve `dist/`
   with COOP/COEP headers, then drive it with Playwright (see "QA harness" below).
5. Pick the first unchecked item under **Next up**.

## Status

### Done
- [x] pnpm monorepo: `apps/mobile` (Expo SDK 58, RN 0.88, expo-router), `packages/engine`, `packages/reference`, `packages/content`
- [x] Reference data: CDC 2000 stature-for-age LMS and WHO 2007 height-for-age LMS (each cross-checked against a second copy); Khamis–Roche coefficients from the handoff (`packages/reference/SOURCES.md`)
- [x] Engine: units, age, LMS/percentiles, Khamis–Roche (rows with ≥ 2 sources only), mid-parental height, percentile projection, unknown-parent mode, velocity, prediction history, streaks with weekly rest day, Growth Habits Score, growth-chart data builder. **45 Jest tests**
- [x] Content: habits, routines, meals, grocery list, tips, Week 1 plan, focus targets, puberty and measuring guides, notification lines, seasonal packs. **58 Jest tests**
- [x] Design system: tokens (§13.2), HIG/M3 type scale, Text, Icon (SF Symbols / Material Symbols), Button, inset List/Row, SegmentedControl, MeasureField (cm, ft/in, kg, lb), MonthYearWheel, Banner, Sheet header, ProgressLine, Celebrate (confetti)
- [x] Data: Drizzle schema + migration, repositories, MMKV settings store, export/delete
- [x] Onboarding: welcome + role, sex, birth (wheel + typed), height, weight (Skip), parents (Don't know rules), puberty (age-gated), sleep, goal, research, 3 s loader; edit-in-place from the result
- [x] Result: hero count-up, range bar, percentile, puberty line, methods, inputs, teen Show a Parent, locked Pro rows, free Today preview, Improve accuracy, caveat, CTA, confetti, soft A/B variant
- [x] Sheets: How We Calculated This, Share (9:16 card, Save Image, Send to a Parent), Name, Legal (disclaimer, methods & sources), Log Measurement, Score, Routine
- [x] Paywall (§13.6): bubble background with consent gate, top-right X, Annual/Weekly cards, runtime Save %, opt-in trial, plan-specific renewal text, Restore/Terms/Privacy, teen Ask a Parent
- [x] EntitlementService: RevenueCat (two annual products on iOS, tagged offer on Play) + mock for web/dev/tests
- [x] Success / plan setup: bedtime, in-context notification ask
- [x] Tabs: Today (streak, habits, repair before noon, score, tip, season pack, free preview, lapsed read-only), Growth (SVG chart with CDC/WHO percentiles, projection band, table view, velocity alerts, history sparkline, measurements, PDF), Plan (focus, Week 1, groceries, guides, routines, personalize), Family/Profile (children, add child with plan limits, subscription, reminders, settings, export JSON, delete all)
- [x] Services: local notifications (bedtime, morning Mon–Sat, Sunday score, check-in, trial reminder, free re-measure), PDF report (expo-print + vector SVG chart), analytics seam (no-op), store review rule
- [x] CI: typecheck, unit tests, testimonials consent gate, web bundle smoke test (`.github/workflows/ci.yml`)
- [x] Web preview works (DB warm-up in `src/db/client.web.ts`); welcome screen matches the prototype

### Next up (in order)
- [x] Fixed: result screen was blank on web. Skia confetti crashed because CanvasKit isn't loaded in browsers. `src/ui/Celebrate.web.tsx` skips confetti on web only; the loader's BackHandler is now Android-only. Verified: the result renders with the hero, methods and CTA
- [x] Finish the scripted QA flow (note: the default units follow locale; the script must tap `cm`/`kg` before filling `height-field`/`weight-field`, or fill `height-field-ft`/`-in`) through paywall → success → tabs; compare each screenshot with `docs/prototype/shots/v2/` (light and dark) and fix the differences
- [x] Mobile Jest tests (jest-expo): ChoiceList auto-advance lock, MeasureField unit switch precision, paywall price and CTA logic, savePercent
- [x] Maestro flows authored in `.maestro/` (parent, teen 13+, under-13 hand-off, free result, paywall close, check-in, delete data); native execution pending
- [x] `apps/web`: static site (Astro or Vite) with the calculator importing `@tallsoon/engine`, plus /method, /pricing, /privacy, /terms, /support
- [x] App icon and splash PNGs generated from `AppIcon` (1024 px), Android adaptive icon layers
- [x] `eas.json` (development / preview / production), EAS Submit config
- [x] Docs: README (build/run/test), REVIEW_NOTES.md (App Review), PLAY_DECLARATIONS.md, manual checklist (store products, RevenueCat keys, privacy URL, consented testimonials, pediatric content review)
- [ ] Accessibility pass: large font sizes on every screen, VoiceOver labels, Reduce Motion
- [ ] Milestone share cards (7/30/100-day streaks, first check-in), weekly-to-annual upgrade card after week 2
- [ ] Debug-only demo data mode for store screenshots

## Completed waves

### Wave 1 · browser QA and layout fixes
- Light and dark walkthroughs pass with no browser console errors. Prototype comparison and native
  verification limits: `docs/QA_REPORT.md`.
- Fixed compact parent field overflow and the browser tab bar covering headers; native tabs stay.
- Added reproducible Playwright/Expo lint tooling and retained light/dark screenshots in CI artifacts.
- Validation: workspace typecheck, engine (47) and content (58) tests, mobile web export and both QA flows.
  Native simulator/device review remains required.

### Wave 2 · mobile regression coverage and native flow definitions
- Added 13 mobile Jest tests for real paywall price/CTA/terms rendering, trial eligibility and
  conversion pricing, ChoiceList input/focus/motion behavior, metric precision and reset handling,
  unknown-parent exclusivity and puberty options. Mobile tests now run in CI.
- Fixed tap races and canceled delayed navigation on blur; kept the lock through navigation.
  Fixed stale externally reset measurement fields and disclosed the selected trial package's price.
  Savings are hidden when the two store products use different currencies.
- Added parameterized, calendar-relative Maestro flows. YAML and helper JavaScript parse; selectors
  were checked against source. Native Maestro execution is still pending (Maestro CLI not installed yet).
- Validation: mobile Jest (13), mobile typecheck and lint (existing warnings).

### Wave 3 · static companion website
- Added all requested routes, a client-only calculator using the shared engine/reference packages,
  method explanations and sources, explicit subscription disclosures, FAQ/WebApplication schema,
  and safe shared-range landing pages. New copy stays in the mobile English catalog.
- Added browser smoke checks for routes, method availability, invalid inputs, unknown parents,
  unit round-trips, share links, light/dark mobile layouts and absence of external data requests.
- Validation: Astro build/check, mobile typecheck and website Playwright smoke checks. No hosting
  deployment or live store links; support/legal details remain owner release tasks.
- Node 24 LTS is used in CI (Astro requires Node 22.22+ / supported Node 24).

### Wave 4 · assets and release foundations
- Rendered all six brand assets from the existing vector leaf, including a full-bleed 1024 px icon,
  splash and Android adaptive background/foreground/monochrome layers. Existing config paths apply.
- Added EAS development/preview/production profiles, remote build numbering, Submit internal-track
  setup, the SDK-compatible development client and environment examples. SDK 58 compile SDK is 37.
- Added setup/release docs, App Review notes, Play declaration drafts and the owner checklist.
- Missing RevenueCat keys block production EAS builds; native release runtime also refuses simulated
  purchases. The free prediction remains usable and existing paid history remains read-only.
- Validation: release config/profile/asset checks, 2 new entitlement safety tests, mobile typecheck;
  native simulator builds and real store setup are tracked separately, not implied by these checks.

## QA harness
Screenshots and console logs go to ignored `artifacts/qa/` (override with `QA_OUTPUT`). Install Chromium with `pnpm exec playwright install chromium`.

Scripts: `scripts/qa/serve.js` (static server with COOP/COEP) and `scripts/qa/flow.js` (Playwright walkthrough; set `PLAYWRIGHT_PATH=/opt/node-tools/node_modules/playwright` in the cloud sandbox). Run: `node scripts/qa/serve.js apps/mobile/dist 8099 &` then `node scripts/qa/flow.js light`.

## Open questions for the product owner (ask at the end)
- Domain `tallsoon.app` and support email stay placeholders in `AppConfig` for now (owner's call).

## Resolved
- `main` created from the build branch (owner's call).
- Unknown-parent widening: replaced the prototype's fixed 3.5 cm with a figure derived from published data (see DECISIONS.md).
- SVG growth chart instead of victory-native: approved.
