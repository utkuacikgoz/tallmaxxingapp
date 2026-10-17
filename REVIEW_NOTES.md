# App Review notes draft

TallSoon provides an on-device estimate of adult height from the information entered by the user. It is an estimate, not a diagnosis or medical advice. The result and its range are free and appear before any subscription screen. No account is required.

## How to review

1. Open the app and tap **Get Started**.
2. Complete the short onboarding flow. For a parent path, enter sample values for the child and parent heights. For a teen path, choose the teen option.
3. The prediction, likely range, method label, and caveat appear on the result screen. Tap **How We Calculated This** to view the formulas and references.
4. Tap **Get My Growth Plan** to open the optional subscription paywall. The close button is visible in the upper-right corner. The paywall offers annual and weekly subscriptions; it never hides the prediction.
5. On a purchased subscription, the app shows the success and plan setup screen. Subscription purchase and restore should be reviewed with the App Store sandbox and the configured RevenueCat offering.

No reviewer account is needed. Child profiles and prediction inputs are processed locally; the app sends subscription and purchase information to RevenueCat using its anonymous app user ID. It does not send child names, ages, heights, weights, or parent measurements to RevenueCat. A sandbox tester has not yet been provisioned for this project; add the account through App Store Connect and enter its credentials in the App Review Information field when submitting. Do not place credentials in this repository. The live product setup and sandbox purchase path must be verified before submission.

## Method references

- Kuczmarski RJ et al. *2000 CDC Growth Charts for the United States: Methods and Development.* Vital and Health Statistics, Series 11, No. 246, 2002. The app bundles CDC stature-for-age LMS data; see [`packages/reference/SOURCES.md`](packages/reference/SOURCES.md) for provenance and validation.
- de Onis M et al. *Development of a WHO growth reference for school-aged children and adolescents.* Bulletin of the World Health Organization. 2007;85:660–667. The bundled WHO LMS data are third-party redistributions cross-checked against a second third-party copy, not downloaded from WHO directly; see the source notes before making data-provenance claims.
- Khamis HJ, Roche AF. *Predicting adult stature without use of skeletal age: the Khamis-Roche method.* Pediatrics. 1994;94(4 Pt 1):504–507. Coefficients are provided by the product owner and their verification status is documented in `packages/reference/khamis_roche_coefficients.json`.

The app states limitations and advises users to consult a pediatrician before making medical decisions. It does not claim guaranteed height gains or a quantified accuracy percentage. See [Apple's App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) for its health-content, accurate metadata, and complete-review requirements.

## Before submitting

- Replace the `tallsoon.app` and `support@tallsoon.app` placeholders with working privacy, terms, and support details.
- Create and test the real RevenueCat project, store products, entitlements, and `default` offering.
- Verify localized prices and purchases with the App Store sandbox, and supply the sandbox tester through App Store Connect's review information.
- Confirm all native release credentials and actual EAS project metadata are configured.
