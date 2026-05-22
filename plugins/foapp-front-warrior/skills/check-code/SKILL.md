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

Validate code against conventions for both OperatorAppFlutter (Dart) and OperatorApp (Kotlin). Report violations with severity, location, and auto-fix suggestions.

## Input

Accept one of:
- A file path or list of file paths to check (`.dart` or `.kt`)
- A directory path (check all `.dart` and/or `.kt` files in it)
- Code pasted directly in chat
- "check my recent changes" — run `git diff --name-only` in BOTH repos and check changed files
- "check bridge code" — validate MethodChannel code on both Android and Flutter sides for consistency

## Validation rules

Check each rule below. For every violation found, report: file, line number (if applicable), rule violated, severity, and suggested fix.

### Rule 1: Colors (severity: ERROR)
**Violation:** `Color(0xff...)` used inline in widget code
**Check:** Grep for `Color(0x` in build methods, constructors, and widget returns
**Fix:** Replace with matching `WEColors.colorXXXXXX` or `AssetsColors.colorXXXXXX`
**Exception:** Color definitions inside `assets_colors.dart` itself are allowed

### Rule 2: Text styles (severity: ERROR)
**Violation:** `TextStyle(` used inline in UI code
**Check:** Grep for `TextStyle(` outside of theme definition files
**Fix:** Replace with `WETheme.textStyleXXXX.copyWith(...)` if customization needed

### Rule 3: Spacing (severity: WARNING)
**Violation:** `SizedBox(height:` or `SizedBox(width:` with hardcoded numbers
**Check:** Grep for `SizedBox(height:` and `SizedBox(width:` in widget files
**Fix:** Replace with `verticalSpaceN` or `horizontalSpaceN` from we_style
**Violation:** `EdgeInsets.` used inline
**Fix:** Replace with spacing constants from we_style (horizontalPadding16, padding16, etc.)

### Rule 4: Strings / Localization (severity: WARNING)
**Violation:** Hardcoded string literals in `Text()`, button titles, hints, labels
**Check:** Grep for `Text('` or `Text("` (excluding test files)
**Fix:** Add key to `WeLangKeysStore` and use `.string(context)`
**Exception:** Strings in test files, comments, and debug prints are allowed

### Rule 5: Buttons (severity: ERROR)
**Violation:** `ElevatedButton`, `TextButton`, `OutlinedButton` used directly
**Check:** Grep for these widget names in UI code
**Fix:** Replace with `WEFlatButtonV2.primary(...)` or appropriate variant

### Rule 6: Text fields (severity: ERROR)
**Violation:** `TextField(` or `TextFormField(` used directly
**Check:** Grep for these widget names
**Fix:** Replace with `WeTextFieldV2(...)` or `WeOpTextFieldWidget(...)`

### Rule 7: Navigation (severity: ERROR)
**Violation:** `Navigator.of(context)` or `Navigator.push` used directly
**Check:** Grep for `Navigator.of` and `Navigator.push`
**Fix:** Replace with `WeNavigator.push/pop` or `AppNavigator.of(context)`

### Rule 8: BLoC pattern (severity: WARNING)
**Violation:** Events not extending Equatable, states not sealed
**Check:** Read BLoC event files — check for `extends Equatable`. Read state files — check for `sealed class`
**Fix:** Add Equatable extension, convert to sealed classes

### Rule 9: API pattern (severity: WARNING)
**Violation:** API calls not following Retrofit → Repository → UseCase pattern
**Check:** Look for direct Dio calls outside of repository implementations
**Fix:** Restructure following Clean Architecture layers

### Rule 10: Models (severity: WARNING)
**Violation:** Using `@JsonSerializable`, `@freezed`, or code generation for models
**Check:** Grep for these annotations
**Fix:** Replace with manual `fromJson`/`toJson` factory constructors

### Rule 11: DI registration (severity: WARNING)
**Violation:** New classes not registered in locator.dart
**Check:** Cross-reference new Repository, UseCase, BLoC classes against locator registrations
**Fix:** Add `locator.registerSingleton<MyClass>(...)` with `isRegistered` guard

### Rule 12: Analytics (severity: INFO)
**Violation:** New screen without screen_view event, new button without click event
**Check:** Look for screens missing `MyEventManager.instance.screenView()` in initState, buttons missing click event tracking
**Fix:** Create EventManager extending `WeLyticsEventManagerV2` with static singleton pattern. Use `super.sendEvent(named params)` — NOT `EventDTO`. Register via `static final instance` — NOT GetIt locator

### Rule 13: Tap handling — WeInkWell (severity: ERROR)
**Violation:** `GestureDetector(onTap:` used for simple tap handling
**Check:** Grep for `GestureDetector(` in UI code. If only `onTap` is used (no onLongPress, onPan, onScale, drag), it should be `WeInkWell`
**Fix:** Replace `GestureDetector(onTap: ..., child: ...)` with `WeInkWell(onTap: ..., child: ...)`
**Exception:** GestureDetector is allowed when using complex gestures (long press, pan, scale, drag)

### Rule 14: Icon/Image loading — AssetsHelper (severity: ERROR)
**Violation:** `SvgPicture.asset(`, `SvgPicture.network(`, `Image.asset(` used directly for app icons
**Check:** Grep for `SvgPicture.asset(`, `SvgPicture.network(`, `Image.asset(` in UI files
**Fix:** Replace with `AssetsHelper.svg(assetName: SVGAssetsPath.xxx)`, `AssetsHelper.png(assetName: PNGAssetsPath.xxx)`, or `AssetsHelper.pngNetwork(assetName: url)`
**Also check:** Hardcoded S3 URLs (wheelseye.com/static-content) inline instead of using path constants
**Fix:** Move URL to `SVGAssetsPath` or `PNGAssetsPath` constant, then use via AssetsHelper
**Exception:** `Image.network()` is allowed for dynamic user-uploaded images (profile pics, documents from API)

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
