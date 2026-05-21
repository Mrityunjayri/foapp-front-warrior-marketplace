## FOAPPFrontWarrior — Active (Hybrid Android + Flutter)

You are working on a **hybrid mobile app** with TWO repositories:

1. **OperatorAppFlutter** — Melos monorepo (Flutter module). 15 feature apps, 5 shared packages, 4 web modules.
2. **OperatorApp** — Native Android host app (Kotlin, 344+ files). Hosts Flutter via FlutterEngine.

Android is the host app. Flutter runs inside it. They communicate via **MethodChannel**. Migration from Android → Flutter is ongoing.

### Communication bridge
- Channel: `COMMUNICATION_WITH_NATIVE_APP` (Android → Flutter)
- Channel: `COMMUNICATION_WITH_ACTIVITY` (Flutter → Android)
- Bridge manager: `FlutterAppManger.kt` with `callFlutterEngine()`, `ModuleMethodChannel` enum
- Action pattern: `v2/flutteraction/` — FlutterActionProvider + FlutterActionExecutor per feature

### Flutter key rules (always follow)
- Colors: `WEColors.colorXXXXXX` or `AssetsColors.colorXXXXXX` — never hardcode
- Text styles: `WETheme.textStyleMedium14` etc. — never inline TextStyle
- Buttons: `WEFlatButtonV2.primary(...)` variants — never raw ElevatedButton
- Text fields: `WeTextFieldV2(...)` — never raw TextField
- Navigation: `WeNavigator.push/pop` — never Navigator.of(context)
- Spacing: `verticalSpace16`, `horizontalPadding16` — never inline SizedBox/EdgeInsets
- Strings: `WeLangKeysStore.instance.key.string(context)` — never hardcode
- State: BLoC pattern with Equatable events and sealed states
- API: Retrofit → Repository → UseCase (Clean Architecture)
- Models: Manual fromJson/toJson — no code generation
- DI: GetIt locator with isRegistered guard

### Android key rules
- Architecture: MVVM (Activity/Fragment → ViewModel → Repository)
- Bridge: Use FlutterActionProvider/Executor pattern for MethodChannel calls
- DI: Check `di/` package for injection pattern (Dagger/Hilt/Koin)
- Base classes: Extend from `appBase/` and `base/` classes
- Channel names: Must match `ModuleMethodChannel` enum values
- JSON serialization across bridge must match both Kotlin and Dart sides

### Available skills
- `/sync` — scan BOTH repos, update knowledge base (widgets, flows, APIs, bridge map, migration tracker)
- `/build-feature` — PRD + Figma → code with iterative approval (Flutter + Android + bridge code)
- `/check-code` — validate conventions compliance (Dart + Kotlin + bridge consistency)
- `/explain-flow` — understand existing feature flows across BOTH platforms
- `/find-widget` — search existing components in BOTH repos before creating new ones

### Connected tools
- **Figma** — read designs, screenshots, component specs
- **Atlassian Rovo** — read Confluence PRDs, manage Jira tickets
- **Local repos** — direct file access to OperatorAppFlutter and OperatorApp
