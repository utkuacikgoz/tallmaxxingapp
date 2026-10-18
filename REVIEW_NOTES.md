# App Review notes draft

TallSoon provides an on-device estimate of adult height from the information entered by the user. It is an estimate, not a diagnosis or medical advice. The result and its range are free and appear before any subscription screen. No account is required.

## How to review

1. Open the app and tap **Get Started**.
2. Complete the short onboarding flow. For a parent path, enter sample values for the child and parent heights. For a teen path, choose the teen option.
3. The prediction, likely range, method label, and caveat appear on the result screen. Tap **How We Calculated This** to view the formulas and references.
4. Tap **Get My Growth Plan** to open the optional subscription paywall. The close button is visible in the upper-right corner. The paywall offers annual and weekly subscriptions; it never hides the prediction.
5. On a purchased subscription, the app shows the success and plan setup screen. Subscription purchase and restore should be reviewed with the App Store sandbox and the configured RevenueCat offering.

No reviewer account or sign-in credentials are required. Child profiles and prediction inputs are processed locally; the app sends subscription and purchase information to RevenueCat using its anonymous app user ID. It does not send child names, ages, heights, weights, or parent measurements to RevenueCat. The App Store products and RevenueCat offering are configured, but purchase and restore behavior still needs App Store sandbox validation. Do not add sandbox credentials to App Review Information; no account is required to review the free estimate and methods.

## Method references

- Kuczmarski RJ et al. *2000 CDC Growth Charts for the United States: Methods and Development.* Vital and Health Statistics, Series 11, No. 246, 2002. The app bundles CDC stature-for-age LMS data; see [`packages/reference/SOURCES.md`](packages/reference/SOURCES.md) for provenance and validation.
- de Onis M et al. *Development of a WHO growth reference for school-aged children and adolescents.* Bulletin of the World Health Organization. 2007;85:660–667. The bundled WHO LMS data are third-party redistributions cross-checked against a second third-party copy, not downloaded from WHO directly; see the source notes before making data-provenance claims.
- Khamis HJ, Roche AF. *Predicting adult stature without use of skeletal age: the Khamis-Roche method.* Pediatrics. 1994;94(4 Pt 1):504–507. Coefficients are provided by the product owner and their verification status is documented in `packages/reference/khamis_roche_coefficients.json`.

The app states limitations and advises users to consult a pediatrician before making medical decisions. It does not claim guaranteed height gains or a quantified accuracy percentage. See [Apple's App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) for its health-content, accurate metadata, and complete-review requirements.

## Before submitting

- Verify the configured public pages at `https://tallsoon.pro`, `https://tallsoon.pro/privacy`, `https://tallsoon.pro/terms`, and `https://tallsoon.pro/support` are deployed and return HTTP 200. They are configured URLs, not yet verified as live.
- Verify mail delivery for `support@tallsoon.pro`; the address is selected by the owner, but its MX/mail service is not verified.
- Complete App Store sandbox purchase and restore validation for the configured RevenueCat products and offering.
- Complete the privacy disclosure and app listing review, including owner/legal review of the public privacy policy and the age/content declarations.
- Complete Apple agreements, financial/tax setup, and content-rights information where applicable. The GitHub/Fastlane TestFlight pipeline is configured; EAS credentials are optional for that pipeline.
