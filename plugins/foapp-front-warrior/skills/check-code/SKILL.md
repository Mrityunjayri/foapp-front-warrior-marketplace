---
name: check-code
description: >
  Validate code against project conventions for BOTH Flutter (Dart) and Android (Kotlin).
  Use when the user says "check code", "validate this", "is this code correct",
  "compliance check", "review conventions", "check my code", or wants to verify
  that generated or hand-written code follows all project rules. Works on .dart and .kt files.
metadata:
  version: "0.2.0"
---

# Check Code — Convention Compliance Validator (Flutter + Android)

Validate code against conventions for both OperatorAppFlutter (Dart) and OperatorApp (Kotlin). 24 Flutter rules + 7 Kotlin rules + 4 bridge rules = 35 total. Report violations with severity, location, and auto-fix suggestions.

## Input

Accept one of:
- A file path or list of file paths to check (`.dart` or `.kt`)
- A directory path (check all `.dart` and/or `.kt` files in it)
- Code pasted directly in chat
- "check my recent changes" — run `git diff --name-only` in BOTH repos and check changed files
- "check bridge code" — validate MethodChannel code on both Android and Flutter sides for consistency

## Validation rules

Check each rule below. For every violation found, report: file, line number (if applicable), rule violated, severity, and suggested fix.

### Rule 1: Scaffold — WEScaffold (severity: ERROR)
**Violation:** Raw `Scaffold(` used instead of `WEScaffold(`
**Check:** Grep for `Scaffold(` in UI code (exclude WEScaffold definition file)
**Fix:** Replace `Scaffold(...)` with `WEScaffold(...)`

### Rule 2: AppBar — WEAppBar (severity: ERROR)
**Violation:** Raw `AppBar(` used instead of `WEAppBar(`
**Check:** Grep for `AppBar(` in UI code (exclude WEAppBar definition file)
**Fix:** Replace `AppBar(...)` with `WEAppBar(title: ...)`

### Rule 3: Text widget — WeText (severity: ERROR)
**Violation:** Raw `Text(` used instead of `WeText(`
**Check:** Grep for `Text(` in UI code (widget files, screens, build methods)
**Fix:** Replace `Text(...)` with `WeText(...)`
**Exception:** `Text(` inside test files, and `text:` parameter in `TextSpan` children are allowed

### Rule 4: Colors (severity: ERROR)
**Violation:** `Color(0xff...)` used inline in widget code
**Check:** Grep for `Color(0x` in build methods, constructors, and widget returns
**Fix:** Replace with matching `WEColors.colorXXXXXX` or `AssetsColors.colorXXXXXX`
**Exception:** Color definitions inside `assets_colors.dart` itself are allowed

### Rule 5: Text styles (severity: ERROR)
**Violation:** `TextStyle(` used inline in UI code
**Check:** Grep for `TextStyle(` outside of theme definition files
**Fix:** Replace with `WETheme.textStyleXXXX.copyWith(...)` if customization needed

### Rule 6: Line height in text styles (severity: ERROR)
**Violation:** `height:` parameter used in `.copyWith()` on WETheme text styles
**Check:** Grep for `.copyWith(` with `height:` parameter in UI code
**Fix:** Remove `height:` parameter — this project does NOT use line height in text styles

### Rule 7: Spacing (severity: WARNING)
**Violation:** `SizedBox(height:` or `SizedBox(width:` with hardcoded numbers
**Check:** Grep for `SizedBox(height:` and `SizedBox(width:` in widget files
**Fix:** Replace with `verticalSpaceN` or `horizontalSpaceN` from we_style
**Violation:** `EdgeInsets.` used inline
**Fix:** Replace with spacing constants from we_style (horizontalPadding16, padding16, etc.)

### Rule 8: Empty widget (severity: WARNING)
**Violation:** `SizedBox.shrink()` or `SizedBox()` used instead of `emptyWidget`
**Check:** Grep for `SizedBox.shrink()` and `SizedBox()` (empty constructor) in UI code
**Fix:** Replace with `emptyWidget` constant from `package:we_style`

### Rule 9: Strings / Localization (severity: WARNING)
**Violation:** Hardcoded string literals in `WeText()`, button titles, hints, labels
**Check:** Grep for `WeText('` or `WeText("` with inline strings (excluding test files)
**Fix:** Use `WeLangKeysStore.instance.myKey.string(context)` for localized strings or `RawStrings.myKey` for static English strings
**Exception:** Strings in test files, comments, and debug prints are allowed

### Rule 10: Buttons (severity: ERROR)
**Violation:** `ElevatedButton`, `TextButton`, `OutlinedButton` used directly
**Check:** Grep for these widget names in UI code
**Fix:** Replace with `WEFlatButtonV2.primary(...)` or appropriate variant

### Rule 11: Text fields (severity: ERROR)
**Violation:** `TextField(` or `TextFormField(` used directly
**Check:** Grep for these widget names
**Fix:** Replace with `WeTextFieldV2(...)` or `WeOpTextFieldWidget(...)`

### Rule 12: Navigation (severity: ERROR)
**Violation:** `Navigator.of(context)` or `Navigator.push` used directly
**Check:** Grep for `Navigator.of` and `Navigator.push`
**Fix:** Replace with `WeNavigator.push/pop` or `AppNavigator.of(context)`

### Rule 13: Card widget (severity: ERROR)
**Violation:** Raw `Card(` used instead of `WeCardV2(`
**Check:** Grep for `Card(` in UI code (exclude test files and card definition files)
**Fix:** Replace with `WeCardV2(child: ..., borderRadius: ..., padding: ...)`

### Rule 14: Loading indicator (severity: ERROR)
**Violation:** `CircularProgressIndicator(` used instead of `WeLoaderWidget()`
**Check:** Grep for `CircularProgressIndicator(` in UI code
**Fix:** Replace with `WeLoaderWidget()`

### Rule 15: Dialog (severity: ERROR)
**Violation:** Raw `AlertDialog(` or `showDialog` with custom dialog used instead of `WeConfirmationDialog`
**Check:** Grep for `AlertDialog(` in UI code
**Fix:** Replace with `WeConfirmationDialog.show(context: ..., title: ..., leftButton: ..., rightButton: ...)`

### Rule 16: Divider (severity: WARNING)
**Violation:** Raw `Divider(` used instead of `WeDividerWidget(`
**Check:** Grep for `Divider(` in UI code (exclude divider definition files)
**Fix:** Replace with `WeDividerWidget()`

### Rule 17: Checkbox (severity: ERROR)
**Violation:** Raw `Checkbox(` used instead of `WeCheckboxWidget(`
**Check:** Grep for `Checkbox(` in UI code (exclude checkbox definition files)
**Fix:** Replace with `WeCheckboxWidget(displayText: [...], onChange: ...)`

### Rule 18: BLoC pattern (severity: WARNING)
**Violation:** Events not extending Equatable, states not sealed
**Check:** Read BLoC event files — check for `extends Equatable`. Read state files — check for `sealed class`
**Fix:** Add Equatable extension, convert to sealed classes

### Rule 19: API pattern (severity: WARNING)
**Violation A:** API calls not following Retrofit → Repository → UseCase pattern
**Check:** Look for direct Dio calls outside of repository implementations
**Fix:** Restructure following Clean Architecture layers

**Violation B:** New code using deprecated `getStateOf` + `DataState` instead of current `handleResponse` + `ResponseState`
**Check:** In NEW files (not existing legacy code), grep for `getStateOf`, `DataState<`, `DataSuccess`, `DataFailed`
**Fix:** Replace with `handleResponse` + `ResponseState<T>` pattern. Repository returns `ResponseState<BaseAPIResponse<T>>`, BLoC uses `response.when(onSuccess:, onFailed:)` or `is SuccessResponse<T>` type check
**Exception:** Existing files that already use `getStateOf`/`DataState` pattern — don't mix patterns in the same file. When fixing a bug in such a file, use the same pattern the file already uses

### Rule 20: Models (severity: WARNING)
**Violation:** Using `@JsonSerializable`, `@freezed`, or code generation for models
**Check:** Grep for these annotations
**Fix:** Replace with manual `fromJson`/`toJson` factory constructors

### Rule 21: DI registration (severity: WARNING)
**Violation:** New classes not registered in locator.dart
**Check:** Cross-reference new Repository, UseCase, BLoC classes against locator registrations
**Fix:** Add `locator.registerSingleton<MyClass>(...)` with `isRegistered` guard

### Rule 22: Analytics (severity: INFO)
**Violation:** New screen without screen_view event, new button without click event
**Check:** Look for screens missing `MyEventManager.instance.screenView()` in initState, buttons missing click event tracking
**Fix:** Create EventManager extending `WeLyticsEventManagerV2` with static singleton pattern. Use `super.sendEvent(named params)` — NOT `EventDTO`. Register via `static final instance` — NOT GetIt locator

### Rule 23: Tap handling — WeInkWell (severity: ERROR)
**Violation:** `GestureDetector(onTap:` used for simple tap handling
**Check:** Grep for `GestureDetector(` in UI code. If only `onTap` is used (no onLongPress, onPan, onScale, drag), it should be `WeInkWell`
**Fix:** Replace `GestureDetector(onTap: ..., child: ...)` with `WeInkWell(onTap: ..., child: ...)`
**Exception:** GestureDetector is allowed when using complex gestures (long press, pan, scale, drag)

### Rule 24: Icon/Image loading — AssetsHelper (severity: ERROR)
**Violation:** `SvgPicture.asset(`, `SvgPicture.network(`, `Image.asset(` used directly for app icons
**Check:** Grep for `SvgPicture.asset(`, `SvgPicture.network(`, `Image.asset(` in UI files
**Fix:** Replace with `AssetsHelper.svg(assetName: SVGAssetsPath.xxx)`, `AssetsHelper.png(assetName: PNGAssetsPath.xxx)`, or `AssetsHelper.pngNetwork(assetName: url)`
**Also check:** Hardcoded S3 URLs (wheelseye.com/static-content) inline instead of using path constants
**Fix:** Move URL to `SVGAssetsPath` or `PNGAssetsPath` constant, then use via AssetsHelper
**Exception:** `Image.network()` is allowed for dynamic user-uploaded images (profile pics, documents from API)

### Rule 25: Bottom sheet — showCustomBottomSheet (severity: ERROR)
**Violation:** Raw `showModalBottomSheet(` used instead of `showCustomBottomSheet(`
**Check:** Grep for `showModalBottomSheet(` in UI code
**Fix:** Replace with `showCustomBottomSheet(context: context, builder: ...)`

### Rule 26: Toast — WEOpToast (severity: WARNING)
**Violation:** Raw `ScaffoldMessenger.of(context).showSnackBar(SnackBar(` used for success/error feedback
**Check:** Grep for `showSnackBar(SnackBar(` and `ScaffoldMessenger` in UI code
**Fix:** Replace with `WEOpToast().showSuccessToast(context, message: ...)` or `.showErrorToast(...)`
**Exception:** `SnackBars(message:).show(context)` is allowed for BLoC error state handling

### Rule 27: Text formatters (severity: INFO)
**Violation:** Custom `TextInputFormatter` for uppercase or alphanumeric when existing ones are available
**Check:** Grep for `extends TextInputFormatter` in feature code (not in `we_base` package)
**Fix:** Use `UpperCaseTextFormatter` or `AlphaNumericTextFormatter` from `package:we_base`

### Rule 28: Route names (severity: WARNING)
**Violation:** Hardcoded route strings in `WeNavigator.push(context, routeName: '/my-route')`
**Check:** Grep for `routeName: '/'` or `routeName: "/"` in navigation calls
**Fix:** Define route in `ModuleRouteNames` and use `ModuleRouteNames.myScreen`

## Output format

Present results grouped by severity:

```
## Compliance Report

### ❌ ERRORS (must fix)
1. **check_code_screen.dart:45** — Hardcoded Color(0xff333333)
   → Replace with: AssetsColors.color333333 or nearest match
   
2. **chat_widget.dart:12** — Raw ElevatedButton used
   → Replace with: WEFlatButtonV2.primary(title: ..., onTap: ...)

### ⚠️ WARNINGS (should fix)
3. **bloc/munshi_bloc.dart:8** — Events don't extend Equatable
   → Add: extends Equatable, override props

### ℹ️ INFO (consider)
4. **views/munshi_screen.dart** — No screen_view analytics event found
   → Add MyEventManager.instance.screenView() in initState

### Summary
- Files checked: 8
- Errors: 2
- Warnings: 1  
- Info: 1
```

---

## Android / Kotlin validation rules

Apply these when checking `.kt` files in the OperatorApp repo.

### Rule K1: Architecture pattern (severity: WARNING)
**Violation:** Business logic in Activity/Fragment instead of ViewModel
**Check:** Look for API calls, data transformations, or complex logic in Activity/Fragment classes
**Fix:** Move to ViewModel, expose via LiveData/StateFlow

### Rule K2: DI pattern (severity: WARNING)
**Violation:** Manual instantiation instead of DI injection
**Check:** Grep for `= MyRepository()` or `= MyViewModel()` outside DI modules
**Fix:** Use Dagger/Hilt/Koin injection (check which DI framework the project uses in `di/` package)

### Rule K3: MethodChannel naming (severity: ERROR)
**Violation:** MethodChannel name doesn't match ModuleMethodChannel enum
**Check:** Grep for `MethodChannel(` and verify channel name exists in ModuleMethodChannel enum
**Fix:** Use existing ModuleMethodChannel enum value or add new one following naming convention

### Rule K4: Bridge data serialization (severity: ERROR)
**Violation:** Data sent via MethodChannel doesn't match Flutter-side expected format
**Check:** Compare JSON keys in Kotlin `jsonEncode`/`JSONObject` with Flutter-side `fromJson` parsing
**Fix:** Ensure identical key names and types on both sides

### Rule K5: FlutterActionProvider pattern (severity: WARNING)
**Violation:** Flutter bridge calls not following FlutterActionProvider/Executor pattern
**Check:** Grep for direct `methodChannel.invokeMethod` outside of action provider classes
**Fix:** Create proper FlutterActionProvider + FlutterActionExecutor in `v2/flutteraction/`

### Rule K6: Base class usage (severity: INFO)
**Violation:** Activity/Fragment not extending project base classes
**Check:** Look for `extends AppCompatActivity` instead of project base class (check `appBase/` and `base/`)
**Fix:** Extend the project's base Activity/Fragment class

### Rule K7: Network layer (severity: WARNING)
**Violation:** Direct OkHttp/Retrofit calls outside repository pattern
**Check:** Grep for Retrofit interface usage directly in ViewModel or Activity
**Fix:** Use Repository pattern — ViewModel → Repository → ApiService

---

## Cross-platform bridge validation

Apply these when checking MethodChannel bridge code spanning both repos.

### Rule B1: Channel consistency (severity: ERROR)
**Check:** For every `invokeMethod('methodName', ...)` on one side, verify there's a matching `setMethodCallHandler` or handler on the other side
**Fix:** Add missing handler or fix method name mismatch

### Rule B2: Data contract match (severity: ERROR)
**Check:** JSON keys sent from Android must exactly match keys parsed in Flutter (and vice versa)
**Fix:** Align key names — canonical source is whichever side was written first

### Rule B3: Error handling across bridge (severity: WARNING)
**Check:** Both sides should handle `PlatformException` / `MissingPluginException`
**Fix:** Add try-catch on invokeMethod side, result.error() handling on handler side

### Rule B4: Null safety across bridge (severity: WARNING)
**Check:** Nullable fields in Kotlin (`String?`) should map to nullable in Dart (`String?`)
**Fix:** Ensure nullability matches on both sides

---

## Output format

Present results grouped by platform and severity:

```
## Compliance Report

### Flutter (Dart)
#### ❌ ERRORS (must fix)
1. **check_code_screen.dart:45** — Hardcoded Color(0xff333333)
   → Replace with: AssetsColors.color333333 or nearest match

#### ⚠️ WARNINGS (should fix)
2. **bloc/munshi_bloc.dart:8** — Events don't extend Equatable
   → Add: extends Equatable, override props

### Android (Kotlin)
#### ❌ ERRORS (must fix)
3. **MunshiActionProvider.kt:22** — MethodChannel name not in ModuleMethodChannel enum
   → Add enum value or use existing channel

### Bridge (Cross-platform)
#### ❌ ERRORS (must fix)
4. **Bridge mismatch** — Android sends key "vehicle_id" but Flutter expects "vehicleId"
   → Align to snake_case "vehicle_id" on both sides

### Summary
- Flutter files checked: 8 | Errors: 1 | Warnings: 1
- Android files checked: 3 | Errors: 1 | Warnings: 0
- Bridge checks: 1 error found
```

## Auto-fix mode

If the user says "fix it" or "auto-fix", apply all ERROR and WARNING fixes automatically using the Edit tool. Show what was changed. Re-run the check to confirm zero violations remain.

Do NOT auto-fix INFO level — those need developer judgment.
Do NOT auto-fix bridge mismatches without developer confirmation — the developer must decide which side is canonical.

## Build Verification After Auto-Fix (NEVER skip)

After auto-fixing violations, verify the fixes don't introduce compile errors:

### Step 1: Re-run convention check
Run all 39 rules again on fixed files. Must return 0 ERRORS. If new violations → fix → re-run → loop.

### Step 2: Build via MCP (if available)
```
1. Call foapp-build.flutter_analyze(paths: [all auto-fixed files])
2. If compile errors from auto-fix → read errors → fix → re-analyze → loop until 0 errors
3. If Android/Kotlin files were fixed: Call foapp-build.gradle_build(task: "compileDebugKotlin")
4. If Kotlin errors → fix → re-build → loop until success
```

If MCP not available, tell developer which commands to run.

**Auto-fix must NEVER introduce new compile errors. Always verify after fixing.**
