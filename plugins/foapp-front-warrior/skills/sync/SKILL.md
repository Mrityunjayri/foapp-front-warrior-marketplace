---
name: sync
description: >
  Scan and index both OperatorAppFlutter (Flutter) and OperatorApp (Android/Kotlin)
  repositories to update the plugin's knowledge base. Use when the user says "sync",
  "update context", "refresh knowledge", "scan the repo", or after a major sprint
  merge to keep the plugin's understanding of both repos current.
metadata:
  version: "0.2.0"
---

# Sync — Dual-Repo Scanner & Knowledge Base Updater

Scan BOTH repositories and generate up-to-date knowledge base files that other skills depend on. This project is a **hybrid app** — Android (Kotlin) is the host, Flutter runs inside it, they communicate via MethodChannel.

## Repositories to scan

1. **OperatorAppFlutter** — Melos monorepo (Flutter module). Path: look in workspace mounts for `OperatorAppFlutter/`
2. **OperatorApp** — Native Android host app (Kotlin, 344+ files). Path: look in workspace mounts for `OperatorApp/` (may be under `StudioProjects/`)

If either repo is not mounted, ask the user to connect it.

## What to generate

Write all output to the `references/` directory inside this skill. Every file must be markdown. Overwrite previous versions.

---

### 1. Widget catalog (`references/widget-catalog.md`)

**Flutter widgets** — scan:
- `OperatorAppFlutter/packages/we_common_widgets/lib/` (45+ files)
- `OperatorAppFlutter/packages/we_op_common/lib/` (525+ files)

For each public widget class: name, file path, constructor params, one-line purpose, package.
Group by category: Cards, Buttons, Text Fields, Dialogs, Loaders, Navigation, Media, Forms, Layout, Other.

**Android custom views** — scan:
- `OperatorApp/app/src/main/java/com/wheelseyeoperator/` for custom View classes
- `OperatorApp/app/src/main/res/layout/` — count and list key layouts

Note which Android views have Flutter equivalents and which are Android-only.

---

### 2. Design tokens (`references/design-tokens.md`)

**Flutter tokens:**
- `packages/we_style/lib/assets_colors.dart` → all `AssetsColors.colorXXXXXX`
- `packages/we_style/lib/spaces.dart` → all spacing constants
- WEColors usage across codebase → document all `WEColors.colorXXXXXX` found
- WETheme usage → document all `WETheme.textStyleXXX` found

**Android tokens:**
- `OperatorApp/app/src/main/res/values/colors.xml` → Android color definitions
- `OperatorApp/app/src/main/res/values/styles.xml` → Android themes/styles
- `OperatorApp/app/src/main/res/values/dimens.xml` → Android dimension values

**Cross-reference:** Map Android colors to their Flutter equivalents where they match.

---

### 3. Feature flows (`references/feature-flows.md`)

**Flutter features** — for each app in `OperatorAppFlutter/apps/`:
- Screens (`*_screen.dart`, `*_view.dart`)
- BLoCs (`*_bloc.dart`)
- Navigation (WeNavigator.push, AppNavigator, route registration)
- API endpoints (@GET, @POST in Retrofit services)

**Android features** — for each package in `OperatorApp/app/src/main/java/com/wheelseyeoperator/`:
- Activities and Fragments
- ViewModels
- Navigation (Intent launches, fragment transactions)
- API calls (Retrofit services)

**Migration status per feature:**
```
| Feature | Android Status | Flutter Status | Migration |
|---------|---------------|----------------|-----------|
| Dashboard | Active (host) | Partial | In progress |
| GPS | Active | Fully migrated | Done |
| Fuel Guard | Active | Fully migrated | Done |
| Buy-Sell | Active | Active | Both active |
| Settings | Active | Active | In progress |
```

---

### 4. MethodChannel bridge map (`references/bridge-map.md`)

THIS IS CRITICAL — map every communication point between Android and Flutter.

**Scan Android side:**
- `OperatorApp/.../flutter/FlutterAppManger.kt` — all `callFlutterEngine()` calls
- `OperatorApp/.../flutter/v2/flutteraction/` — all FlutterActionProvider classes
- All `ModuleMethodChannel` enum values and their channel names
- All method names invoked via MethodChannel

**Scan Flutter side:**
- `OperatorAppFlutter/` — grep for `MethodChannel(`, `invokeMethod(`, `setMethodCallHandler`
- All NativeActionInvoker classes and their method names
- All data models passed between Android ↔ Flutter

**Output format:**
```
## Android → Flutter channels
| Channel Name | Method | Data Sent | Called From (Android) | Received In (Flutter) |
|---|---|---|---|---|
| COMMUNICATION_WITH_NATIVE_APP | setUnreadBuyAndSellNotificationCount | int count | FlutterAppManger.kt | buy_sell_bloc.dart |

## Flutter → Android channels  
| Channel Name | Method | Data Sent | Called From (Flutter) | Received In (Android) |
|---|---|---|---|---|
| COMMUNICATION_WITH_ACTIVITY | openNativeScreen | json {type, data} | native_action_invoker.dart | WeFlutterActivity.kt |
```

---

### 5. API catalog (`references/api-catalog.md`)

**Flutter APIs** — scan `*_api_service.dart` files:
- Endpoint, method, URL, request/response models, feature

**Android APIs** — scan `OperatorApp/.../apiservice/` and `network/`:
- Retrofit endpoints in Kotlin
- Note which APIs are shared vs Android-only vs Flutter-only

**Cross-reference:** Flag APIs that exist in both repos (potential duplication during migration).

---

### 6. Architecture map (`references/architecture-map.md`)

**Flutter architecture:**
- Package dependency tree (from pubspec.yaml files)
- Feature app list with dependencies
- Web modules list

**Android architecture:**
- Module/package structure under `com.wheelseyeoperator`
- DI setup (Dagger/Hilt/Koin — check `di/` package)
- Base classes (`appBase/`, `base/`)

**Hybrid architecture:**
- How Flutter module is embedded (FlutterEngine, cached engine pattern)
- Entry points: which Android Activities launch Flutter screens
- Data flow: Android → MethodChannel → Flutter and back

---

### 7. Coding rules (`references/coding-rules.md`)

**Flutter rules** — read `OperatorAppFlutter/CLAUDE.md` and format every rule as a checklist (all 20 sections).

**Android rules** — scan for:
- Naming conventions used (check existing code patterns)
- Architecture patterns (MVVM? MVP? check viewmodel/ and repository/)
- DI pattern (check di/ package)
- Network layer pattern
- Base classes to extend

**Bridge rules:**
- MethodChannel naming conventions
- Data serialization pattern (JSON encode/decode)
- Error handling across the bridge

---

### 8. Migration tracker (`references/migration-tracker.md`)

Analyze both repos and build a migration status report:

For each feature area:
- Is it Android-only, Flutter-only, or both?
- If both, which is the "active" one users interact with?
- What Android code will be deprecated after Flutter migration?
- What MethodChannel bridges exist for this feature?
- Estimated complexity to fully migrate (based on Android file count + API count)

---

## Output locations

Write output to TWO places:

### A. Plugin context/ directory (auto-loaded every session)
These files are loaded automatically when the plugin starts. Keep them concise but comprehensive.

Write to the `context/` directory (sibling to this `skills/` folder):
- `context/feature-map.md` — All apps, screens, BLoCs, APIs summary table
- `context/android-architecture.md` — Android modules, Activities, ViewModels, DI, Flutter bridge tree
- `context/bridge-map.md` — All MethodChannel connections, action providers, data formats
- `context/widget-api-catalog.md` — Widget catalog + API endpoints catalog

### B. References directory (detailed, on-demand)
Write detailed analysis to `references/` inside this skill folder:
- `references/design-tokens.md`
- `references/migration-tracker.md`
- `references/coding-rules.md`
- `references/.last-sync` (timestamp)

## Execution order

1. Scan Flutter repo first (faster, well-structured)
2. Scan Android repo (larger, less structured)
3. Build bridge map (cross-references both)
4. Build migration tracker (needs both repos scanned)
5. Write all reference files AND context files
6. Write timestamp to `references/.last-sync`
7. Print summary

## Summary output

Tell the user:
- Flutter: X widgets, Y features, Z API endpoints
- Android: X Kotlin files, Y features, Z API endpoints  
- Bridge: X MethodChannel connections mapped
- Migration: X features fully migrated, Y in progress, Z Android-only
- Last sync timestamp
