---
name: explain-flow
description: >
  Explain how a feature works across BOTH OperatorAppFlutter (Flutter) and OperatorApp (Android/Kotlin).
  Traces screen flows, BLoC/ViewModel state machines, API calls, navigation, AND MethodChannel bridge
  communication. Use when the user says "explain this feature", "how does GPS work", "show me the flow",
  "what screens are in fuel guard", "trace the navigation", "how does Android talk to Flutter here",
  or wants to understand an existing feature before modifying it.
metadata:
  version: "0.2.0"
---

# Explain Flow — Feature Understanding Assistant (Hybrid Android + Flutter)

Help developers understand existing features by tracing code flows across BOTH repos — Android Activities/Fragments/ViewModels AND Flutter Screens/BLoCs/APIs, including the MethodChannel bridge between them.

## Input

The user provides one of:
- A feature name: "explain the fuel guard feature"
- A screen name: "how does vehicle_list_screen work"
- A BLoC name: "what does gps_bloc do"
- An Android class: "what does FlutterAppManger do"
- A bridge question: "how does Android pass vehicle data to Flutter"
- A question: "what happens when user taps recharge button"

## How to analyze

### Step 1: Identify the feature scope
Determine if the feature is Flutter-only, Android-only, or hybrid (both).

### Step 2: Flutter analysis (if applicable)
1. **Find the feature directory** — search in `apps/` for matching feature app
2. **Map the screens** — list all `*_screen.dart` and `*_view.dart` files
3. **Map the BLoCs** — list all `*_bloc.dart` files with their events and states
4. **Map the API layer** — find `*_api_service.dart`, repository, and usecase files
5. **Trace navigation** — grep for `WeNavigator.push`, route names, `AppNavigator`

### Step 3: Android analysis (if applicable)
1. **Find the feature package** — search in `OperatorApp/app/src/main/java/com/wheelseyeoperator/` for matching package
2. **Map Activities/Fragments** — list `*Activity.kt` and `*Fragment.kt` files
3. **Map ViewModels** — list `*ViewModel.kt` files with their LiveData/StateFlow
4. **Map the API layer** — find Retrofit services in `apiservice/` or `network/`
5. **Trace navigation** — grep for `startActivity`, `Intent`, fragment transactions

### Step 4: Bridge analysis (if hybrid)
1. **Android → Flutter**: grep for `callFlutterEngine()`, `invokeMethod()` in the Android feature code
2. **Flutter → Android**: grep for `NativeActionInvoker`, `invokeMethod()` in the Flutter feature code
3. **Channel identification**: which ModuleMethodChannel enum is used
4. **Data flow**: what JSON is passed across the bridge

Also check the sync knowledge base (`references/feature-flows.md`, `references/bridge-map.md`, `references/migration-tracker.md`) if available.

## Output format

Present the flow visually using text diagrams, showing BOTH platforms when applicable:

```
## Fuel Guard Feature (Hybrid — Android host + Flutter UI)

### Platform status
- Android: Active (host, launches Flutter)
- Flutter: Fully migrated (all UI in Flutter)
- Bridge: Android passes vehicleId and token on launch

### End-to-end flow
Android: MainActivity → DashboardFragment → onFuelGuardTap()
   ↓ [FlutterAppManger.callFlutterEngine("fuel_guard", {vehicleId})]
Flutter: FuelGuardScreen → FuelGuardBloc → FuelApiService
   ↓ [NativeActionInvoker for camera access]
Android: CameraActivity → captures image → returns to Flutter

### Flutter screen flow
FuelGuardScreen → FuelHistoryScreen
       ↓
  RechargeScreen → PaymentScreen → SuccessScreen

### Android entry points
DashboardActivity.kt:45 → launches Flutter fuel_guard module
BottomNavigationHandler.kt:78 → fuel tab index 2

### BLoC state machine
FuelGuardBloc:
  Events: LoadFuelData | RechargeRequest | FilterChanged
  States: FuelInitial → FuelLoading → FuelLoaded(data)
                                    → FuelError(message)
                                    → RechargeSuccess

### MethodChannel bridge
Android → Flutter:
| Channel | Method | Data |
|---------|--------|------|
| COMMUNICATION_WITH_NATIVE_APP | setFuelContext | {vehicleId, token, planId} |

Flutter → Android:
| Channel | Method | Data |
|---------|--------|------|
| COMMUNICATION_WITH_ACTIVITY | openCamera | {type: "fuel_receipt"} |
| COMMUNICATION_WITH_ACTIVITY | openNativeScreen | {type: "payment"} |

### API endpoints
GET  /rest/fuel/balance?vehicleId={id}  → FuelBalanceModel
POST /rest/fuel/recharge                → RechargeResponseModel
GET  /rest/fuel/history?vehicleId={id}  → List<FuelHistoryModel>
⚠ Note: Android also has FuelApiService.kt — same endpoints, will be deprecated after migration

### Key widgets used (Flutter)
- WeCardV2 (fuel balance card)
- WEFlatButtonV2.primary (recharge button)
- WeLoaderWidget (loading state)

### Migration notes
- Android FuelGuardActivity.kt — DEPRECATED, replaced by Flutter FuelGuardScreen
- Android FuelGuardViewModel.kt — DEPRECATED, replaced by Flutter FuelGuardBloc
- Bridge still active for: camera access, payment gateway (native)
```

## Follow-up

After explaining, ask: "Want to know more about any specific part? Or ready to build something on top of this?"

If the developer asks about impact of a change, trace all files that would be affected across BOTH repos using import analysis and bridge dependency analysis.

If the developer asks about migration status, reference `references/migration-tracker.md` to show what's done, in-progress, and remaining.
