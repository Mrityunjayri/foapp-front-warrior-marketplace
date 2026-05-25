---
name: crash-anr
description: >
  Deep analysis and fix for production crashes and ANRs from Firebase Crashlytics or Sentry.
  Use when the user says "crash fix", "ANR fix", "production crash", "Crashlytics issue",
  "Sentry error", "app is crashing", "app not responding", or provides a Firebase/Sentry
  error link or stack trace. Performs deep RCA across both Flutter and Android repos,
  presents analysis for approval, then applies the fix following all project conventions.
metadata:
  version: "1.0.0"
---

# Crash & ANR Analyzer — Deep RCA + Fix (Flutter + Android Hybrid)

Analyze production crashes and ANRs from Firebase Crashlytics or Sentry across the **hybrid OperatorApp**. This is a dual-repo project: Android (Kotlin) is the host, Flutter runs inside via MethodChannel. Both sides report errors to Firebase Crashlytics and Sentry.

The skill performs **deep-level root cause analysis** — it doesn't just find the crash line, it traces the entire execution path to identify *why* the crash happened, what conditions lead to it, and whether the same pattern exists elsewhere.

---

## Prerequisites — MCP Connectors

This skill works best with these connectors:

| Source | Connection | How it works |
|--------|-----------|--------------|
| **Sentry** | MCP connector (auto-fetch) | Connects via official Sentry MCP. Skill auto-fetches issues, stack traces, affected users, releases — no copy-paste needed. Developer just says "fix the top crash" or gives an issue ID. |
| **Firebase Crashlytics** | Manual paste | No MCP connector available. Developer copies stack trace from Firebase Console and pastes in chat. Skill handles the rest. |
| **Jira** | MCP connector (Atlassian Rovo) | Auto-reads production bug tickets with crash details, steps to reproduce, and attached logs. |

### First-time setup

If the Sentry connector is not connected, prompt the developer:
> "I can auto-fetch crash data from Sentry if you connect it. Want to set it up now?"
> If yes → use `suggest_connectors` to show the Sentry connect button.
> If no → fall back to manual paste mode for all sources.

---

## Input

The skill accepts input in **two modes**:

### Mode A: Auto-fetch from Sentry (preferred)

Developer can say any of:
- "Fix the top crash" / "What's crashing in production?"
- "Fix Sentry issue OPERATOR-1234"
- "Check crashes in the latest release"
- "Show me ANRs from last 7 days"
- A Sentry issue URL

**Auto-fetch flow:**
1. Use `find_issues` to search Sentry for unresolved crashes/ANRs in the project
2. Use `get_issue_details` to pull full stack trace, error message, affected users, frequency, tags
3. Use `find_releases` to check which release introduced the issue
4. Present a summary of top issues and let developer pick which to analyze, OR auto-analyze if they specified a specific issue

**Sentry MCP tools to use:**
```
find_issues       → search by query, project, status (unresolved), sort by frequency
get_issue_details → full stack trace, tags, first/last seen, user count, events
find_releases     → which version introduced the crash
find_tags         → device, OS, app version breakdown
```

**Example auto-fetch flow:**
```
Developer: "What's crashing in production?"

Skill:
1. find_issues(query: "is:unresolved", sort: "freq", project: "op-android")
2. Returns top 5 crashes with titles and user counts
3. Shows developer:
   "Here are the top 5 unresolved crashes:
    1. NullPointerException in VehicleListingScreen (1,247 users)
    2. PlatformException in MethodChannel handler (892 users)
    3. StateError in MunshiBloc (456 users)
    4. RangeError in FuelGuardWidget (234 users)
    5. ANR in DashboardActivity (189 users)
    Which one should I analyze?"

Developer: "Fix #1"

Skill:
4. get_issue_details(issue_id) → gets full stack trace
5. Proceeds to Phase 2 (Deep RCA)
```

### Mode B: Manual paste (Firebase Crashlytics or any source)

Developer provides one or more of:
1. **Firebase Crashlytics link** — URL to the crash/ANR cluster (developer copies stack trace from Firebase console)
2. **Raw stack trace** — pasted directly (Flutter Dart or Android Kotlin/Java)
3. **Error message** — exact error text (e.g., `Null check operator used on a null value`)
4. **ANR trace** — `main` thread dump showing where the app froze
5. **Crash frequency** — how many users affected, which app versions, which devices
6. **Jira ticket** — link to the production bug ticket (auto-read via Atlassian connector)

If the developer gives a Firebase Console URL, tell them:
> "I can't access Firebase directly — please paste the full stack trace from the Crashlytics console. I'll handle the analysis from there."

---

## Phase 1: Stack Trace Parsing & Classification

### Step 1 — Parse the crash/ANR data

Extract from the provided input:

| Field | What to extract |
|-------|----------------|
| **Error type** | Exception class (e.g., `NullPointerException`, `PlatformException`, `StateError`, `ANR`) |
| **Error message** | Full message string |
| **Stack frames** | Every frame with file, line, method — prioritize app frames over framework/library frames |
| **Platform** | Flutter (Dart), Android (Kotlin/Java), or Bridge (MethodChannel) |
| **Thread** | Main thread, Isolate, or background thread (critical for ANR classification) |
| **Device/OS** | Android version, device model, RAM (for device-specific issues) |
| **App version** | Which build/version the crash occurs in |
| **Frequency** | Number of occurrences, affected users % |

### Step 2 — Classify the issue

Determine the category. This affects the analysis approach:

#### Crash Categories

| Category | Indicators | Analysis approach |
|----------|-----------|-------------------|
| **Null Safety Crash** | `Null check operator used on a null value`, `type 'Null' is not a subtype of type 'X'`, `NoSuchMethodError: method not found on null` | Trace data flow backwards from crash site to find where null originates — usually API response missing a field or MethodChannel returning null |
| **Type Cast Crash** | `type 'X' is not a subtype of type 'Y'`, `ClassCastException` | Check `fromJson` models — API response type changed or field is wrong type |
| **Range/Index Crash** | `RangeError (index)`, `IndexOutOfBoundsException` | Check list operations — usually empty list accessed by index, or API returns fewer items than expected |
| **State Crash** | `Bad state: Cannot add event after closing`, `Bad state: Stream has already been listened to` | BLoC lifecycle issue — event added after dispose, or stream controller not properly closed |
| **Platform Crash** | `PlatformException`, `MissingPluginException` | MethodChannel issue — handler not registered, channel name mismatch, or native code crash |
| **Memory Crash** | `OutOfMemoryError`, large bitmap issues, device-specific OOM | Image loading without resize, unbounded list growth, or memory leak in long-running screen |
| **Unhandled Async** | `Unhandled Exception`, `Future` errors without catch | Missing try-catch on async operations, especially API calls |
| **Bridge Crash** | Stack trace spans both Dart and Kotlin/Java frames | Data serialization mismatch, null sent across bridge, or handler throwing on one side |

#### ANR Categories

| Category | Indicators | Analysis approach |
|----------|-----------|-------------------|
| **Main Thread I/O** | ANR trace shows file/network ops on main thread | Find the blocking call — usually synchronous SharedPreference read, database query, or file I/O on main thread |
| **Heavy Computation** | ANR trace shows JSON parsing, list sorting, image processing on main | Large data processing on main thread — should be moved to `compute()` or isolate |
| **Lock Contention** | ANR trace shows `Object.wait()`, `synchronized` blocks (Android) | Multiple threads competing for same lock — usually DB access pattern |
| **MethodChannel Blocking** | ANR trace shows `invokeMethod` waiting for response | Flutter calling Android synchronously, or Android handler taking too long to respond |
| **Layout Jank** | ANR during `onMeasure`/`onLayout` (Android), or build method taking >16ms (Flutter) | Deep widget tree, heavy build method, or unnecessary rebuilds in BlocBuilder |
| **DI Initialization** | ANR during `locator` registration or `initializeDependencies` | Too many synchronous registrations at startup — check locator.dart for blocking calls |

---

## Phase 2: Deep Root Cause Analysis

### Step 3 — Locate crash site in codebase

Using the stack trace frames, find the exact crash location:

**For Flutter crashes:**
```
1. Map stack frame → file path in OperatorAppFlutter repo
   e.g., "package:gps_route_v2/gps_route/presentation/bloc/my_bloc.dart:142"
   → apps/gps_route/lib/gps_route/presentation/bloc/my_bloc.dart line 142

2. Read the file at the crash line + 30 lines of context above and below

3. Identify the immediate cause (the actual failing operation)
```

**For Android crashes:**
```
1. Map stack frame → file path in OperatorApp repo
   e.g., "com.wheelseye.operator.feature.MyActivity.onCreate(MyActivity.kt:87)"
   → app/src/main/java/com/wheelseye/operator/feature/MyActivity.kt line 87

2. Read the file at the crash line + 30 lines of context

3. Identify the immediate cause
```

**For Bridge crashes:**
```
1. Find both the Flutter frame AND Android frame in the stack
2. Read both files — the crash is at the boundary
3. Compare the data being sent (Android) vs data being received (Flutter) or vice versa
```

### Step 4 — Trace execution path backwards

THIS IS THE DEEP ANALYSIS. Don't stop at the crash line — trace backwards to find the TRUE root cause.

**Trace chain for Flutter:**
```
Crash site (e.g., null access in widget)
  ← Where did the null value come from? (BLoC state field)
    ← Which BLoC event handler set this state? (check emit calls)
      ← What API/UseCase response led to this? (repository call)
        ← What did the API actually return? (check fromJson mapping)
          ← Is the API contract wrong, or is the model missing null handling?
```

**Trace chain for Android:**
```
Crash site (e.g., NPE in Activity)
  ← Where was the null variable supposed to be set? (onCreate, onNewIntent, savedInstanceState)
    ← Was it set via Intent extras from Flutter's MethodChannel call?
      ← What data did Flutter send? (check the invokeMethod call)
        ← Was the data null at the Flutter side before sending?
```

**Trace chain for ANR:**
```
Frozen method (e.g., SharedPreferences.getString on main thread)
  ← Who calls this method? (trace callers)
    ← Is this called during screen init? (initState, onCreate)
      ← Can this be made async or moved off main thread?
        ← What data does it load and who consumes it?
```

At each level of the trace, **read the actual code** — do not assume. Use `Read` and `Grep` tools to follow the chain.

### Step 5 — Check for pattern recurrence

After finding the root cause, check if the SAME pattern exists elsewhere:

```bash
# If root cause is missing null check on API field:
Grep for the same model class usage across all features

# If root cause is unsafe ! operator:
Grep for the same variable access pattern in similar screens

# If root cause is MethodChannel data mismatch:
Check bridge-map.md for all channels using the same data structure

# If root cause is main thread blocking:
Grep for similar blocking calls (SharedPreferences.getInstance sync, jsonDecode on main)
```

Report ALL occurrences — the developer decides which to fix now vs later.

---

## Phase 3: RCA Report & Approval

### Step 6 — Present the full RCA to the developer

Present the analysis in this format:

```
## Crash/ANR Root Cause Analysis

### Issue Summary
- **Type:** Crash / ANR
- **Category:** [from classification table]
- **Error:** [exact error message]
- **Platform:** Flutter / Android / Bridge
- **Affected:** [X users, Y% of sessions, versions A-B]
- **Severity:** Critical / High / Medium

### Stack Trace (key frames)
```
[Top 5-10 relevant frames from the stack trace, with file paths mapped to repo]
```

### Execution Trace (deep analysis)
```
1. CRASH SITE: file.dart:142 — `model.name!` throws because `name` is null
2. STATE SOURCE: my_bloc.dart:87 — `emit(MyLoaded(response.data))` passes null `name` field
3. API RESPONSE: my_repository_impl.dart:34 — `getStateOf()` succeeds but `name` field is null in JSON
4. MODEL: my_model.dart:12 — `fromJson` maps `json['name']` but API sometimes omits this field
5. ROOT CAUSE: API returns `name: null` for vehicles without registration. Model doesn't handle null.
```

### Root Cause
[2-3 sentences: exactly what is wrong, why it happens, and under what conditions]

### Proposed Fix

**Files to change:**
```
Flutter (OperatorAppFlutter):
├── apps/gps_route/lib/.../my_model.dart:12
│   Change: `name: json['name']` → `name: json['name'] as String?`
│   Why: Allow null from API response
│
├── apps/gps_route/lib/.../my_screen.dart:142
│   Change: `model.name!` → `model.name ?? RawStrings.defaultVehicleName`
│   Why: Handle null display gracefully instead of crashing

Android (OperatorApp) [if bridge involved]:
├── .../MyActivity.kt:87
│   Change: [what changes]
│   Why: [reason]
```

**Diff preview:**
```dart
// my_model.dart — BEFORE
name: json['name'],

// my_model.dart — AFTER
name: json['name'] as String?,
```

```dart
// my_screen.dart — BEFORE
WeText(model.name!, style: WETheme.textStyleMedium14)

// my_screen.dart — AFTER
WeText(model.name ?? RawStrings.defaultVehicleName, style: WETheme.textStyleMedium14)
```

### Same Pattern Found Elsewhere
```
⚠ Same unsafe `!` on `name` field also found in:
  - apps/gps_route/lib/.../vehicle_card_widget.dart:67
  - apps/gps_route/lib/.../vehicle_detail_screen.dart:134
  Should these be fixed too? (will not fix unless you approve)
```

### Side Effects Check
- [What other screens/flows use this model — will the null type change break them?]
- [Are there BLoC states that assume this field is non-null?]
- [Does any MethodChannel bridge send this field — will it handle null?]
```

End with: **"Approve this fix? Or need changes to the approach?"**

**Do NOT make any code changes until the developer explicitly approves.**

---

## Phase 4: Apply Fix

### Step 7 — Fix with minimal changes

Once approved, apply the fix following ALL project conventions:

**Mandatory conventions — ALL fixes MUST follow these. No exceptions even for "just a crash fix":**

**Widgets — NEVER use raw Flutter widgets:**
- `WEScaffold(...)` — NEVER raw `Scaffold(...)`
- `WEAppBar(title: ...)` — NEVER raw `AppBar(...)`
- `WeText(...)` — NEVER raw `Text(...)` (exception: `text:` in `TextSpan` children)
- `WeCardV2(...)` — NEVER raw `Card(...)`
- `WeLoaderWidget()` — NEVER `CircularProgressIndicator()`
- `WeConfirmationDialog.show(...)` — NEVER raw `AlertDialog(...)`
- `WeDividerWidget()` — NEVER raw `Divider()`
- `WeCheckboxWidget(...)` — NEVER raw `Checkbox(...)`
- `WEFlatButtonV2.primary(...)` — NEVER raw `ElevatedButton` / `TextButton`
- `WeTextFieldV2(...)` — NEVER raw `TextField` / `TextFormField`
- `WeInkWell(onTap:)` — NEVER raw `GestureDetector(onTap:)` or `InkWell(...)` for simple taps
- `emptyWidget` — NEVER `SizedBox.shrink()` or `SizedBox()` (empty)

**Styling — NEVER hardcode:**
- Colors: `WEColors.colorXXXXXX` or `AssetsColors.colorXXXXXX` — NEVER `Color(0xff...)`
- Text styles: `WETheme.textStyleMedium14` — NEVER inline `TextStyle(...)`. NEVER add `height:` in `.copyWith()`
- Spacing: `verticalSpace16` / `horizontalPadding16` — NEVER `SizedBox(height: 16)` or inline `EdgeInsets`

**Strings — NEVER hardcode inline:**
- Localized: `WeLangKeysStore.instance.myKey.string(context)`
- Static English: `RawStrings.myKey` (in feature's `utils/raw_strings.dart`)
- NEVER `WeText("Some text")` or `title: "Click here"` — always use WeLangKeysStore or RawStrings

**Navigation:**
- `WeNavigator.push/pop` — NEVER `Navigator.of(context)` or `Navigator.push/pop` directly
- Route names: `ModuleRouteNames.myScreen` — NEVER hardcoded route strings

**Images/Icons:**
- `AssetsHelper.svg(assetName: SVGAssetsPath.xxx)` — NEVER raw `SvgPicture.asset(...)`
- `AssetsHelper.png(assetName: PNGAssetsPath.xxx)` — NEVER raw `Image.asset(...)`
- `AssetsHelper.pngNetwork(assetName: url)` — for network images from S3

**Bottom sheets / Toasts / Errors:**
- `showCustomBottomSheet(...)` — NEVER raw `showModalBottomSheet(...)`
- `WEOpToast().showSuccessToast/showErrorToast` — for success/error feedback, NEVER raw `SnackBar`
- `SnackBars(message:).show(context)` — for BLoC error side-effect states only

**State management:**
- BLoC events extend `Equatable`, states are `sealed class`
- Error display: emit `ShowSnackBarState` from BLoC → show via `SnackBars` in `BlocListener`
- NEVER call `SnackBars` directly from BLoC — always from UI layer

**API / Models:**
- Manual `fromJson`/`toJson` — NEVER `@JsonSerializable`, `@freezed`, or code generation
- Repository extends `BaseApiRepository`, uses `handleResponse()` → `ResponseState<T>` → `.when(onSuccess:, onFailed:)` for NEW code. Legacy code uses `getStateOf()` → `DataState<T>` — when fixing bugs in legacy files, match the existing pattern
- DI: register in `locator.dart` with `isRegistered` guard

**Analytics:**
- `WeLyticsEventManagerV2` with static singleton `MyEventManager.instance` — NEVER `locator<>`
- `super.sendEvent(named params)` — NEVER `EventDTO`
- `vehicleID` (capital D) — NEVER `vehicleId` (lowercase d)

**If ANY widget/color/style/constant needed for the fix does NOT exist in the codebase → STOP and ask the developer. NEVER invent or use raw Flutter widgets.**

### Crash-specific fix patterns

**Null Safety fixes:**
```dart
// ❌ WRONG — hardcoded empty string fallback
WeText(model.name ?? '', style: WETheme.textStyleMedium14)

// ❌ WRONG — using raw Text widget in the fix
Text(model.name ?? 'Unknown')

// ❌ WRONG — adding force unwrap (!) to "fix" a null issue
final name = model.name!;  // This is what CAUSED the crash, don't add more

// ✅ CORRECT — make model field nullable at data layer
// In model fromJson:
name: json['name'] as String?,

// ✅ CORRECT — use RawStrings for fallback, WeText for display
WeText(
  model.name ?? RawStrings.defaultVehicleName,
  style: WETheme.textStyleMedium14,
)

// ✅ CORRECT — validate in BLoC before emitting state (if field is required)
if (response.data?.name == null) {
  emit(ShowSnackBarState(RawStrings.vehicleDataError));
  return;
}
emit(MyLoaded(response.data!));
```

**ANR fixes:**
```dart
// ❌ WRONG — wrapping in Future.delayed (hides the problem)
Future.delayed(Duration.zero, () => heavyOperation());

// ❌ WRONG — raw SharedPreferences
final prefs = await SharedPreferences.getInstance();

// ✅ CORRECT — use WeOpSharedPreference (project wrapper)
final value = await WeOpSharedPreference.getString('key');

// ✅ CORRECT — use compute() for heavy JSON parsing
final result = await compute(parseJsonInBackground, jsonString);

// ✅ CORRECT — move blocking I/O off main thread
// In BLoC handler, emit loading state FIRST, then do async work:
emit(MyLoading());
final data = await repository.fetchHeavyData();
emit(MyLoaded(data));

// ✅ CORRECT — add buildWhen to reduce widget rebuilds
BlocBuilder<MyBloc, MyState>(
  buildWhen: (prev, curr) => curr is MyLoaded || curr is MyLoading,
  builder: (context, state) { ... },
)
```

**Bridge fixes:**
```dart
// ❌ WRONG — fix only Flutter side, ignore Android
// Flutter: json['name'] as String? ?? ''
// Android: still sends null (unfixed)

// ❌ WRONG — hardcode fallback string inline
json['name'] as String? ?? 'Unknown'

// ✅ CORRECT — fix BOTH sides + use RawStrings for fallback

// Android side (Kotlin) — send default if null:
jsonObject.put("name", name ?: "")

// Flutter side (Dart) — still handle null defensively:
name: json['name'] as String?,

// Flutter UI — use RawStrings for display fallback:
WeText(
  model.name ?? RawStrings.unknownVehicle,
  style: WETheme.textStyleMedium14,
)

// ALWAYS verify JSON keys match exactly on both sides
// Android: jsonObject.put("vehicle_id", vehicleId)
// Flutter: vehicleId: json['vehicle_id'] as String?
// Key mismatch = silent null = crash later
```

**State lifecycle fixes:**
```dart
// ❌ WRONG — just catching the error
try { bloc.add(MyEvent()); } catch (_) {}

// ✅ CORRECT — check lifecycle before adding event
if (!bloc.isClosed) {
  bloc.add(MyEvent());
}

// ✅ CORRECT — cancel subscriptions in dispose
@override
void dispose() {
  _subscription?.cancel();
  super.dispose();
}
```

### Step 8 — Run compliance check

After applying the fix, scan every changed file for:
- Hardcoded colors → replace with constants
- Hardcoded styles → replace with WETheme
- Hardcoded strings → replace with WeLangKeysStore / RawStrings
- Raw Flutter widgets → replace with project widgets
- Missing null checks introduced by the fix

If auto-fixable, fix silently. If needs developer input, flag it.

---

## Phase 5: Verification Report

### Step 9 — Present the fix summary

```
## Fix Applied

### Changes Made
| File | Line | What Changed |
|------|------|-------------|
| my_model.dart | 12 | Made `name` field nullable (String?) |
| my_screen.dart | 142 | Added null fallback with RawStrings |

### Compliance Check
✅ No convention violations in changed files

### Crash Prevention Verification
- [x] The null case that caused the crash is now handled
- [x] The fix does not introduce new nullable access without checks
- [x] No side effects on other screens using this model
- [x] Bridge data contract unchanged (or updated on both sides)

### Similar Patterns (not fixed — awaiting your decision)
- vehicle_card_widget.dart:67 — same `name!` pattern
- vehicle_detail_screen.dart:134 — same `name!` pattern

Fix these too? Or track as separate tickets?
```

---

## ANR-Specific Deep Analysis

ANRs require a different analysis approach than crashes because there's no "crash line" — instead, the app is frozen.

### ANR Analysis Steps

1. **Read the thread dump** — find what the main thread is blocked on
2. **Classify the block type:**
   - **I/O block** — network call, file read, database query on main thread
   - **Compute block** — JSON parsing, list sorting, image processing on main thread
   - **Lock block** — waiting for a lock held by another thread
   - **Bridge block** — `invokeMethod` waiting for response from the other platform
   - **Layout block** — expensive widget tree rebuild

3. **For I/O blocks:** Find the synchronous call and make it async
4. **For Compute blocks:** Move to `compute()` isolate or optimize the algorithm
5. **For Lock blocks:** Reduce lock scope or use async alternatives
6. **For Bridge blocks:** Check if the handler on the other side is doing heavy work
7. **For Layout blocks:** Identify the expensive widget, add `const`, reduce rebuilds, check `BlocBuilder` `buildWhen`

### Common ANR Patterns in This Project

| Pattern | Where to look | Fix |
|---------|--------------|-----|
| `WeOpSharedPreference` sync read at startup | `initializeDependencies`, `locator.dart` | Make async, use `await`. NEVER use raw `SharedPreferences.getInstance()` — use `WeOpSharedPreference` |
| Large JSON parse on main thread | `fromJson` on large API responses | Use `compute()` for lists > 100 items |
| MethodChannel blocking call | `invokeMethod` without timeout | Add timeout, handle `PlatformException` |
| Heavy BlocBuilder rebuild | Widget tree inside `BlocBuilder` | Add `buildWhen`, extract const widgets |
| Image loading without cache/resize | Network images with large dimensions | Use `CachedNetworkImage` with `maxWidth`/`maxHeight`. For app assets use `AssetsHelper.pngNetwork()` — NEVER raw `Image.network` for app icons |
| Sync DB access on main thread | Direct Hive/SQLite read in BLoC handler | Use async read, add loading state |

---

## Strict Rules

- NEVER apply fixes without developer approval — always present RCA first
- NEVER refactor or improve code beyond what the crash/ANR fix requires
- NEVER guess the root cause — trace the actual code path with Read/Grep tools
- NEVER fix only one side of a bridge crash — always check and fix BOTH Android and Flutter sides
- NEVER add blanket try-catch to suppress crashes — fix the actual root cause
- NEVER add `!` (force unwrap) in a crash fix — that's likely what caused it
- NEVER ignore "same pattern elsewhere" — always report it, let developer decide
- For ANR fixes: NEVER just add `Future.delayed` — that hides the problem, doesn't fix it
- For null fixes: handle at the CORRECT layer — model, repository, BLoC, or UI depending on where the null should be caught
- Maximum diff should be minimal — if the crash has a 1-line fix, don't turn it into a 50-line refactor
- If the fix requires architectural changes (e.g., "this entire screen needs to be rewritten"), STOP and tell the developer rather than making huge changes

---

## Integration with Project Error Handling

This project uses both **Firebase Crashlytics** and **Sentry** for error reporting:

**Flutter error handling (main.dart):**
```dart
FlutterError.onError = (errorDetails) {
  Sentry.captureException(errorDetails.exception, stackTrace: errorDetails.stack);
  FirebaseCrashlytics.instance.recordFlutterError(errorDetails, fatal: ...);
};
```

**Sentry logging (for non-fatal issues):**
```dart
SentryLogger.instance.logError(SentryLogEntry(
  message: 'Description of what went wrong',
  attributes: [SentryLogAttribute(key: 'vehicleId', value: id)],
));
```

When fixing a crash, consider whether the fix should also add Sentry logging for the edge case that caused it — so future occurrences of similar-but-not-identical issues are captured before they crash.
