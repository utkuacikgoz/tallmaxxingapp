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
- [x] Engine: units, age, LMS/percentiles, Khamis–Roche (rows with ≥ 2 sources only), mid-parental height, percentile projection, unknown-parent mode, velocity, prediction history, streaks with weekly rest day, Growth Habits Score, growth-chart data builder. **49 Jest tests**
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
- [ ] Accessibility pass (shared fixes complete; full native assistive-technology audit pending): large font sizes on every screen, VoiceOver labels, Reduce Motion
- [x] Milestone share cards (7/30/100-day streaks, first check-in), weekly-to-annual upgrade card after week 2
- [x] Debug-only demo data mode for store screenshots

## Completed waves

### Estimate explanation redesign · 2026-10-19
- Replaced the formula-first sheet with Behind the Estimate: current estimate and range first, then readable method cards. Actual equations and sources remain accessible behind collapsed disclosures, with selection feedback and accessible expanded states.
- Retained unknown-parent and floor explanations, method availability, population limitations, and the distinction between projection bands and statistical ranges. Metric/imperial ranges use the shared formatters.
- Native light/dark captures show readable ranges and no header overlap. Typecheck and all 36 mobile tests pass. The replacement fifth marketing screenshot uses this real collapsed screen and is explicitly approved with the first four; upload verification is in progress.
- The web database correction merged as PR #14 after both exact-commit CI runs passed; main CI also passed.

### CI database worker correction · 2026-10-19
- Investigated the failed PR walkthrough: Expo's synchronous web SQLite worker timed out while saving onboarding. The same commit's branch run passed, exposing a scheduling-dependent failure rather than a website build error.
- Replaced the web-only synchronous Drizzle connection with a local async SQLite adapter and async bundled migrations. Native SQLite and its migrations remain unchanged. Initialization/migration failures use the existing error screen, and onboarding observes save rejection immediately.
- Extended the browser walkthrough to verify measurement writes, live query updates, reload persistence, replacement transactions, exported data, and persisted habit checks. Enhanced light/dark walkthroughs pass with no console errors; 35 mobile tests pass, workspace typechecks pass, and lint has no errors. GitHub CI verification is pending for this correction.

### Wave 13 · shorter landing copy and simpler controls
- Removed decorative arrows from website navigation, links, method rows, and CTAs. Replaced capsule CTAs with modest rectangular corners and the launch pill with plain platform text.
- Rewrote marketing copy around the free estimate and real app screens. Rendered homepage body fell from 417 to 205 words (50.8%); main content from 357 to 151 (57.7%). Counts exclude standalone symbols; with FAQs expanded, body copy fell from 494 to 235 words. Legal disclosures and calculator behavior remain intact.
- Refreshed the social image to match the new headline. Astro check/build, nine-route browser smoke, and 320–1440 px layout checks pass.
- App Store description now includes the live Terms of Use and Privacy Policy links; the saved field was reloaded and verified. No review submission was requested.
- The owner activated Hostinger’s free email plan and created `support@tallsoon.pro`. The mailbox is active; Hostinger and public DNS verify MX, SPF, DKIM, and DMARC. Website DNS remains pointed to Vercel. Sending and receiving a test message remains a manual check.

### Wave 12 · public website and production links
- Rebuilt the Astro landing page around the free estimate, real light-mode app captures, published methods, and an explicit coming-soon app CTA. Retained the working browser calculator.
- Added mobile-app and website Privacy Policy, Terms of Use, Health Disclaimer, and Support for Bosphorus Elevate LLC; owner selected `support@tallsoon.pro`. The policy distinguishes local child records/backups/exports from RevenueCat purchase processing and Vercel hosting logs.
- Updated app links to `https://tallsoon.pro`, configured Vercel static deployment and canonical/www handling, and added social preview, sitemap, and crawler rules. Hostinger apex DNS now points to Vercel; domain registration and nameservers remain at Hostinger.
- Refreshed stale release docs: TestFlight 1.0.0 (2) is processed and owner-installed; iOS RevenueCat catalog is configured. Sandbox billing, privacy publication, approved store screenshots, Android setup, and clinical/accessibility review remain pending.
- Validation: Astro check/build and nine-route browser smoke pass; calculator regressions, legal/support links, all responsive images, and 320–1440 px overflow checks pass. Mobile lint has zero errors and 33 existing warnings; release guards pass. Email delivery is not yet verified (no MX records at audit time).
- Separate App Store creative revisions remain approval drafts and are not uploaded as part of the website release.
- Verified production: `https://tallsoon.pro` and all legal/support routes return HTTPS 200 with the expected content; `www` redirects to the canonical apex. Added explicit CLI deployment exclusions so local native build products, drafts, dependencies, and credentials cannot enter a Vercel upload.
- App Store Connect URLs and `2026 Bosphorus Elevate LLC` copyright are saved and reopened for verification; version 1.0.0 has build 2 selected. The privacy disclosure was observed already published, with Purchase History for App Functionality and Analytics, not linked and not tracked. No disclosure publication or review submission was performed during this website work. Vercel confirms `main` as its production branch.

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

### Wave 4 follow-up · exact store offer selection
- Trial disclosure now requires confirmed iOS eligibility or an available tagged Play offer, with
  exactly one free seven-day phase followed by annual renewal. Purchases recheck the offer instead
  of relying on the paywall's earlier snapshot. Ineligible/unknown trials cannot fall back to a charge.
- Android opt-out purchases select the explicit base plan. Store billing periods, prepaid flags and
  introductory phases must match the annual/weekly disclosure. Weekly-to-Annual replacements include
  the existing Play plan ID and explicit replacement mode; missing IDs stop the purchase.
- Added 8 mocked SDK regression cases. Actual sandbox purchases still require owner-provisioned
  store products and SDK keys; mocked tests do not establish real billing integration.

### Wave 5 · accessibility fixes
- Raised segmented controls, onboarding navigation and wheel items to the platform minimum target.
  Large-text birth entry uses the approved typed fallback. Sheet titles/row values wrap; Today streak
  text and week dots reflow; progress and close labels come from the catalog; controls expose states.
- Reduce Motion skips the success entrance. Secondary labels, small interactive text, errors,
  warnings and apricot glyphs use accessible contrast. Brand-filled buttons retain the agreed tint.
- Contrast results and limits: `docs/ACCESSIBILITY.md`. Browser light/dark walkthroughs pass;
  VoiceOver/TalkBack and every screen at largest native text size remain a separate verification gate.

### Wave 5 · retention and private milestone sharing
- Added Day 3 grocery and Day 7 plan-review touchpoints, 7/30/100-day streak and first check-in
  share cards in Story and Square sizes. Milestone images omit dates of birth and measurements.
- Weekly users can compare Annual after 14 locally observed subscription days; the store paywall
  still supplies the actual price. Trial reminders use the selected trial package renewal price.
- Added calendar-boundary and entitlement-gating tests and browser coverage of both card sizes.

### Wave 5 · screenshot demo
- Debug/mock builds can load and remove a separate synthetic child with measurement history and
  completed habits. Reserved IDs and transactions protect existing children; real billing is untouched.
- Documented native capture steps and current store screenshot-size verification in `docs/SCREENSHOTS.md`.
  Store screenshots and submissions are not implied by the seed-data feature.

### Wave 5 · same-day measurement ordering
- Measurement reads and inserts expose SQLite insertion sequence without changing the schema.
  A new check-in on the same date now becomes the current prediction and chart projection point;
  both measurements remain in history and edits retain their insertion order.
- Added reversed-input regressions for chart and prediction history. Engine tests: 49; mobile: 25.

### Wave 5 follow-up · milestone sharing without measurements
- Review caught that an earned habit milestone could open an empty sheet after all measurements
  were removed. Milestone sharing now needs only the child, and missing-data sheets retain Close.
- Added a real-screen regression: all 26 mobile tests and mobile typecheck pass.

### Wave 6 · native build and bounded smoke verification
- Built and installed the iOS Debug app on a dedicated iPhone 17 / iOS 26.5 simulator, then
  visually verified the native welcome screen through a dedicated Metro server.
- Ran Maestro: all six initial flows stopped at the development-client reset/server-selection
  screen before onboarding. A bounded follow-up reached the app but stopped at the Dev Menu overlay;
  unverified startup edits were reverted. Full native flow and assistive-technology verification remain open.
- Evidence, environment and release limits are recorded in `docs/NATIVE_QA.md`.
- Corrected the native README checklist reference to the existing repository-root file.

### TestFlight / RevenueCat account setup · 2026-10-18
- Created and verified Expo project `@utkuacikgoz/tallsoon` with ID
  `830cb434-572b-47bf-a88f-6e909f4141ff`. Dynamic app config now links that verified project by
  default; environment variables remain available as explicit overrides.
- Created RevenueCat project `TallSoon` (`40ce0c3d`). Catalog and Apple app integration are still
  being configured; project creation alone does not establish working store billing.
- Apple signing, subscription products, RevenueCat iOS credentials/key and TestFlight upload are
  not complete. See `docs/TESTFLIGHT_SETUP.md` for identifiers and the remaining sequence.

### Automated TestFlight setup · 2026-10-18
- Corrected production iOS identity to the user-configured `com.belevate.tallsoon`, verified in
  RevenueCat app `app5829101f0b`; both Apple credential checks there are valid. Android and debug/
  preview identifiers remain unchanged. Apple team is `9D78WTZAD8`.
- Owner chose GitHub macOS/Xcode/Fastlane instead of EAS Build. Workflow runs after successful
  main-push CI or manual dispatch on main; missing prerequisites skip the paid macOS build.
- Clean Expo prebuild generates the native project. Locked CocoaPods/Fastlane dependencies,
  temporary signing keychain, explicit production profile mapping, Apple-derived build numbers,
  exact IPA upload and bounded Apple processing wait are configured. No public release or invites.
- Seven GitHub secrets and numeric `ASC_APP_ID` are required; no Expo token or EAS environment
  is needed for this pipeline. Credentials were absent when checked; actual signed archive/upload
  and device verification remain pending. See `docs/TESTFLIGHT_SETUP.md` for exact setup steps.
- Added Apple JWT/app-identity and signing-profile regression checks; rejected sandbox SDK keys,
  wrong-team/bundle, expired, development, ad hoc and enterprise profiles. An explicit final
  check requires Apple state `VALID` for the exact app/version/build/platform; Fastlane alone
  treats failed processing as finished. Clean production prebuild, Fastlane lane loading, mobile
  typecheck and lint passed (34 existing lint warnings, no errors). Profile installation uses
  Fastlane's Xcode-aware path rather than the obsolete MobileDevice profile location.

### First signed TestFlight run · 2026-10-18
- All seven required GitHub secrets are configured. Verified App Store Connect app `6824177611`
  belongs to `com.belevate.tallsoon` and set `ASC_APP_ID`; configured the TallSoon public iOS SDK key.
- Run `39117605979` passed Apple authentication, certificate import, profile installation and native
  dependency installation. Archive failed because the notifications plugin added a push entitlement
  absent from the App Store profile. No binary was uploaded.
- Disabled remote notification capability in the Expo plugin: TallSoon uses on-device scheduled
  reminders only. Local notification APIs and reminder behavior remain unchanged. Verified a clean
  production prebuild emits no APNs entitlement; mobile typecheck and lint pass (existing warnings).

### TestFlight build 1 processed · 2026-10-18
- After the notification entitlement fix, workflow `39118784001` successfully signed and uploaded
  version 1.0.0 (1). Apple confirmed processing state `VALID`. The owner tested this build on device.
- The GitHub macOS/Xcode/Fastlane pipeline and all seven configured secrets are verified end to end.

### Device feedback polish · 2026-10-18
- Shared onboarding scrolling reserves the measured sticky footer height when a keyboard is open;
  sheet bodies disable automatic native inset adjustment and keep their headers in normal layout.
- Puberty signs are alphabetical; exclusive None/Not sure choices remain separate. Shortened helper
  copy across onboarding and core screens while retaining method, privacy and billing disclosures.
- Added shared button feedback and safe platform-specific haptics. Family child actions are visible,
  chart data has table semantics, and Restore Purchases announces its action correctly.
- Existing iOS/Android review requests now count only new measurements and wait for save confirmation
  to finish. Edits/replacements do not trigger requests; background requests are deferred. Store
  quotas can suppress prompts, and TestFlight does not display the iOS review prompt.
- Validation: workspace TypeScript, 49 engine + 58 content + 32 mobile tests, release guards, web
  export and final light/dark walkthroughs pass. Lint has zero errors and 33 existing warnings.
  Native iOS 26.5 simulator checks confirm weight/father input visibility with the keyboard, A–Z
  options and method sheet headers at half/full height and after scrolling in light/dark mode.
  Maestro keyboard-dismiss/focus limitations required manual native input verification; the full
  Maestro onboarding flow is not claimed as passing. Physical haptic feel and full assistive-
  technology coverage remain device checks. Release CI must pass before merge.

### Subscription catalog setup · 2026-10-18
- TallSoon-specific RevenueCat Apple credentials are valid; three products and the default offering
  map weekly to pro, and both annuals to pro + multi_child. Apple English product metadata is saved.
- App pricing is Free; app/subscriptions have worldwide (175-region) availability configured for
  release. U.S. prices are $4.99 weekly and $39.99 annual. The separate opt-in trial annual has a
  one-week free offer starting October 19, 2026 with no end date. Nothing was submitted or published.
- Review screenshots and sandbox transactions remain outstanding. See `docs/TESTFLIGHT_SETUP.md`
  for verified records and the distinction between catalog setup and working store purchases.

### App Store privacy alignment · 2026-10-18
- Added Analytics to the Purchase History privacy-manifest purposes alongside App Functionality,
  matching RevenueCat's current Apple App Privacy guidance. Data remains not linked and not tracked.
  The app configures anonymous RevenueCat IDs without custom attributes or an analytics sink; child
  profiles and measurements remain on-device. Store privacy fields are being completed separately.
- Owner explicitly retained website/privacy/support placeholders until hosting is purchased. They
  remain pre-submission work; no public App Store release or review submission is authorized here.
- Polish PR #10 merged after both CI runs passed. Its automatic archive was canceled before upload
  so the next build can include this privacy declaration correction.

### Native large-title contrast · 2026-10-18
- Native screenshot capture exposed invisible large tab titles after switching to dark appearance.
  Use SDK 58’s native system header appearance rather than forced transparency/blur and an opaque
  large-title background, which the installed implementation flags as hiding titles on iOS 26.
  Explicitly apply the theme label color to the separate large-title style. Native iOS 26.5
  screenshots verify visible Today titles in light and dark after the fix; typecheck/lint pass.
- App Store 1.0.0 listing text, app name/subtitle/category, placeholder URLs and review notes have
  been saved and revisited in App Store Connect. App Privacy draft is saved; Apple's binding Publish
  attestation awaits owner confirmation. Copyright/reviewer contact and approved screenshots remain.

## QA harness
Screenshots and console logs go to ignored `artifacts/qa/` (override with `QA_OUTPUT`). Install Chromium with `pnpm exec playwright install chromium`.

Scripts: `scripts/qa/serve.js` (static server with COOP/COEP) and `scripts/qa/flow.js` (Playwright walkthrough; set `PLAYWRIGHT_PATH=/opt/node-tools/node_modules/playwright` in the cloud sandbox). Run: `node scripts/qa/serve.js apps/mobile/dist 8099 &` then `node scripts/qa/flow.js light`.

## Open questions for the product owner (ask at the end)
- Domain `tallsoon.app` and support email stay placeholders in `AppConfig` for now (owner's call).

## Resolved
- `main` created from the build branch (owner's call).
- Unknown-parent widening: replaced the prototype's fixed 3.5 cm with a figure derived from published data (see DECISIONS.md).
- SVG growth chart instead of victory-native: approved.
