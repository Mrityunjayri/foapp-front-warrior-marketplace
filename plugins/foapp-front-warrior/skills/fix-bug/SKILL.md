---
name: fix-bug
description: >
  Fix bugs with minimal, scoped changes. Use when the user says "fix bug", "debug this",
  "this screen is crashing", "this API is failing", "something broke", or reports any bug
  in Flutter or Android code. Keeps changes minimal — no refactoring, no feature additions,
  just the fix.
metadata:
  version: "0.1.0"
---

# Fix Bug — Minimal, Scoped Changes (Flutter + Android Hybrid)

Fix bugs in the **hybrid OperatorApp** with the smallest possible diff. This is a dual-repo project: Android (Kotlin) is the host app, Flutter runs inside it via MethodChannel. The golden rule is **touch only what is broken**.

---

## Input

Provide any of the following (more context = faster diagnosis):

- **Bug description** — what went wrong, what was expected (text, Jira ticket link, error log, crash stack trace, or screenshot)
- **Affected feature/screen** — name of the screen, flow, or module where the bug appears (optional but speeds up scoping)
- **Steps to reproduce** — numbered steps to reliably trigger the bug (optional)
- **Platform** — Flutter, Android, or "not sure" (if not sure, the process will determine it)

---

## Process

### Step 1 — Scope the bug

Identify exactly where the bug lives before touching any code.

Determine:
- **Platform**: Flutter (Dart), Android (Kotlin), or Bridge (MethodChannel between both)
- **Layer**: UI / BLoC / UseCase / Repository / API / Data model / DI / Navigation / Bridge
- **Feature**: which app in `apps/`, which feature directory, which screen or flow

Load the relevant knowledge base files from the sync skill references:
- `references/feature-flows.md` — understand the expected flow before looking at code
- `references/bridge-map.md` — if the bug could be in MethodChannel communication
- `references/api-catalog.md` — if the bug involves an API call
- `references/architecture-map.md` — to find the right files quickly

If the knowledge base files are missing or stale, tell the developer to run `/sync` first.

### Step 2 — Trace the flow

Read the affected files and understand the current behavior end-to-end.

For Flutter bugs, trace: Screen → BLoC → UseCase → Repository → API Service → Model

For Android bugs, trace: Activity/Fragment → ViewModel → Repository → API/Local

For Bridge bugs, trace: Android trigger → MethodChannel invoke → Flutter handler → BLoC event → UI state

Use the explain-flow pattern if the bug is in an unfamiliar flow. Read only the files relevant to the reported bug — do not scan the entire codebase.

### Step 3 — Root cause analysis

Identify the single root cause. Be specific:

- What is the exact line or condition that is wrong?
- What is the current (broken) behavior?
- What should the behavior be?

Common root causes to check first:
- Null check missing or in the wrong place
- Wrong state being emitted from BLoC
- API response field name mismatch in `fromJson`
- MethodChannel data serialized differently on Android vs Flutter
- Missing `isRegistered` guard in locator causing duplicate registration
- Route argument type mismatch on navigation
- Index out of bounds in list operations
- Async/await missing, causing race condition

If you cannot determine the root cause with confidence, tell the developer what additional information is needed (specific log output, the value of a particular variable, which exact user action triggers the bug) rather than guessing.

### Step 4 — Impact assessment

Before making any change, list ONLY the files that need to be modified to fix this specific bug. Show this to the developer and get approval.

Present the assessment in this format:

```
Root cause:
[One to two sentences describing exactly what is wrong and why]

Files to change:
Flutter (OperatorAppFlutter):
├── path/to/file.dart  — line 42: [what needs to change and why]

Android (OperatorApp) [if bug spans the bridge]:
├── path/to/File.kt  — line 87: [what needs to change and why]

Files NOT changing (confirming scope):
├── [any file the developer might expect to change but does not need to]
```

End with: **"Approve this scope? Or is there something I'm missing?"**

Do NOT proceed until the developer approves.

### Step 5 — Fix

Make the minimal change. One fix per file if possible.

Follow all project conventions even in a bug fix — these are non-negotiable:
- Colors: `WEColors.colorXXXXXX` or `AssetsColors.colorXXXXXX` — never `Color(0xff...)`
- Text styles: `WETheme.textStyleMedium14` etc. — never inline `TextStyle(...)`
- Spacing: `verticalSpace16`, `horizontalPadding16` etc. — never inline `SizedBox(height: 16)`
- Strings: `WeLangKeysStore.instance.myKey.string(context)` — never hardcoded
- Buttons: `WEFlatButtonV2.primary(...)` variants — never raw `ElevatedButton`
- Tap handling: `WeInkWell(onTap: ...)` — never raw `GestureDetector` or `InkWell` for simple taps
- Navigation: `WeNavigator.push/pop` — never `Navigator.of(context)`
- State side effects: emit `ShowSnackBarState` from BLoC — never call `SnackBars` directly from BLoC

If fixing the bug correctly requires violating a convention (e.g., the convention itself is what's broken), flag this explicitly and ask the developer how to proceed.

### Step 6 — Verify

After applying the fix, run **mandatory self-verification** (NEVER skip):

**A) Convention compliance** — Run `/check-code` logic on every changed file:
- Scan for hardcoded colors, styles, spacing, strings, raw widgets introduced by the fix
- If violations found → auto-fix → re-scan → repeat until 0 violations

**B) Structural integrity** — Cross-file verification:
- All imports resolve to real files that exist
- If DI was touched: locator registrations match actual classes
- If BLoC was touched: event handlers match event classes, states match BlocBuilder usage
- If model was touched: fromJson keys match API response, type changes propagated to all usages
- If bridge was touched: JSON keys and types match on BOTH Android and Flutter sides

**C) Build verification** (if Flutter SDK available):
```bash
flutter analyze <changed_files> 2>/dev/null
```
If SDK not available, tell the developer which commands to run locally.

**D) Regression check:**
- Re-read every changed file in full context — does the fix look correct?
- Check if the same bug pattern exists elsewhere — list but do NOT fix unless developer asks

**Do NOT mark the task complete until A + B pass. If any issue found → fix → re-verify.**

---

## Strict Rules

- NEVER refactor code while fixing a bug — not even "while you're in there"
- NEVER add new features or improvements alongside the fix
- NEVER change files that are not directly required to fix the reported bug
- NEVER rename variables, restructure classes, reorganize imports, or clean up unrelated code
- NEVER change indentation, formatting, or whitespace beyond what the fix itself requires
- Maximum diff should be as small as possible — if two approaches fix the bug equally well, choose the one with fewer lines changed
- If fixing the bug correctly requires a larger structural change (e.g., the architecture itself is the cause), STOP and tell the developer: "This needs a refactor, not just a bug fix. Here is what would need to change and why." Then wait for direction.
- If the bug is in MethodChannel bridge code, always check BOTH Android and Flutter sides — a fix on one side alone is incomplete

---

## Output Format

After scoping (Step 4), show the developer this before making any change:

```
Root cause:
[1–2 lines explaining the exact issue]

Files to change:
├── path/to/file.dart — line N: [what changes]
├── path/to/File.kt  — line N: [what changes] (if bridge bug)

Proposed fix:
[Diff preview — show old lines and new lines for each change]

Side effects check:
[What else could be affected by this change, and why it won't break]
```

Ask for approval before applying the fix. After applying, confirm what was changed.

---

## Bug Categories

### UI bugs
**Symptoms:** wrong color, layout overflow, widget missing, wrong text, misaligned element, incorrect icon

**Where to look first:** the screen widget (`views/`), feature-local widgets (`widgets/`), any `BlocBuilder` that controls visibility

**Common causes:**
- State condition wrong in `BlocBuilder` (`if (state is X)` checking the wrong state)
- Wrong color constant used (check `WEColors` vs `AssetsColors`)
- Missing `Expanded` or `Flexible` causing overflow
- Localization key returning wrong string (check `WeLangKeysStore`)

**Fix approach:** Change only the widget rendering logic. Do not touch BLoC, API, or data layer unless the wrong data is causing the visual bug.

---

### State bugs
**Symptoms:** screen stuck on loading, wrong data shown, UI not updating after action, stale data after navigation

**Where to look first:** the BLoC file (`bloc/`), specifically the event handler that should have fired

**Common causes:**
- Wrong state emitted after API call (e.g., emitting `MyLoaded` with wrong data field)
- Missing `emit` call in a branch of an event handler
- `BlocBuilder`/`BlocConsumer` `buildWhen` condition filtering out the needed state
- Race condition: two events fired in sequence, second overwrites first before UI processes it
- State not being reset when screen re-enters (e.g., `add(InitEvent())` missing in `initState`)

**Fix approach:** Change only the BLoC handler or state emission logic. Do not restructure the entire BLoC class.

---

### API bugs
**Symptoms:** API call returns error, data is null when it shouldn't be, wrong data returned, request sent with wrong parameters

**Where to look first:** the Retrofit API service (`data/remote/`), the repository implementation (`data/repositories/`), the data model (`data/models/`)

**Common causes:**
- JSON key mismatch in `fromJson` (API returns `vehicle_id`, model reads `vehicleId`)
- Wrong HTTP method (GET vs POST) on the Retrofit annotation
- Missing query parameter or wrong `@Query`/`@Body` annotation
- Null field not handled in `fromJson` (API omits optional field, model crashes on access)
- Wrong base URL or endpoint path

**Fix approach:** Change only the affected model field, API service annotation, or repository call. Do not change the UseCase or BLoC unless the bug is proven to be there.

---

### Bridge bugs
**Symptoms:** MethodChannel call has no effect, Flutter receives null or garbled data from Android, Android receives no callback from Flutter, channel not found error

**Where to look first:** the MethodChannel invocation on the Flutter side, the corresponding handler on the Android side, and the data serialization in between

**Common causes:**
- Channel name string does not match exactly between Android and Flutter (case-sensitive)
- Method name string does not match exactly
- Data serialized as JSON on one side but expected as a raw Map on the other
- Android handler registered on the wrong thread (must be main thread)
- Flutter handler not registered before Android sends the first call
- Missing `result.success(null)` in Android handler causing timeout on Flutter side

**Fix approach:** Fix the mismatch. Change the minimum — if the Android side has the wrong channel name, fix only the Android constant. Verify the fix restores parity on both sides before closing.

---

### Navigation bugs
**Symptoms:** wrong screen opens, back button does not work as expected, argument is null on destination screen, route not found error

**Where to look first:** the route registration file, the `WeNavigator.push` call at the source, and the argument extraction at the destination

**Common causes:**
- Route name string mismatch between push call and route map
- Argument passed as wrong type (e.g., `String` expected but `int` passed)
- `ModalRoute.of(context)?.settings.arguments` cast fails silently
- `WeNavigator.pop(context, result)` called but result not received by caller
- Screen not registered in the app's route map

**Fix approach:** Fix the route string, argument type, or extraction logic. Do not restructure the navigation system.

---

### Crash bugs
**Symptoms:** app crashes with stack trace, `Null check operator used on a null value`, `type 'Null' is not a subtype of type 'X'`, `RangeError (index)`, `ClassCastException` on Android

**Where to look first:** the stack trace line numbers — go directly to the crash site

**Common causes:**
- Null safety violation: `!` used on a nullable value that is null at runtime
- List accessed by index without bounds check
- `as` cast on a value that is not the expected type
- `fromJson` accessing a key that is absent in the actual API response
- Android `NullPointerException` on a view or context that has been destroyed

**Fix approach:** Add the null check, bounds check, or safe cast at the exact crash site. Do not add defensive null checks throughout unrelated code.

---

## Important Notes

- If the bug report is vague ("something is broken"), ask for the specific screen, the specific action, and the specific wrong behavior before starting the process. Do not guess.
- If a Jira ticket is provided, read it using the Atlassian connector to extract the full description, acceptance criteria, and any attached logs or screenshots.
- If a stack trace is provided, start from Step 3 directly — the crash site is already known.
- If the same bug exists in multiple places (e.g., a bad `fromJson` pattern repeated across several models), list all occurrences but fix only the one the developer reported unless they explicitly ask to fix all of them.
- Never suggest "while we're here, let's also improve X" — stay focused on the reported bug only.
