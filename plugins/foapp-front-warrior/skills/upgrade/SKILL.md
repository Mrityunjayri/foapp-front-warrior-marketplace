---
name: upgrade
description: >
  Upgrade Android SDK, Flutter SDK, Dart SDK, Kotlin, Gradle, or external packages.
  Use when the user says "upgrade to Android 16", "upgrade Flutter", "update packages",
  "upgrade dependencies", "check outdated packages", "migrate to new SDK", or wants to
  assess impact of any platform/library upgrade on the hybrid codebase.
metadata:
  version: "0.1.0"
---

# Upgrade — Platform & Package Upgrade Assistant

Help assess, plan, and execute upgrades across both repos in the hybrid app:
- **OperatorAppFlutter** — Flutter Melos monorepo (15 apps, 5 shared packages, 4 web modules)
- **OperatorApp** — Android/Kotlin host app (Gradle, Dagger v2)

They communicate via MethodChannel. Upgrades on either side can break the bridge.

---

## Input

Provide one of the following:

- **Specific target** — e.g., "upgrade to Android 16", "upgrade Flutter to 3.27", "upgrade dio to 5.x", "upgrade Kotlin to 2.1"
- **Scan request** — "check what's outdated", "list all outdated packages", "what needs upgrading?" — scan both repos and produce a full report

---

## Upgrade Types

### 1. Android SDK Upgrade

**Scan** these files in `OperatorApp/`:
- `app/build.gradle` — `compileSdkVersion`, `targetSdkVersion`, `minSdkVersion`
- `build.gradle` (root) — `classpath` versions
- `gradle/wrapper/gradle-wrapper.properties` — Gradle distribution URL

**Check:**
- Android behavior changes at the target SDK level (e.g., permission model changes, intent restrictions, background limits, notification changes)
- Deprecated APIs used in the codebase — grep for known deprecated symbols
- New required permissions (e.g., `SCHEDULE_EXACT_ALARM`, `POST_NOTIFICATIONS` for API 33+)
- Manifest changes needed (`android:exported` requirements, etc.)
- Kotlin compatibility with new SDK compile requirements

**Update:**
- `app/build.gradle` — bump `compileSdkVersion` and `targetSdkVersion`
- `AndroidManifest.xml` — add required permissions/attributes
- Any deprecated API call sites

**Special — Flutter bridge compatibility:**
- Check if the Flutter embedding (`FlutterActivity`, `FlutterEngine`) is compatible with the new SDK
- Verify `FlutterAppManger.kt` and all `ModuleMethodChannel` handlers still compile
- Check if any MethodChannel data serialization is affected

**Test — features that need manual retesting after SDK bump:**
- Background services / WorkManager jobs
- Notification channels and permission prompts
- File access (Scoped Storage changes)
- Foreground service types (Android 14+)
- Exact alarm scheduling
- Any feature using the MethodChannel bridge (test both sides)

---

### 2. Flutter SDK Upgrade

**Scan:**
- `.fvm/fvm_config.json` or `.flutter-version` in `OperatorAppFlutter/` — current Flutter version
- Root `pubspec.yaml` and all app/package `pubspec.yaml` files — `sdk: ">=X.Y.Z <A.B.C"` constraints
- `OperatorAppFlutter/melos.yaml` — workspace configuration

**Check:**
- Flutter CHANGELOG and migration guides for breaking changes between current and target
- Deprecated widgets used in the codebase (e.g., `FlatButton` → `TextButton`, `Scaffold.of` patterns)
- New lint rules that may fail existing code — check `analysis_options.yaml`
- `MethodChannel` API changes between Flutter versions (rare but critical)
- Flutter embedding API changes affecting `OperatorApp` side (`FlutterActivity`, `FlutterEngine`, `GeneratedPluginRegistrant`)

**Update:**
- `.fvm/fvm_config.json` or equivalent version pin
- Root `pubspec.yaml` SDK constraint
- All 15 app `pubspec.yaml` files + 5 package `pubspec.yaml` files + 4 web `pubspec.yaml` files
- Fix any deprecated widget usages flagged by analyzer

**Melos — run across the monorepo:**
```bash
# After updating SDK constraint, run across all packages:
melos exec -- flutter pub get
melos exec -- flutter analyze
```

**Special — MethodChannel:**
- Grep `OperatorAppFlutter/` for `MethodChannel(` and `invokeMethod(` — ensure the API signature is unchanged
- Cross-check with `OperatorApp/` Flutter bridge classes

---

### 3. Dart SDK Upgrade

**Scan:**
- All `pubspec.yaml` files across `OperatorAppFlutter/` for `sdk: ">=X.Y.Z <A.B.C"`
- Check Dart version bundled with current Flutter version (they are coupled)

**Check:**
- Dart language changelog — new syntax, deprecations
- Null safety migration status (should already be migrated; verify no `--no-sound-null-safety` flags remain)
- New language features that may conflict with existing patterns (e.g., records, patterns, sealed classes if upgrading Dart 3+)
- `analysis_options.yaml` lint rule compatibility

**Update:**
- All `pubspec.yaml` files — lower bound of `sdk` constraint
- Fix any deprecated API call sites flagged by `dart analyze`

**Melos — run across all packages:**
```bash
melos exec -- dart pub get
melos exec -- dart analyze
```

---

### 4. External Package Upgrades (Flutter/Dart)

**Scan** all `pubspec.yaml` files across the monorepo:
- `OperatorAppFlutter/apps/*/pubspec.yaml` (15 apps)
- `OperatorAppFlutter/packages/*/pubspec.yaml` (5 packages)
- `OperatorAppFlutter/web/*/pubspec.yaml` (4 web modules)

**Check current vs latest:**
```bash
# Per package, check outdated:
flutter pub outdated

# With Melos across all:
melos exec -- flutter pub outdated
```

**Categorize upgrades:**

| Category | Version Change | Risk | Action |
|----------|---------------|------|--------|
| Safe | Patch (x.y.Z) | Low — bug fixes only | Upgrade immediately |
| Minor | Minor (x.Y.z) | Medium — new features, usually backward compatible | Upgrade after reviewing changelog |
| Major | Major (X.y.z) | High — breaking changes guaranteed | Migrate carefully, one at a time |

**Special packages to watch (these affect the entire codebase):**

| Package | Risk Level | Why |
|---------|-----------|-----|
| `flutter_bloc` | Critical | Every BLoC, event, state, BlocBuilder, BlocConsumer across all apps |
| `equatable` | High | Every event and state class uses it |
| `dio` | High | All API services use `Dio` — networking layer |
| `retrofit` | High | All `@RestApi` services and code generation |
| `get_it` | High | All `locator.dart` DI registrations |
| `go_router` or navigation packages | High | All route definitions and navigation calls |
| `melos` | Medium | Monorepo tooling — check melos.yaml compatibility |
| Private packages (onepub.dev) | Critical | Must verify new version exists on private registry before upgrading |

**Private packages (onepub.dev) — special steps:**
1. Check if the target version is published on `https://onepub.dev`
2. Verify `dart pub token` is configured for the private registry
3. Do NOT upgrade if the version is not available on the private registry

**Process — upgrade one at a time for major versions:**
1. Upgrade one package
2. Run `flutter pub get` across monorepo
3. Run `flutter analyze` across monorepo
4. Fix compilation errors
5. Run `/check-code` to verify conventions still pass
6. Commit
7. Then move to the next package

**Shared packages first:**
When upgrading a package that is a dependency of the shared packages, upgrade in this order:
1. `packages/we_style` (no internal deps)
2. `packages/we_base` (depends on we_style)
3. `packages/we_common_widgets` (depends on we_style, we_base)
4. `packages/we_op_common` (depends on we_common_widgets)
5. `packages/we_lib_manager` (re-exports from above)
6. Then apps (depend on shared packages)

---

### 5. Kotlin Version Upgrade

**Scan** in `OperatorApp/`:
- `build.gradle` (root) — `kotlin_version` or `id("org.jetbrains.kotlin.android")` version
- `build.gradle` (app) — `kotlinOptions { jvmTarget = "..." }`

**Check:**
- Kotlin changelog for deprecations and breaking changes
- Kotlin compiler compatibility with current AGP version
- Coroutines and extension function compatibility
- Dagger v2 annotation processor compatibility (kapt)
- Check AGP ↔ Kotlin ↔ Gradle compatibility matrix (see Compatibility Matrix section below)

**Update:**
- Root `build.gradle` — `kotlin_version`
- Check kapt configurations still work with new Kotlin version

---

### 6. Gradle / AGP Upgrade

**Scan** in `OperatorApp/`:
- `gradle/wrapper/gradle-wrapper.properties` — `distributionUrl` (Gradle version)
- `build.gradle` (root) — AGP classpath version (`com.android.tools.build:gradle:X.Y.Z`)
- `build.gradle` (app) — `compileSdkVersion`, `buildToolsVersion`
- `settings.gradle` — plugin management block (new DSL)

**Check compatibility matrix:**

| AGP Version | Required Gradle | Required JDK | Notes |
|-------------|----------------|-------------|-------|
| 8.x | 8.x+ | JDK 17+ | New DSL, namespace required |
| 7.x | 7.x+ | JDK 11+ | Stable |

Always verify at: https://developer.android.com/build/releases/gradle-plugin#updating-gradle

**Check Flutter Gradle plugin compatibility:**
- The Flutter module embedded in `OperatorApp` has its own Gradle plugin
- Verify the Flutter Gradle plugin version supports the new AGP version
- Check `OperatorAppFlutter/` for `com.android.application` or `com.android.library` plugin usage

**Update — in this exact order:**
1. Update `gradle-wrapper.properties` (Gradle version)
2. Update AGP version in root `build.gradle`
3. Update Kotlin version if required by new AGP
4. Sync and fix any DSL migration issues (e.g., `namespace` instead of `applicationId` in new AGP DSL)

---

## Compatibility Matrix Reference

Always check these compatibility constraints before any upgrade:

```
AGP ↔ Gradle:    https://developer.android.com/build/releases/gradle-plugin#updating-gradle
AGP ↔ Android SDK: compileSdk must be >= targetSdk
Kotlin ↔ AGP:    https://kotlinlang.org/docs/gradle-configure-project.html
Flutter ↔ Dart:  Bundled together — upgrading Flutter upgrades Dart
Flutter ↔ AGP:   Check Flutter release notes for minimum AGP requirement
JDK ↔ Gradle:    Gradle 8.x requires JDK 17; Gradle 7.x requires JDK 11
```

**Minimum versions as of 2025 (verify current):**
- Android 16 (API 36) → AGP 8.x, Gradle 8.x, JDK 17
- Flutter 3.x → AGP 7.0+, Gradle 7.0+
- Kotlin 2.x → AGP 8.1+, Gradle 8.x

---

## Process

Run these steps for every upgrade:

### Step 1 — Scan current versions
Report all current versions from both repos:

```
Flutter SDK:    [from .fvm/fvm_config.json]
Dart SDK:       [bundled with Flutter]
Android SDK:    compileSdk=[X], targetSdk=[Y], minSdk=[Z]
Kotlin:         [from root build.gradle]
Gradle:         [from gradle-wrapper.properties]
AGP:            [from root build.gradle]

Top Flutter packages (from pubspec.yaml):
  flutter_bloc:   X.Y.Z  (latest: A.B.C)
  dio:            X.Y.Z  (latest: A.B.C)
  retrofit:       X.Y.Z  (latest: A.B.C)
  get_it:         X.Y.Z  (latest: A.B.C)
  equatable:      X.Y.Z  (latest: A.B.C)
  [... all packages]

Private packages (onepub.dev):
  [list all private deps]
```

### Step 2 — Identify target
Clarify exactly what to upgrade to. If the user said "upgrade Flutter", confirm the specific version.

### Step 3 — Compatibility check
Run through the compatibility matrix. Flag any blockers:
- "AGP X.Y requires Gradle A.B — current Gradle is C.D, must upgrade Gradle first"
- "Flutter 4.x drops support for AGP 7.x — OperatorApp must be on AGP 8.x first"
- "Package X has no version compatible with Flutter 4.x SDK constraint"

### Step 4 — Impact analysis
List every file that needs changes:
- Which `pubspec.yaml` files need SDK constraint updates
- Which `build.gradle` files need version bumps
- Which source files have deprecated API usage that must be migrated
- Which features need manual retesting

### Step 5 — Generate migration plan
Produce a numbered, ordered list of changes. Example:

```
Migration Plan: Flutter 3.x → 4.x

1. Upgrade OperatorApp AGP to 8.x (required by Flutter 4.x)
   - File: OperatorApp/build.gradle
   - Change: classpath "com.android.tools.build:gradle:8.X.X"

2. Upgrade Gradle to 8.x
   - File: OperatorApp/gradle/wrapper/gradle-wrapper.properties
   - Change: distributionUrl=...gradle-8.X.X-all.zip

3. Upgrade Kotlin to 2.x
   - File: OperatorApp/build.gradle
   - Change: kotlin_version = "2.X.X"

4. Update Flutter SDK pin
   - File: OperatorAppFlutter/.fvm/fvm_config.json
   - Change: "flutterSdkVersion": "4.X.X"

5. Update SDK constraints in shared packages (in order)
   - packages/we_style/pubspec.yaml
   - packages/we_base/pubspec.yaml
   - packages/we_common_widgets/pubspec.yaml
   - packages/we_op_common/pubspec.yaml
   - packages/we_lib_manager/pubspec.yaml

6. Update SDK constraints in all apps
   - apps/operator-app/pubspec.yaml
   - apps/buy-sell-truck/pubspec.yaml
   - [... all 15 apps]

7. Run melos exec -- flutter pub get

8. Run melos exec -- flutter analyze — fix all issues

9. Run /check-code to verify conventions
```

### Step 6 — Execute upgrades
Make all file changes in the order from the migration plan. Show diffs for each change.

### Step 7 — Verify
After changes:
```bash
# Flutter side
melos exec -- flutter pub get
melos exec -- flutter analyze

# Android side
./gradlew assembleDebug  # check compilation

# Conventions check
/check-code
```

---

## Rules

1. **Always check the compatibility matrix before upgrading** — AGP ↔ Gradle ↔ Kotlin ↔ JDK ↔ Android SDK. One bad combination blocks the build.

2. **Upgrade in order: SDK → build tools → core packages → feature packages.** Never jump ahead.

3. **Never upgrade all packages at once.** For major version upgrades, do one package at a time. For patch/minor, batching is acceptable.

4. **For Flutter monorepo: upgrade shared packages first.** Order: `we_style` → `we_base` → `we_common_widgets` → `we_op_common` → `we_lib_manager` → apps.

5. **Always show rollback commands** before making any change so the user can revert.

6. **Check private onepub.dev packages** before upgrading any shared dep — if the private package hasn't published a compatible version, the upgrade will fail.

7. **Flag breaking changes prominently** — use a "BREAKING" label so the user cannot miss them.

8. **After any upgrade, run `/check-code`** to verify the codebase still follows project conventions (colors, spacing, text styles, navigation, etc.).

9. **MethodChannel bridge is a cross-cutting concern** — any Flutter or Android SDK upgrade must include a check that the bridge still compiles and behaves correctly on both sides.

10. **Do not upgrade if blockers exist.** Report blockers and stop — do not attempt a partial upgrade that will leave the project in a broken state.

---

## Output Format

For every upgrade, show a structured report:

```
## Upgrade Report: [Upgrade Target]

### Current → Target
  From: [current version]
  To:   [target version]

### Compatibility Check
  [PASS/FAIL] AGP ↔ Gradle
  [PASS/FAIL] Kotlin ↔ AGP
  [PASS/FAIL] Flutter ↔ Android SDK
  [BLOCKER if any] description

### Breaking Changes
  BREAKING: [description of breaking change and affected files]
  ...

### Files to Modify
  - path/to/file — what changes
  - path/to/file — what changes

### Migration Commands (step-by-step)
  1. [command or file edit]
  2. [command or file edit]
  ...

### Rollback Commands
  # To revert, restore these versions:
  - path/to/file: [original value]
  ...

### Features to Retest After Upgrade
  - [Feature name] — reason why it needs testing
  - [Feature name] — reason why it needs testing
```
