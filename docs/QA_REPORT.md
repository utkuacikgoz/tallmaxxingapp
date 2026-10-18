# Browser visual QA · 2026-10-17

Compared the onboarding, result, paywall (Annual, Weekly and trial), success, Today, Growth,
Plan, Family, log and method screenshots with `docs/prototype/shots/v2/` in light and dark.
The walkthrough finishes with zero browser console errors and checks that the result precedes
any paywall, invalid height disables Continue, the close control is visible, and the tabs load.
CI retains screenshots and console logs in the `mobile-web-qa` artifact.

Fixed during the pass:
- Compact numeric inputs expanded to the browser's default input width and pushed the parents'
  “Don't know” action off-screen. Constrained the input width and allowed parent rows to wrap.
- Expo's browser implementation of native tabs covered screen headers with a floating top menu.
  The browser preview now uses Expo Router's bottom tabs; iOS and Android keep native tabs.
- QA now selects cm **and kg**, uses an explicit birth date, fails on interaction/console errors,
  closes the share sheet through its control, and stores screenshots outside tracked source.
- Added the missing Expo lint configuration and compatible dependencies. Fixed the asynchronous
  offering load and instant count-up branch reported by the hooks lint rule.

Expected production additions over the prototype remain: a third prediction method, percentile
curves, history, plan content varying by date, free-plan preview, and settings/export controls.
Numbers vary with the current date and actual input values. System typography, safe-area/status
bars and system sheets require comparison on real iOS/Android builds; browser QA cannot verify
native billing, permission prompts, screen readers, or large system text sizes.

Final-wave verification: light/dark walkthroughs also cover Story and Square milestone cards,
check square dimensions and verify the card excludes height measurements. Secondary text contrast
and native verification limits are recorded in `docs/ACCESSIBILITY.md`. Workspace typechecks,
49 engine tests, 58 content tests, 26 mobile tests, website browser smoke checks and release
configuration checks pass. Mobile lint has zero errors and 27 existing warnings.

## Device feedback verification · 2026-10-18

A dedicated iPhone 17 simulator running iOS 26.5 loaded the updated development app. With the
software keyboard visible, the weight field and father-height field remain fully above Continue.
Puberty choices render alphabetically. The method sheet shows its first section below the header
at half and full height; scrolling keeps body text below the opaque header in light and dark mode.

Maestro captured weight and sheet screenshots, but its keyboard dismissal and offscreen-input
focus behavior prevented a clean full onboarding run. Parent input was corrected and checked
through native UI controls. This verifies the layouts above, not a passing full Maestro suite.
Screenshots are local QA artifacts, not App Store billing screenshots.

A fresh web export and final light/dark walkthroughs pass with zero console errors. One initial
light run displayed a generic boundary during direct Growth navigation; the subsequent complete
light run and dark run both passed. Shared API props were checked against installed declarations.
Workspace TypeScript, 49 engine, 58 content and 32 mobile tests pass; lint has zero errors and 33
existing warnings. Physical haptic feel, store transactions and full VoiceOver/TalkBack testing
remain device checks; TestFlight does not display Apple's review prompt.

The native store-capture pass also found blank large tab titles. The shared navigation helper now
uses SDK 58's native system appearance without forced transparency/blur or an opaque large-title
background. Fresh iOS 26.5 light/dark captures confirm the Today title is visible. The original
forced background was specifically incompatible with the installed iOS 26 header path.
