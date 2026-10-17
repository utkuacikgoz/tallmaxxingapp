# Debug screenshot data

Use a **debug development build without RevenueCat keys**. From the free result, enter the tabs,
open Family and use “Load Demo Data” in the debug section. Confirming creates a separate synthetic
child with six measurements and two weeks of habits, then selects it. It does not overwrite an
existing child. The operation is idempotent; “Remove Demo Data” removes only the reserved demo child
and restores the mock entitlement. The entry and seed function are guarded by `__DEV__` and the
mock service; native release builds cannot enable this mode.

Capture Today, Growth, Plan and Family in light and dark on:

- a 6.9-inch iPhone simulator/device accepted by the current App Store screenshot specifications;
- a 6.5-inch iPhone simulator/device accepted by App Store Connect;
- an Android phone/emulator at the intended Play screenshot size.

Use the simulator/device's native screenshot function, with notification prompts dismissed and
only the synthetic profile visible. Confirm the current dimensions in the store console before
uploading. No store screenshots or screenshot uploads are implied by adding the debug mode.

For a dedicated iOS simulator, `xcrun simctl io <device-udid> screenshot /tmp/tallsoon-growth.png`
captures the displayed native screen. Verify that no real child data or developer menus appear.
Do not use browser exports as evidence of native screen-reader or system-permission behavior.
