---
name: find-widget
description: >
  Search for existing widgets, colors, text styles, spacing constants, or Android custom views
  across BOTH OperatorAppFlutter and OperatorApp repos. Use when the user says "find widget",
  "is there a widget for", "what button should I use", "which color constant",
  "show me available widgets", "I need a date picker", "is there an Android view for",
  "find layout", or wants to avoid creating duplicate components.
metadata:
  version: "0.2.0"
---

# Find Widget — Component Discovery (Flutter + Android)

Search BOTH repos for existing widgets, custom views, design tokens, and utilities before creating new ones.

## Search scope

### Flutter (OperatorAppFlutter)
1. `packages/we_common_widgets/lib/` — shared UI widgets (45+ files)
2. `packages/we_op_common/lib/` — operator-specific widgets (525+ files)
3. `packages/we_style/lib/` — colors, spacing, extensions
4. `packages/we_lib_manager/lib/` — WEColors, WETheme re-exports
5. `packages/we_base/lib/` — base classes, analytics, navigation

### Android (OperatorApp)
6. `app/src/main/java/com/wheelseyeoperator/` — custom View classes, adapters, custom layouts
7. `app/src/main/res/layout/` — XML layouts
8. `app/src/main/res/values/colors.xml` — Android color definitions
9. `app/src/main/res/values/styles.xml` — Android themes/styles
10. `app/src/main/res/values/dimens.xml` — Android dimension values
11. `app/src/main/res/drawable/` — custom drawables and shapes

Also check `references/widget-catalog.md` and `references/design-tokens.md` from the sync skill if available.

## Search strategy

When the user describes what they need:

1. **Search by keyword** — grep for related terms in widget file names and class names (BOTH repos)
2. **Search by category** — check the widget catalog reference (includes Android views)
3. **Search by Figma component** — if user gives a Figma component name, map it to the closest existing widget
4. **Cross-platform search** — check if widget exists in one platform but not the other (migration opportunity or reuse)

## Output format

For each matching widget found:

```
### WeCardV2
📁 packages/we_common_widgets/lib/card/we_card.dart
📦 import 'package:we_common_widgets/we_common_widgets.dart'

Usage:
WeCardV2(
  child: Column(
    children: [
      Text('Title', style: WETheme.textStyleBold16),
      verticalSpace8,
      Text('Subtitle', style: WETheme.textStyleMedium14.copyWith(
        color: WEColors.color888888,
      )),
    ],
  ),
)

Variants: WeCard, WeCardV2, WeCardWidget
```

## Android view output format

For matching Android custom views:

```
### CustomFuelCardView
📁 OperatorApp/app/src/main/java/com/wheelseyeoperator/feature/fuel/CustomFuelCardView.kt
📐 Layout: res/layout/view_fuel_card.xml

Usage (Kotlin):
CustomFuelCardView(context).apply {
    setFuelBalance(balance)
    setVehicleName(vehicleName)
}

Usage (XML):
<com.wheelseyeoperator.feature.fuel.CustomFuelCardView
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />

Flutter equivalent: WeCardV2 (similar card layout in Flutter)
```

## When nothing matches

If no existing widget matches, clearly say so and check BOTH platforms:
```
❌ No existing widget found for "voice input button"

Flutter options:
1. Create a new widget in the feature's widgets/ directory
2. Create a shared widget in we_op_common (if reusable across features)
3. Compose from existing widgets (WeTextFieldV2 + IconButton)

Android options:
4. Create a custom View in the feature package
5. Use existing Android library component (MaterialButton + mic icon)

Cross-platform note:
⚠ If building for hybrid, create Flutter widget first — Android can invoke it via MethodChannel

Recommendation: Option 3 — compose WeTextFieldV2 with a suffixIcon for the microphone
```

## Quick lookups

For common questions, provide instant answers:

- "which button?" → Show all WEFlatButtonV2 variants (Flutter) + Material button styles (Android)
- "which color?" → Search AssetsColors/WEColors (Flutter) + colors.xml (Android), show cross-reference
- "which text style?" → Show all WETheme.textStyle options (Flutter) + styles.xml text styles (Android)
- "which spacing?" → Show all spacing constants (Flutter) + dimens.xml values (Android)
- "which text field?" → WeTextFieldV2 vs WeOpTextFieldWidget (Flutter) + TextInputLayout (Android)
- "does Android have this?" → Cross-reference Flutter widget with Android custom views
- "is this migrated?" → Check migration-tracker.md for whether the Android view has a Flutter equivalent
