# Android Architecture — OperatorApp (Kotlin)

## Module Structure

| Module | Package | Purpose |
|--------|---------|---------|
| `app` | `com.wheelseyeoperator` | Main app — dashboard, splash, Flutter bridge, DI |
| `webase` | `com.wheelseye.webase` | Core library — networking, base classes, Flutter infra |
| `wegps` | `com.wheelseye.wegps` | GPS tracking feature |
| `wefuel` | `com.wheelseye.wefuel` | Fuel/diesel feature |
| `weftag` | `com.wheelseyeoperator.weftag` | FASTag feature |
| `wecredit` | `com.wheelseye.wecredit` | Credit/lending |
| `wedocs` | `com.wheelseye.wedocs` | Vehicle documents/challan |
| `wepayment` | `com.wheelseye.wepayment` | Payment gateway v1 |
| `wepaymentv2` | `com.wheelseye.wepaymentv2` | Payment gateway v2 |
| `weyestyle` | `com.wheelseye.weyestyle` | Shared styles, KYC, base Flutter actions |
| `welauncher` | `com.wheelseye.welauncher` | Activity builders/intent launchers |
| `welytics` | `com.wheelseye.welytics` | Analytics (WeLytic) |
| `welang` | — | Localization |
| `weload` | `com.wheelseye.weload` | Load/freight feature |
| `wenotification` | `com.wheelseye.wenotification` | Notification service |

## App Module Package Structure

```
com.wheelseyeoperator/
├── activity/              — General activities (blank, maintenance, payments)
├── appBase/               — AppCommonBaseActivity, AppCommonViewModel
├── base/vm/               — WeBaseVM
├── dashboardfeature/      — Dashboard (Activity, ViewModel, helpers, analytics)
├── di/                    — Dagger DI (MyApplicationComponent, modules)
├── drawer/                — Navigation drawer + profile
├── feature/
│   ├── splash/            — SplashActivity + ViewModel + Repository
│   ├── credit/            — Credit feature
│   ├── ble/               — Bluetooth
│   ├── web/               — WheelseyeWebActivity
│   ├── logout/            — LogoutViewModel
│   ├── vdp/               — Vehicle detail page
│   └── parkingLock/       — Parking lock alerts
├── flutter/               — ⚡ FLUTTER BRIDGE (critical)
│   ├── FlutterAppManger.kt        — Singleton, holds shared state
│   ├── FlutterData.kt             — Data class for shared data
│   ├── FlutterDataProviderImpl.kt  — Data provider implementation
│   ├── FlutterNavigatorImpl.kt     — Navigation from Flutter
│   ├── WeFlutterActivity.kt        — Flutter hosting Activity
│   ├── WeFlutterActivityV2.kt      — V2 Flutter hosting
│   ├── WeFlutterViewModel.kt       — ViewModel for Flutter Activity
│   ├── init/WeFlutterArchitectureInitializer.kt
│   └── v2/flutteraction/           — V2 action provider system
│       ├── base/WeModuleFlutterActionProvider.kt
│       ├── app/WeAppFlutterActionProvider.kt
│       ├── app/WeAppDataFlutterActionProvider.kt
│       ├── app/WeAppRedirectFlutterActionProvider.kt
│       └── redirect/               — Action executors
│           ├── ActionResponseActionExecutor.kt
│           ├── ChangeLocalActionExecutor.kt
│           ├── GetUserSettingsActionExecutor.kt
│           └── MunshiActionResponseHandlerActionExecutor.kt
├── handler/               — Dashboard/redirect handlers
│   ├── flutter/FlutterStartActivityHandler.kt
│   └── redirect/WeRedirectHandler.kt
└── utils/
```

## Key Activities (by feature)

### Dashboard & Core
- `SplashActivity` — App entry, auth check
- `DashboardActivity` — Main dashboard with tabs (Java)
- `WeFlutterActivity` / `V2` — Hosts Flutter modules
- `WheelseyeWebActivity` — Internal web views

### GPS (wegps module)
- `VehicleListMapActivity` — GPS home/map
- `VehicleDetailActivity` — Single vehicle detail
- `PlayItineraryActivity` — Route playback
- `GpsAlertNotificationActivity` — Alert notifications
- `GPSBuyFlowOrderDetailsCollectionActivity` — Purchase flow

### Fuel (wefuel module)
- `FuelHomePageActivity` — Fuel dashboard
- `VehicleRechargeActivity` — Recharge fuel
- `FuelCashbackActivity` — Cashback offers

### FASTag (weftag module — 40+ activities)
- Complete FASTag lifecycle: buy, activate, recharge, transfer, KYC

### Payments (wepaymentv2)
- `PgV2Activity` — Payment gateway
- `AutoPayActivity` — Auto-pay mandate
- Multiple bank/UPI activities

## Dependency Injection — Dagger v2

**Pattern:** Component + Module per feature module

```kotlin
// App-level
MyApplicationComponent → MyApplicationModule
MyActivityComponent → ActivityModule, FragmentModule

// Per-feature
GpsActivityComponent → GpsActivityModule, GpsFragmentModule
FuelActivityComponent → FuelActivityModule, FuelFragmentModule
FtagActivityComponent → FtagActivityModule, FtagFragmentModule
CreditActivityComponent → CreditActivityModule, CreditFragmentModule
PgActivityComponentV2 → PgActivityModuleV2, PgFragmentModuleV2
```

## Flutter Bridge Architecture

### FlutterAppManger.kt (Singleton)
- Extends `FlutterBaseManager`
- Holds shared state: vehicle data, banners, geofence, settings, fuel sensor
- Creates Flutter engine via `callFlutterEngine()`
- Registers all FlutterActionProviders

### V2 Action Provider Tree
```
WeModuleFlutterActionProvider (root)
├── "app" → WeAppFlutterActionProvider
│   ├── "data" → WeAppDataFlutterActionProvider
│   └── "redirect" → WeAppRedirectFlutterActionProvider
├── "base" → WeBaseFlutterActionProvider
│   ├── "data" → WeBaseDataFlutterActionProvider (14 executors)
│   └── "redirect" → WeBaseRedirectFlutterActionProvider
├── "gps" → WeGpsFlutterActionProvider
│   ├── "data" → WeGpsDataFlutterActionProvider (6 executors)
│   └── "redirect" → WeGpsRedirectFlutterActionProvider
├── "buy_sell" → WeBuySellFlutterActionProvider
│   └── "data" → WeBuySellDataFlutterActionProvider
└── "payment" → WePaymentFlutterActionProvider
    ├── "data" → WeFlutterDataFlutterActionProvider
    └── "redirect" → WeFlutterRedirectFlutterActionProvider
```

### Flutter Page Routes (WeFlutterPages.kt — 100+ routes)
Routes are grouped by feature:
- `gps/*` — GPS screens
- `fastag/*` — FASTag screens
- `fuel/*` — Fuel screens
- `help_section/*` — Help/support
- `settings/*` — Settings
- `buynsell` — Buy-Sell
- `vehicle_score/*` — Safety score
- `user_onboarding/*` — Login/auth
- `khata` — Expense tracking

## Migration Status

| Feature | Platform | Notes |
|---------|----------|-------|
| GPS (main) | Hybrid | Android host → Flutter UI via bridge |
| FASTag | Flutter-first | Most screens in Flutter, Android for payments |
| Fuel Guard | Flutter-first | Full Flutter, minimal Android |
| Buy-Sell | Hybrid | BuySell channel, notification caching in Android |
| Dashboard | Android | Java Activity, triggers Flutter modules |
| Settings | Hybrid | Flutter UI, Android data provider |
| Help/Tickets | Flutter-first | Full Flutter with Android bridge for analytics |
| Payments | Hybrid | Android PG activities + Flutter wrapper |
| User Onboarding | Flutter-first | Full Flutter |
| Vehicle Score | Flutter-first | Own channel (VEHICLE_SCORE_CHANNEL) |
| Lubricants | Flutter-first | Own channel (LUBRICANT_METHOD_CHANNEL) |
