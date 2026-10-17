# Native E2E flows

These flows cover parent onboarding through the free result, teen onboarding both above and below
13, closing the paywall, logging a measurement, and deleting all local data. They use the app's
existing `testID`s.

Build and install the `development` app variant (`app.tallsoon.dev`) without RevenueCat API keys,
then run the suite from the repository root with `maestro test .maestro`. `.maestro/config.yaml`
sets the workspace `APP_ID` environment value used by each flow's `appId`; it defaults to the
development bundle/package ID. Pass an override as `maestro test -e APP_ID=app.tallsoon.preview .maestro`
to target another installed variant. The log flow buys the mock annual plan because measurement logging
is a Pro feature; it also dismisses the notification permission prompt when the OS presents it.
Birth month/year inputs are calculated at run time to keep the parent path age 14, the under-13 path
age 12, and the teen path age 15. Each flow starts with clean app data.

The flows require an iOS Simulator or Android emulator/device with the selected development build
installed. They cannot be validated by the web export. Native execution was not available in this
workspace; the YAML files were parsed and selectors were checked against the source `testID`s. The
measurement flow checks both the saved row for today's date and the “Measurement added” banner. The
delete flow relaunches the app after deletion and checks that onboarding remains the initial screen.
