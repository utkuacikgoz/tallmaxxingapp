# Accessibility verification

Shared controls use 44 pt minimum targets on iOS/web and 48 dp on Android, including segmented
controls, wheel items and onboarding navigation. Radio groups, checkbox/check states, switches and
progress labels expose their roles and values. Sheet titles and row values wrap instead of
truncating. At large text sizes the birth step uses the approved typed month/year input so long
month names cannot be clipped by wheel columns. The existing keyboard fallback remains available
at normal sizes.

Reduce Motion skips the success entrance animation as well as the existing confetti, result
count-up and moving paywall bubbles. Milestone export artwork has fixed typography for its image
aspect ratio and an accessible summary; the surrounding sharing actions still scale with text size.

Measured with the WCAG sRGB luminance formula, compositing secondary text over its background:

| Pair | Light | Dark | AA normal text |
| --- | ---: | ---: | --- |
| label2 on bg | 4.85:1 | 6.36:1 | Pass |
| onTint on tint | 4.91:1 | 7.05:1 | Pass |

Small interactive text uses the existing darker teal shade in light mode, while the brand tint
for filled buttons and graphics stays unchanged. Light errors, warnings and accent labels use
darker shades; the apricot flame uses a contrasting glyph.

The light secondary-label opacity is 0.75; the old 0.64 did not meet the required contrast.
Browser light/dark walkthroughs and visual comparison cover the shared layouts. Native VoiceOver,
TalkBack and every screen at the largest OS text size require separate device verification; a
browser screenshot does not establish those results. Record native findings in PROGRESS.md.
