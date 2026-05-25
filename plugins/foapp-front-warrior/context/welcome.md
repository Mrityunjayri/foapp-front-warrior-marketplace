## 🛡️ FOAPPFrontWarrior — Active

**Tumhara AI coding assistant ready hai!** Ye plugin dono repos samajhta hai — OperatorApp (Android) + OperatorAppFlutter (Flutter).

### Quick start — ye commands yaad rakho:

| Command | Kya karta hai | Kab use karo |
|---------|--------------|--------------|
| `/sync` | Dono repos scan karke knowledge update karta hai | Sprint start pe ya major merge ke baad |
| `/build-feature` | PRD + Figma se production code banata hai | Naya feature develop karna ho |
| `/check-code` | Code conventions check karta hai (39 rules — Dart + Kotlin + Bridge) | PR bhejne se pehle |
| `/explain-flow` | Feature ka pura flow samjhata hai (Android → Bridge → Flutter) | Existing feature modify karne se pehle |
| `/find-widget` | Existing widgets dhundhta hai dono repos me | Naya widget banane se pehle |
| `/fix-bug` | Minimal scoped bug fix — sirf wo todta hai jo toota hai | Bug report ya crash aaye toh |
| `/crash-anr` | Production crash + ANR ka deep RCA — Sentry auto-fetch + Firebase manual paste | Crashlytics/Sentry me error dikhe toh |
| `/add-events` | Analytics events add karta hai event sheet se | Feature me tracking lagani ho |
| `/optimize` | Code optimize karta hai changes ke baad | Feature/fix complete hone ke baad |
| `/upgrade` | SDK, Flutter, Kotlin, packages upgrade impact check | Version upgrade karna ho |

### Connectors — MCP integrations

| Connector | Kya karta hai | Setup |
|-----------|--------------|-------|
| **Sentry** | Auto-fetch crash data, stack traces, affected users, releases | Settings → Connectors → Sentry |
| **Atlassian (Jira + Confluence)** | PRD read karta hai, bug tickets padhta hai | Settings → Connectors → Atlassian |
| **Figma** | Design components + screenshots extract karta hai | Settings → Connectors → Figma |
| **Firebase Crashlytics** | Manual paste — no MCP available yet | Stack trace copy-paste karo chat me |

### Pehli baar use kar rahe ho?
1. Apne **OperatorAppFlutter** aur **OperatorApp** folders connect karo (Add folder)
2. **Figma**, **Atlassian**, aur **Sentry** connectors connect karo (Settings → Connectors)
3. Type karo: `/sync` — ye 2-5 min me dono repos scan kar lega

### Convention enforcement — 39 rules automatic

Plugin har command me CLAUDE.md ke **saare 34 sections** follow karta hai:

- **Widgets** — WEScaffold, WEAppBar, WeText, WeCardV2, WeLoaderWidget, WeConfirmationDialog, WeDividerWidget, WeCheckboxWidget, WeInkWell, emptyWidget (19 raw Flutter widget replacements)
- **Styling** — WEColors/AssetsColors for colors, WETheme for text styles (no `height:` in copyWith), spacing constants (verticalSpace, horizontalPadding)
- **Strings** — WeLangKeysStore for localized, RawStrings for static English — never hardcoded inline
- **Buttons** — WEFlatButtonV2 variants only (primary, secondary, tertiary, promotion)
- **Text fields** — WeTextFieldV2 only, with UpperCaseTextFormatter/AlphaNumericTextFormatter from we_base
- **Navigation** — WeNavigator + ModuleRouteNames only
- **Images** — AssetsHelper.svg/png/pngNetwork with SVGAssetsPath/PNGAssetsPath constants
- **Bottom sheets** — showCustomBottomSheet only, WeOpBottomSheetHelperWidgetV2 for standard layouts
- **Toasts** — WEOpToast().showSuccessToast/showErrorToast for visual feedback
- **State** — BLoC with Equatable events, sealed states, ShowSnackBarState for errors
- **API** — Retrofit → BaseApiRepository → getStateOf() → .when(onSuccess:, onFailed:)
- **Models** — Manual fromJson/toJson, no code generation
- **DI** — GetIt locator with isRegistered guard
- **Analytics** — WeLyticsEventManagerV2 static singleton (.instance), super.sendEvent(named params)
- **Pagination** — WEPagingController + WEPagedListView + droppable() transformer
- **Performance** — PagePerformanceMetricTracker mixin for screen load metrics
- **PDF** — DownloadSharePdfHandler mixin for download/share flows
- **Preferences** — WeOpSharedPreference only, never raw SharedPreferences
- **Date/Time** — DateTimeUtils from we_op_common, never custom formatting

### Example workflows:

**Build a feature:**
```
Tum: /build-feature
     PRD: [confluence link]
     Figma: [figma link]

Claude: [PRD padhega] → [Figma design dekhega] → [Impact analysis dikhayega]
        → [Tumhara approval lega] → [Code generate karega] → [39 rules check karega]
```

**Fix a production crash:**
```
Tum: /crash-anr
     Fix the top crash from Sentry

Claude: [Sentry se top 5 crashes fetch karega] → [Tum choose karo]
        → [Deep RCA — pura flow trace karega] → [Root cause + fix plan dikhayega]
        → [Approval ke baad fix apply karega] → [Convention compliance verify karega]
```

**Check code before PR:**
```
Tum: /check-code check my recent changes

Claude: [git diff se changed files nikalega] → [39 rules check karega]
        → [Errors / Warnings / Info report] → [Auto-fix option]
```

**Note:** Agar koi widget, color, style, ya constant codebase me nahi milta — plugin ruk ke tumse puchega. Kabhi raw Flutter widget use nahi karega, kabhi guess nahi karega.
