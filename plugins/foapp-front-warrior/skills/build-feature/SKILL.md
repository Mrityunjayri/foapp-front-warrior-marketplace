---
name: build-feature
description: >
  Build a new feature or modify an existing one from a PRD and Figma design.
  Use when the user says "build feature", "create screen", "implement this PRD",
  "generate code from Figma", "develop this feature", or provides a Confluence PRD link
  and Figma component link together. Follows an iterative approval loop — the developer
  reviews and adjusts the plan before any code is generated. Supports BOTH Flutter and
  Android (Kotlin) code generation, including MethodChannel bridge code for cross-platform features.
metadata:
  version: "0.2.0"
---

# Build Feature — PRD + Figma to Production Code (Hybrid Android + Flutter)

Generate production-ready code from a PRD and Figma design for the **hybrid OperatorApp**. This is a dual-repo project: Android (Kotlin) is the host app, Flutter runs inside it via MethodChannel. The developer controls every decision through an iterative approval loop.

## Input collection

Ask the developer for (skip any already provided):

1. **PRD link** — Confluence page URL (read via Atlassian Rovo connector)
2. **Figma link** — Figma frame/component URL (read via Figma connector)
3. **Feature name** — short name like "ask-munshi", "fuel-guard-v2"
4. **Target app** — which app in `apps/` this belongs to (or if it's a new app)
5. **Platform scope** — one of:
   - **Flutter only** — new Flutter screen/feature, no Android changes needed
   - **Android only** — native Android feature (Activity/Fragment/ViewModel)
   - **Hybrid** — needs both Flutter UI + Android bridge (MethodChannel communication)
   - **Migration** — moving existing Android feature to Flutter (needs bridge + deprecation plan)

## Phase 1: Context gathering

1. **Read the PRD** from Confluence using the Atlassian connector tools (`getConfluencePage`). Extract:
   - Feature requirements and acceptance criteria
   - User stories and flows
   - API endpoints mentioned
   - Edge cases and error states

2. **Read the Figma design** using the Figma connector tools (`get_design_context`, `get_screenshot`). Extract:
   - Screen layouts and component hierarchy
   - Colors, typography, spacing used
   - Interactive states (loading, empty, error)
   - Navigation flow between screens

3. **Read the knowledge base** — load these reference files from the sync skill:
   - `references/coding-rules.md` — all CLAUDE.md conventions (Flutter + Android)
   - `references/widget-catalog.md` — existing widgets to reuse (Flutter + Android views)
   - `references/design-tokens.md` — colors, text styles, spacing constants (both platforms)
   - `references/feature-flows.md` — current app flows to understand impact (both repos)
   - `references/api-catalog.md` — existing API endpoints (flag duplicates across repos)
   - `references/bridge-map.md` — MethodChannel connections between Android ↔ Flutter
   - `references/migration-tracker.md` — which features are migrated, in-progress, or Android-only
   - `references/architecture-map.md` — package structure, DI, entry points for both repos

   Use `Read` tool with paths relative to the sync skill directory. If files don't exist, tell the developer to run `/sync` first.

4. **Determine platform impact** based on the feature scope:
   - If **Flutter only**: standard Flutter code generation
   - If **Android only**: Kotlin code in OperatorApp repo
   - If **Hybrid**: identify which MethodChannel bridges are needed, what data flows across
   - If **Migration**: map the existing Android implementation, plan Flutter replacement + bridge + deprecation

## Phase 2: Impact analysis (show plan v1)

Analyze and present the following to the developer:

### Current flow
Show the existing navigation/screen flow that this feature touches — include BOTH platforms if hybrid:
```
Android: MainActivity → DashboardFragment → ServiceListAdapter → [launches Flutter via FlutterAppManger]
Flutter: HomeScreen → BottomNav → ServicesTab → [feature doesn't exist yet]
Bridge: Android sends vehicleId via COMMUNICATION_WITH_NATIVE_APP → Flutter receives in bloc
```

### Files to modify (BOTH repos)
List every existing file that needs changes, grouped by repo:
```
Flutter (OperatorAppFlutter):
├── app_routes.dart — register new route "/ask-munshi"
├── home_screen.dart — add entry point button
└── locator.dart — register new dependencies

Android (OperatorApp) [if hybrid/migration]:
├── FlutterAppManger.kt — add new callFlutterEngine() method for this feature
├── ModuleMethodChannel — add enum value if new channel needed
├── DashboardActivity.kt — add entry point to launch Flutter screen
└── v2/flutteraction/ — add new FlutterActionProvider if needed
```

### New files to create
List every new file following Clean Architecture structure, grouped by repo:
```
Flutter — New files (presentation/):
├── views/ask_munshi_screen.dart
├── widgets/chat_bubble_widget.dart
├── bloc/ask_munshi_bloc.dart
├── bloc/ask_munshi_event.dart
└── bloc/ask_munshi_state.dart

Flutter — New files (domain/):
├── repositories/munshi_repository.dart
├── usecases/send_message_usecase.dart
└── models/request/send_message_request.dart

Flutter — New files (data/):
├── remote/munshi_api_service.dart
├── repositories/munshi_repository_impl.dart
└── models/chat_message_model.dart

Android — New files [if hybrid]:
├── MunshiFlutterActionProvider.kt — bridge actions for this feature
└── MunshiFlutterActionExecutor.kt — execute bridge calls
```

### MethodChannel bridge plan (if hybrid/migration)
```
Android → Flutter:
| Channel | Method | Data | When |
|---------|--------|------|------|
| COMMUNICATION_WITH_NATIVE_APP | setMunshiContext | {vehicleId, token} | On feature launch |

Flutter → Android:
| Channel | Method | Data | When |
|---------|--------|------|------|
| COMMUNICATION_WITH_ACTIVITY | openNativeScreen | {type: "camera"} | User taps camera in chat |
```

### Migration impact (if migration scope)
```
Android code to deprecate after Flutter migration:
├── MunshiActivity.kt — replaced by Flutter ask_munshi_screen.dart
├── MunshiViewModel.kt — replaced by Flutter ask_munshi_bloc.dart
└── MunshiApiService.kt — replaced by Flutter munshi_api_service.dart

Bridge code needed during transition:
├── Data passed from Android → Flutter on launch
├── Callbacks from Flutter → Android for native features (camera, GPS)
└── Shared preferences / local storage sync
```

### Widgets to use
Map Figma components to existing widgets:
```
Figma "Chat Card" → WeCardV2
Figma "Send Button" → WEFlatButtonV2.primary
Figma "Message Input" → WeTextFieldV2
Figma "Loading" → WeLoaderWidget
```

### Design tokens to use
Map Figma colors/styles to code constants:
```
Primary blue → WEColors.color0066FF
Background → WEColors.colorFFFFFF
Border gray → WEColors.colorEBEDF1
Body text → WETheme.textStyleMedium14
Header → WETheme.textStyleBold16
Spacing → verticalSpace16, horizontalPadding16
```

### Missing items (ask developer)
Flag anything that doesn't exist in the codebase:
```
⚠ Color #7C3AED not found in WEColors or AssetsColors — add to AssetsColors?
⚠ No existing widget matches "Voice Input Button" — create new or use existing?
⚠ Localization key for "Ask Munshi" not found — add to WeLangKeysStore?
```

End with: **"Approve this plan? Or suggest changes."**

## Phase 3: Iterative approval loop

THIS IS CRITICAL. Do NOT generate code until the developer explicitly approves.

The developer may:
- **Remove files** — "don't change bottom_nav_bloc.dart"
- **Add requirements** — "also add a history screen"
- **Change approach** — "use floating button instead of tab"
- **Correct understanding** — "the API is POST not GET"
- **Change widgets** — "use WeCardV2 not WeCard"
- **Answer missing items** — "yes add that color as AssetsColors.color7C3AED"

For each piece of feedback:
1. Acknowledge the change specifically
2. Update the plan showing what changed (mark with ✗ Removed, ✓ Added, ↻ Changed)
3. Show the updated plan
4. Ask again: **"Approve this plan? Or more changes needed."**

**Repeat until the developer says one of:** "approved", "looks good", "haan ye sahi hai", "go ahead", "generate code", "theek hai", "LGTM"

## Phase 4: Code generation

Once approved, generate code file by file. For EACH file:

### Mandatory conventions (from CLAUDE.md)

**Scaffold:** Use `WEScaffold(...)`. NEVER raw `Scaffold(...)`.

**AppBar:** Use `WEAppBar(title: ...)`. NEVER raw `AppBar(...)`.

**Text widget:** Use `WeText(...)` for ALL text display. NEVER raw `Text(...)`.

**Colors:** Use `WEColors.colorXXXXXX` or `AssetsColors.colorXXXXXX` only. Never `Color(0xff...)`.

**Text styles:** Use `WETheme.textStyleMedium14` etc. Never inline `TextStyle(...)`. NEVER add `height:` in `.copyWith()`.

**Spacing:** Use `verticalSpace16`, `horizontalPadding16` etc. Never inline `SizedBox(height: 16)`.

**Empty widget:** Use `emptyWidget`. Never `SizedBox.shrink()` or `SizedBox()`.

**Strings:** Use `WeLangKeysStore.instance.myKey.string(context)` for localized strings or `RawStrings.myKey` for static English strings. Never hardcode inline strings. Button text MUST also use WeLangKeysStore or RawStrings.

**Buttons:** Use `WEFlatButtonV2.primary(...)` variants. Never raw `ElevatedButton`.

**Text fields:** Use `WeTextFieldV2(...)`. Never raw `TextField`.

**Navigation:** Use `WeNavigator.push/pop`. NEVER `Navigator.of(context)` or `Navigator.push/pop` directly.

**Cards:** Use `WeCardV2(...)`. Never raw `Card(...)`.

**Loading:** Use `WeLoaderWidget()`. Never `CircularProgressIndicator()`.

**Dialogs:** Use `WeConfirmationDialog.show(...)`. Never raw `AlertDialog(...)`.

**Dividers:** Use `WeDividerWidget()`. Never raw `Divider()`.

**Checkboxes:** Use `WeCheckboxWidget(...)`. Never raw `Checkbox(...)`.

**Tap handling:** Use `WeInkWell(onTap:)`. Never `GestureDetector(onTap:)` for simple taps.

**Icons/Images:** Use `AssetsHelper.svg()` / `.png()` / `.pngNetwork()`. Never raw `SvgPicture.asset()` / `Image.asset()`.

**Bottom sheets:** Use `showCustomBottomSheet(...)`. Never raw `showModalBottomSheet(...)`. For standard bottom sheets with header + buttons, use `WeOpBottomSheetHelperWidgetV2`.

**Toasts:** Use `WEOpToast().showSuccessToast(context, message:)` / `.showErrorToast(...)` for visual success/error feedback. Never raw `ScaffoldMessenger.showSnackBar(SnackBar(...))`.

**Text formatters:** Use `UpperCaseTextFormatter` / `AlphaNumericTextFormatter` from `package:we_base`. Never create custom formatters for these common patterns.

**Route names:** Use `ModuleRouteNames.myScreen` for navigation. Never hardcode route strings like `'/my-route'`.

**Date/time:** Use `DateTimeUtils` from `package:we_op_common` for date formatting and epoch conversions. Never write custom date formatting logic.

**If ANY widget/color/style/constant you need does NOT exist in the codebase → STOP and ask the developer. NEVER invent or use raw Flutter widgets.**

**State management:** BLoC with events extending `Equatable`, sealed state classes.

**API:** Retrofit service → abstract Repository (returns `ResponseState<T>`) → impl extends BaseApiRepository (uses `handleResponse`) → UseCase. NEVER use deprecated `getStateOf`/`DataState` in new features.

**Models:** Manual `fromJson`/`toJson`. No code generation (no freezed, no json_serializable).

**DI:** Register in `locator.dart` using GetIt. Check `isRegistered` before registering.

**Analytics:** `WeLyticsEventManagerV2` with static singleton pattern. Use `super.sendEvent(named params)`, NOT `EventDTO`. Define event constants in feature's `analytics/` directory. Usage: `MyEventManager.instance.method()` — NOT `locator<>()`.

**Errors:** Emit `ShowSnackBarState` from BLoC, show via `SnackBars(message:).show(context)` in BlocListener.

### Generation order

**Flutter code (always):**
1. Models (domain + data) — request and response
2. API service (Retrofit)
3. Repository interface (domain)
4. Repository implementation (data)
5. UseCase
6. BLoC (events → states → bloc)
7. Widgets (feature-local)
8. Screen (view)
9. DI registration (locator.dart)
10. Route registration
11. Analytics event manager
12. Localization keys (WeLangKeysStore additions)

**Android code (if hybrid/migration):**
13. FlutterActionProvider (bridge action definitions)
14. FlutterActionExecutor (bridge call implementations)
15. FlutterAppManger.kt updates (new callFlutterEngine method)
16. ModuleMethodChannel enum updates (if new channel)
17. Activity/Fragment updates (entry point to launch Flutter)
18. Android-side data models (for MethodChannel serialization)

**MethodChannel bridge code (if hybrid):**
19. Flutter-side MethodChannel handler (receive from Android)
20. Flutter-side NativeActionInvoker (send to Android)
21. Data serialization — JSON encode/decode on both sides must match

### After generating each file

Run an internal compliance check (same logic as `/check-code`):
- Scan for hardcoded colors → replace with constants
- Scan for hardcoded text styles → replace with WETheme
- Scan for hardcoded spacing → replace with spacing constants
- Scan for hardcoded strings → flag for localization
- Scan for raw Navigator/Button/TextField → replace with WE variants

If auto-fixable, fix silently. If needs developer input, flag it.

## Phase 5: Self-Verification (MANDATORY — never skip)

After ALL files are generated, run a **3-layer verification** before presenting to the developer. Do NOT mark the task as complete until all 3 layers pass.

### Layer 1: Convention Compliance (AI scan)
Run the full `/check-code` logic on every generated/modified file:
- Scan for hardcoded colors → auto-fix with `WEColors`/`AssetsColors` constants
- Scan for hardcoded text styles → auto-fix with `WETheme`
- Scan for hardcoded spacing (`SizedBox`, `EdgeInsets`) → auto-fix with spacing constants
- Scan for hardcoded strings → auto-fix with `WeLangKeysStore`/`RawStrings`
- Scan for raw Flutter widgets → auto-fix with project widgets (WeText, WEScaffold, WEAppBar, WeCardV2, etc.)
- Scan for raw `showModalBottomSheet` → auto-fix with `showCustomBottomSheet` + `WEBottomSheet`
- Scan for raw `Navigator` → auto-fix with `WeNavigator`
- Scan for `getStateOf`/`DataState` in new files → auto-fix with `handleResponse`/`ResponseState`

**If violations found → fix them silently → re-scan → repeat until 0 violations.**

### Layer 2: Structural Integrity (AI cross-file check)
Verify the generated code won't cause compile errors:

```
For EACH generated file, verify:
├── All imports resolve to real files/packages that exist in the project
├── Classes referenced in DI (locator.dart) actually exist
├── Repository interface methods match implementation methods (name, params, return type)
├── BLoC event classes match the on<Event> handlers in the BLoC
├── State classes used in BlocBuilder/BlocConsumer match what BLoC actually emits
├── Model fromJson/toJson field names match API response keys (check api-catalog.md)
├── Route registered in FeatureRoutes matches the BasePageRoute path
├── Constructor parameters in BlocProvider.create match the BLoC constructor
├── Generic types match: ResponseState<BaseAPIResponse<MyModel>> consistent across layers
└── No circular imports between files
```

**For each issue found:**
1. Fix it automatically if the correct answer is clear
2. If ambiguous → flag it for the developer (don't guess)

### Layer 3: Build Command Verification (if Flutter SDK available)
Check if Flutter SDK is accessible by running:
```bash
flutter --version 2>/dev/null
```

**If Flutter SDK IS available (Claude Code CLI):**
```bash
# Run Dart analysis on changed files
cd <flutter_project_path>
flutter analyze <path/to/changed/files>

# If errors found → read errors → fix code → re-run analyze
# Loop until: "No issues found!"
```

```bash
# For Android changes, run Gradle check
cd <android_project_path>
./gradlew compileDebugKotlin 2>&1 | head -50

# If errors found → read errors → fix code → re-run
```

**If Flutter SDK is NOT available (Cowork Desktop):**
Skip this layer — Layer 1 and Layer 2 already catch most issues.
After presenting code, tell the developer:
```
⚠ Build verification skipped (Flutter SDK not available in sandbox).
Run these commands locally to verify:
  cd ~/OperatorAppFlutter && flutter analyze apps/<feature>/lib/
  cd ~/OperatorApp && ./gradlew compileDebugKotlin
```

### Verification report (show to developer AFTER all layers pass):
```
## Verification Report

### Layer 1: Convention Compliance ✅
- Files checked: 12
- Auto-fixed: 5 violations
  ├── SizedBox(height: 8) → verticalSpace8 in chat_screen.dart
  ├── Color(0xff0066FF) → WEColors.color0066FF in bubble_widget.dart
  ├── EdgeInsets.only(top: 16) → topPadding16 in header_widget.dart
  ├── Text('hello') → WeText(RawStrings.hello) in input_widget.dart
  └── AppBar(title:) → WEAppBar(title:) in screen.dart
- Remaining violations: 0

### Layer 2: Structural Integrity ✅
- Import resolution: all imports valid
- DI registration: 4 new classes registered in locator.dart
- BLoC events ↔ handlers: matched
- Repository interface ↔ impl: matched
- Route registration: verified

### Layer 3: Build Verification ⚠️ (skipped — SDK not in sandbox)
Run locally: flutter analyze apps/ask_munshi/lib/

✅ Code is ready for review.
```

## Phase 6: Code review loop

The developer may ask for code changes:
- "BLoC mein loading state ke baad error state bhi handle karo"
- "API service mein header add karo"
- "This widget mein padding change karo"

Update ONLY the affected files — do not regenerate everything. Show what changed.

**After EVERY change → re-run Phase 5 verification again. Never skip.**

**Loop continues until the developer is satisfied.**

## Important rules

- NEVER generate code before plan approval
- NEVER skip the compliance check
- NEVER use widgets/colors/styles not found in the knowledge base without asking
- ALWAYS show impact on existing code before creating new code
- ALWAYS follow Clean Architecture (presentation → domain → data) for Flutter
- ALWAYS follow MVVM pattern for Android (Activity/Fragment → ViewModel → Repository)
- ALWAYS register new dependencies in locator.dart (Flutter) and DI module (Android)
- ALWAYS add analytics events for new screens and key actions
- ALWAYS check bridge-map.md before creating new MethodChannel connections — reuse existing channels where possible
- ALWAYS ensure JSON serialization matches on both Android (Kotlin) and Flutter (Dart) sides of a bridge
- ALWAYS check migration-tracker.md — if the feature already exists in Android, plan migration path not duplication
- If the knowledge base files are missing or stale, tell the developer to run `/sync` first
- For hybrid features: generate Flutter code first, then Android bridge code, then verify data models match across the bridge
