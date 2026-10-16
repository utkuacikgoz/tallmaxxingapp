# APP_NAME: Build Brief
*An honest, parent-first height predictor and growth tracker for iOS and Android (one Expo / React Native codebase, §5)*

> Paste this whole file into Claude Code or Codex. The kickoff prompt is in §8. Hand the agent the bundle `handoff.zip` (this brief, `khamis_roche.json`, `prototype/index.html`, `prototype/shots/v2/`); the prototype and screenshots are the visual source of truth (§13).
> **Precedence:** **§13 (design system & approved prototype v2) is the newest decision (Oct 16, 2026) and wins on visual design, input patterns, on-screen copy and paywall layout; `prototype/index.html` and `prototype/shots/v2/` are the visual source of truth.** Next come §11 (GoTall teardown), §12 (subscription value and retention), the cross-platform tech plan (§5) and the rewritten tone guide (§4.6). Where they conflict with anything older, they win.
> `APP_NAME` is a placeholder. Keep it in one constant (`AppConfig.appName`) and in one string catalog key so renaming takes one edit.

---

## 1. Product summary and target user

**One-liner:** You get your child's predicted adult height for free in under a minute. The app shows the method, the formula, and an honest range. You only pay (a subscription) if you want ongoing tracking, check-ins and updated predictions as they grow.

**Target user:** Parents and guardians of children aged **5–17**. The parent is the user. The child is not. Secondary users: a co-parent, or a grandparent who keeps a record.

**Why now / the gap.** The incumbents are GoTall (~$31k/mo verified revenue), Taller AI (~23k ratings), and Taller (~17k ratings). Recent reviews are mostly 1–2 stars, and they keep naming the same problems:

| Competitor pain | Our answer |
|---|---|
| Long quiz, then a paywall before the result | Result is **free and instant** after 6 quick inputs (about 40 s, vs GoTall's 36 screens and 1:34). The predicted height and range are never behind the paywall. |
| Bait trial ($0.67/wk turns into $35); trial auto-converts to a full year | **Two plans, both priced up front: Annual $39.99/yr (default, highlighted, unlimited children) or Weekly $4.99/wk (up to 2 children).** The billed amount is always the biggest price. Weekly has no trial, so nothing converts by surprise; the only trial is an opt-in 7-day trial on Annual, disclosed in the CTA, with a reminder notification 2 days before it converts (see §9.3). |
| Hard to cancel | One tap goes to "Manage Subscription" (the Apple sheet / Play subscriptions page) from the Family/Profile tab; the paywall shows Restore Purchases, Terms and Privacy (§13.6). |
| Inaccurate predictions | We use published methods (mid-parental height, Khamis–Roche), show a **range** and the method, and say plainly what each method can't do. |
| Too many personal questions | We ask only what the formula needs. Name is optional (a nickname or emoji works). |
| Toxic "manosphere" tone, fake "+5 cm" promises | Energetic, aspirational, teen-friendly tone (§4.6) with no body shaming. "Grow taller / reach your full height" is allowed as aspiration; **we never guarantee cm or inch gains.** |
| Minors as users | Built for and marketed to parents. Not in the App Store Kids Category, not in Google Play's Families program (§6.2b). No teen-targeted "height-maxxing" content. |

**Positioning:** "How tall will you grow? Find out free, with real science. Then get a plan to reach your full height." Short form: "Free prediction. Real science. No tricks."

**Non-goals:** guaranteed height gains or "add X cm" programs, supplements, stretching sold as a way to "add height", public social features, ads, selling data, AI-generated "predictions" with no published basis. (The paid program in §12 does include age-appropriate activity, posture and stretching, framed as general health and fitness that supports normal growth, never as a height intervention.)

---

## 2. Features: MVP vs v2

### MVP (v1.0)

**Free**
| # | Feature | Acceptance criteria |
|---|---|---|
| F1 | **Instant prediction** | Inputs: child's sex at birth, birth month and year, current height, current weight (optional; needed for Khamis–Roche, skip → mid-parental only), mother's height, father's height (at most one may be "Don't know": population average substituted and range widened, §13.4). Input patterns and validation: §13.4. Result appears in ≤ 60 s from first launch with no account, no email, and no paywall. Works fully offline. |
| F2 | **Method transparency** | The result shows the point estimate, a range (e.g. "170–181 cm"), the method name, a "How we calculated this" sheet with the formula and inputs, and a citation. When several methods apply, all are shown side by side. |
| F3 | **Honest caveats** | Every result screen has a short caveat line ("A prediction, not a guarantee…") plus a link to the full disclaimer. The method falls back automatically when inputs are out of range (e.g. Khamis–Roche only runs for ages 4–17.5), and the fallback is labelled. |
| F4 | **Units** | cm/kg and ft-in/lb. Defaults to device locale. Switchable per input and globally. Values are stored internally in metric. |
| F5 | **One child profile, saved locally** | The first prediction saves a child profile on the device (SQLite, §5.3). The user can edit or delete it. |
| F6 | **Delete all data** | Settings → "Delete all data" → confirm → wipes the local SQLite database, MMKV settings, scheduled notifications and any generated PDFs. |

**Paid (Pro)**
| # | Feature | Acceptance criteria |
|---|---|---|
| P1 | **Growth tracking** | Log unlimited measurements (date, height, optional weight, optional note). List is sorted by date and editable. Predictions recompute from the latest measurement. Validation rejects impossible values (see §5.4). |
| P2 | **Growth-chart percentiles** | A Skia chart (victory-native) shows CDC 2000 stature-for-age (default for US locale) or WHO 2007 height-for-age 5–19 y (default elsewhere), with P3/P10/P25/P50/P75/P90/P97 curves and the child's points overlaid. Tapping a point shows its percentile and z-score. Calculated values match CDC/WHO reference tables to ±0.1 percentile in unit tests. |
| P3 | **Pediatrician-ready PDF** | One-page (two max) on-device PDF export (expo-print, HTML → PDF) with child nickname, DOB, the measurement table, the percentile chart, mid-parental target range, the prediction with its method, and the disclaimer footer. Opens the Share sheet. Generated on device. US Letter or A4 by locale. |
| P4 | **Puberty-stage guide** | Static, reviewed educational content: typical timing ranges, growth spurt, when to talk to a pediatrician. **No clinical (Tanner) self-staging and no photos.** The only body-related input is the optional, age-gated "Which have you noticed?" checklist from onboarding (§11.3), used for context notes and spurt timing, never for a diagnosis. Content is plain text with sources listed. |
| P5 | **Personalized daily growth plan** (§12.2) | Age- and sex-banded daily plan built from the onboarding answers: activity (incl. age-appropriate stretches and posture), sleep routine, and meals rich in protein, calcium and vitamin D. Every item links to public guidance (WHO, AASM/AAP, NIH ODS). Copy may be aspirational ("maximize your growth", "reach your full height", §4.6) but never guarantees cm/inch gains. |
| P6 | **Multiple children** | Annual (Family) plan: unlimited child profiles plus a profile switcher. Weekly plan: up to 2 children. |
| P7 | **Monthly check-in + reminders** | Local notification every 1 or 3 months (parent's choice) to measure; check-in screen logs a measurement in ≤ 3 taps and shows the updated prediction and its change vs last time. |
| P8 | **Updated predictions over time** | Each new measurement recomputes all methods and shows a "prediction history" sparkline, so the parent sees the estimate narrow/shift. |
| P9 | **Growth-spurt / velocity alerts** | After ≥ 2 measurements ≥ 3 months apart, compute cm/yr and flag (neutrally) when velocity is well above or below typical bands for age/sex, with "worth mentioning to your pediatrician" copy. Not a diagnosis. (Moved forward from v2.) |
| P10 | **Daily habit checklist + streaks** (§12.2–12.4) | 3–5 items per day from the plan; one tap to tick. Streak counts days with ≥ 3 items done; one automatic rest day per week keeps the streak alive. Best streak is kept forever. No guilt copy. |
| P11 | **Weekly Habit Score** (§12.3) | 0–100 score of the past 7 days' habits (sleep, activity, nutrition, checklist). Measures habits only and is labelled that way; it never predicts or claims height. Sunday recap card. |
| P12 | **Bedtime and plan reminders** (§12.4) | Local notifications at times the user picks: bedtime wind-down, morning plan, monthly measurement. Permission is requested only after the first result, when the user turns reminders on. |
| P13 | **Weekly grocery list** | Generated from the week's meal ideas, grouped by aisle, shareable and printable. Answers the 4★ request quoted in §9.1. |
| P14 | **Milestone share cards** | 7/30/100-day streaks, first check-in, "prediction updated". 9:16 and 1:1, nickname only, no DOB or body data. |

**Monetization MVP criteria**
- The paywall never appears before the first free result.
- The paywall shows both products, exact localized prices from the store (via RevenueCat), what's included, "Restore Purchases", "Terms of Use" and "Privacy Policy" ("Manage Subscription" is one tap away in the Family/Profile tab). It has a visible close (X) button **top-right** from frame 1 (§13.6).
- Exactly two plans: Annual (default) and Weekly. No monthly, no lifetime, no decoy. No fake or resetting countdown timers (only a genuine launch offer with a real end date, §11.6), no fake discounts, no fake "people joined today" counts, no fabricated testimonials. The only trial is an opt-in 7-day trial on the Annual plan (toggle off by default): the CTA reads "Start 7-Day Free Trial" and the line directly beneath it reads "Free for 7 days, then $39.99 per year. We'll remind you 2 days before…" (§13.6), with a local reminder 2 days before conversion.
- The Annual plan is preselected and highlighted (§11.6). The billed amount ("$39.99/year", "$4.99/week") is always the most prominent price on each card; Annual's per-week breakdown ("≈ $0.77/week") sits right next to it in smaller text (Apple's subscription guidance and guideline 3.1.2).

### v2 (post-launch)
- Parent-teen shared family view (§12.2) and multi-device sync. Both need a sync layer, which v1 deliberately lacks; options in §12.7 (encrypted file sync via iCloud Drive / Google Drive, or a minimal account-free backend). Decide before building.
- Seasonal content packs beyond the first one; Apple Health / Health Connect sleep import (§12.7).
- Family Sharing for the Annual plan (App Store Connect toggle; Google Play family sharing for subscriptions where supported) and a co-parent share.
- Apple Health (HealthKit) and Android Health Connect import/export of height and weight, opt-in. Health Connect triggers extra Play declarations (§6.2b).
- Bone-age input option (if a pediatrician supplied one), using a published bone-age method, clearly labelled.
- Widgets (latest percentile, next measurement date).
- More languages.
- Mid-parental adjustments for other reference populations, if published methods exist.

---

## 3. User flows

### 3.1 Onboarding → first prediction (target < 45 s; welcome + 10 progress steps + loader + result; full spec §13.4–13.5)
0. **Welcome**: one "Get Started" button (no role buttons here any more).
1. **Who's checking today?** (I'm a teen / I'm a parent), auto-advance.
2. **Sex at birth**, auto-advance. 3. **Birth date** (inline month + year wheel, typed fallback). 4. **Height** (numeric field(s), cm | ft / in). 5. **Weight** (numeric field, kg | lb, optional with Skip). 6. **Parents' heights** (two labelled fields on one screen, "Don't know" for at most one parent).
7. **"Which have you noticed?"** puberty multi-select with exclusive "None yet" / "Not sure", only for ages where it's relevant.
8. **Sleep** ("How much do they usually sleep?"), auto-advance; personalizes the plan only.
9. **Main goal** (single choice, auto-advance).
10. **Built on real pediatric research** (authority screen, true claims only), button "See My Result".
- **Loader** (3 s) with real steps, then the **Result:** confetti, free predicted height + range + methods, locked Pro rows (§13.7). Teen path adds **Show a Parent** (§11.3).
- Single-choice screens auto-advance; Back is always available.
- No notification, ATT, rating or paywall prompt before the result. Reminder permission is asked only after purchase on the plan-setup screen, when the reminder switch is on (§12.4).
- Nickname moved to the result screen ("Add a name"), optional.

### 3.2 Prediction (returning user)
Home → child card shows the latest prediction → tap → Result detail → "Recalculate with new measurement" (free users can update the current measurement; it replaces the single saved measurement).

### 3.3 Add child
- Free user: Home → "+ Add child" → paywall sheet (context: "Multiple children is part of Family"), with close always visible.
- Family user: "+ Add child" → steps 2–4 from 3.1 (parent heights pre-filled and editable) → result.

### 3.4 Log measurement (Pro)
Growth tab → "+" (or "Log Measurement…") → sheet: date (segmented Today · 3 mo ago · 6 mo ago · 1 yr ago, plus "Other date…"), height, weight (optional), note → **Add** (enabled only when valid) → chart animates the new point → **banner** "Measurement added · Prediction updated +0.4 cm" (production also names the percentile). Validation warns when a today-dated value is > 2 cm below the last entry or the velocity is implausible ("That is lower than the last entry. Please double-check."), but the user can still save (§13.4).

### 3.5 Paywall
- Triggers: tapping a locked card on the result (§11.4) or any Pro feature, "Get My Growth Plan" on the result, "+ Add child", Family/Profile tab → "Upgrade". Only in the optional soft A/B variant does it auto-present once after the result (§11.5).
- Layout: §13.6 (supersedes §4.4). Purchase → success / plan-setup screen → the tab for the feature they tapped (Today by default).
- Cancel: Settings → "Manage subscription" in one tap: iOS `Purchases.showManageSubscriptions()`, Android opens `customerInfo.managementURL` (the Play subscriptions page for this app). Refund: iOS `Purchases.beginRefundRequestForActiveEntitlement()`; Android opens Google Play's refund help page plus a "Contact us" mail link (we can refund from the Play Console / RevenueCat dashboard).
- When a subscription lapses, the data remains viewable read-only (charts visible, logging disabled), and the PDF export stays available for existing data. **Never hold the user's data hostage.**

---

## 4. Design plan

### 4.1 Visual style
Bright, energetic and modern, with enough clinical credibility to be trusted by parents; **native on each platform: Apple HIG (iOS 17/18) on iOS, Material 3 on Android** (full rules §13.1 and §13.9). It should feel like a great coach who knows the science, not a casino. Use inset grouped lists, plenty of white space, SF Symbols on iOS (expo-symbols) and Material Symbols on Android (§13.3), and one subtle growth motif (the leaf app icon). No dark patterns: no fake scarcity, no countdowns, no confetti on paywalls.

**Motion borrowed from GoTall (§11), adapted in prototype v2:** auto-advance on single choice (0.35 s after tap, light haptic), a count-up of the result number, one short confetti burst when the result is revealed (fires for every result, tall or short; it celebrates finishing, not the number), and an iMessage-style scrolling bubble background on the paywall. **The GoTall-style ruler sliders are dropped** in favour of numeric fields and a wheel date picker (§13.4). All motion respects Reduce Motion (§13.1).

### 4.2 Palette (light / dark)
**Superseded by §13.2** (iOS system grouped colors with a single sage-teal tint, #2F7D6D light / #5FB8A5 dark, and apricot #F2A65A / #F4B677 used sparingly). The old custom palette (#F7F8F6 background etc.) is retired.

All text/background pairs must meet WCAG AA (4.5:1 body, 3:1 large). Verify during build and adjust the hex values if needed.

### 4.3 Typography
- System fonts on each platform (SF Pro on iOS, Roboto on Android) through a small `Text` component with the HIG type scale: `largeTitle` 34, `title1` 28, `title2` 22, `title3` 20, `headline` 17 semibold, `body` 17, `callout` 16, `subhead` 15, `footnote` 13, `caption` 12 (Android mapping §13.9). It honours the OS font scale (`allowFontScaling`, `maxFontSizeMultiplier` only where layout would break).
- Result number and numeric field values: large rounded weight (SF Pro Rounded on iOS; on Android bundle one rounded font such as Nunito via expo-font) with tabular figures (`fontVariant: ['tabular-nums']`).
- Monospace (`Menlo` / `monospace`) only in the "How we calculated this" formula sheet.

### 4.4 Key screens, component by component
**Welcome** (`L-01-welcome`; §13.7 row 1)
- 76 pt app icon → `.largeTitle` "How tall will you grow?" ("grow?" in tint) → `.body` "Find out free in about 40 seconds, then get a daily plan to help you reach your full height." → three feature rows (Free prediction · Real pediatric methods · Private by design) → one filled **"Get Started"** button. Footnote: "An estimate, not a medical diagnosis. By continuing you agree to the Terms and Privacy Policy." The teen/parent choice is the first onboarding step (auto-advance rows), not on this screen.

**Input screens (§13.4–13.5)**
- Thin tint progress line under the nav bar (step n of 10) → `.title1` question → helper → one control → inline message → "Continue" pinned to the bottom, enabled only when valid → Back chevron.
- Single-choice screens (role, sex, sleep, main goal) are inset grouped checkmark rows with no Continue: they auto-advance.
- **Birth date:** inline month + year wheel with a "Birth date" value row, plus "Enter date with keyboard instead". **Height:** cm | ft / in segmented control + large numeric field (two side-by-side fields for ft / in). **Weight:** kg | lb + numeric field, optional with Skip. **Parents:** two labelled fields on one screen, each with "Don't know" (at most one).
- Fields start **empty with placeholders** (never a pre-filled median), autofocus, decimal keypad, Return advances, inline validation with the ranges in §13.4. The wheel must be moved or tapped before Continue enables, so a value is never accepted by accident.

**Result (teaser dashboard; full spec §11.4)**
*As built: `L-10-result` / §13.7 row 13. The list below is the full production content; items the prototype omits are listed in §13.10.*
1. Confetti burst (once, ~1.3 s; skipped under Reduce Motion). Large Title "Your Result" + "Your results are in! 🎉"; share button top-right. Neutral copy for every value.
2. Hero card: number counting up from today's height to the prediction (e.g. "174 cm", then "5′ 9″ · likely 169–180 cm"), **free and fully visible**.
3. Range bar: "Likely between 171–181 cm", with the point marker.
4. METHODS inset list (one row per method with its ± range and value) → "How We Calculated This" sheet, plus a footnote saying which method leads and why.
5. "Your inputs" row: age, height, weight, parents, each tappable to edit.
6. Today's percentile line (free): "Today: 64th percentile for age (CDC)".
7. Caveat card + "Full disclaimer" link.
8. **Locked Pro rows** under "Included with APP_NAME Pro" (padlock; never a blurred version of fake findings): Growth curve & trend ("Every check-in plotted, with updated predictions", which covers prediction history) · Personalized growth plan · Growth-spurt timing · Pediatrician-ready PDF. Tapping any opens the paywall with that context line.
9. Bridge line "Now let's help them reach it!" (teen: "Now let's help you reach it!"), then the pinned primary CTA **"Get My Growth Plan"** (opens the paywall). Secondary: share (nav bar), "Add a name".
10. Teen path only: a "Show a Parent" row ("They can unlock your growth plan with you") that opens the share sheet with "Send to a Parent", then the hand-off flow (§11.3).
11. After the CTA area: "Improve accuracy" card (optional follow-up questions, §11.3).

**Home → four tabs** (supersedes the old child list + child-detail segmented control; §13.8, `L-17` to `L-21`)
- **Today:** streak card, 5 daily habit rows with check circles, rest-day footer, "Why it matters" tip.
- **Growth:** prediction row, growth chart (victory-native `CartesianChart` on Skia): thin CDC/WHO percentile lines, `tintFill` band, emphasised P50, the child's points + line in `accent`, dashed projection with the likely-range band to the predicted adult height. Reference switcher (CDC/WHO). Growth speed row, measurements list (swipe to edit/delete), "+" / "Log Measurement…", Export PDF in the nav bar. The canvas gets an `accessibilityLabel` summary ("Height for age, 6 measurements, latest 64th percentile") and a "Show as table" toggle.
- **Plan:** this week's focus targets, Week 1 day rows (expandable), puberty guide entry.
- **Family** (teen: **Profile**): child profiles + "Add Child…" (teen: "Invite a Parent…"), subscription (plan, renew date, Manage Subscription, Restore Purchases), reminder switches, settings, Delete All Data.

**Paywall: superseded by §13.6** (`L-13-paywall`, `D-13-paywall`). In short: full-screen dark cover with the scrolling chat-bubble background (Q&A placeholders labelled "Sample messages · not real reviews" until consented testimonials exist, §11.7); **close X top-right** from frame 1 (44×44 pt); sheet with header "Your growth plan is ready" + tint sub-line; Annual ($39.99/year, ≈ $0.77/week, "Best value · Save 84%", unlimited children; preselected) and Weekly ($4.99/week, up to 2 children) cards; opt-in "Try 7 days free first" toggle (Annual only, off by default); "Included with Pro" rows; reassurance line; teen "Ask a Parent to Unlock"; sticky footer with "Start My Growth Plan · $39.99/year", the plan-specific renewal line, and Restore Purchases · Terms of Use · Privacy Policy. Prices from RevenueCat `package.product.priceString` / `price`; nothing hardcoded. No countdown, no "people joined today", no decoy plan, no confetti here.

**Settings** (inside the Family/Profile tab, §13.7 row 23)
- Plan status, Upgrade / Manage Subscription (one tap), Restore purchases, Request refund, Units, Growth reference (CDC/WHO), Disclaimer, Methods and sources, Privacy policy, Export all data (JSON), Delete all data, Contact support (mailto), Version.

### 4.5 Accessibility
- OS font scaling up to iOS AX5 and Android 200%. Layouts reflow vertically, with no truncated numbers.
- VoiceOver and TalkBack labels on every control (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`). The result is read as "Predicted adult height 176 centimeters, likely range 171 to 181."
- The month/year wheel columns are `adjustable` with increment/decrement actions, and the typed fallback is always offered; numeric fields have labels that include the unit ("Mother's height in centimeters") and announce inline errors (`accessibilityLiveRegion` / live announcements).
- Skia charts are not accessible by themselves: every chart has a summary label and a data-table view.
- Respect Reduce Motion (`AccessibilityInfo.isReduceMotionEnabled` / Reanimated `useReducedMotion`) for transitions (cross-fade), chart animation, the count-up, confetti, bubbles and auto-advance timing (§13.1); respect bold text / high-contrast settings where RN exposes them.
- Minimum 44×44 pt (iOS) / 48×48 dp (Android) targets. Color is never the only signal (percentile bands also labelled).
- Localizable from day one (i18next or Lingui, ICU plurals). English only for v1.

### 4.6 Tone and copy guide (rewritten Oct 16, 2026: conversion-first, store-safe)
**Voice:** energetic, aspirational, teen-friendly, still credible. A hype coach who actually knows the science. Exclamation marks and the odd emoji are fine, including on money screens. Two registers that share one voice:
- **Teen path:** "you" ("How tall will you grow?").
- **Parent path:** "your child / they" ("Help them reach their full height").
- Marketing can speak to teens 13+ or parents. Never to under-13s (Play Families policy, §6.2b).

**Allowed (Utku's direction):** "grow taller", "reach your full height", "maximize your growth", "unlock your potential", "How tall will I grow?" in marketing, ASO, onboarding and paywall. Aspirational framing ("your tallest self"). **Positive urgency that is true:** growth plates close in the mid-to-late teens (earlier in girls), so "start while you're still growing" is fair. **Genuine time-limited offers** (a launch or intro price with a real end date that is the same for everyone, §11.6).

**How to use "grow taller" without a store problem:** pair it with natural growth and habits, never with a number or a guarantee.
- OK: "Grow taller the way your body is built to: sleep, food, movement." "Still growing? Make every cm count." "Reach your full height." "Maximize your growth years."
- Not OK: "Grow 2 inches", "+5 cm in 30 days", "add height", "guaranteed", "taller than your genetics", anything implying growth after growth plates close.

**Hard guardrails (minors + App Store 1.4.1 / 2.3 / 3.1.2 + Play health-misinformation and subscriptions policies; these don't loosen):**
1. No guaranteed or quantified height gains, no before/after height claims, no "+cm" testimonial badges.
2. No fake timers (per-session or resetting countdowns), no fake "people joined today" or live-user counts, no fake discounts or decoy plans.
3. No fabricated accuracy stats ("98.7%"), no "AI accuracy" claims; only published error ranges with citations.
4. No borrowed institution logos or wording implying CDC/WHO/NIH/Stanford endorsement.
5. No body shaming or status language: no "short = defective/problem", "cooked", "manlet", "alpha", no dating/attractiveness framing ("girls like tall guys"), no ranking of bodies. Teens read this.
6. The prediction is reported straight: same layout and confetti for tall and short results, no "not growing at your potential", "issues found" or "dream odds".
7. Disclaimer placement (§6.3) stays. "Talk to your pediatrician" stays in caveats and alerts.

**Sample headlines (store, ads, onboarding, web)**
- "How tall will you grow? Find out in 40 seconds. Free."
- "How tall will your child grow? Real formula. Free answer."
- "Your growth years are now. Make them count!"
- "Reach your full height: sleep, food and movement, planned for your age."
- "Maximize your growth while you're still growing."
- "The formula pediatric researchers use, in your pocket."
- "Unlock your growth potential with a daily plan that fits your age."
- "See your predicted height free. No paywall, no tricks."
- "Growth plates close in your mid-to-late teens. Start your plan today!"
- "Tall parents, short parents? See what the science says about you."

Paywall copy: §12.5. Push notification lines: §12.4.

---

## 5. Tech plan

### 5.1 Stack (cross-platform: iOS + Android from one codebase)
**Decision: Expo (React Native) + TypeScript, with RevenueCat for subscriptions.** Flutter was the alternative; Expo wins here because:
1. **One engine for app and website.** The prediction engine is pure TypeScript (`packages/engine`) and the §10 web calculator imports the same package, so the app and the site can never disagree on a number. Flutter would mean Dart in the app and a second JS port for the web.
2. **Subscriptions:** `react-native-purchases` (RevenueCat) is first-class on Expo and gives one entitlement model across App Store and Google Play, receipt validation, refunds/churn analytics and webhooks without our own server.
3. **Shipping speed:** EAS Build / Submit for both stores from one machine (no Mac needed for CI builds), EAS Update for over-the-air fixes to JS and bundled content (copy, plan content) within store rules, config plugins instead of hand-edited native projects.
4. Coding agents and the hiring pool are strongest in TypeScript/React.
Tradeoffs accepted: charts and confetti run on Skia (not native SwiftUI charts), a bit larger binary, and a dev build is required (RevenueCat and MMKV don't run in Expo Go).

| Concern | Choice | Replaces (old iOS-only plan) |
|---|---|---|
| Framework | Expo SDK (latest stable at kickoff), React Native New Architecture, TypeScript `strict`, `expo-router` (file-based navigation) | SwiftUI |
| Local-first data | `expo-sqlite` + Drizzle ORM (typed schema, migrations) for children/measurements/habits; `react-native-mmkv` for settings and UI caches | SwiftData, @AppStorage |
| State | Zustand stores + TanStack Query only if a network source appears (none in v1) | @Observable |
| Validation | Zod schemas shared by engine, forms and JSON import | — |
| Subscriptions | RevenueCat `react-native-purchases` behind an `EntitlementService` interface (a `MockEntitlementService` for tests/demo) | StoreKit 2 |
| Charts | `victory-native` (Skia) + `@shopify/react-native-skia` | Swift Charts |
| Motion | `react-native-reanimated`, `react-native-gesture-handler` (month/year wheel picker, sheets with detents via `@gorhom/bottom-sheet` or expo-router `formSheet`), Skia confetti + bubble scroller, `expo-haptics` | SwiftUI animation |
| PDF | `expo-print` (`printToFileAsync` from an HTML template; charts embedded as SVG built with `d3-shape`) + `expo-sharing` | PDFKit/ImageRenderer |
| Share cards | `react-native-view-shot` → PNG → `expo-sharing` | ImageRenderer |
| Notifications | `expo-notifications`, local only (no push server, no push token) | UNUserNotificationCenter |
| Locale/units | `expo-localization` + `Intl` | Locale |
| Icons | `expo-symbols` (SF Symbols) on iOS, Material Symbols Rounded on Android (§13.3) | SF Symbols |
| Files | `expo-file-system` (JSON export, PDFs) | FileManager |
| Tests | Jest (+ `@testing-library/react-native`) for engine and components; **Maestro** E2E flows run on both iOS simulator and Android emulator | XCTest/XCUITest |
| Build/release | EAS Build, EAS Submit, EAS Update (channels: `development`, `preview`, `production`) | Xcode archive |

- **Minimum OS:** iOS 15.1+ / Android 7.0 (API 24)+ or whatever the chosen Expo SDK requires; **Android `targetSdkVersion` 36** (required for new Play apps from Aug 31, 2026; check the Play Console for the current rule at submission).
- **Third-party SDKs in v1:** RevenueCat only, plus optionally one privacy-first analytics tool (§7). Remove any transitive `com.google.android.gms.permission.AD_ID` permission (config plugin) and answer "No" to Advertising ID in Play Console.
- **Network:** none except RevenueCat/store billing (and the analytics tool if chosen). The prediction, program and PDF all work offline.
- Architecture: monorepo (pnpm workspaces): `apps/mobile`, `apps/web` (§10), `packages/engine` (pure TS: units, validation, MidParental, KhamisRoche, LMS, PercentileProjection, velocity, habit score; no React imports, 100% unit-testable), `packages/reference` (bundled CDC/WHO LMS + KR JSON + loader), `packages/content` (program/guide JSON + Markdown).

### 5.2 Project structure
```
repo/
  apps/mobile/
    app/                 (expo-router routes: (onboarding)/, result, (tabs)/home, child/[id], paywall, settings)
    src/features/        (Onboarding, Result, Home, ChildDetail, LogMeasurement, Paywall, Program, Settings, Guides)
    src/services/        (EntitlementService, PDFReportService, NotificationScheduler, AnalyticsService, ShareCard, UnitFormatter)
    src/db/              (Drizzle schema, migrations, repositories)
    src/ui/              (design tokens §13.2, Text, Button (filled/tinted/bordered/plain), InsetGroupedList + Row, CheckRow, NumericField, UnitSegmentedControl, MonthYearWheel, Switch, Sheet, Banner, Alert, TabBar, BubbleBackground, Confetti, LockedRow)
    assets/              (icon, splash, fonts, testimonials.json)
    app.config.ts        (AppConfig: appName, bundle IDs, RevenueCat keys via env, privacy manifest, plugins)
  apps/web/              (§10 site; imports packages/engine)
  packages/engine/       (pure TS + Jest tests)
  packages/reference/    (khamis_roche_coefficients.json, cdc_statage.json, who2007_hfa.json, SOURCES.md)
  packages/content/      (program/, guides/, seasonal/; Markdown + JSON, <!-- REVIEW --> markers)
  .maestro/              (E2E flows, run per platform)
```

### 5.3 Data model (SQLite via Drizzle; all on device)
```ts
// packages/engine/types.ts (shared) + apps/mobile/src/db/schema.ts (tables)
type Sex = 'female' | 'male';

children:      { id: text pk (uuid), nickname: text default '', avatarEmoji: text default '🙂',
                 sexAtBirth: Sex, birthDate: text (ISO date), motherHeightCm: real | null,
                 fatherHeightCm: real | null, parentHeightsSelfReported: int(bool) default 1,
                 parentHeightEstimated: 'mother' | 'father' | null,   // §13.4 "Don't know"; that parent's height = population average
                 sleepBand: 'lt7' | '7-8' | '8-9' | '9+' | null,     // §13.5 step 8; plan only
                 pubertySigns: text (JSON string[]) default '[]',   // optional §11.3 checklist keys
                 primaryGoal: text | null,                           // §13.5 step 9
                 bedtime: text | null ('21:00'),                     // §12 sleep routine
                 createdAt: text }
measurements:  { id: text pk, childId: text fk → children (cascade), date: text, heightCm: real,
                 weightKg: real | null, note: text | null }
habitChecks:   { id: text pk, childId: text fk (cascade), day: text ('2026-10-16'), habitKey: text,
                 done: int(bool), isRestDay: int(bool) default 0 }    // P10; streaks + Habit Score computed

// Not persisted: computed on demand by packages/engine
interface Prediction { method: 'midParental' | 'khamisRoche' | 'percentileProjection';
  estimateCm: number; lowCm: number | null; highCm: number | null;
  inputsUsed: Record<string, string>; citation: string; notes: string[] }
```
- Store metric internally; convert at the edge. Dates as ISO strings in local time; ages computed in the engine.
- Entitlements come from RevenueCat `CustomerInfo` at runtime (`pro`, `multi_child`), cached in MMKV only as a UI hint. Never the source of truth.
- MMKV settings: units, growth reference, hasCompletedOnboarding, userRole (`parent`/`teen`), reminder times, resultVariant (A/B, §11.5).
- Plan content (daily items, meals, stretches, seasonal packs) is bundled JSON/Markdown in `packages/content`, keyed by age band and sex; no network.

### 5.4 Prediction formulas, references, caveats
**General rules**
- Show every method that is valid for the inputs. Never blend them into one "AI" number.
- Round displayed values to whole cm (or ½ inch). Keep full precision internally.
- Input validation (§13.4, prototype v2): child height 60–220 cm, weight 10–200 kg (optional), parent heights 130–230 cm, age 2 to < 22 y (under 2 blocked). Soft warning when height is > 22% from the typical height for age and sex. Under 4: MPH only; over 17.5: genetics-only note. Khamis–Roche output is floored at the child's current height (and the method sheet says so).
- **Unknown parent (v2 behaviour, ⚠️ product review):** at most one parent may be "Don't know". The engine substitutes the population adult average for that parent (prototype: US NHANES 2015–2018, mother 161.3 cm, father 175.3 cm) in both KR and MPH and widens each method's range by 3.5 cm on each side. It labels the result and method sheet. Gate with `AppConfig.unknownParentMode` (§13.4).
- Never output a result without its range and method label.

**A. Mid-parental height (target height)**
- Boys: `(father_cm + mother_cm + 13) / 2`
- Girls: `(father_cm + mother_cm − 13) / 2`
- Range: **± 8.5 cm** (≈ 2 SD target range, per Tanner et al.).
- Inputs: both parents' heights. If one is unknown, use the population average for that parent and widen the range to ± 12.0 cm (8.5 + 3.5), labelled (§13.4; ⚠️ product review). Both unknown is not allowed by the UI.
- Reference: Tanner JM, Goldstein H, Whitehouse RH. *Standards for children's height at ages 2–9 years allowing for height of parents.* Arch Dis Child. 1970;45:755–762.
- Caveat copy: "Shows the genetic 'target'. It ignores how your child is growing now."

**B. Khamis–Roche (without bone age)**
- Form: `predicted_adult_stature = β0 + β1·stature + β2·weight + β3·midparent_stature`, with sex-specific and age-specific coefficients (half-year ages, **4.0–17.5 y**). The original works in inches and pounds, so convert.
- Reference: Khamis HJ, Roche AF. *Predicting adult stature without using skeletal age: the Khamis–Roche method.* Pediatrics. 1994;94(4 Pt 1):504–507. **Erratum: Pediatrics. 1995;95(3):457** (use the corrected coefficients).
- **Implementation rule for the coding agent: do NOT write coefficients from memory.** Bundle `khamis_roche.json` (provided alongside this brief) as `packages/reference/khamis_roche_coefficients.json` and load it at runtime. Each row has `{sex, age, intercept, stature_coef, weight_coef, midparent_coef, units, source_urls, verified_by_n_sources}` (inches/pounds; midparent = (mother + father)/2, unadjusted). Show verification status in the "How we calculated this" sheet (e.g. "Coefficients cross-checked against 2 independent sources"). The engine runs KR **only for rows with `verified_by_n_sources >= 2`**; for any other row it refuses and the UI hides the KR chip and labels the fallback. All 56 rows (boys and girls, 4.0–17.5) currently meet this bar, so KR is on. Note: some secondary sources (e.g. the matuR R package) print weight coefficients 10× too small; the bundled values are the erratum-corrected ones. Add unit tests that pin a few rows (e.g. boy 10.0: −11.038, 0.97135, −0.039981, 0.45932; girl 4.0: −8.1325, 1.24768, −0.19435, 0.44774) and check the paper's worked example(s) once Utku confirms them against the original PDF/erratum.
- Accuracy to display: average 90% error bounds ≈ ±5.3 cm (boys) / ±4.3 cm (girls); 50% bounds ≈ ±2.2 / ±1.7 cm. Valid only for ages 4.0–17.5 and was developed on healthy white American children (Fels study), so say so in the limitations.
- Age handling: use the coefficient row for the nearest half-year (or interpolate linearly between rows; pick one and document it).
- Range: use the error bounds reported in the paper (also transcribed into the JSON as `errorBound90Cm` per sex/age if available). Don't invent a number. If none is transcribed, show the estimate with "range unavailable".
- Caveats: derived from the Fels Longitudinal Study (largely white, US-born children). It may be less accurate for other populations, for early- or late-maturing children, and for children with medical conditions. Inputs should be measured heights. The paper's parent-height handling should be followed as specified in the paper.

**C. Percentile projection (fallback / third view)**
- Compute the current height-for-age z-score with the LMS method, then project the same z to age 20 on the same reference (CDC) or to 19 (WHO 2007).
- LMS: `z = ((X/M)^L − 1) / (L·S)` (if L ≠ 0), `z = ln(X/M)/S` (if L = 0). Inverse: `X = M·(1 + L·S·z)^(1/L)`. Percentile = Φ(z).
- Data: CDC 2000 `statage` LMS table (2–20 y, by sex, monthly) and WHO 2007 height-for-age 5–19 y LMS tables. Both are public; download the official CSVs and bundle them, and record the source URL and download date in `packages/reference/SOURCES.md`.
- References: Kuczmarski RJ et al. *2000 CDC Growth Charts for the United States: methods and development.* Vital Health Stat 11. 2002;(246). de Onis M et al. *Development of a WHO growth reference for school-aged children and adolescents.* Bull World Health Organ. 2007;85:660–667.
- Range: show the projection at z ± 0.5 as a "if they track roughly this percentile" band, clearly labelled as illustrative, not statistical.
- Caveat: "Children often move between percentiles, especially around puberty."

**Global disclaimer** (shown in onboarding footnote, result caveat link, PDF footer, Settings):
> APP_NAME provides estimates for general information only. It is not a medical device and does not diagnose, treat or prevent any condition. Predictions can differ from actual adult height. If you have concerns about your child's growth, talk to a pediatrician or qualified health professional.

### 5.5 PDF report
- `PDFReportService.makeReport(child, measurements, reference): Promise<string /* file uri */>`.
- Render an HTML template (inline CSS, system fonts) with `expo-print` `printToFileAsync({ html, width, height })`; page size US Letter (612×792 pt) or A4 (595×842 pt) by locale. The percentile chart is an inline SVG built from the same engine data with `d3-shape` (vector, sharp when printed), not a screenshot of the Skia canvas.
- Share with `expo-sharing`; delete temp files on next launch.
- Include the generated date, the app name, and "Prepared by parent using APP_NAME". No ads, no upsell in the PDF.

### 5.6 Subscription products (App Store + Google Play, unified in RevenueCat)
| Store | Product | Type | Price | RevenueCat entitlements |
|---|---|---|---|---|
| App Store | `app.pro.weekly` | Auto-renewable, group `pro`, 1 week, no intro offer | $4.99/wk | `pro` (max 2 children, `AppConfig.weeklyMaxChildren = 2`) |
| App Store | `app.family.annual` | Auto-renewable, group `pro`, 1 year, higher service level, **no intro offer** | $39.99/yr | `pro` + `multi_child` |
| App Store | `app.family.annual.trial` | Same group and level as above, **7-day free introductory offer** | $39.99/yr after trial | `pro` + `multi_child` |
| Google Play | subscription `pro_weekly`, base plan `weekly` (auto-renewing, 1 week) | Auto-renewing | $4.99/wk | `pro` |
| Google Play | subscription `family_annual`, base plan `annual`, offer `trial-7d` (7-day free trial, new-customer eligibility, tagged `optin-trial`) | Auto-renewing | $39.99/yr | `pro` + `multi_child` |

**Price rationale (US; competitor IAP lists fetched Oct 16, 2026, §9.3):** weekly $4.99 sits mid-market (GoTall $1.99–5.99, Taller $4.99–5.99, Taller AI $5.99–9.99), so it's a credible plan for someone who wants to try the program for a week, not a decoy. Annual $39.99 sits in the middle of competitor yearly prices (GoTall $9.99–59.99, Taller $19.99–39.99, Taller AI $39.99–99.99) and equals 8 weeks of Weekly (≈ $0.77/week, an 84% saving), which makes Annual the obvious choice and protects LTV. Localize lower tiers for IN and PH on both stores (weekly price pain quoted in §9.1).

- **Why two annual products on iOS:** an App Store introductory offer applies automatically to every eligible buyer of that product, so "trial off by default" is impossible with one product. The toggle switches between `app.family.annual` and `app.family.annual.trial`. On Play, offers are explicit: buy the base plan without an offer, or pass the `trial-7d` subscription option when the toggle is on (`purchaseSubscriptionOption`).
- RevenueCat Offering `default`: packages `$rc_weekly`, `$rc_annual` (no trial), `annual_trial`. `AppConfig.plans = { weekly: { maxChildren: 2 }, annual: { maxChildren: Infinity } }`; the default selected package is `$rc_annual`. Paywall copy is ours (no RevenueCat paywall templates) so §11.6 rules hold.
- Trial reminder: schedule a local notification 2 days before trial end ("Your trial ends on <date>; you'll be charged $39.99 unless you cancel") with a deep link to Manage subscription. Cancel the notification if the user cancels (check `CustomerInfo` on foreground).
- No lifetime / non-consumable product. No monthly plan. No trial on Weekly.
- Listen to `Purchases.addCustomerInfoUpdateListener` at launch. Restore = `Purchases.restorePurchases()` (required button on iOS; also shown on Android). Anonymous RevenueCat app user IDs only; never send names, ages or measurements as attributes.

---

## 6. Privacy and compliance

### 6.1 Privacy by design
- **No account and no sign-in.** No email collection.
- All child data stays on the device (SQLite + MMKV). Nothing about the child leaves the phone. Any v2 sync is opt-in and end-to-end encrypted (§12.7).
- Platform backups: exclude nothing by default (users expect their data to survive a phone change), but say so in the privacy policy; Android Auto Backup is on, iOS iCloud device backup is on.
- No ads, no ad SDKs, no IDFA, **no App Tracking Transparency prompt** (we don't track).
- Analytics (if any): anonymous event counts only. **Never send heights, weights, birth dates, names, or predictions.**
- RevenueCat receives only an anonymous app user ID and store purchase data.
- Export all data (JSON) and Delete all data are in Settings.
- iOS privacy manifest via `app.config.ts` `ios.privacyManifests` (required-reason APIs such as UserDefaults/file timestamps used by Expo modules and MMKV; no tracking). Check that every native dependency ships its own manifest.
- App Store privacy label: "Purchases" (app functionality, via RevenueCat; follow RevenueCat's current guidance on whether it's linked) and, if analytics are used, "Usage Data – not linked to identity – not used for tracking". Everything else: not collected.
- Google Play **Data safety** form: the same facts. Data processed only on the device is not "collected". Expect "Purchase history" (app functionality) and, if analytics, "App interactions"; data encrypted in transit; no data shared; deletion = in-app "Delete all data" (no account exists).
- The privacy policy URL is required. Write it in plain language and host it on a simple static page.

### 6.2 App Store Review Guideline notes (iOS)
- **1.4.1 (Physical Harm, medical/health apps):** apps that could give inaccurate health data get extra scrutiny. Mitigations: use only published methods, show citations in the app, show ranges, carry the disclaimer everywhere, make no diagnostic claims, and never say the app can change height. In App Review notes, explain the methods and link the sources.
- **5.1.1 / 5.1.2 (Data collection and use):** only collect what the feature needs. No account required (5.1.1(v): account deletion is n/a with no accounts, but provide in-app data deletion).
- **5.1.3 (Health and health research):** do not use the data for advertising, do not share it, and do not store personal health info in iCloud or any cloud without care. Any sync must be opt-in and encrypted.
- **Kids / minors (1.3, 5.1.4):** the app is for parents. **Do not choose the Kids Category.** Set the age rating honestly through the questionnaire (likely 4+). Marketing may now speak to teens 13+ as well as parents (§4.6), but never to under-13s; the teen path routes purchases to a parent and under-13 self-use to a parent hand-off (§11.3). Keep body-shaming and dating framing out (§4.6 guardrails). Parental gate: not required outside the Kids Category, but external links (sources) open in an in-app Safari view.
- **3.1.1:** all digital unlocks use IAP. No external purchase links.
- **3.1.2 (Subscriptions):** both plans (Weekly and Annual) must provide ongoing value (daily plan, tracking, charts, check-ins). Weekly's renewal must be as clear as Annual's ("renews every week"). The paywall must clearly show the price, the billing period, the renewal terms, how to cancel, and links to Terms (EULA) and Privacy. The subscription's title and duration must be shown prominently. No misleading "free" wording near paid buttons.
- **3.1.2(a) / 5.6 (Developer Code of Conduct, no manipulative practices):** no bait-and-switch, no hidden trials. This is our main differentiator, so it's easy to meet.
- **2.3 (Accurate metadata):** screenshots must show the real app. Don't claim "accurate to X cm" unless it's quoted from a cited source.

### 6.2b Google Play policy notes (Android)
- **Target audience and content (Families policy):** in Play Console → App content → Target audience, select **18+ and 13–17** (the teen path exists) and **do not select any age under 13**. Selecting an under-13 age band puts the app under the **Families policy** (Designed for Families requirements, Families Self-Certified SDKs only, stricter data rules, teacher-approved review), which we don't want for v1. In return: the store listing must not unintentionally appeal to children (no cartoon kids, no "for kids" copy, screenshots show a parent's phone), and the teen path blocks under-13 self-use: if a teen-path birth date gives age < 13, show "Ask a parent to set this up" and switch to the parent path wording. Re-check the Teen/age questions in the form each release.
- **Health apps declaration** (Policy → App content → Health apps): mandatory for every app, including closed testing. Declare our health features honestly using the closest categories the form offers (growth tracking / medical-information style features, activity and fitness, nutrition, sleep). State in the description that the app is not a medical device. If v2 adds Health Connect, declare each data type and justify it.
- **Health Content and Services / health misinformation:** no claims that the app increases height or treats anything; cite sources in-app; keep the disclaimer everywhere (§6.3). Same mitigations as Apple 1.4.1.
- **Payments + Subscriptions policy:** all digital unlocks through Google Play Billing (via RevenueCat). The offer must clearly state what's included, price, billing period, that it auto-renews, the trial length and what happens after it, and how to cancel. No misleading "free" wording; the close button must be obvious. Play shows its own purchase sheet with the price; our paywall must match it.
- **Data safety form:** see §6.1. Must match actual SDK behaviour (RevenueCat, analytics) or the listing can be removed. Privacy policy URL in Play Console and in-app.
- **Content rating:** complete the IARC questionnaire honestly (no violence, no user-generated content, no ads).
- **Permissions:** only `POST_NOTIFICATIONS` (runtime prompt on Android 13+, asked after first value, §12.4). Do **not** request `SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM` (restricted; inexact reminders are fine for bedtime). No ad ID.
- **Ads declaration:** "No ads". **Financial features / government / news declarations:** not applicable.
- **Target API:** `targetSdkVersion` 36 for new apps and updates from Aug 31, 2026.
- **Account setup:** complete Play Console developer identity verification. New *personal* developer accounts must run a closed test with at least 12 opted-in testers for 14 days before production access is granted; plan this into the schedule (use the TestFlight parent group, §7).

### 6.3 Medical disclaimer placement
Onboarding footnote link, the result caveat card, the method sheets, the puberty guide header, the habit plans header, the PDF footer, Settings, and the App Store and Google Play descriptions (last paragraph).

### 6.4 Paywall legal text (Weekly + Annual)
> "Weekly: $4.99 per week, renews every week. Annual (Family): $39.99 per year, renews every year (localized prices). If you start the 7-day free trial on Annual, you'll be charged $39.99 when it ends unless you cancel at least 24 hours before; we'll remind you 2 days before. Payment is charged to your Apple ID [Android: Google Play account]. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel anytime in Settings → Manage subscription [Android: Google Play → Payments & subscriptions]."

Render the bracketed variant per platform (`Platform.OS`).

---

## 7. Launch checklist

**App Store assets (iOS)**
- [ ] App icon (1024²): the white leaf mark on a sage-teal gradient tile, as in the prototype (`L-01-welcome`), no text.
- [ ] 6.9″ and 6.5″ iPhone screenshots (6–7). Captions:
  1. "Free height prediction. No paywall."
  2. "See the method and the honest range."
  3. "Track growth on CDC/WHO charts."
  4. "A PDF your pediatrician can read."
  5. "Annual or weekly. Prices up front. Cancel in one tap."
  6. "A daily plan for sleep, food and activity." (program screenshot, §12)
  7. "Your family's data stays on your phone."
- [ ] Optional app preview video (15–30 s) showing input → result in real time.
- [ ] Subtitle (30 chars), e.g. "Honest child height predictor".
- [ ] Promotional text, a description that ends with the disclaimer, a support URL, a privacy policy URL, and a EULA (Apple standard or custom).
- [ ] App Review notes: methods and citations, no account needed, how to reach the paywall, and a sandbox tester.

**Google Play assets (Android)**
- [ ] App icon 512×512 PNG (adaptive icon foreground/background in the app via `app.config.ts`).
- [ ] Feature graphic 1024×500 (ruler/leaf mark + "Free, honest height prediction"; no fake badges or rankings).
- [ ] Phone screenshots (4–8, 9:16, 1080×1920 or larger) reusing the iOS captions above, captured on Android so they show the real Android UI; 7″ and 10″ tablet screenshots if tablets are supported (recommended for featuring).
- [ ] Title (30 chars, e.g. "APP_NAME: Height Predictor"), short description (80 chars, e.g. "Free child height prediction. Real formulas, honest range, no paywall."), full description (up to 4,000 chars) ending with the disclaimer.
- [ ] Optional YouTube promo video (same 15–30 s input → result capture).
- [ ] Privacy policy URL, support email, website; Data safety, Health apps, Target audience, Content rating, Ads and Advertising ID declarations completed (§6.2b).
- [ ] Closed test track with ≥ 12 testers for 14 days if the developer account is personal and new (§6.2b), then production with a staged rollout (10% → 50% → 100%).

**Play ASO (no keyword field)**
- Google indexes the title, short description and full description. Put "height predictor", "child height", "growth chart", "growth tracker", "percentile", "mid-parental height calculator" naturally into the short and full descriptions (no keyword stuffing, repeated lists or competitor names; Play's metadata policy rejects them).
- No "best", "#1", "free download", emoji or ALL CAPS in the title; no price claims in the icon or title.
- Use **Store listing experiments** to A/B the icon, feature graphic, screenshots and short description (an honest place for A/B tests), and custom store listings per country (IN, PH lower-price messaging).
- Reply to reviews within 48 h, especially billing complaints.

**ASO keywords (100 chars, comma-separated, no spaces; refine with an ASO tool)**
`how tall will i be,grow taller,height predictor,growth tracker,child height,growth chart,puberty`
- (96 chars.) "Grow taller" and "How tall will I be" are now allowed (§4.6). Don't repeat words already in the title or subtitle; Apple indexes those separately.
- Title: "APP_NAME: Height Predictor" (or "APP_NAME – Child Height & Growth").
- Avoid competitor brand names in keywords (guideline 2.3.7 risk).

**TikTok / social launch angle: "How tall will you grow? Free, no paywall"**
- Hook formats:
  - Screen recording: "I tried height predictor apps. This one asked 40 questions then wanted $35. Here's one that just tells you, free, in 30 seconds."
  - "How height prediction actually works (the formula doctors use)", showing the mid-parental math on screen.
  - A parent-perspective story ("my son kept asking how tall he'll be…").
- Rules: parent creators and teen-friendly creators (13+; anyone under 18 appearing on camera needs parental consent, and paid creators must disclose the partnership). Aspirational "grow taller / reach your full height" hooks are fine (§4.6). No guaranteed cm, no before/after height claims, no shaming or "alpha" talk. Always mention "an estimate, not a guarantee".
- CTA: "Free on the App Store and Google Play. Search APP_NAME."
- Prepare 10–15 short scripts before launch and post daily for 2–3 weeks.

**Analytics (privacy-first)**
- [ ] Choose: none (App Store Connect + Play Console + RevenueCat dashboards only), or one privacy-first SDK that supports React Native on both platforms (e.g. TelemetryDeck or self-hosted PostHog with anonymous mode) behind `AnalyticsService`.
- [ ] Events (no PII, no measurement values): `onboarding_started(role)`, `onboarding_step_completed(step)`, `onboarding_step_skipped(step)`, `result_shown(methods_count, variant)`, `locked_card_tapped(card)`, `method_sheet_opened(method)`, `paywall_shown(trigger, variant)`, `plan_selected(product)`, `trial_toggled(on)`, `purchase_completed(product)`, `paywall_closed`, `restore_tapped`, `manage_subscription_tapped`, `teen_share_to_parent`, `notification_permission(result)`, `habit_checked`, `streak_milestone(days)`, `habit_score_viewed`, `grocery_list_opened`, `measurement_logged`, `checkin_completed`, `spurt_alert_shown`, `pdf_exported`, `child_added`.
- [ ] Key metrics: time-to-result (target median < 45 s), onboarding completion, result → paywall view, paywall conversion, refund rate, rating, plus the retention set in §12.6 (D1/D7/D30, trial-to-paid, weekly-plan churn, monthly churn across all subscribers).
- [ ] Rating prompt: `expo-store-review` `requestReview()` (StoreKit on iOS, Play In-App Review API on Android) only after the 2nd logged measurement or a PDF export. Never after a paywall.

**Testing**
- [ ] Unit tests: mid-parental (both sexes, edge values), LMS z/percentile against CDC/WHO published percentile values, KR pinned-row tests against the bundled JSON, plus the paper's examples once confirmed against the original PDF, unit conversion round-trips, input validation.
- [ ] Purchases, both platforms: iOS StoreKit configuration file / sandbox and Android license testers on the internal test track (via RevenueCat) for purchase, restore, renewal, expiry, refund, Ask to Buy (iOS) / Family Link purchase approval (Android), trial on/off product selection, grace period / billing retry, and the lapsed → read-only state. `EntitlementService` unit tests with the mock.
- [ ] UI tests: onboarding reaches the result through welcome + 10 progress steps (9 when the puberty step is age-gated out) + loader, in < 45 s with scripted input; Continue is disabled for empty/out-of-range values and the untouched wheel; Return advances; "Don't know" works for one parent and is refused for the second; predicted height and range visible on the result with no paywall; the paywall close button (top-right) is visible immediately; the billed amount is the largest price text on each plan card; no notification prompt before the result; screenshots match `prototype/shots/v2/` in light and dark mode.
- [ ] E2E: the same Maestro flows (onboarding parent/teen, result, paywall, check-in, delete data) pass on the iOS simulator and the Android emulator in CI (EAS Workflows or GitHub Actions).
- [ ] Accessibility audit: Xcode Accessibility Inspector + VoiceOver full pass; Android Accessibility Scanner + TalkBack full pass; screenshots at iOS AX5 and Android 200% font scale.
- [ ] Devices: iPhone SE (small screen), a standard iPhone, Pro Max; a small/low-end Android (≈ 5.5″, 3 GB RAM), a Pixel, a Samsung (One UI font and display scaling), Android 8 and the latest Android; light and dark mode; airplane mode; Android back gesture on every screen.
- [ ] TestFlight + Play closed test with 12–20 parents (≥ 12 Android testers for 14 days if required). Timed onboarding; ask "Did anything feel like a trick?"
- [ ] Have the content (puberty guide, habits) reviewed by a pediatric professional before launch if possible, and list sources in the app.

---

## 8. Kickoff prompt for the coding agent (paste as-is)

```
You are building an iOS + Android app called APP_NAME (placeholder; keep it in AppConfig.appName and the
i18n strings). Read the full brief above (sections 1–13) before writing code. Follow it exactly;
when something is ambiguous, choose the simplest option that respects the brief's principles
(honest numbers, free result before any paywall, data on device, both platforms equal) and note it in DECISIONS.md.

VISUAL SOURCE OF TRUTH: prototype/index.html (approved prototype v2; open it in a browser and click
through every screen, in light and dark mode) and the screenshots in prototype/shots/v2/ (L- light,
D- dark, M- phone). Match their layout, hierarchy, controls, copy, input behaviour and states on iOS
(Apple HIG, §13.1–13.8); on Android apply the Material 3 mapping in §13.9. If the prototype and an
older section disagree on design or input behaviour, §13 and the prototype win. Where §13.10 lists a
prototype simplification, build the brief's full requirement. Put side-by-side screenshots (yours vs
shots/v2) in each UI milestone summary.

Tech (§5): Expo (latest stable SDK, dev builds, New Architecture) + TypeScript strict, expo-router,
expo-sqlite + Drizzle, react-native-mmkv, Zustand, Zod, RevenueCat react-native-purchases behind an
EntitlementService interface, victory-native/Skia charts, Reanimated, expo-print + expo-sharing,
expo-notifications (local only), expo-haptics, expo-localization, i18next. pnpm monorepo:
apps/mobile, apps/web, packages/engine (pure TS, no React), packages/reference, packages/content.
No other third-party SDKs unless I approve. No accounts, no network calls except RevenueCat/store
billing. Android targetSdkVersion 36. Every feature must work and be tested on BOTH iOS and Android;
a milestone is not done until it builds and its Maestro flow passes on both.

Hard rules:
- Never show a paywall before the first free prediction.
- Never hardcode Khamis–Roche coefficients from memory. Bundle the provided khamis_roche.json as
  packages/reference/khamis_roche_coefficients.json (erratum-corrected, inches/pounds). Show its
  verification status in the method sheet. Run KR only for rows with verified_by_n_sources >= 2;
  for any other row the engine refuses and the UI hides the KR chip with a labelled fallback.
- Bundle official CDC 2000 statage and WHO 2007 height-for-age (5–19y) LMS CSVs; record
  source URLs + download dates in packages/reference/SOURCES.md. If you cannot download them, create the
  loader + a clearly-marked stub and tell me exactly which files to add.
- Copy follows §4.6: energetic and aspirational is fine ("grow taller", "reach your full height"), but no
  medical claims, no guaranteed cm/inch gains, no body shaming; disclaimer wherever the brief lists it.
- Exactly two plans: Annual $39.99 (default, highlighted, unlimited children) and Weekly $4.99 (up to 2
  children); no monthly, no lifetime; only trial = opt-in 7-day on Annual with reminder (two annual
  products on iOS, an explicit offer on Play, §5.6); prices from the store via RevenueCat only; close
  button visible on paywall frame 1.
- The predicted height and range are always free and visible. Locks apply only to Pro extras.
- Paywall: Annual preselected, billed amount is the most prominent price, per-week breakdown smaller next
  to it, "Save N%" computed from the two real store prices, plan-specific renewal line under the CTA.
  No fake/resetting countdowns (only a real launch-offer end date, §11.6), no "people joined today" counts, no decoy plans, no fabricated testimonials or
  growth claims, no institution logos. The bubble background shows only entries with consent == true
  in assets/testimonials.json; otherwise it shows the Q&A placeholder bubbles (§11.7).
- Never request notification permission before the first result (§12.4).
- Inputs per §13.4: numeric fields (decimal keypad) with unit segmented controls, empty with
  placeholders, autofocus, Return advances, inline validation, Continue only when valid; month/year
  wheel with typed fallback that must be touched; optional weight with Skip; at most one parent
  "Don't know" (population average + widened range behind AppConfig.unknownParentMode, flagged for
  product review); auto-advance checkmark rows; puberty multi-select with exclusive None yet / Not sure.
  No ruler sliders.
- Program copy (§12): habits help you reach your full height; never promise a number of cm/inches.
- Read §9 (Research-driven changes), §10 (Website), §11 (GoTall teardown), §12 (Subscription value
  and retention) and §13 (Design system & prototype reference). Later sections override earlier ones
  where they conflict.

Work in these milestones. After each one: build, run tests, summarise what changed, list open
questions, then stop and wait for my "continue".

M1 Project skeleton: pnpm monorepo per §5.2, Expo app with dev builds for iOS and Android
   (EAS profiles development/preview/production), app.config.ts (AppConfig, bundle IDs, privacy
   manifest, AD_ID removal, targetSdk 36), design tokens (§13.2 light/dark, HIG Text type
   scale §4.3, Material mapping §13.9), the §5.2 src/ui primitives, Drizzle schema + migrations per §5.3, MMKV settings, expo-router screens stubbed,
   Jest + Maestro wired into CI. Done = both platforms launch to the stub welcome screen.
M2 Prediction engine + tests (packages/engine): unit conversion, validation, MidParental, LMS (z,
   percentile, inverse), PercentileProjection, KhamisRoche (JSON-driven, gated per row by
   verified_by_n_sources >= 2), velocity, PredictionEngine returning Prediction[]. Full Jest tests
   (§7 Testing). Platform-free, so it also powers apps/web.
M3 Onboarding + Result (free path): welcome + the 10 steps per §13.5 (parent and teen paths,
   auto-advance rows, §13.4 inputs, age-gated puberty multi-select, sleep question, authority screen,
   3 s loader) and the result per §13.7 / §11.4 (confetti, count-up, free number + range + methods,
   editable inputs, locked Pro rows, share sheet, method sheet, teen Show a Parent, "Improve accuracy"). Saves Child + first Measurement. ResultVariant flag
   (honest = default, soft = §11.5) behind MMKV. UI tests: result reachable with no paywall,
   10 progress steps, < 45 s scripted, on iOS and Android (Android back gesture returns one step and never
   skips the result).
M4 Tab shell + Family/Profile tab (§13.8): Today / Growth / Plan / Family tabs (teen: Profile),
   child profiles, units, growth reference switch, disclaimer, methods & sources, export JSON,
   delete all data (destructive alert).
M5 Subscriptions + paywall: RevenueCat setup for both stores (products, entitlements pro/multi_child,
   offering per §5.6: weekly + annual, two annual products on iOS / explicit trial offer on Play, trial-end reminder),
   EntitlementService + mock, paywall per §13.6 (layout, close X top-right, "Your growth plan is
   ready") + rules §11.6 + copy §12.5 (scrolling bubble background from testimonials.json with consent
   gate and Q&A placeholder, sticky footer, Annual preselected, billed amount most prominent, runtime
   "Save N%" vs Weekly, opt-in trial toggle, plan-specific renewal text), success/plan-setup screen
   (bedtime + reminder switch), legal text §6.4,
   restore, manage subscription (iOS sheet / Play subscriptions URL), refund request (iOS API /
   Android help link), lapsed = read-only. Tested with StoreKit config + Play license testers.
M6 Pro tracking: measurement logging + list, monthly check-in with updated prediction and
   percentile trend, growth chart (victory-native/Skia, percentile bands, child line, predicted-height
   rule, summary label + table view), prediction history, growth-spurt/velocity alerts, multiple
   children with entitlement limits.
M7 PDF report: per §5.5 (expo-print HTML + SVG chart), on demand from child detail, share sheet,
   Letter/A4 by locale, test that a PDF with N pages is produced on both platforms.
M8 Program (§12): daily plan by age band/sex (activity incl. stretches/posture, sleep routine, meals),
   daily checklist with streaks + automatic weekly rest day, weekly Growth Habits Score, weekly grocery list,
   week-1 plan, puberty guide. Bundled JSON/Markdown under packages/content/; §4.6-voice, sourced
   placeholder copy with every paragraph needing expert review marked "<!-- REVIEW -->".
M9 Retention + polish: NotificationScheduler per §12.4 (permission only after first value; bedtime,
   morning plan, day 1/3/7/30 touchpoints, monthly check-in, quiet hours), milestone share cards,
   AnalyticsService (no-op default, events per §7, no PII), requestReview rules, accessibility pass
   (iOS AX5 / Android 200% font, VoiceOver + TalkBack, Reduce Motion for transitions/confetti/bubbles/count-up),
   Android notification channels + POST_NOTIFICATIONS, dark mode, empty/error states, App Review
   notes in REVIEW_NOTES.md and Play declarations draft (§6.2b) in PLAY_DECLARATIONS.md.
M10 Release prep: screenshot-ready demo data mode (debug only) for both stores' screenshot sizes,
    EAS Submit config for App Store Connect + Play internal track, README with build/run/test
    steps, checklist of everything I must do manually (App Store Connect + Play Console products and
    prices, RevenueCat project + API keys, Play declarations and closed test (§6.2b),
    privacy policy URL, icon, real consented testimonials for testimonials.json, pediatric review of
    program and guide content).

Start with M1.
```

---

## 9. Research-driven changes (Oct 16, 2026)

Raw data: `/workspace/rv/` (`ios_all.json`, `play_all.json`, `tiktok_videos.json`, `ttmeta/`). The previous brief is in `rv/height-app-brief.backup.md`.

### 9.1 What the reviews say
**Sources**
- App Store: iTunes RSS, 10 pages × 10 countries (US, GB, CA, AU, IN, PH, NZ, IE, ZA, SG) for 7 apps. 934 unique reviews. 721 are US; the other countries return few.
- Google Play: `google-play-scraper`, US + IN, filtered to 1★, 2★ and 5★, up to 150 per star per app, 11 apps. Play returns the same global review pool for both countries, so the data is deduplicated by review ID.
- Themes are keyword-matched, so one review can count toward several themes.

| App (store) | 1–2★ | Pay to see result | "Scam"/deceptive | Charges, cancel, refund | Too many questions | Inaccurate |
|---|---|---|---|---|---|---|
| Taller (iOS) | 200 | 164 | 38 | 12 | 13 | 7 |
| Taller (Play) | 300 | 110 | 8 | 4 | 7 | 3 |
| GoTall (iOS) | 119 | 102 | 30 | 14 | 20 | 7 |
| GoTall (Play) | 169 | 102 | 14 | 10 | 13 | 5 |
| Grow (Play / iOS) | 60 / 6 | 14 / 6 | 2 / 0 | 2 / 0 | 0 | 0 |
| Taller AI (iOS / Play) | 43 / 28 | 29 / 6 | 9 / 1 | 4 / 1 | 1 / 0 | 2 / 1 |
| TallMate (Play) | 32 | 17 | 6 | 0 | 2 | 0 |
| Tallex (Play) | 24 | 6 | 0 | 0 | 0 | 0 |
| Hite / GoTaller / Height Prediction (Play) | 16 / 10 / 9 | 2 / 5 / 0 | 1 / 1 / 1 | 0 | 0 | 0 |
| Tallmax / TallUp / Height Predictor Calc. (iOS) | 8 / 6 / 8 | 4 / 5 / 0 | 1 / 1 / 0 | 1 / 0 / 0 | 1 / 1 / 0 | 0 / 0 / 3 |

Height Predictor Calculator ($1.99, no paywall) collects complaints about accuracy, not about money.

**Trial traps, quoted verbatim:**
- GoTall iOS, 2026-02-01: "got a 7 day supposedly free trial which i then canceled cause i got it by accident, i was then charged 50 dollars with no refund"
- Taller AI iOS, 2026-06-17: "if you forget to cancel the free trial they charge you for a whole year. So that's 55 dollars down the drain"
- Taller iOS, 2025-08-03: "They stole 20$ from me on a free trial when they said it would auto cancel"

**Price pain:**
- Taller PH, 2025-01-11: "the weekly payment is too high in my country. 300 pesos is a lot, especially since I'm just a student"
- Taller Play, 2025-04-26: "5$ weekly is too much and lock 95% of the stuff you need to see"

**Feature requests** (verbatim; there are few):
- "please add some free features so the people who can't afford it can still grow" (Taller Play, 2★)
- "they should also add a free virsion of this which might have a bit less features" (Taller Play, 2★)
- "please add a list of ingredients you need per week rather than just showing a bunch of random foods" (Taller iOS, 4★)
- "it would be nicer if it was free" (Taller Play, 1★)

**What 4–5★ reviews praise:** keyword hits across 1,571 positive reviews, most of which are short ("good app"):
- The prediction itself: 38
- Claims of having grown: 22
- Ease and design: 16
- Exercises: 14
- Tracking and progress: 7
- Sleep and motivation: 4 each

**The users are teens, not parents.** Only 1 of 1,571 positive reviews and 2 of the 1–2★ reviews mention "my son/daughter/kid/child". Many reviewers say they are minors or students.

### 9.2 TikTok findings
**Data sources**
- **Video metadata:** `yt-dlp` on 112 niche videos, collected from Toklytics tag pages (#heightmax, #heightmaxx, #growtaller, #heightmaxxing, #heightgrowth, #howtogrowtaller) and from SGE, Winning Posts and Substack write-ups. Views, likes and comments are as of Oct 16, 2026.
- **Not accessible:**
  - tiktok.com tag pages (stats are loaded by JavaScript).
  - Creative Center and the Ad Library.
  - Account-level follower counts (yt-dlp needs a channel ID).
  - **Comments.** yt-dlp returned 0 comments for every video. Comment patterns below come from founder interviews and write-ups.

**Top formats and hooks** (URLs as returned by yt-dlp)

| # | Format / hook | Example (views · likes · comments) | Notes |
|---|---|---|---|
| 1 | "How tall are you?" street or face-to-camera question (app-owned account) | tallup_app https://www.tiktok.com/@tallup_app/video/7618081236602359053 (6.4M · 84.5K · 1,676); also /7625762460112342286 (1.1M) and /7632816567683779853 (462K) | TallUp repeats it. Comments get answered with heights |
| 2 | Street experiment, "how old / how tall do you think I am?" | Taller, 4.3M (Winning Posts, 2026-06-01; no URL given) | Works as a curiosity gap |
| 3 | Very tall creator showing off "aura" | beck13213 /video/7599716982333754646 (4.4M · 227K); promo video /7431251311783349526 "Download the @Taller app" (392K) | Paid micro-influencer (SGE) |
| 4 | Spanish-language "grow in a month" routine with an app tag | marcelosarango /video/7437992576025644344 (4.3M · 278K · 1,938) | Taller-sponsored |
| 5 | Exercise tutorial (Maasai jumps, stretching, yoga) | adixovic /video/7609733959601229078 (4.0M · 218K); pulseedge_fitness /video/7448576428620156190 (3.5M) | Not app-owned. Shows demand for "how" content |
| 6 | Reaction or review of a supplement (Philippines) | ginoroqueiv /video/7522802519240674567 (4.8M) | Supplement-driven, avoid |
| 7 | Fear or "you're cooked" bait | tallup_app /video/7600608304263335181 "If you under 6ft and u have hair in this places u cooked bro" (2.5M · 3,190 comments) | High engagement but toxic. Avoid |
| 8 | "Educational" with a study link | skintelligent1 /video/7377489588501138721 (2.4M · 151K), links an NCBI article | **Shows that citing science travels** |
| 9 | Comment bait from a creator account named after the app | ricky.taller1 /video/7626172623944273159 (2.2M · 84K · **13,500 comments**) | Highest comment ratio in the set |
| 10 | "COMMENT your current height!" | meimonte1 /video/7654707944017186062 (618K · 682 comments) | Explicit call to comment |
| 11 | Height-difference satire | dapeak333 /video/7666122534177721621 (649K) | Meme |
| 12 | Reply-to-comment height prediction ("age, height, parents' heights") | GoTall founder's breakout format (Starter Story / GTM Sauce, 2026-07-19) | The format credited with driving downloads |
| 13 | Silent selfie with 2–3 lines of on-screen text; a creator account named after the app | @gotallkae: 14 videos, 2.43M total; "short mom is the biggest nerf" 614K, "late bloomers end up over 6 ft" 677K (X post @Xxxmaxxingxxx, 2026-10-15) | Cheap to make at scale |
| 14 | Four-image tip slideshow | @levelup.club_posts, 3.8M (SGE, 2026-03-30) | GoTall |
| 15 | AI or anime story slideshows | @tallerapp 5.2M over 47 videos; @tall.maxxer 2.2M over 87 (SGE thread) | Taller |
| 16 | "Height stats for 15 year olds" | heightlab.app /video/7661786001425173791 (33K) | Data format |
| 17 | **Parent-facing:** "3 Natural foods for height increase in kids" | littlebiteofficial /video/7640937628543487265 (463K · 11.8K) | **The only parent-facing hit in the set.** Nutrition framing |
| 18 | Shoe lifts and insoles from TikTok Shop | leodagoat_official (156K) | Commerce noise |

**What drives downloads:**
- Only founder statements give evidence: format #12 plus cheap UGC (about $5 per video), then paid ads behind proven organic videos.
- I found no view-to-download data for the other formats.

**What commenters ask for:** their age, current height and parents' heights, wanting a prediction. This is what the GoTall founder describes. Taller's "5'3 at 13" video drew about 8,000 comments of people sharing heights (Winning Posts).

### 9.3 Product changes

**Keep**
- Free result.
- Showing the method.
- Ranges.

**Add**
- **Comment-reply mode** (free): enter "age, height, mom, dad" and get a result card in under 10 seconds. This lets us make format #12 videos at scale, with no child profile saved.
- **Shareable result card** (9:16 and 1:1):
  - Big predicted range, for example "171–181 cm · 5′7″–5′11″".
  - Method chip, plus "Mid-parental: (dad + mom + 13) / 2" shown on the card.
  - Percentile today.
  - Small "estimate, not a guarantee" line and the app name and URL.
  - No full name or date of birth.
  - Optional "late bloomer?" note when the child is early in puberty age.
  - Designed so a face-cam creator can screen-record it.
- **Prediction history** (P8) and **velocity / growth-spurt alerts** (P9). These are the recurring value behind the subscription.
- **Weekly habit checklist with a printable weekly grocery list.** This answers the 4★ request for a weekly ingredient list.
- **Teen to parent hand-off.** Teens are the real audience. If the user indicates they are under 18, show "Share this with a parent" on the result. Paid features require the parent to buy (Ask to Buy / Family Sharing on iOS, Google Family Link purchase approvals on Android cover this). Marketing targets parents and teens 13+ per §4.6 (updated Oct 16; was parents only).

**Cut or keep out**
- Height-increase workouts (exercise videos are popular but would break §1 non-goals and guideline 1.4.1).
- Supplements.
- AI "scores".
- Any "% of growth complete" claim we can't source.

**Onboarding** (superseded by §11.3)
- ~~3 input screens, unchanged.~~ Now 5–7 short input screens with one control each, auto-advance where possible, < 45 s total (§11.3).
- Still only the questions the formula needs before the result (6 inputs) plus two optional, fast ones (puberty signs, main goal). "Too many questions" accounts for 13–20 complaints for each of the leading apps.
- No paywall, account or trial prompt before the result.

**Paywall and pricing** (subscription; this replaces the lifetime unlock)
- **Competitor prices** (US App Store IAP list, fetched Oct 16, 2026):
  - GoTall: weekly $1.99–$5.99; yearly $9.99, $34.99 and $59.99.
  - Taller AI: weekly $5.99–$9.99 (with trials); yearly $39.99–$99.99, with 3-day trials.
  - Taller: weekly $4.99–$5.99; yearly $19.99–$39.99; lifetime $14.99–$39.99.
- **Ours (updated Oct 16, 2026; supersedes the monthly/yearly plan):**
  - Annual (Family) $39.99/year, unlimited children, ≈ $0.77/week. Default and highlighted.
  - Weekly $4.99/week, up to 2 children. No trial.
  - Optional 7-day trial on Annual only. It is opt-in, appears as a separate toggle, its terms are in the CTA text, and the app sends a local reminder 2 days before it converts. This addresses the trial-trap complaints quoted above.
  - Cancel and refund are each one tap.
  - Rationale and product IDs: §5.6. Weekly is mid-market; Annual is mid-market and equals 8 weeks of Weekly, so it is clearly the better deal.
  - Localize lower tiers for IN and PH (price pain quoted above).
- **Why it's worth paying for, week after week:**
  - Check-in reminders.
  - An updated prediction after each measurement.
  - Prediction history.
  - Growth-spurt and velocity flags.
  - A pediatrician PDF that improves as data builds up.
  - Habit plans with weekly lists.
  - Multiple children.
- **Lapsed subscription:** data stays readable (unchanged).

### 9.4 Launch content plan: 10 videos
Parent creators lead, plus one founder face-cam account. No teen-targeted body shaming.
1. **Reply-to-comment:** "Dad 180, mom 165, he's 12 and 150 cm," then the result card on screen, plus the formula.
2. **"I tried 3 height apps":** 40 questions and a $35 paywall in the others, versus a free answer in 30 seconds with ours. Show the competitor's paywall screen, but don't name the app.
3. **"The formula doctors use":** mid-parental height worked out on a whiteboard, about 30 seconds.
4. **"Why your height prediction is a range, not a number":** honesty as the hook. This follows the success of the study-citing video (#8).
5. **Parent:** "My son asked how tall he'll be, so we measured him properly." Shows how to measure.
6. **Late bloomers:** what the data says about puberty timing (sourced), with the result card.
7. **"Short mom, tall dad — what happens?":** worked examples. A softer version of the 614K-view hook.
8. **Nutrition for growing kids:** a weekly grocery list (the format behind the 463K-view parent video), framed as "supports healthy growth".
9. **Pediatrician PDF reveal:** "what to bring to your child's checkup".
10. **Stitch or duet** of a viral "how tall will I be" video: "Here's the honest answer," using the creator's numbers if they posted them.

Every video ends with "an estimate, not a guarantee" and the free calculator URL (§10).

---

## 10. Website

**Competitor baseline:** gotall.app is a thin landing page ("Track & Predict Your Height", "Built on Science. Informed by Data.") with no pricing, no method and no calculator.

**Our site (static, for example Astro or plain HTML on Cloudflare Pages)**
- **`/` (home):**
  - Hero: "How tall will you grow? Free, instant, real science."
  - Embedded calculator above the fold.
  - App Store and Google Play buttons sit below the result, never in front of it.
- **`/height-predictor`:** the free web calculator, our main SEO page.
  - **Inputs:** sex, age, height, mom's height, dad's height.
  - **Output:** mid-parental range, Khamis–Roche (the bundled coefficients are verified; add a weight input on the web page for KR) and a percentile projection, with the same range and caveat UI as the app.
  - **Implementation:** client-side TypeScript importing `packages/engine` (the same code as the app), no data sent anywhere.
  - **SEO:** schema.org `WebApplication` + `FAQPage` markup. Target "height predictor", "how tall will my child be", "mid parental height calculator", "child height calculator" (Google Trends shows "height predictor" steady to rising in 2026, see the earlier research).
- **`/method`:**
  - Every formula and its citation.
  - The accuracy section quotes only published error ranges (for example ±8.5 cm, about 2 SD, for mid-parental per Tanner 1970; the KR paper's bounds once transcribed).
  - What each method can't do.
- **`/pricing`:** shown on the site in full:
  - Free: the prediction, forever.
  - $39.99/year Annual (Family, unlimited children), with the optional 7-day trial explained word for word.
  - $4.99/week Weekly (up to 2 children), renews weekly.
  - How to cancel, in one sentence with a screenshot.
- **`/privacy`** (plain language, "data stays on your phone"), **`/support`**, **`/terms`**.
- **Optional:** `/guides/*`, sourced articles such as "how to measure your child's height" and "growth spurts by age". Each carries the disclaimer.
- **Share-card landing:** `/r?h=171-181&u=cm` re-renders a shared range so TikTok viewers who tap the link land on the calculator. The link carries no personal data.
- **Analytics:** privacy-first (for example Plausible), page views only.

---

## 11. GoTall teardown: copy vs cut (Oct 16, 2026)

Source: Utku's screen recording of GoTall (TR locale). Utku loved the paywall and wants it emulated. He thinks our onboarding should be short; GoTall's is far too long.

### 11.1 What GoTall does
- **36 screens, 1:34 to the paywall.** Sequence: Who are you (Teen/Parent) → birth date picker → gender → height (vertical slider) → weight slider → shoe size → why you downloaded (multi-select) → sports (auto-advance) → exercise hrs/week → sleep hrs → parents' heights (2 sliders) → relatives taller than dad → race → info "Your child's growth spurt matters" → **8 separate puberty screens** (underarm hair, facial hair, growth last year, broader shoulders, body odor, acne, muscle definition, voice deepened) → still growing slower → hype screens ("World's Best Height Prediction Model" neural-net animation, "98.7% Accuracy" counter with CDC/Stanford/NIH logos, habits chart, "Your Child Can Grow Taller" 20% gauge, potential hexagons, support icons, sleep tracking, daily exercises) → **notification permission mid-flow** → Expert Opinions cards → Real Results reviews with "+cm" badges → goal height slider → 10-second loader "Your Child Is More Than Their Genes".
- **Teaser result:** "Your results are in! It turns out... You're not growing at your potential. Let's fix that!", confetti, a dashboard of the entered data next to a padlocked predicted height, blurred "What's Holding You Back: 2 issues found", locked growth curve, "Dream Odds: [lock]%", CTA "See My Potential >".
- **Paywall:** endlessly scrolling iMessage-bubble testimonials in the background; sticky bottom sheet; small grey X visible immediately; headline "Your height prediction is ready" + green "Choose your plan to unlock it"; green countdown 2:59:59; Yearly preselected at ₺28,84/week with a "1800 people joined today" badge; decoy Weekly ₺249,99/week; no trial; big green CTA "Start my journey today"; small grey "Billed as ₺1.499,99 per year".
- **What they sell:** a subscription to an ongoing program (daily exercises, sleep tracking and bedtime advice, habit building, tracker), not a one-off report. Our answer is §12.

### 11.2 Copy vs cut
| GoTall element | Verdict | Our version |
|---|---|---|
| Teen / Parent fork on screen 1 | **Copy** | Step 1 after the welcome screen (auto-advance rows, §13.5); both paths kept. Teen path ends with "Show a Parent" (§11.3). |
| Big vertical/horizontal ruler sliders | **Replaced (prototype v2)** | Large numeric fields with decimal keypad + unit segmented controls, inline validation; month/year wheel for birth date (§13.4). |
| Auto-advance on single choice | **Copy** | Role, sex, sleep, main goal: checkmark row, advance 0.35 s after tap. |
| 8 separate puberty screens | **Merge** | One multi-select "Which have you noticed?", only for relevant ages. |
| Shoe size, race, relatives taller than dad, sports, exercise hrs, sleep hrs, why downloaded | **Cut** from pre-result onboarding, **except sleep** | Shoe size/relatives: cut forever (not in any published method). Race: cut; the KR population caveat is shown to everyone. **Sleep: kept pre-result as one auto-advance question (step 8, prototype v2)**; it personalizes the plan and bedtime only, never the prediction. Sports/exercise: asked inside the paid plan setup (§11.3 "Personalize your plan"). |
| Info screen "growth spurt matters" | **Merge** | Becomes the one-line header of the puberty screen. |
| Neural-net "World's Best Model" + "98.7% Accuracy" + CDC/Stanford/NIH logos | **Cut** | One authority screen with true claims only: method, citation, published ± range, no logos (§11.8). |
| Habits chart, "Can Grow Taller 20%" gauge, potential hexagons | **Cut** | Unsourced numbers. The program's value is shown on the locked cards and paywall bullets instead. |
| Support/sleep/exercise feature tour | **Move** | Locked cards on the result + paywall bullets. |
| Notification prompt mid-flow | **Cut / move** | Asked after first value, when the user turns on reminders (§12.4). |
| Expert Opinions cards | **Cut until real** | Only if a named, real pediatric reviewer has reviewed our content and consented. Then "Content reviewed by [name, credential]". |
| Real Results reviews with "+cm" badges | **Cut** | Never show cm gains. Consented testimonials about the app experience only (§11.7). |
| Goal height slider | **Cut** | Implies the user can pick an outcome. |
| 10 s loader "More than their genes" | **Shorten** | 3 s labour-illusion loader with real steps (§13.5). |
| Teaser dashboard + confetti | **Copy, adapted** | Confetti + dashboard, but the **predicted height and range are free and visible**; the locks are on paid extras (§11.4). |
| "You're not growing at your potential" / "2 issues found" / "Dream Odds" | **Cut** | Negative or fake findings. Positive, true framing instead ("Here's your plan to reach it!"). |
| Scrolling iMessage testimonial background | **Copy, ethically** | Real, consented testimonials only; Q&A placeholder bubbles until then (§11.7). |
| Sticky bottom-sheet checkout + small X from frame 1 | **Copy, StoreKit-style** | X **top-right** (StoreKit convention), 44×44 pt; §13.6. |
| Clear headline + green sub-line | **Copy, adapted** | "Your growth plan is ready" + tint sub-line "Your prediction is free. Now make the most of their growth years!" (§13.6). |
| Yearly preselected | **Copy** | Annual preselected and highlighted. |
| Per-week price as the big number, annual total in small grey | **Fix** | Billed amount ($39.99/year) is the most prominent price; ≈ $0.77/week sits beside it, smaller (Apple's billing-amount guidance, 3.1.2; Play subscriptions policy). "Billed $39.99 per year" sits under the CTA at the same size as the breakdown, not small grey. |
| Weekly plan used as a decoy (₺249,99/week) | **Keep Weekly, but make it real** | Weekly $4.99 (up to 2 children) is a genuine, mid-market plan for people who want to try a week; Annual $39.99 is clearly better (8 weeks' price). No monthly. |
| "1800 people joined today" badge | **Cut** | "Best value · Save 84%", computed from the real weekly and annual prices. |
| Green 2:59:59 countdown | **Cut** | A genuine launch offer with a fixed, real end date is allowed (§11.6). |
| No trial | **Keep ours** | Opt-in 7-day trial on Annual with a reminder 2 days before it converts. |
| CTA "Start my journey today" | **Copy, adapted** | "Start My Growth Plan · $39.99/year" (§13.6). |

### 11.3 New onboarding: exact screen list (as built in prototype v2; target < 45 s)
Required for Khamis–Roche: **age (birth date), sex, height, weight, mother's and father's height.** Weight is optional (skip → mid-parental only); one parent may be "Don't know" (§13.4). Everything else is optional or comes after the result. Controls and validation: §13.4. Screenshots: §13.7.

| # | Screen | Input / control | Required? | Parent copy | Teen copy | ~Time |
|---|---|---|---|---|---|---|
| 0 | Welcome | "Get Started" | — | "How tall will you grow?" + "Find out free in about 40 seconds…" | same | 2 s |
| 1 | Who's checking today? | Checkmark rows, auto-advance | Yes (routing only) | [I'm a parent · Checking for my child] | [I'm a teen · Checking how tall I might grow] | 2 s |
| 2 | Sex at birth | Boy / Girl rows, auto-advance | **KR + MPH** | "Is your child a boy or a girl?" Helper: "Growth formulas use sex at birth." | "Are you a boy or a girl?" | 2 s |
| 3 | Birth date | Inline month + year wheel (must be touched) + "Enter date with keyboard instead" | **KR (age)** | "When were they born?" Helper: "Month and year are enough." | "When were you born?" | 5 s |
| 4 | Height | cm \| ft / in + large numeric field(s) | **KR** | "How tall are they right now?" Helper: "Measure without shoes, back against a wall." | "How tall are you right now?" | 5 s |
| 5 | Weight | kg \| lb + numeric field, **Skip** with accuracy note | **KR** (skip → KR off, labelled fallback) | "What do they weigh?" Helper: "Optional. Used only by the Khamis–Roche formula…" | "What do you weigh?" | 4 s |
| 6 | Parents' heights | Two labelled fields on one screen, "Don't know" (max one) | **KR + MPH** (one unknown → population average + range widened 3.5 cm each side, labelled; ⚠️ product review) | "How tall are their parents?" Helper: "Biological parents. A best guess is fine; measured is better." | "How tall are your parents?" | 7 s |
| 7 | Which have you noticed? | Multi-select checkmark rows + exclusive "None yet" / "Not sure" | Optional; **shown only for girls 8–15 and boys 9–16** | Helper: "Growth spurts matter. Select all that apply. This adds context; it doesn't change the formula." | Same | 5 s |
| 8 | Sleep | Checkmark rows, auto-advance | Optional (plan only) | "How much do they usually sleep?" Helper: "On a typical school night." < 7 h · 7–8 h · 8–9 h · 9 h+ | "How much do you usually sleep?" | 2 s |
| 9 | Main goal | Checkmark rows, auto-advance | Optional | "What matters most?" Find out their adult height · Help them reach their full height · Track growth over time · Check growth is on track | Same, "my" | 2 s |
| 10 | How this works | Authority screen, button "See My Result" | — | §11.8 | §11.8 | 4 s |
| — | Loader (3 s) | Real steps ticking: "Checking age and growth data · Running Khamis–Roche · Comparing with mid-parental height · Building the likely range" | — | "Calculating…" | same | 3 s |
| — | **Result** | §11.4 / §13.7 | — | "Your Result · Your results are in! 🎉" | same | — |
| — | *Teen only:* Show a Parent | "Show a Parent" row on the result → share sheet with the 9:16 card + "Send to a Parent"; paywall offers "Ask a Parent to Unlock" (Ask to Buy / Family Link approves the purchase) | — | — | "They can unlock your growth plan with you" | 3 s |

Total ≈ 43 s for a parent with all screens; 9 progress steps when the puberty screen is gated out. Teen path: if the birth date gives age < 13, the parent hand-off becomes mandatory and the copy switches to "Ask a parent to finish setting this up" (§6.2b).

**Puberty options** (checkmark rows, §13.4): both sexes: Grew a lot in the last year · Body odor · Underarm hair · Acne. Boys add: Voice deepening · Facial hair · Broader shoulders. Girls add: Breast development · First period. Answers stay on the device, never feed the KR number (the method sheet says so), and drive (a) a context line on the result ("Early in puberty: most of the growth spurt is likely still ahead" / "Most growing may already be done"), and (b) the paid growth-spurt timing card. Wording <!-- REVIEW --> by a pediatric professional.

**After the result, optional**
- **"Improve accuracy"** (only things that change the numbers): confirm parents' heights were measured, not guessed (flag stored; self-reported heights tend to be overstated); exact birth date; re-measure height properly (morning, no shoes, back to the wall); add a second measurement in 3+ months (unlocks velocity, Pro); v2: bone age from a pediatrician.
- **"Personalize your plan"** (Pro setup; these change the plan, not the prediction, and are labelled that way): usual bedtime and wake time; sports/activity days per week; current sleep hours; diet notes (vegetarian, dairy-free, allergies); reminder times.
- **Never asked:** shoe size, race, relatives' heights beyond parents, goal height.

### 11.4 Teaser result (free core, locked extras)
- Confetti burst on reveal, identical for every result. Headline "Your results are in! 🎉".
- **Free and fully visible:** predicted adult height, likely range, the METHODS rows, today's percentile, the inputs used (tap to edit), the puberty context line, caveat card.
- **Locked Pro rows** (padlock; we never blur fake findings about the child): Growth curve & trend (incl. updated predictions / history) · Personalized growth plan · Growth-spurt timing · Pediatrician-ready PDF (§13.7 row 13).
- Below the rows: a positive bridge line, "Now let's help them reach it!" / teen: "Now let's help you reach it!", then the pinned CTA **"Get My Growth Plan"**.
- Free users get **one free "Today's plan" preview** (3 checklist items for today) so they taste the program before paying.

### 11.5 Free core vs. GoTall's locked number: the tradeoff, and an optional "soft" A/B
GoTall locks the predicted height itself. That likely converts better in the short run: the paywall arrives at the peak of curiosity. We don't copy it, because:
- "Pay to see the result" is the #1 complaint in competitor reviews (§9.1: 102–164 per leading app) and leads to "scam" 1★ reviews, which hurt ranking and conversion later.
- "Free prediction" is our brand promise across the store screenshots, the TikTok hooks, the web calculator and the §10 pricing page. Locking it would contradict all of them.
- A locked number after 40 seconds of questions is the bait pattern App Review and Play reviewers look for.
- Our paywall sells the ongoing program (§12), which is what GoTall really sells anyway.

**Variant A (default, "honest"):** result fully visible; the paywall opens only when the user taps a locked card or the CTA.

**Variant B (optional test, "soft"):** same free result, but after the confetti (~1.5 s) the paywall sheet auto-presents once per install at a medium detent, so the predicted height stays visible above it; X visible immediately; dismissing returns to the full result. Expected: higher paywall views and some conversion lift. Risks: users skimming may read it as "paywall after the quiz", more "paywall" 1★ reviews, more refunds. Guardrails: run at 50/50 for ≥ 2 weeks with ≥ 1,000 results per arm; stop B if its 1–2★ reviews mentioning pay/paywall/scam, its refund rate, or its D7 retention is meaningfully worse than A's, even if conversion is up.

**Not allowed in any variant:** hiding the predicted height or range behind payment.

### 11.6 Paywall spec (emulating GoTall's layout)
Layout and components: **§13.6** (as built in prototype v2). Copy: §12.5. Rules:
- Full-screen cover; scrolling bubble background; sticky bottom sheet; small grey X **top-right** from frame 1 (44×44 pt / 48 dp target, ≥ 3:1 contrast; Android back also closes).
- Annual preselected and highlighted. On each plan card the **billed amount is the biggest price text** ($39.99/year, $4.99/week); Annual's "≈ $0.77/week" sits beside it in smaller text. Under the CTA, at the same size as the breakdown text, a renewal line for the selected plan: "Billed $39.99 per year. Renews every year until you cancel." or "Billed $4.99 every week. Renews every week until you cancel." All amounts come from the store at runtime.
- Badge: "Best value · Save 84%", computed from the two real store prices as 1 − annual ÷ (weekly × 52), floored; hidden if not computable (e.g. a localized tier makes it odd).
- Weekly is the only alternative and is a real plan, not a decoy. No monthly.
- Opt-in 7-day trial toggle on Annual only (implementation per store: §5.6).
- **Genuine launch offer (optional):** e.g. a first-year intro price on Annual ("Launch price $29.99 for your first year, then $39.99/year") configured as an App Store introductory offer / Play offer, with a **fixed end date shown as a date** ("Launch price ends Nov 30"). A countdown is allowed only in the final 48 h, only if it counts to that same real end date for every user, and it disappears when the offer ends. Never per-session, never resetting. Because iOS allows one intro offer per product, the launch price goes on `app.family.annual` (the trial stays on `app.family.annual.trial`); the billed amount rules apply to the intro price too.
- No confetti, no "people joined today", no fake scarcity.
- Footer: Restore Purchases · Terms of Use · Privacy Policy (Manage Subscription is in the Family/Profile tab); auto-renew disclosure (§6.4) via Terms and the store sheet, with the plan-specific renewal line always under the CTA.

### 11.7 Testimonials policy (bubble background)
- Source: `assets/testimonials.json`, entries `{ id, text, attribution ("Maria, mom of 2" or "Alex, 15"), source ("TestFlight" | "support email" | "App Store review"), consentDate, consentEvidence, approved: boolean }`. Teens' quotes need parental consent.
- The app shows only entries with `approved && consentDate`. A CI check fails a release build if any shown entry lacks consent fields.
- **Content rules:** about the app experience ("Finally an app that just told me the number!", "The bedtime reminders actually work"). No cm/inch gains, no "I grew…", no medical outcomes, no edited quotes beyond trimming.
- **Placeholder until we have 12+ real ones** (shown with the pill "Sample messages · not real reviews", §13.6; the prototype's "Sample quote" bubbles must not ship): Q&A bubbles that are clearly not testimonials, styled as a chat between "You" and "APP_NAME": "Is the prediction free?" → "Yes, always!" · "Which formula?" → "Khamis–Roche, plus mid-parental height." · "Can I cancel?" → "One tap in Settings." · "Does it work for girls and boys?" → "Yes, with separate formulas." · "Is my data uploaded?" → "No, it stays on your phone."
- Collect real ones from TestFlight / Play closed-test parents and teens with a consent form.

### 11.8 Authority screen (screen 9), true claims only
- Title: "Built on real pediatric research". Helper: "Published methods, shown openly. No AI guesswork, no made-up accuracy scores." (`L-08-method`)
- Body as an inset list (prototype v2): **Khamis–Roche method** · "Pediatrics, 1994 · Fels Longitudinal Study"; **Mid-parental height** · "Tanner, 1970 · genetics only"; **Typical accuracy** · "Within about ±5 cm (boys) / ±4 cm (girls), 9 times out of 10"; "See the formulas" → method sheet. Button: "See My Result".
- Footer: "An estimate, not a diagnosis. Not affiliated with or endorsed by any health agency." (Production adds: "Percentiles use CDC 2000 and WHO 2007 growth reference data.")
- No neural-net animation, no "AI", no logos, no accuracy percentage.
- The ± figures are the average 90% error bounds (±5.3 cm boys, ±4.3 cm girls) from `khamis_roche.json` (via secondary sources); re-check against the paper before launch.

### 11.9 Metrics to beat GoTall's funnel
- Time to result: median < 45 s (GoTall: 1:34 to a paywall, without a visible result).
- Onboarding completion (screen 1 → result): ≥ 80%.
- Result → paywall view: ≥ 40% (Variant A).
- Paywall view → purchase or trial start: track per variant and per trigger (locked card vs CTA).
- 1–2★ review share mentioning pay/paywall/scam: < 5% of reviews.

---

## 12. Subscription value & retention loop (Oct 16, 2026)

GoTall sells a subscription to an ongoing program, not a one-off report. So do we: **the prediction is free; the subscription is "Your child's personalized growth plan"** (on the paywall it is headlined "Your growth plan is ready", §13.6), a daily/weekly program plus tracking that gets better as the child grows. Copy follows §4.6: aspirational ("reach your full height", "maximize your growth years"), never a guaranteed number of cm.

### 12.1 Honest framing (shown once in plan setup and in the method sheet)
"Height is mostly set by genetics. Sleep, nutrition and activity help a growing body reach its full genetic potential. No plan can promise extra cm, but the growth years are when habits matter most!"

### 12.2 The program
| Component | What the user gets | Cadence | MVP / v2 | Source guidance (verify before ship, <!-- REVIEW -->) |
|---|---|---|---|---|
| **Daily plan** | 3–5 items/day picked for age band and sex: activity, stretches/posture, sleep, food | Daily | **MVP** | WHO 2020 activity guideline for 5–17 y (avg 60 min/day moderate-to-vigorous; bone- and muscle-strengthening 3 days/week) |
| **Activity, stretches and posture** | 5–10 min follow-along routines (illustrated, no video in v1): jumping/skipping (bone loading), core and back, posture checks, mobility. Framed as fitness and posture, never "stretch to get taller" | Daily | **MVP** (illustrations); video v2 | WHO; AAP sports/fitness guidance |
| **Sleep routine + bedtime reminders** | Target sleep window by age, a wind-down reminder 30 min before bedtime, a morning "did you hit your sleep?" one-tap check | Daily | **MVP** | AASM/AAP: 9–12 h (6–12 y), 8–10 h (13–18 y) |
| **Nutrition** | Daily meal idea focused on protein, calcium and vitamin D; **weekly grocery list** grouped by aisle, shareable/printable; diet filters (vegetarian, dairy-free) | Daily / weekly | **MVP** | NIH ODS: calcium 1,000 mg (4–8 y), 1,300 mg (9–18 y); vitamin D 600 IU; protein DRI ~0.95 g/kg (4–13 y), ~0.85 g/kg (14–18 y) |
| **Daily habit checklist + streaks** | One tap per item; streak = days with ≥ 3 items done; automatic weekly rest day | Daily | **MVP** | — |
| **Weekly Growth Habits Score** | 0–100 of last 7 days: sleep 35%, activity 30%, nutrition 25%, checklist consistency 10%. Labelled "Growth Habits Score: how well you did on the habits that support growth", never a height prediction | Weekly (Sunday) | **MVP** | — |
| **Monthly measurement check-in** | Reminder → log in ≤ 3 taps → **updated prediction** + change vs last time + **percentile trend** chart | Monthly (or every 3 months) | **MVP** | CDC/WHO LMS (§5.4) |
| **Growth-spurt detection** | After ≥ 2 measurements ≥ 3 months apart: velocity in cm/yr vs typical bands; "Growth spurt detected! 🚀 Sleep and protein matter extra now." or a neutral "worth mentioning to your pediatrician" when unusually low | On each check-in | **MVP** (fires from month 3+) | Velocity references <!-- REVIEW --> |
| **Prediction history** | Sparkline of each estimate and range over time | Each check-in | **MVP** | — |
| **Milestone & progress shares** | Cards for 7/30/100-day streaks, first check-in, "grew X cm since you started" (measured growth only, no attribution to the app), prediction updated | On event | **MVP** | — |
| **Pediatrician PDF on demand** | Measurements, chart, prediction with method, habits summary | Any time | **MVP** | §5.5 |
| **Multiple children** | Weekly: up to 2; Annual: unlimited | — | **MVP** | — |
| **Parent–teen shared family view** | Parent and teen see the same child profile, checklist and check-ins on their own phones | Live | **v2** (needs sync, §12.7) | — |
| **Seasonal content** | Packs such as Summer (activity, sun and vitamin D), Back-to-school (sleep reset), Winter (vitamin D foods), Exam season (sleep) | Quarterly | **v1.1**: one bundled pack at launch; more via EAS Update or app updates | — |
| **Sleep import** | Apple Health / Health Connect sleep to auto-tick the sleep habit | Daily | **v2** | — |

### 12.3 Growth Habits Score
- Sleep: share of nights inside the age target window (from the morning one-tap check). Activity: share of days with the activity item done. Nutrition: share of days with the calcium/protein items done. Consistency: share of days with ≥ 3 items done.
- Shown with the 4 sub-bars, last week's score, and one tip for the weakest area. Never shown as a probability of height or a "potential %".

### 12.4 Retention mechanics
**Notification permission, after first value.** Never in onboarding. Ask when the user (a) leaves the "Remind me 30 min before" switch on in the post-purchase plan-setup screen ("You're in!": pick a bedtime, then "Start My Plan"; `L-15-success`, `L-16-notification-alert`), or (b) taps "Remind me to re-measure" on the result (free). The plan-setup screen explains exactly which notifications they'll get (wind-down and morning plan, at most 2 a day), then the OS prompt (Android 13+: `POST_NOTIFICATIONS`). Allow → banner "Bedtime reminder set". If denied, show in-app reminders on the home screen and a Settings link; ask again only from a user action.

**Default schedule (all local, user-editable, quiet hours 21:30–07:00 except the bedtime reminder they chose; max 2 per day):**
| When | Notification | Who |
|---|---|---|
| Daily, user's morning time (default 07:30) | Today's plan | Pro |
| Daily, 30 min before bedtime | Wind-down | Pro |
| Sunday 18:00 | Weekly Growth Habits Score | Pro |
| Monthly (or every 3 months), user's choice | Measurement check-in | Pro (free: one "re-measure" reminder at 3 months) |
| Trial users: 2 days before conversion | Trial ends reminder (§5.6) | Trial |

**Sample push lines (§4.6 voice; no guaranteed cm):**
- Morning: "Your 3 growth moves for today are ready! ☀️" · "Still growing? Make today count 💪" · "5 minutes of jumps + a calcium-packed breakfast. Let's go!"
- Bedtime: "Wind-down time 🌙 Growth hormone peaks in deep sleep, so lights out by 21:30!" · "Phone down, growth up. Bedtime in 30 min 😴"
- Streaks: "🔥 6-day streak! One more for a full week." · "Missed yesterday? Your rest day covered it. Keep the streak alive today!"
- Weekly: "Your Growth Habits Score is in: 78! Sleep was your MVP this week 🏆"
- Check-in: "Measuring day! 📏 See your updated prediction in 30 seconds." · "It's been 3 months. Time to see how much they've grown!"
- Growth spurt: "Growth spurt detected! 🚀 This is when sleep and protein matter most."
- Seasonal: "Summer = growth season ☀️ New outdoor activity pack unlocked!"
- Never: "You're falling behind", "You'll stay short", guilt after a missed day, any cm promise.

**Streak recovery:** one automatic rest day per week (applied to the first missed day); "Repair streak" by ticking yesterday's items before noon today; best streak saved forever; the weekly score never drops to zero because of one missed day.

**Week-1 plan (right after purchase):**
| Day | Focus | Ends with |
|---|---|---|
| 1 | Set bedtime + reminder times (permission ask), first 3 habits | First tick 🎉 |
| 2 | Measure properly (how-to + baseline measurement) | Baseline saved |
| 3 | Grocery list for the week | List shared/printed |
| 4 | 10-min family activity (jumping, skipping, ball games) | Activity ticked |
| 5 | Posture + mobility routine | Routine done |
| 6 | Sleep check: how did the week go? | Bedtime tweak |
| 7 | First Growth Habits Score + 7-day share card | Share prompt |

**Touchpoints:**
- **Day 1:** morning plan + bedtime reminder; in-app checklist intro.
- **Day 3:** grocery list nudge; one sourced "why it matters" tip (e.g. calcium in the growth years).
- **Day 7:** first weekly score, 7-day milestone card, review the plan ("Too easy? Too hard?").
- **Day 30:** first monthly check-in → updated prediction + percentile trend; 30-day streak card; `requestReview` only if the rules in §7 are met (2nd measurement or PDF export).
- Free users: day 1 "Today's plan" preview on the result; day 3 home card "Your plan is ready when you are"; day 90 re-measure reminder (if allowed).

### 12.5 Paywall copy (sells the program; prediction stays free)
- **Headline (both paths, prototype v2):** "Your growth plan is ready".
- **Tint sub-line:** parent "Your prediction is free. Now make the most of their growth years!" / teen "…of your growth years!"
- **Context line** when opened from a locked row: "Unlocks the growth curve" / "…the daily growth plan" / "…growth-spurt timing" / "…the pediatrician PDF".
- **"Included with Pro" rows** (icon tiles, no emoji; §13.6):
  - Daily plan for their age: sleep, food, movement
  - Habit checklist, streaks and bedtime reminders
  - Growth curve and updated predictions
  - Growth-spurt timing and pediatrician PDF
  - (Grocery lists and check-ins are part of the plan; children per plan are shown on the plan cards.)
- **Plans:** "Annual" **$39.99/year** (smaller: ≈ $0.77/week · badge "Best value · Save 84%") — preselected and highlighted; "Weekly" **$4.99/week** (up to 2 kids, renews weekly).
- **Trial toggle:** "Try 7 days free first" (Annual only, off by default).
- **CTA:** "Start My Growth Plan · $39.99/year" / "Start My Growth Plan · $4.99/week"; trial on: "Start 7-Day Free Trial", with "Free for 7 days, then $39.99 per year. We'll remind you 2 days before. Cancel at least 24 hours before the trial ends to avoid being charged." directly beneath.
- **Under CTA (per selected plan):** Annual "Billed $39.99 per year. Renews every year until you cancel. Cancel anytime in Settings." · Weekly "Billed $4.99 every week. Renews every week until you cancel. Cancel anytime in Settings."
- **Reassurance:** "Your prediction stays free. We'll never promise extra cm, just a real plan for their growth years." (teen: "your")
- **Positive urgency line (optional, true):** "Growth plates close in the mid-to-late teens. The best time to start is while you're still growing."
- **Teen path extra:** plain button "Ask a Parent to Unlock" (shares a link / triggers Ask to Buy or Family Link approval on purchase).

### 12.6 Retention metrics (starting targets; replace with real baselines after the first 1,000 installs)
| Metric | Definition | Starting target |
|---|---|---|
| D1 / D7 / D30 retention (all installs) | Opened the app on day N | 40% / 20% / 10% |
| D7 / D30 retention (subscribers) | Ticked ≥ 1 habit on day N | 70% / 50% |
| Paywall conversion | Purchase or trial start / paywall views | track per variant and trigger |
| Trial start rate | Trials / Annual purchases | track |
| Trial-to-paid | Trials converting at day 7 | ≥ 40% (opt-in trials should convert well) |
| Weekly-plan churn | Weekly subscribers cancelled or lapsed within 4 weeks / started | track; expect high, aim for upgrades to Annual |
| Monthly churn (all subscribers) | Cancelled or lapsed in month / active at start | ≤ 12% after month 3 |
| Weekly → Annual upgrades | Weekly subs who switch to Annual within 8 weeks | ≥ 15% (offer an in-app "switch to Annual" card after week 2) |
| Annual renewal rate | Renewed at month 12 | ≥ 35% |
| Refund rate | Refunds / purchases | < 3% |
| Habit engagement | Subscribers with ≥ 4 active days/week | ≥ 50% |
| Check-in completion | Scheduled check-ins logged within 3 days | ≥ 60% |
| Notification opt-in | Granted / asked | ≥ 60% |
All from RevenueCat (subscriptions, churn, trials) plus anonymous app events (§7); no measurement values leave the device.

### 12.7 MVP vs v2 summary
- **MVP (v1.0):** daily plan, stretches/posture/activity routines (illustrated), sleep routine + bedtime reminders, nutrition + weekly grocery list, daily checklist + streaks + recovery, weekly Growth Habits Score, monthly check-in with updated prediction and percentile trend, growth-spurt alerts, prediction history, milestone share cards, pediatrician PDF on demand, multiple children, week-1 plan, day 1/3/7/30 touchpoints.
- **v1.1:** first seasonal content pack beyond launch, more meal ideas, routine videos.
- **v2:** parent–teen shared family view and multi-device sync (needs a sync layer: encrypted file sync through iCloud Drive / Google Drive, or a minimal account-free backend with end-to-end encryption; decide before building, update the privacy label and Data safety form), Apple Health / Health Connect sleep import, more seasonal packs.

---

## 13. Design system & prototype reference (Oct 16, 2026, approved prototype v2)

Utku approved **prototype v2** on Oct 16, 2026. It is the **visual and interaction source of truth** for every screen it covers:
- `prototype/index.html` is a single offline HTML file. Open it in any browser: desktop shows a 390×844 iPhone frame, a phone shows it full screen. A small "Restart prototype" link resets all state.
- `prototype/shots/v2/*.png` has 48 screenshots: `L-` light, `D-` dark, `M-` phone full screen.
- Where the prototype and an older section of this brief disagree on layout, controls, copy on screen, or input behaviour, **§13 and the prototype win**. Where the prototype simplifies something the brief requires (listed in §13.10), **the brief's requirement still applies**.
- The prototype shows the iOS look. Android follows §13.9.
- Prices in the prototype are labelled "Example prices · placeholder". The real app takes every price from the store via RevenueCat (§5.6).

### 13.1 Apple HIG adherence (iOS 17/18 look and feel)
Build it as a native-feeling iOS app, not a themed web page. No ornamental gimmicks: no custom ruler sliders, gradients on content, glassy cards or novelty controls. The only flourishes are the ones the brief asks for: one confetti burst on the result and the scrolling bubble background on the paywall.

| Area | Rule (as built in v2) |
|---|---|
| **Typeface** | System font: SF Pro on iOS, Roboto on Android. Rounded weight (SF Pro Rounded) only for the big result number and numeric field values, with tabular figures. Monospace only in the formula sheet. |
| **Type scale** (Dynamic Type sizes at the default "Large" setting; all scale with the OS text size) | Large Title 34 bold · Title 1 28 bold · Title 2 22 bold · Title 3 20 semibold · **Headline 17 semibold** · **Body 17** · Callout 16 · Subhead 15 · **Footnote 13** · Caption 12. Questions use Title 1. Screen titles use Large Title. List rows use Body. Section headers and footers use Footnote (headers uppercase, secondary label color). |
| **Colors** | iOS semantic system colors: `systemGroupedBackground` #F2F2F7 (dark #000000) for screens; `secondarySystemGroupedBackground` #FFFFFF (dark #1C1C1E) for list cells and cards; `label`, `secondaryLabel` (60% opacity), `tertiaryLabel`; `separator` (hairline, 0.5 pt); `systemFill` variants for field and segmented-control backgrounds; `systemRed` for errors and destructive actions; an orange (#C25E00 light) for soft warnings. |
| **Tint (single app tint)** | Sage-teal **#2F7D6D** light / **#5FB8A5** dark (text on tint: #FFFFFF light / #03231C dark). Used for every interactive element: buttons, links, checkmarks, toggles on, selected tab, progress line, the result number. No second interactive color. |
| **Apricot accent (sparing)** | #F2A65A light / #F4B677 dark, accent text #B05F12. **Only** on: the streak flame and weekday dots, the "Best value · Save N%" badge, the child's measurement line and dots on the growth chart, and confetti particles. Never on buttons or body text. |
| **Layout** | 16 pt side margins. Inset grouped lists: cells sit 16 pt from the edges, corner radius 12 pt, separators inset 16 pt from the leading edge (60 pt when the row has an icon tile). Section header above, footnote below. Continuous ("squircle") corners on cards, fields, buttons, sheets and icon tiles. |
| **Tap targets** | Minimum 44×44 pt for every tappable element, including the paywall X, "Don't know", segmented segments, legal links and tab bar items. |
| **Navigation bars** | Large title that collapses into an inline 17 pt semibold title with a translucent material bar and hairline once content scrolls under it. Back button = chevron + "Back" (or the previous screen's name, e.g. "Result" when editing an input from the result). Bar buttons are tint-colored text or SF Symbols. |
| **Onboarding progress** | A thin 2 pt tint line under the nav bar showing step n of 10. No dots, no step numbers, no percentage. |
| **Tab bar** | Standard iOS tab bar (49 pt + home-indicator inset, translucent material, hairline on top). Four tabs with SF Symbols: **Today** (`sun.max`), **Growth** (`chart.line.uptrend.xyaxis`), **Plan** (`calendar`), **Family** (`person.2`). The parent path labels the last tab "Family"; the teen path labels it "Profile". Outline symbol when unselected, filled when selected, tint color plus label. Tapping the current tab scrolls to top. |
| **Sheets** | Standard sheets with a grabber, a 3-part sheet nav bar (left action, centered title, right "Done"/"Add" or a gray circular close ✕), and detents **medium** (~56% height) and **large**. Drag the grabber to resize or dismiss; scrolling in a medium sheet expands it to large. Used for the method sheet, share card, App Store purchase (simulated), log measurement and legal pages. |
| **Buttons** (HIG styles) | **Filled** (tint background, 50 pt tall, full width, 14 pt radius, Headline text) for the one primary action per screen, pinned in a bottom bar above the home indicator. **Tinted** (tint at ~15% background) for secondary actions. **Bordered** (hairline outline) for neutral alternatives. **Plain** (tint text) for low-emphasis actions such as "Skip", "Enter date with keyboard instead" and "Ask a Parent to Unlock". Disabled = `systemFill` background with tertiary label. Title Case labels ("Get Started", "See My Result", "Get My Growth Plan", "Start My Plan"). |
| **Controls** | Native segmented controls (cm \| ft / in, kg \| lb, log-measurement date). Native switches (trial toggle, reminders). Checkmark rows for single choice (trailing tint ✓). Checkmark rows for multi-select. Circle / filled check-circle for habit completion. Disclosure chevrons on rows that navigate or open sheets. Destructive row text in red. |
| **Feedback** | **No toasts.** Confirmations use an iOS-style **banner** that slides down from the top (icon tile + title + subtitle, auto-hides after ~3 s, tap to dismiss): "Measurement added", "4-day streak!", "Bedtime reminder set". Decisions and errors use **alerts** (centered, title + message, buttons side by side, preferred action bold, destructive red): "Delete All Data?", "We need one parent's height", "Restore Purchases", the notification permission pre-prompt. Inline field errors sit under the field (§13.4). |
| **Haptics** | Light impact on selection, wheel detents and habit ticks. Success notification haptic on result reveal and purchase. |
| **Transitions** | Standard push/pop for onboarding steps. Modal (slide up) for the paywall; it dismisses downward back to where it was opened. Cross-fade from loader to result and from purchase to success. |
| **Dark mode** | Full support through the system setting (`prefers-color-scheme` in the prototype; `useColorScheme` in Expo). Every token above has a dark value. The paywall cover is always dark behind its sheet. The sheet itself follows the system appearance. Check the `D-` screenshots. |
| **Reduce Motion** | When on, push/modal transitions become cross-fades, confetti is skipped, the bubble background stops scrolling, the count-up shows the final number instantly, and auto-advance uses a shorter 0.15 s delay. Everything stays usable. The prototype passed a full run with Reduce Motion emulated. |
| **Accessibility** | Dynamic Type (layouts reflow; nothing truncates numbers). VoiceOver roles: radio groups for single choice and plans, checkboxes for multi-select and habits, switches for toggles, a spin-button style "adjustable" for each wheel column. Result hero read as one element ("Predicted adult height 174 centimeters, likely 169 to 180"). Colour is never the only signal. |

### 13.2 Design tokens (replaces the §4.2 palette)
| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` (systemGroupedBackground) | #F2F2F7 | #000000 | Screen background |
| `card` (secondarySystemGroupedBackground) | #FFFFFF | #1C1C1E | List cells, cards, fields |
| `cardElevated` | #FFFFFF | #2C2C2E | Selected segment, elevated surfaces |
| `sheetBg` | #F2F2F7 | #1C1C1E | Sheets and the paywall sheet |
| `label` / `label2` / `label3` | #000 / rgba(60,60,67,.6) / rgba(60,60,67,.3) | #FFF / rgba(235,235,245,.6) / rgba(235,235,245,.3) | Text hierarchy |
| `separator` | rgba(60,60,67,.29) | rgba(84,84,88,.65) | Hairlines |
| `tint` | #2F7D6D | #5FB8A5 | Single interactive color |
| `onTint` | #FFFFFF | #03231C | Text and icons on tint |
| `tintFill` | rgba(47,125,109,.14) | rgba(95,184,165,.20) | Tinted buttons, icon tiles, the range band |
| `accent` (apricot) / `accentText` | #F2A65A / #B05F12 | #F4B677 / #F4B677 | Sparing accents only (§13.1) |
| `red` / `orange` | #FF3B30 / #C25E00 | #FF453A / #FF9F0A | Errors and destructive / soft warnings |
| Radii | list 12 · button 14 · sheet 16 · app icon tile ~22% | same | Continuous corners |
| Spacing | margin 16 · section gap 22–35 · row min height 44 | same | |
All text/background pairs must still pass WCAG AA (§4.2 rule). Check `label2` on `bg` and `onTint` on `tint` in both modes at build time.

### 13.3 Iconography
SF Symbols on iOS via `expo-symbols`. Material Symbols Rounded on Android (§13.9), mapped one to one. The prototype draws SF Symbols-style inline SVGs as stand-ins. Icons in list rows sit in a 30 pt rounded tile: tint tile with white glyph for primary rows, `tintFill` tile with tint glyph ("soft") for informational rows, gray tile for settings rows, apricot tile only for the streak.

### 13.4 Input patterns (every onboarding and logging input)
**General rules (all numeric fields)**
- One question per screen: Title 1 question, Body secondary helper line, one control, inline message area, Continue pinned at the bottom.
- **Continue is enabled only when the input is valid.** It never accepts a pre-filled or default value by accident.
- **No pre-filled fake values.** Fields start empty with an example placeholder ("e.g. 152", "e.g. 45", "e.g. 163", ft/in "5" / "0"). Previously entered values are restored when the user comes back.
- **Autofocus:** the first empty field is focused after the push transition (~0.5 s) so the keypad is up. (iOS Safari in the web prototype may not raise the keyboard without a tap. The native app must use `autoFocus`.)
- **Numeric keypad:** `inputmode="decimal"` in the prototype; in RN `keyboardType="decimal-pad"`. Accept "." and "," as the decimal separator. Strip any other characters as they're typed.
- **Return advances:** `returnKeyType="next"` moves to the next empty field; on the last field, Return submits the step if it's valid (same as Continue).
- **Unit segmented control** above the field: **cm | ft / in** (height and parents share one unit setting) and **kg | lb**. Defaults to device locale (US → ft/in and lb). **ft / in shows two side-by-side fields** (ft, then in); typing a digit in ft auto-advances to in. Switching units converts the current value, and an untouched converted value keeps full precision (152 cm → 5 ft 0 in → back to 152 cm, not 152.4). Values are stored in metric.
- **Live conversion hint** under a valid field ("= 5′ 0″" or "= 152 cm"; "= 95 lb").
- **Inline validation:** errors (red text under the field plus a red ring on the field) show on blur, on Return, or immediately if the value is far outside the range (> 1.2× the max). While the user is still typing, a too-small partial value never flashes an error. Soft warnings (orange text, Continue stays enabled) for plausible-but-unusual values.
- Error copy names the range in the active unit: "Enter a height between 60 and 220 cm." / "…between 2′ 0″ and 7′ 3″"; "Enter a weight between 10 and 200 kg." / "…between 23 and 440 lb"; "Enter mother's height between 130 and 230 cm."; "Inches must be between 0 and 11."

**Validation ranges** (supersede §5.4's older ranges)
| Input | Hard range (blocks Continue) | Soft warning |
|---|---|---|
| Age from birth date | 2 to < 22 years. Under 2 → error "APP_NAME is for ages 2 to 21." | Under 4: "Under 4, we use mid-parental height only." Over 17.5: "Most growth is done by now; we'll show what genetics suggest." Always shows "Age 13 years, 5 months." |
| Child height | 60–220 cm | More than 22% from the typical height for age and sex: "That's unusual for their age. Please double-check (it's fine if it's right)." |
| Child weight (optional) | 10–200 kg | — |
| Parent height | 130–230 cm each | — |
| Inches part | 0–11 | — |
| Logged measurement | 60–220 cm | Dated "Today" and > 2 cm below the latest entry: "That is lower than the last entry. Please double-check." (can still save) |

**Birth date: wheel picker + typed fallback** (`L-03-birthdate-wheel`)
- "When were they born?" / teen "When were you born?" Helper: "Month and year are enough." (Day defaults to the 15th for age maths.)
- **Inline compact style:** a "Birth date" row shows the chosen value as a tinted pill ("May 2013"), or a gray "Select" before any choice. Under it, an **always-visible inline two-column wheel**: **Month** (full month names, right-aligned) | **Year** (left-aligned), 216 pt tall, highlighted selection band, 3D fade and haptic tick per detent. Years run from current year − 21 to current year − 2.
- The wheel opens at current month / current year − 12 but **counts as unanswered until the user moves it or taps an item.** Continue stays disabled until then. The age message updates live.
- **Typed fallback:** a plain button "Enter date with keyboard instead" swaps the wheel for a native month field (`<input type="month">` in the prototype; in the app a month + year text entry with numeric keypad, or the platform month/year picker). "Use wheel picker" swaps back. VoiceOver users get the fallback's simpler control too.
- RN: if the date-picker library exposes iOS 17.4+'s year-and-month mode, it may replace the custom wheel on iOS. Otherwise build the two-column wheel (snap-scrolling lists, Reanimated, `accessibilityRole="adjustable"` with increment/decrement actions). Android: §13.9.

**Height** (`L-04a-height-invalid`, `L-04-height-ftin`)
- "How tall are they right now?" Helper: "Measure without shoes, back against a wall." Footer: "Morning measurements are the most accurate."
- cm | ft / in segmented control → one large numeric field (72 pt tall, 40 pt rounded digits, unit suffix inside the field) or two side by side for ft / in.

**Weight, optional with Skip** (`L-05-weight`)
- "What do they weigh?" Helper: "Optional. Used only by the Khamis–Roche formula and stays on this phone." kg | lb segmented control + large field.
- Under Continue, a plain **Skip** button plus the footnote "Without weight we can only use parents' heights: the range widens from about ±5 cm to ±8.5 cm."
- Skip → Khamis–Roche is off, mid-parental height is the headline method (with percentile projection in production, §5.4C). The result says "Weight was skipped, so only mid-parental height was used. Add weight for a tighter range." The Weight input row on the result shows "Skipped" and is tappable to add it.

**Parents' heights, one screen, "Don't know" rule** (`L-06-parents`, `D-06-parents`)
- "How tall are their parents?" / teen "How tall are your parents?" Helper: "Biological parents. A best guess is fine; measured is better." One shared cm | ft / in control.
- Two inset sections, **MOTHER** and **FATHER**. Each row has the height field(s) plus a trailing plain **"Don't know"** button. Return in the mother field moves to the father field.
- **Rule: at most one parent may be unknown.** Tapping "Don't know" replaces that row with "Unknown · we'll use an average (175 cm)" and an **Undo** button. Trying to mark the second parent unknown shows the alert "We need one parent's height: The estimate relies on family height. Please enter at least one parent, even a best guess."
- With one parent unknown, the footer changes to: "Accuracy is reduced: with one parent unknown we use the US adult average (161 cm / 175 cm) for that parent and widen the likely range by about 3.5 cm on each side." Continue is enabled when the known parent is valid.
- **Engine behaviour (v2, adopted; ⚠️ flagged for product review):** substitute the population adult average for the unknown parent (prototype: US NHANES 2015–2018, mother 161.3 cm, father 175.3 cm) in **both** Khamis–Roche and mid-parental height, and **widen each method's range by 3.5 cm on each side** (KR boys ±5.3 → ±8.8; MPH ±8.5 → ±12.0). The result's method footnote, the method sheet and the PDF state that one parent is estimated. **Product review needed before launch:** (a) the 3.5 cm widening is a prototype assumption, not a published figure; derive or source it (e.g. from the SD of adult height in the reference population × the formula's parent coefficient) or replace it; (b) choose the reference population per locale (US NHANES vs local national averages); (c) confirm App Review / Play are comfortable with an estimated parent (it's disclosed everywhere). Until signed off, keep this behind `AppConfig.unknownParentMode = 'populationAverage'` with the older behaviour (`'disableParentMethods'`: KR and MPH off, percentile projection only, labelled) available as the fallback.

**Single-choice questions: auto-advance list rows** (`L-02-who-list`)
- Who's checking (teen / parent, with icon tiles and subtitles), sex at birth (Boy / Girl), sleep, main goal.
- Inset grouped list, one row per option (min 44 pt, full-row tap target). Tapping shows a trailing tint checkmark, a light haptic, then **auto-advances after 0.35 s** (0.15 s with Reduce Motion). No Continue button. Input is locked during the delay so a double-tap can't skip a step. Back returns with the choice still checked; changing sex clears the puberty answers.

**Puberty signs: multi-select with exclusive options** (`L-07-puberty-multiselect`)
- "Which have you noticed?" Helper: "Growth spurts matter. Select all that apply. This adds context; it doesn't change the formula."
- First section (checkmark rows, any number): both sexes Grew a lot in the last year · Body odor · Underarm hair · Acne; boys add Voice deepening · Facial hair · Broader shoulders; girls add Breast development · First period.
- Second, separate section of **exclusive options: "None yet" and "Not sure".** Selecting either clears every other selection. Selecting any sign clears them.
- Continue is enabled once at least one row (sign, None yet or Not sure) is selected.
- Answers drive the context line under the result hero and the paid spurt card only. They never feed the KR number.

**Logging a measurement (Pro)** (`L-18-log-sheet`)
- Sheet (Cancel / "Log Measurement" / **Add**, Add disabled until valid). Date as a segmented control (Today · 3 mo ago · 6 mo ago · 1 yr ago; production adds "Other date…" opening a date picker). Height field identical to onboarding, with the same validation and drop warning.
- Save → sheet closes → banner "Measurement added: Prediction updated +0.4 cm" (or "Prediction unchanged" / "Saved to your history"), and the chart adds the point.

### 13.5 Onboarding flow as built (10 progress steps; supersedes the §11.3 table layout)
Welcome (no progress line) → **10 steps with the progress line** → loader → result. Target < 45 s.

| Step | Screen | Control | Notes |
|---|---|---|---|
| — | Welcome | Filled "Get Started" | App icon, Large Title "How tall will you **grow?**" ("grow?" in tint), 3 feature rows, legal footnote |
| 1 | Who's checking today? | Auto-advance rows | "I'm a teen" / "I'm a parent" (moved off the welcome screen in v2) |
| 2 | Sex at birth | Auto-advance rows | "Growth formulas use sex at birth." |
| 3 | Birth date | Wheel + typed fallback | §13.4 |
| 4 | Height | Numeric field(s) + unit control | §13.4 |
| 5 | Weight | Numeric field + unit control + Skip | Optional |
| 6 | Parents' heights | Two fields + "Don't know" | §13.4 |
| 7 | Which have you noticed? | Multi-select + exclusive options | Age-gated in production (girls 8–15, boys 9–16; the prototype always shows it). When gated out there are 9 steps. |
| 8 | **Sleep (new pre-result question)** | Auto-advance rows | "How much do they usually sleep?" / teen "you". Helper "On a typical school night." Options: Less than 7 hours · 7–8 hours · 8–9 hours · 9 hours or more. Personalizes the plan and the bedtime default. **Never changes the prediction.** |
| 9 | What matters most? | Auto-advance rows | Find out their adult height · Help them reach their full height · Track growth over time · Check growth is on track (teen: "my") |
| 10 | Built on real pediatric research | Continue = **"See My Result"** | §13.7 |
| — | Loader ("Calculating…") | 3 s, real steps | Progress bar + 4 rows ticking with spinner → check: Checking age and growth data · Running Khamis–Roche · Comparing with mid-parental height · Building the likely range |
| — | Result | §13.7 | |

Approximate times: role 2 s, sex 2, birth date 5, height 5, weight 4, parents 7, puberty 5, sleep 2, goal 2, authority 4, loader 3, plus welcome 2 = ≈ 43 s.

### 13.6 Paywall layout (as built; supersedes older layout details in §4.4, §11.6 and §12.5)
Screenshots: `L-13-paywall`, `D-13-paywall`, `L-14-purchase-sheet`.
- **Presentation:** full-screen modal cover that slides up over the result; dark backdrop in both modes. Opened by the result CTA, any locked row, "+ Add child" (free) or Upgrade. Dismissing returns to where it was opened.
- **Background (top ~46%):** two columns of slowly upward-scrolling chat bubbles ("me" bubbles in tint, replies in gray), faded at the top and bottom edges. Static under Reduce Motion. Top-left pill: **"Sample messages · not real reviews"** while placeholders are shown. Production content rules: §11.7. Ship only Q&A placeholder bubbles until consented testimonials exist. The prototype's few italic "Sample quote" bubbles only mark where consented quotes will go and must not ship as-is.
- **Close X: top-right** (StoreKit convention; replaces the older "top-left" rule). It's a 30 pt gray translucent circle with ✕ inside a 44×44 pt hit area, visible from the first frame, ≥ 3:1 contrast. The Android system back also closes the paywall.
- **Sheet** (bottom ~80% height, 16 pt top corners, system background, scrolls internally on small screens / large text), top to bottom:
  1. Header row: 52 pt app icon tile + **Title 2 headline "Your growth plan is ready"** + tint semibold sub-line "Your prediction is free. Now make the most of their growth years!" (teen: "your").
  2. Context line when opened from a locked row (Footnote): "Unlocks the growth curve" / "Unlocks the daily growth plan" / "Unlocks growth-spurt timing" / "Unlocks the pediatrician PDF".
  3. **Plan cards** (radio group, Annual preselected):
     - **Annual** (selected: 2 pt tint ring + filled tint radio with ✓). Headline "Annual" + apricot badge **"Best value · Save 84%"** (runtime: ⌊(1 − annual ÷ (weekly × 52)) × 100⌋; hidden if not computable). Second line "≈ $0.77/week · unlimited children". Trailing price **"$39.99"** + "/year" (the billed amount is the most prominent price).
     - **Weekly**: "Weekly", "Up to 2 children · renews weekly", trailing **"$4.99"** + "/week".
  4. **Optional opt-in trial toggle** (Annual only; hidden when Weekly is selected; **off by default**): switch row "Try 7 days free first".
  5. (Prototype only) "Example prices · placeholder".
  6. **"Included with Pro"** inset list with 4 icon rows: Daily plan for their age: sleep, food, movement · Habit checklist, streaks and bedtime reminders · Growth curve and updated predictions · Growth-spurt timing and pediatrician PDF.
  7. Reassurance (Footnote, centered): "Your prediction stays free. We'll never promise extra cm, just a real plan for their growth years."
  8. Teen path only: plain button **"Ask a Parent to Unlock"** (share link / Ask to Buy / Family Link).
- **Sticky footer** (hairline on top): filled CTA **"Start My Growth Plan · $39.99/year"** / **"Start My Growth Plan · $4.99/week"**; with the trial on: **"Start 7-Day Free Trial"**. Directly under it (Footnote, same size as the per-week text, not tiny gray):
  - Annual: "Billed $39.99 per year. Renews every year until you cancel. Cancel anytime in Settings."
  - Weekly: "Billed $4.99 every week. Renews every week until you cancel. Cancel anytime in Settings."
  - Trial: "Free for 7 days, then $39.99 per year. We'll remind you 2 days before. Cancel at least 24 hours before the trial ends to avoid being charged."
  - Then a link row: **Restore Purchases · Terms of Use · Privacy Policy**. "Manage Subscription" lives in the Family/Profile tab for subscribers (one tap). The full auto-renew disclosure (§6.4) is reachable from Terms and shown in the store's own purchase sheet.
- **Purchase:** CTA → the store's native purchase sheet (the prototype simulates an "App Store" medium-detent sheet: product "APP_NAME Pro · Annual", Price, Renews, Subscribe → spinner → ✓) → success screen. No confetti, countdowns, "people joined today" counts or decoys on the paywall.

### 13.7 Screen-by-screen spec with screenshot references
Each screen has a light and a dark screenshot: `L-xx` and `D-xx` in `prototype/shots/v2/`.

| # | Screen | Screenshot(s) | Key spec |
|---|---|---|---|
| 1 | Welcome | `L-01-welcome`, `D-01-welcome`, `M-01-mobile-welcome` | 76 pt app icon; Large Title "How tall will you grow?"; body "Find out free in about 40 seconds, then get a daily plan to help you reach your full height."; feature rows: Free prediction ("No paywall on the number") · Real pediatric methods ("Khamis–Roche and mid-parental height, with the formulas shown") · Private by design ("No account needed. Your data stays on your phone."); "Get Started"; footnote "An estimate, not a medical diagnosis. By continuing you agree to the Terms and Privacy Policy." |
| 2 | Who's checking today? | `L-02-who-list` | §13.4 single choice; footer "Choose one to continue." |
| 3 | Sex at birth | (no screenshot; same pattern as `L-02`) | Boy / Girl |
| 4 | Birth date | `L-03-birthdate-wheel`, `D-03-…` | §13.4 |
| 5 | Height | `L-04a-height-invalid` (300 cm → error, Continue disabled), `L-04-height-ftin` | §13.4 |
| 6 | Weight | `L-05-weight` | §13.4 |
| 7 | Parents | `L-06-parents` (both entered), `D-06-parents` (father "Don't know") | §13.4 |
| 8 | Puberty signs | `L-07-puberty-multiselect` | §13.4 |
| 9–10 | Sleep, Main goal | (same pattern as `L-02`) | §13.5 |
| 11 | Authority | `L-08-method` | Title "Built on real pediatric research"; helper "Published methods, shown openly. No AI guesswork, no made-up accuracy scores."; rows: Khamis–Roche method (Pediatrics, 1994 · Fels Longitudinal Study) · Mid-parental height (Tanner, 1970 · genetics only) · Typical accuracy (Within about ±5 cm (boys) / ±4 cm (girls), 9 times out of 10) · "See the formulas" → method sheet; footer "An estimate, not a diagnosis. Not affiliated with or endorsed by any health agency."; button "See My Result" |
| 12 | Loader | `L-09-loader` | §13.5 |
| 13 | Result | `L-10-result`, `D-10-result` (wider range, one parent estimated), `M-02-mobile-result-teen` | Large Title "Your Result" + "Your results are in! 🎉"; share button (SF `square.and.arrow.up`) top-right; **hero card**: "Predicted adult height", the number counting up from today's height to the prediction (rounded, tint, ~71 pt) + unit, "5′ 9″ · likely 169–180 cm", range bar (tint band, marker) labelled "Today 152 cm … Likely range"; puberty context footnote; **METHODS** rows (Khamis–Roche "Height, weight, age and parents · ±5.3 cm" → 174 cm; Mid-parental "Parents only · ±8.5 cm" → 178 cm) opening the method sheet, plus a footnote explaining which method leads and why; **THEIR INPUTS** rows (Age, Height, Weight, Mother, Father) that edit the step in place (back button reads "Result") and recompute on return; teen only: "Show a Parent" row; **INCLUDED WITH APP_NAME PRO** locked rows with padlock (Growth curve & trend · Personalized growth plan · Growth-spurt timing · Pediatrician-ready PDF) → paywall with context; disclaimer footnote; bridge Title 3 "Now let's help them reach it!"; pinned CTA **"Get My Growth Plan"**. One confetti burst (1.3 s, teal/apricot) on reveal for every result; skipped under Reduce Motion. KR output is never shown below today's height (floored at current height, noted in the method sheet). |
| 14 | Share sheet | `L-11-share-sheet` | Large-detent sheet "Share Result"; 9:16 story card preview (app name, "Predicted adult height", big number, "likely 169–180 cm", method · "an estimate, not a guarantee", "How tall will you grow?"); rows: Send to a Parent (teen) · Save Image · More… (system share sheet) |
| 15 | Method sheet | `L-12-method-sheet` | "How We Calculated This" + Done; monospace worked formula with the user's numbers (row coefficients, inches/pounds, result × 2.54); Result row "174 cm ± 5.3 cm"; MPH formula with numbers; unknown-parent note when relevant; ACCURACY AND LIMITS rows (KR 90%: ±5.3 boys · ±4.3 girls; Valid ages 4.0–17.5; Puberty signs: Context only) + honest-framing footnote (§12.1) and Fels population caveat |
| 16 | Paywall | `L-13-paywall`, `D-13-paywall` | §13.6 |
| 17 | Purchase | `L-14-purchase-sheet` | Native store sheet (simulated in prototype) |
| 18 | Success / plan setup | `L-15-success` | Check-circle, Title 1 "You're in!", "Their growth plan is ready. First, when should lights go out?"; BEDTIME single-choice rows 21:00 · 21:30 · 22:00 · 22:30 (none preselected); footer sleep targets (8–10 h teens, 9–12 h ages 6–12); switch "Remind me 30 min before" (on by default); CTA "Start My Plan" (enabled once a bedtime is picked) |
| 19 | Notification permission | `L-16-notification-alert` | Only if the reminder switch is on: the OS permission alert, after the in-context explanation on screen 18 (§12.4). Allow → banner "Bedtime reminder set". Don't Allow → reminders off, no nagging. |
| 20 | Today tab | `L-17-today`, `D-17-today` | Kicker date ("FRIDAY, OCTOBER 16") + Large Title "Today"; streak card (apricot flame tile, "4-day streak", "3 habits a day keeps it going", M–S weekday dots); DAILY HABITS header with "3 of 5 done"; 5 habit rows with icon tile, title, subtitle and trailing circle/check-circle (Morning stretch & posture · Lights out by {bedtime} · Protein + calcium meal · 15 minutes of daylight · Hydration); footer about the automatic rest day; WHY IT MATTERS tip. Ticking the 3rd habit bumps the streak with a banner (+ confetti). |
| 21 | Growth tab | `L-18-log-sheet`, `L-19-growth` | Large Title "Growth" + "+" bar button; prediction row (→ method sheet); chart card: projection curve (dashed tint) with range band (`tintFill`), measurements in apricot, end label, legend; Growth speed row (cm/yr, first → latest); MEASUREMENTS list newest first; "Log Measurement…" row. Production adds CDC/WHO percentile curves and a table view (§4.4). |
| 22 | Plan tab | `L-20-plan` | Kicker "WEEK 1" + "Plan"; THIS WEEK'S FOCUS rows (Sleep 8–10 h / 9–12 h, Calcium 1,300 / 1,000 mg, Active minutes 60 min, Vitamin D 600 IU, each "a day"); WEEK 1 · FOUNDATIONS: 7 expandable day rows (numbered tiles, "TODAY" tag, disclosure chevron rotates, 3 bullet tasks each) per §12.4 week-1 plan; sources footnote |
| 23 | Family / Profile tab | `L-21-family`, `L-21b-family-scrolled`, `D-21-family` | Child profile card (age, today's height, predicted range); "Add Child…" (teen: "Invite a Parent…"); SUBSCRIPTION (APP_NAME Pro · plan, Renews / Trial ends date, **Manage Subscription**, Restore Purchases); REMINDERS switches (Bedtime wind-down, Morning plan, Measurement check-in); SETTINGS (Units Metric/US, Methods & Sources, Medical Disclaimer); centered red **"Delete All Data"** → destructive alert → wipes and restarts. Production adds the §4.4 Settings items (growth reference, export JSON, refund, support, version). |

### 13.8 App structure after purchase (replaces the "Home (child list)" and "Child detail" layout in §4.4)
A four-tab app: **Today · Growth · Plan · Family** (teen: Profile). §13.7 rows 20–23 give the contents. The child switcher (multi-child, Annual) sits at the top of Today and Growth as a nav-bar menu showing the child's nickname. "+ Log measurement" is the Growth tab's "+" bar button. Free users who close the paywall land back on the result. The result stays reachable from Growth → prediction row.

### 13.9 Android / Material 3 adaptation (Expo build)
Same flow, same copy, same tokens, rendered with Android conventions. Build shared components with a platform switch (`Platform.select`), not two apps.

| iOS (v2 prototype) | Android equivalent |
|---|---|
| SF Pro, Dynamic Type scale | Roboto via the Material 3 type scale, scaling with the system font size: Large Title → `headlineLarge` (32) · Title 1 → `headlineMedium` (28) · Title 2 → `headlineSmall` (24) · Headline → `titleMedium` (16, medium) · Body → `bodyLarge` (16) · Subhead → `bodyMedium` (14) · Footnote → `bodySmall` (12) · section headers → `labelLarge`. Rounded number font: bundled Nunito (§4.3). |
| Grouped background + white inset cells | `surface` / `surfaceContainerLow` background with `surfaceContainer` cards (12 dp radius, 16 dp margins); list dividers optional (M3 uses spacing more than hairlines). Same teal as `primary`; **dynamic color off** so the brand tint stays; apricot as `tertiary`, used just as sparingly. Dark theme from the same tokens. |
| Large-title nav bar, chevron "Back" | `LargeTopAppBar` collapsing to `TopAppBar` on scroll, **← arrow icon** (no text), system back gesture/button on every screen (returns one step; never skips the result). |
| Tab bar | M3 `NavigationBar` (80 dp, pill active indicator in `secondaryContainer`), Material Symbols Rounded outlined → filled: `wb_sunny`, `monitoring`, `calendar_month`, `group`. |
| Sheets with grabber + detents | M3 `ModalBottomSheet` with drag handle; partially expanded ≈ medium, expanded ≈ large. (In Expo: `@gorhom/bottom-sheet` for both platforms, or expo-router `presentation: 'formSheet'` with `sheetAllowedDetents`.) |
| Segmented control | M3 `SegmentedButton` (single-select, check icon on the selected segment) |
| Switch | M3 `Switch` |
| Checkmark rows (single choice) | List items with a trailing check (or `RadioButton`), ripple, auto-advance unchanged |
| Multi-select checkmarks | List items with leading `Checkbox`; "None yet" / "Not sure" stay a separate group and stay exclusive |
| Month/year wheel | Two exposed dropdown fields side by side (Month, Year) opening menus, or a bottom sheet with two snap-scrolling lists. Material's DatePicker has no month/year-only mode. Typed fallback: a numeric "MM / YYYY" text field. Continue still waits for an explicit choice. |
| Numeric fields | M3 `OutlinedTextField`, large text, unit as suffix, `keyboardType="decimal-pad"`, `returnKeyType="next"`, supporting text for hints/errors (error color + error icon) |
| Filled / tinted / bordered / plain buttons | `Button` (filled) / `FilledTonalButton` / `OutlinedButton` / `TextButton`; full-width primary in a bottom bar above the gesture area; Sentence case is acceptable on Android if the copy deck allows it |
| Banners | `Snackbar` (bottom, above the navigation bar) for confirmations such as "Measurement added" and streaks |
| Alerts | M3 `AlertDialog` (title, supporting text, right-aligned text buttons; destructive action in `error` color) |
| Notification pre-prompt → OS alert | Same placement; Android 13+ `POST_NOTIFICATIONS` runtime dialog |
| Paywall X top-right + StoreKit sheet | X top-right (48 dp target) **and** system back closes it; purchase opens the Google Play billing sheet; footer links identical; legal text uses the Android variant (§6.4) |
| Highlight on press | Ripple |
| 44 pt targets | **48 dp** targets |
| Haptics | `expo-haptics` light/selection; keep subtler than iOS |
| Edge to edge | Draw behind system bars with proper insets (`react-native-safe-area-context`) |

### 13.10 Prototype simplifications (the brief still requires these in the real app)
- Prices are hardcoded "example" values. The app reads localized prices from the store and computes Save N% at runtime (§5.6).
- The App Store purchase sheet, Restore, Manage Subscription, Ask a Parent and notification permission are **simulated**.
- Production adds: today's percentile line, the percentile projection method, "Add a name", the "Improve accuracy" card, the free "Today's plan" preview (§11.4), prediction history, CDC/WHO percentile curves on the growth chart (the prototype's curve is illustrative), the PDF, the grocery list, the Growth Habits Score, multi-child switching, and the age gate on the puberty step.
- Fonts: the prototype falls back to Inter when SF Pro isn't installed (e.g. in the screenshots); the app uses system fonts. Continuous corners render only in Chromium in the prototype.
- One child, in-memory state; no persistence.

### 13.11 Decisions reconciled into older sections (Oct 16, 2026)
| Topic | Old text | Now (v2) | Updated in |
|---|---|---|---|
| Paywall close X | Top-left | **Top-right**, 44×44 pt / 48 dp; Android back also closes | §2, §4.4, §11.2, §11.6, §7 |
| Unknown parent | One missing → don't compute MPH / KR and MPH off | **Substitute population average + widen range 3.5 cm each side; at most one parent unknown; ⚠️ product review** (§13.4) | §2, §3.1, §5.3, §5.4, §11.3 |
| Sleep question | Cut from pre-result onboarding | **Asked pre-result** as one auto-advance question (step 8), plan-only | §3.1, §11.2, §11.3 |
| Paywall headline | "Your child's personalized growth plan" / "Your personal growth plan" | **"Your growth plan is ready"** (both paths) + tint sub-line | §4.4, §11.2, §12.5 |
| Height / weight / parents input | Ruler sliders, start at median, "That's right" | **Numeric fields + unit segmented control**, empty with placeholders, inline validation | §2, §3.1, §4.1, §4.4, §4.5, §5.1, §5.2, §11.2, §11.3, §8 |
| Birth date | Month + year wheel | Inline compact **wheel + typed fallback**; must be touched | §11.3 |
| Who's this for? | Buttons on the welcome screen | Separate step 1 (auto-advance rows); welcome has one "Get Started" | §3.1, §4.4, §11.3 |
| Validation ranges | Height 80–210, weight 10–150, parents 130–220, age 2–20 | Height 60–220, weight 10–200, parents 130–230, age 2–21 | §5.4 |
| Feedback | Toasts | **Banners and alerts** | §3.4, §4.4 |
| Palette | #F7F8F6 background etc. | iOS system grouped colors + teal tint (§13.2) | §4.2 |
| Home | Child list + child detail with segmented control | **Tabs: Today · Growth · Plan · Family/Profile** | §4.4, §8 |
| Paywall footer | Restore · Manage subscription · Terms · Privacy | **Restore Purchases · Terms of Use · Privacy Policy**; Manage Subscription in the Family/Profile tab | §1, §2, §4.4, §11.6 |
| Trial CTA | "Start 7-day free trial, then $39.99/year" | **"Start 7-Day Free Trial"** + "Free for 7 days, then $39.99 per year…" directly beneath | §2, §4.4, §12.5 |
| CTA casing | "Start my growth plan! · $39.99/year", "Get my growth plan ›" | HIG Title Case: "Start My Growth Plan · $39.99/year", "Get My Growth Plan" | §4.4, §11.4, §12.5 |
| Locked Pro cards | 5 cards incl. prediction history | 4 rows (prediction history folded into "Growth curve & trend: every check-in plotted, with updated predictions") | §4.4, §11.4 |
| Onboarding count | "≤ 11 screens incl. result" | Welcome + **10 progress steps** (9 when puberty is gated out) + loader + result, < 45 s | §3.1, §7, §8, §11.3 |
| Log-measurement warning | > 3 cm drop | > 2 cm below the last entry (can still save) | §3.4 |
