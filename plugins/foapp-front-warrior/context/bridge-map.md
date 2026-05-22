# MethodChannel Bridge Map: OperatorApp (Android) <-> OperatorAppFlutter (Flutter)

## Architecture Overview

The bridge uses **3 named MethodChannels** plus a **V2 action-routing system** (`we_comm_native` package) that multiplexes over the main channel.

### Channel Names

| Channel Name | Constant | Purpose |
|---|---|---|
| `COMMUNICATION_WITH_NATIVE_APP` | `FlutterBaseManager.COMMUNICATION_WITH_NATIVE_APP` | Primary channel: Flutter calls Android for data/actions |
| `COMMUNICATION_WITH_ACTIVITY` | `WeFlutterActivity.CHANNEL_COMMUNICATION_WITH_ACTIVITY` | Flutter calls Android Activity for navigation/start-activity |
| `COMMUNICATION_WITH_FLUTTER` | `WeFlutterActivity.CHANNEL_COMMUNICATION_WITH_FLUTTER` | Android calls Flutter (callback results, notifications) |
| `UMBRELLA_METHOD_CHANNEL` | `ModuleMethodChannel.UMBRELLA` | Android triggers Flutter module navigation (routeTo) |

### ModuleMethodChannel Enum (Android)

Defined in `FlutterBaseManager.kt`:

```
COMMUNICATION_WITH_NATIVE("COMMUNICATION_WITH_NATIVE_APP")
UMBRELLA("UMBRELLA_METHOD_CHANNEL")
LUBRICANT("LUBRICANT_METHOD_CHANNEL")
BUY_SELL("BUY_SELL_METHOD_CHANNEL")
VEHICLE_SCORE("VEHICLE_SCORE_CHANNEL")
TICKET_STATUS_REVAMP("TICKET_STATUS_REVAMP")
```

Only `COMMUNICATION_WITH_NATIVE` and `UMBRELLA` have `setMethodCallHandler` registered in `FlutterBaseManager.makeEngine()`. The others are declared but not actively handled in the scanned code.

---

## Communication Systems

### System 1: Legacy Direct MethodChannel (Old Pattern)

Flutter calls `platformChannel.invokeMethod("methodName", args)` directly on the `COMMUNICATION_WITH_NATIVE_APP` channel. Android's `FlutterBaseManager.handleCommunicationWithNativeMethodCalls()` dispatches by method name.

### System 2: V2 Action Invoker Architecture (New Pattern via `we_comm_native`)

Flutter uses `ActionInvoker` classes that build a structured map `{path, at, ad}` and invoke the `"communication"` method on `COMMUNICATION_WITH_NATIVE_APP`. Android's `we_comm_native` plugin routes the call through a tree of `FlutterActionProvider` classes using the dot-separated `path` to find the correct `ActionExecutor`.

**Flutter Invoker path construction:**
- `BaseActionInvoker` sends method `"communication"` with map: `{path: "module.category.action", at: actionType, ad: actionData}`
- Path segments are set by the class hierarchy, e.g.: `AppActionInvoker("app") -> AppRedirectActionInvoker("redirect") -> HandleActionResponseActionInvoker("handleActionResponse")`
- Final path: `"app.redirect.handleActionResponse"`

**Android ActionProvider tree:**
```
WeModuleFlutterActionProvider (root)
  |-- "app" -> WeAppFlutterActionProvider
  |     |-- "data" -> WeAppDataFlutterActionProvider
  |     |     `-- "handleSettingsNewPage" -> GetUserSettingsActionExecutor
  |     `-- "redirect" -> WeAppRedirectFlutterActionProvider
  |           |-- "handleActionResponse" -> ActionResponseActionExecutor
  |           |-- "handleRawActionResponse" -> RawActionResponseExecutor
  |           |-- "changeLocale" -> ChangeLocalActionExecutor
  |           |-- "helpSectionStartActivity" -> HelpSectionActionResponseHandlerActionExecutor
  |           |-- "handleSettingsRoute" -> SettingsActionResponseHandlerActionExecutor
  |           `-- "munshiStartActivity" -> MunshiActionResponseHandlerActionExecutor
  |-- "base" -> WeBaseFlutterActionProvider
  |     |-- "data" -> WeBaseDataFlutterActionProvider
  |     |     |-- "getApiHeaderData" -> ApiHeaderDataActionExecutor
  |     |     |-- "getHostUrl" -> GetHostUrlActionExecutor
  |     |     |-- "eventTrigger" -> FirebaseEventsActionExecutor
  |     |     |-- "flutterRemoteConfig" -> RemoteConfigDataActionExecutor
  |     |     |-- "sharedPref" -> SessionDataActionExecutor
  |     |     |-- "welangGetObject" -> WeLangDataActionExecutor
  |     |     |-- "performanceMonitor" -> PerformanceMonitorActionExecutor
  |     |     |-- "performanceMonitorV2" -> PerformanceMonitorActionExecutorV2
  |     |     |-- "getAppServiceData" -> AppServiceInfoDataActionExecutor
  |     |     |-- "getUserPrefData" -> UserPrefInfoDataActionExecutor
  |     |     |-- "getFirstTimeLangSelection" -> GetFirstTimeLanguageSelectionActionExecutor
  |     |     `-- "getHelpSectionData" -> GetHelpSectionDataSelectionActionExecutor
  |     `-- "redirect" -> WeBaseRedirectFlutterActionProvider
  |           |-- "dismissBottomSheet" -> BottomSheetDismissActionExecutor
  |           `-- "flutterPop" -> FlutterPopActionExecutor
  |-- "gps" -> WeGpsFlutterActionProvider
  |     |-- "data" -> WeGpsDataFlutterActionProvider
  |     |     |-- "openGeoFenceOrPlayRoute" -> PlayRouteGeoFenceDataActionExecutor
  |     |     |-- "getVehicleData" -> GetVehicleDataActionExecutor
  |     |     |-- "getReportFlowData" -> GpsReportFlowRemoteConfigDataExecutor
  |     |     |-- "wifiNetworkBinder" -> WifiNetworkBinderActionInvoker
  |     |     |-- "getARPTData" -> GetARPTDataActionExecutor
  |     |     `-- "shouldMpRateCardBannerBeShown" -> ShouldMpRateCardBannerBeShownActionExecutor
  |     `-- "redirect" -> WeGpsRedirectFlutterActionProvider (empty)
  |-- "buy_sell" -> WeBuySellFlutterActionProvider
  |     `-- "data" -> WeBuySellDataFlutterActionProvider
  |           `-- "unreadNotificationCount" -> BuySellUnreadNotificationCount
  `-- "payment" -> WePaymentFlutterActionProvider
        |-- "data" -> WeFlutterDataFlutterActionProvider
        |     `-- "getPaymentModeData" -> PaymentGetPaymentModeDataExecutor
        `-- "redirect" -> WeFlutterRedirectFlutterActionProvider
              `-- "handleActionResponse" -> PaymentActionResponseActionExecutor
```

---

## Channel 1: COMMUNICATION_WITH_NATIVE_APP (Flutter -> Android)

### Legacy Direct Methods (handled in FlutterBaseManager)

| Method Name | Direction | Data Format | Handler | Purpose |
|---|---|---|---|---|
| `welang` | F->A | `String` (strID) | `handleWeLang` | Get localized string by ID |
| `eventTrigger` | F->A | `String` (JSON payload) | `handleEventTrigger` | Send Firebase analytics event |
| `previousActivityFinish` | F->A | none | `handlePreviousActivityFinish` | Finish the host Android activity |
| `getFlutterSessionData` | F->A | `String` (key) | `handleGetFlutterSessionData` | Read shared pref by key |
| `putFlutterSessionData` | F->A | `Map {key, value}` | `handlePutFlutterSessionData` | Write shared pref key-value |
| `getApiHeaderData` | F->A | none | `handleGetApiHeaderData` | Returns API headers map |
| `operatorInfo` | F->A | none | `handleGetOperatorInfo` | Returns operator name, number, buy-sell config |
| `flutterRemoteConfig` | F->A | none | `handleGetFlutterRemoteConfig` | Returns Firebase Remote Config JSON string |
| `getNativeStartTime` | F->A | none | `handleNativeStartTime` | Returns timestamp (Long) for perf measurement |
| `getHostUrl` | F->A | none | `handleGetHostURL` | Returns base URL string |
| `startPerfMon` | F->A | `String` (traceName) | `handleStartPerfMon` | Start Firebase Performance trace |
| `stopPerfMon` | F->A | `String` (traceName) | `handleStopPerfMon` | Stop Firebase Performance trace |
| `startPerfMonDep` | F->A | `String` (traceName) | `handleStartPerfMonDep` | Start deprecated perf trace |
| `stopPerfMonDep` | F->A | none | `handleStopPerfMonDep` | Stop deprecated perf trace |
| `getVehicleNumber` | F->A | none | `handleVehicleNumber` | Returns vehicle number string |
| `getHelpSectionData` | F->A | none | `handelHelpSectionData` | Returns help/ticket data map |
| `getOrderNumber` | F->A | none | `handleOrderNumber` | Returns order number string |
| `welangGetObject` | F->A | `String` (screenName) | `handleWeLangGetObject` | Get all lang keys for a screen |
| `APP_SERVICE_INFO` | F->A | none | `handleAppServiceInfoRequest` | Returns app service/settings map |
| `USER_PREF_INFO` | F->A | none | `handleUserPrefInfoRequest` | Returns user preference map |
| `IS_IT_1ST_TIME_LANG_SELECTION_FLOW_NEW` | F->A | none | `handleIsIt1StTimeLangSelectionFlowRequest` | Returns boolean |
| `REFRESH_SETTING_API_FOR_UPDATE_GEO_FENCE` | F->A | none | `addPlacesHasBeenUpdated` | Marks geofence places as updated |
| `getVehicleData` | F->A | none | `handleGetVehicleData` | Returns vehicle data map (vId, vNum, filter, routingPageData) |
| `handleSettingsNewPage` | F->A | none | `handleGetSettingsData` | Returns settings data map |
| `getBannerData` | F->A | none | `handleBannersDataData` | Returns banners data map |
| `getGeofencingCreateData` | F->A | none | `handleGeofencingData` | Returns geofencing data map |
| `getGeofencingRemoteData` | F->A | none | `handleGeofencingRemoteData` | Returns geofencing remote config string |
| `getFuelSensorPageData` | F->A | none | `handleGetFuelSensorPageData` | Returns fuel sensor page data map |
| `openGeoFenceOrPlayRoute` | F->A | none | `handleGetAddPlaceOrPlayRoute` | Returns geofence/play route config map |
| `SEND_CALENDAR_REQUIRED_DATA` | F->A | `String` (JSON) | `handleFunctionSendCalendarRequiredData` | Sends calendar data via LocalBroadcast |
| `getUnreadBuyAndSellNotificationCount` | F->A | none | `handleBuyAndSellUnSeenNotificationCount` | Returns unread notification count (int) |
| `getBuySellNotificationData` | F->A | none | `handleBuyAndSellNotificationData` | Returns buy-sell notification data map |

### V2 Action Invoker Methods (via "communication" method)

All go through `CommunicationMethodChannel` invoking method `"communication"` with `{path, at, ad}`.

| Flutter Invoker Class | Full Path | Data Sent | Android Executor | Purpose | Feature |
|---|---|---|---|---|---|
| `ApiHeaderActionInvoker` | `base.data.getApiHeaderData` | none | `ApiHeaderDataActionExecutor` | Get API headers | All modules |
| `HostUrlActionInvoker` | `base.data.getHostUrl` | none | `GetHostUrlActionExecutor` | Get base URL | All modules |
| `FireBaseEventsActionInvoker` | `base.data.eventTrigger` | `Map` (event JSON) | `FirebaseEventsActionExecutor` | Send analytics event | All modules |
| `GetRemoteConfigDataActionInvoker` | `base.data.flutterRemoteConfig` | none | `RemoteConfigDataActionExecutor` | Get remote config | All modules |
| `FlutterSessionDataActionInvoker` | `base.data.sharedPref` | `{key, value}` or `{key}` | `SessionDataActionExecutor` | Read/write shared prefs | All modules |
| `WeLangDataActionInvoker` | `base.data.welangGetObject` | - | `WeLangDataActionExecutor` | Get localization data | All modules |
| `PerformanceMonitorActionInvoker` | `base.data.performanceMonitor` | - | `PerformanceMonitorActionExecutor` | Perf monitoring | All modules |
| `GetAppServiceInfoDataActionInvoker` | `base.data.getAppServiceData` | none | `AppServiceInfoDataActionExecutor` | App service info (KAM, NPS) | Fuel Guard, GPS |
| `UserPrefInfoDataActionInvoker` | `base.data.getUserPrefData` | none | `UserPrefInfoDataActionExecutor` | User preferences | Settings |
| `GetFirstTimeLanguageSelectionActionExecutor` | `base.data.getFirstTimeLangSelection` | none | `GetFirstTimeLanguageSelectionActionExecutor` | First-time lang check | Onboarding |
| `GetHelpSectionDataSelectionActionExecutor` | `base.data.getHelpSectionData` | none | `GetHelpSectionDataSelectionActionExecutor` | Help/ticket section data | Ticket Status |
| `BottomSheetDismissActionInvoker` | `base.redirect.dismissBottomSheet` | none | `BottomSheetDismissActionExecutor` | Dismiss Android bottom sheet | Common |
| `FlutterScreenPopActionInvoker` | `base.redirect.flutterPop` | none | `FlutterPopActionExecutor` | Pop/finish Flutter screen | Common |
| `HandleActionResponseActionInvoker` | `app.redirect.handleActionResponse` | `{type, data}` | `ActionResponseActionExecutor` | Navigate to Android screen via WeRedirectIntent | GPS, FuelGuard, FASTag, BuySell, Settings, ARPT |
| `HandleRawActionResponseInvoker` | `app.redirect.handleRawActionResponse` | `{type, data}` | `RawActionResponseExecutor` | Raw redirect via WeRedirectIntent | GPS |
| `ChangeLocaleDataActionInvoker` | `app.redirect.changeLocale` | `Map` (locale data) | `ChangeLocalActionExecutor` | Change app language | Settings |
| `HelpSectionActionResponseHandlerActionInvoker` | `app.redirect.helpSectionStartActivity` | `{type, data}` | `HelpSectionActionResponseHandlerActionExecutor` | Start help section activity | Ticket Status |
| `SettingsActionResponseHandlerActionExecutor` | `app.redirect.handleSettingsRoute` | - | `SettingsActionResponseHandlerActionExecutor` | Settings page routing | Settings |
| `SaarthiCtaBridgeInvoker` | `app.redirect.saarthiStartActivity` | `{at, ...payload}` | Routed to Munshi executor? | Saarthi AI CTA actions | Ticket Status / Saarthi AI |
| `MunshiActionResponseHandlerActionExecutor` | `app.redirect.munshiStartActivity` | `{at, ad: {...}}` | `MunshiActionResponseHandlerActionExecutor` | Munshi AI redirect | Ask Munshi |
| `GetUserSettingsActionExecutor` | `app.data.handleSettingsNewPage` | none | `GetUserSettingsActionExecutor` | Get user settings data | Settings |
| `GetVehicleDataActionInvoker` | `gps.data.getVehicleData` | none | `GetVehicleDataActionExecutor` | Get vehicle data map | GPS Route |
| `PlayRouteGeoFenceDataActionInvoker` | `gps.data.openGeoFenceOrPlayRoute` | none | `PlayRouteGeoFenceDataActionExecutor` | Get geofence/play route config | GPS Route |
| `GetReportFlowDataActionInvoker` | `gps.data.getReportFlowData` | none | `GpsReportFlowRemoteConfigDataExecutor` | Get report flow data | GPS Reports |
| `WifiNetworkBinderActionInvoker` | `gps.data.wifiNetworkBinder` | `{type: "BIND"/"UNBIND"}` | `WifiNetworkBinderActionInvoker` | Bind/unbind WiFi network | GPS Dashcam |
| `GetARPTDataActionInvoker` | `gps.data.getARPTData` | none | `GetARPTDataActionExecutor` | Get ARPT native data | ARPT |
| `MpRateCardDataActionInvoker` | `gps.data.shouldMpRateCardBannerBeShown` | none | `ShouldMpRateCardBannerBeShownActionExecutor` | Check rate card banner | GPS |
| `UnreadNotificationCountActionInvoker` | `buy_sell.data.unreadNotificationCount` | none | `BuySellUnreadNotificationCount` | Get unread B&S notification count | Buy & Sell |
| `SavedPaymentModeDataActionInvoker` | `payment.data.getPaymentModeData` | none | `PaymentGetPaymentModeDataExecutor` | Get saved payment mode | One-Tap Payment |
| `HandlePaymentRedirectionActionInvoker` | `payment.redirect.handleActionResponse` | `{type, data}` | `PaymentActionResponseActionExecutor` | Payment redirect | One-Tap Payment, Fuel Guard |

---

## Channel 2: COMMUNICATION_WITH_ACTIVITY (Flutter -> Android)

Handled in `WeFlutterActivity.handleCommunicationMethodCalls()`:

| Method Name | Direction | Data Format | Purpose | Feature |
|---|---|---|---|---|
| `START_ACTIVITY` | F->A | none | Start an Android activity (stub, not implemented) | Legacy |
| `START_ACTIVITY_FOR_RESULT` | F->A | `Map {vId, vNum, escId, tId, at, ad: {altDocFlow, docUploadEntityType, orderId, entityId, entityType, amtInPaisa}}` | Start activity for result (doc upload, tag transfer, order details, payment gateway) | FASTag, GPS, Order |
| `OPEN_DIALOG` | F->A | (not implemented) | Open native dialog | Legacy |
| `CHANGE_LOCALE` | F->A | `Map {NEW_LOCALE_CODE, NEW_LOCALE_NAME}` | Change app language and restart | Settings |
| `OPEN_CHAT_FLOW` | F->A | `Map (ad data)` | Open in-house chat | GPS, Support |
| `OPEN_FTAG_TAG_TO_TAG_TRANSFER_OTP_FLOW` | F->A | `Map {escId}` | Open FASTag tag-to-tag transfer OTP flow | FASTag |
| `OpenNotificationPage` | F->A | none | Open Buy & Sell notification page | Buy & Sell |
| `onTicketRaisedSuccessfully` | F->A | none | Notify ticket was raised (iOS pattern, used in GPS) | GPS / Ticket |

---

## Channel 3: COMMUNICATION_WITH_FLUTTER (Android -> Flutter)

Handled by Flutter's `setMethodCallHandler` on `platformChannelFlutter`:

| Method Name | Direction | Data Sent | Purpose | Feature |
|---|---|---|---|---|
| `ON_ACTIVITY_RESULT` | A->F | `boolean` (resultCode == RESULT_OK) | Callback after `startActivityForResult` completes | FASTag, GPS Route, One-Tap Payment |
| `onBuyAndSellNotificationClick` | A->F | `Map {action, filter}` | Notification click data from Buy & Sell notification page | Buy & Sell |
| `setUnreadBuyAndSellNotificaitonCount` | A->F | `int` (unseenNotificationCount) | Push updated unread notification count to Flutter | Buy & Sell |

---

## Channel 4: UMBRELLA_METHOD_CHANNEL (Android -> Flutter)

| Method Name | Direction | Data Sent | Purpose | Feature |
|---|---|---|---|---|
| `routeTo` | A->F | `String` (route name from `umbrellaAppOldRoutes`) | Navigate Flutter to a specific module/screen | Module launching |
| `getFlutterPackageVersions` | F->A | `Map<String?, String?>` (package versions) | Report Flutter package versions to Android | Umbrella startup |

Android calls `FlutterAppManger.callFlutterEngine(ModuleMethodChannel.UMBRELLA, methodName, arguments)` which invokes the method on the UMBRELLA channel and then starts `WeFlutterActivity`.

---

## Common Redirect Action Types (via HandleActionResponseActionInvoker)

These are the `type` values passed in `{type, data}` to `ActionResponseActionExecutor`, which routes them through `WeRedirectIntent.classRouter()`:

| Action Type | Data Keys | Source Feature |
|---|---|---|
| `open_dashboard_screen` | `{flow, loginFrom, loginWith, shouldSaveDataOnly, loginResponseDataJson, userName, password}` | User Onboarding / Login |
| `open_language_screen` | none | User Onboarding |
| `VEHICLE_DETAILS_VIEW_TICKET` | `{tId}` | Fuel Guard |
| `FUEL_HOME_PAGE` | none | Fuel Guard |
| `VEHICLE_DETAILS_TICKET_PAY` | `{orderId}` | Fuel Guard |
| `create_order_screen` | `{data: JSON{packageId, tokenAmount, buyFlowCategory, serviceType}}` | Fuel Guard |
| `MY_ORDER_DETAILS_SCREEN` | `{orderId}` | Fuel Guard |
| `FUEL_SENSOR_SCREEN` | `{vehicleId, pageId}` | Fuel Guard |
| `FUEL_SENSOR_PAGE_NEW` | `{pageId}` | Fuel Guard |
| `MULTI_YEAR_VEHICLE_RECHARGE_CLICKED` | `{vehicleData: JSON{vNo, vId}}` | Fuel Guard |
| `TRANSACTION_DETAIL_SCREEN` | `{transactionCode}` | Fuel Guard |
| `openLearnVideoListing` | `{name, videoUrl, videoIndex?}` | Fuel Guard |
| `OPEN_NPS_FLOW` | `{npsOpenData, isFlutterListing}` | Fuel Guard |
| `BUY_AND_SELL_NOTIFICATION_PAGE` | none | Buy & Sell |
| `SCHEDULE_BACK_HANDLING` | `{buyFlowCategory}` | GPS / Scheduling |
| `soundUrl` | `{audioUrl}` | GPS Route |
| `navigate_to_lat_long` | `{lat, long}` | GPS Route |
| `changePayment` | `PaymentRequest.toJson()` | One-Tap Payment |
| `startPayment` | `PaymentRequest.toJson()` | One-Tap Payment |
| `OPEN_ORDER_TRANSACTION_DETAIL_PAGE` | `{orderId}` | WeFlutterActivity (legacy) |
| `OPEN_PAYMENT_GATEWAY` | `{amtInPaisa, entityType, entityId}` | WeFlutterActivity (legacy) |
| `TAG_TRANSFER` | `{escId}` | FASTag (legacy) |
| `TAG_CLOSURE_DOC` | `{vId, escId, vNum}` | FASTag (legacy) |
| `DOC_UPLOAD` | `{docUploadEntityType, tId, vNum}` | FASTag (legacy) |

---

## Flutter-Side NativeActionInvoker Class Hierarchy

```
BasicDataActionInvoker                  (path, actionType, actionData fields)
  |-- BasicActionInvoker<T>             (defaultValue, validator, execute, getResult)
        |-- BaseActionInvoker<T>        (process via CommunicationDataParser -> "communication" method)
              |-- WeBaseActionInvoker   (path="base")
              |     |-- WeBaseDataActionInvoker (path="data")
              |     |     |-- ApiHeaderActionInvoker         (path="getApiHeaderData")
              |     |     |-- HostUrlActionInvoker            (path="getHostUrl")
              |     |     |-- FireBaseEventsActionInvoker     (path="eventTrigger")
              |     |     |-- GetRemoteConfigDataActionInvoker(path="flutterRemoteConfig")
              |     |     |-- FlutterSessionDataActionInvoker (path="sharedPref")
              |     |     |-- WeLangDataActionInvoker         (path="welangGetObject")
              |     |     |-- PerformanceMonitorActionInvoker (path="performanceMonitor")
              |     |     |-- GetAppServiceInfoDataActionInvoker (path="getAppServiceData")
              |     |     `-- UserPrefInfoDataActionInvoker   (path="getUserPrefData")
              |     `-- WeBaseRedirectActionInvoker (path="redirect")
              |           |-- BottomSheetDismissActionInvoker (path="dismissBottomSheet")
              |           `-- FlutterScreenPopActionInvoker   (path="flutterPop")
              |-- AppActionInvoker      (path="app")
              |     `-- AppRedirectActionInvoker (path="redirect")
              |           |-- HandleActionResponseActionInvoker (path="handleActionResponse")
              |           |-- HandleRawActionResponseInvoker    (path="handleRawActionResponse") [in we_base]
              |           |-- ChangeLocaleDataActionInvoker     (path="changeLocale")
              |           |-- ChatBotActionInvoker              (path=?)
              |           |-- HelpSectionActionResponseHandlerActionInvoker (path="helpSectionStartActivity")
              |           |-- SaarthiCtaBridgeInvoker           (path="saarthiStartActivity") [ticket_status_revamp]
              |           `-- MunshiActionResponseHandler       (path="munshiStartActivity") [future]
              |-- WeGpsActionInvoker    (path="gps")
              |     |-- WeGpsDataActionInvoker (path="data")
              |     |     |-- GetVehicleDataActionInvoker     (path="getVehicleData")
              |     |     |-- PlayRouteGeoFenceDataActionInvoker (path="openGeoFenceOrPlayRoute")
              |     |     |-- GetReportFlowDataActionInvoker  (path="getReportFlowData")
              |     |     |-- WifiNetworkBinderActionInvoker  (path="wifiNetworkBinder")
              |     |     `-- MpRateCardDataActionInvoker     (path="shouldMpRateCardBannerBeShown")
              |     `-- WeGpsRedirectActionInvoker (path="redirect")
              |-- BSActionInvoker       (path="buy_sell") [buy-sell-truck]
              |     `-- BSDataActionInvoker (path="data")
              |           `-- UnreadNotificationCountActionInvoker (path="unreadNotificationCount")
              |-- WePaymentActionInvoker (path="payment") [we_op_common / fuel_guard]
              |     |-- WePaymentDataActionInvoker (path="data")
              |     |     `-- SavedPaymentModeDataActionInvoker (path="getPaymentModeData")
              |     `-- WePaymentRedirectActionInvoker (path="redirect")
              |           `-- HandlePaymentRedirectionActionInvoker (path="handleActionResponse")
              `-- WeArptActionInvoker   (path=?) [average_revenue_per_truck]
                    `-- WeArptDataActionInvoker (path="data")
                          `-- GetARPTDataActionInvoker (path="getARPTData")
```

---

## Feature-to-Channel Usage Map

| Feature | Channel(s) Used | Key Invokers / Methods |
|---|---|---|
| **GPS Route** | NATIVE_APP, ACTIVITY, FLUTTER | `GetVehicleDataActionInvoker`, `PlayRouteGeoFenceDataActionInvoker`, `HandleActionResponseActionInvoker`, `WifiNetworkBinderActionInvoker`, ON_ACTIVITY_RESULT listener |
| **Fuel Guard** | NATIVE_APP | `HandleActionResponseActionInvoker` (many redirect types), `FlutterSessionDataActionInvoker`, `GetRemoteConfigDataActionInvoker`, `GetAppServiceInfoDataActionInvoker` |
| **FASTag** | NATIVE_APP, ACTIVITY, FLUTTER | `FlutterSessionDataActionInvoker`, `GetRemoteConfigDataActionInvoker`, ON_ACTIVITY_RESULT listener, `OPEN_FTAG_TAG_TO_TAG_TRANSFER_OTP_FLOW` |
| **Buy & Sell** | NATIVE_APP, FLUTTER | `HandleActionResponseActionInvoker` (BUY_AND_SELL_NOTIFICATION_PAGE), `UnreadNotificationCountActionInvoker`, `onBuyAndSellNotificationClick` callback |
| **Settings** | NATIVE_APP, ACTIVITY | `ChangeLocaleDataActionInvoker`, `HandleActionResponseActionInvoker`, `CHANGE_LOCALE` on activity channel |
| **ARPT** | NATIVE_APP | `GetARPTDataActionInvoker`, `HandleActionResponseActionInvoker`, `HostUrlActionInvoker`, `ApiHeaderActionInvoker` |
| **One-Tap Payment** | NATIVE_APP | `SavedPaymentModeDataActionInvoker`, `HandlePaymentRedirectionActionInvoker` (changePayment, startPayment) |
| **Ticket Status / Saarthi AI** | NATIVE_APP | `HelpSectionActionResponseHandlerActionInvoker`, `SaarthiCtaBridgeInvoker` |
| **User Onboarding** | NATIVE_APP | `HandleActionResponseActionInvoker` (open_dashboard_screen, open_language_screen) |
| **Analytics (WeLytics)** | NATIVE_APP | `FireBaseEventsActionInvoker` (V2), `platformChannel.invokeMethod("eventFirebaseTrigger")` (iOS legacy) |
| **Schedule Installation** | NATIVE_APP, ACTIVITY | Legacy direct `invokeMethod` calls |
| **Street View** | NATIVE_APP, ACTIVITY | `HandleActionResponseActionInvoker` via `NativeRedirectHelper` |
| **Ask Munshi** | NATIVE_APP | `MunshiActionResponseHandlerActionExecutor` via `app.redirect.munshiStartActivity` path |

---

## Key Files Reference

### Android (OperatorApp)
- `webase/.../flutter/FlutterBaseManager.kt` -- Legacy channel handler + ModuleMethodChannel enum + constants
- `app/.../flutter/WeFlutterActivity.kt` -- ACTIVITY channel handler + FLUTTER channel invoker
- `app/.../flutter/FlutterAppManger.kt` -- Concrete FlutterBaseManager impl + callFlutterEngine
- `app/.../flutter/v2/flutteraction/base/WeModuleFlutterActionProvider.kt` -- V2 root provider tree
- `app/.../flutter/v2/flutteraction/app/WeAppRedirectFlutterActionProvider.kt` -- App redirect executors
- `weyestyle/.../flutter/flutteraction/base/WeBaseDataFlutterActionProvider.kt` -- Base data executors
- `wegps/.../flutteraction/WeGpsDataFlutterActionProvider.kt` -- GPS data executors
- `wepaymentv2/.../flutteraction/WePaymentFlutterActionProvider.kt` -- Payment provider tree

### Flutter (OperatorAppFlutter)
- `packages/we_base/lib/src/analytics/we_lytics.dart` -- EventDispatcher (analytics bridge)
- `apps/gps_route/lib/gps_route/platform/gps_route_events.dart` -- GPS platform events
- `apps/fastag/lib/free_fastag/platform/ftag_route_events.dart` -- FASTag platform events
- `apps/fuel_guard/lib/platform/fuel_guard_events.dart` -- Fuel Guard platform events
- `apps/buy-sell-truck/lib/truck_buy_and_sell/analytics/em_events.dart` -- Buy & Sell events
- `apps/average_reveue_per_truck/lib/utils/platform_methods.dart` -- ARPT platform events
- `packages/we_op_common/lib/we_one_tap_payment/utils/platform/platform_events.dart` -- Payment events
- `packages/we_op_common/lib/we_auto_pay_flow/communication/platform_communication.dart` -- AutoPay bridge
- `apps/settings_page/lib/communication/platform_methods.dart` -- Settings platform events
- `apps/user_onboarding/lib/platform/login_platform_events.dart` -- Login platform events
- `apps/ticket_status_revamp/lib/features/saarthi_ai/bridge/saarthi_cta_bridge_invoker.dart` -- Saarthi CTA bridge

### Shared Library (flutter_packages/we_comm_native)
- `lib/src/channel/communication_method_channel.dart` -- Main channel definition (COMMUNICATION_WITH_NATIVE_APP)
- `lib/src/invokers/base/base_action_invoker.dart` -- Base invoker (sends "communication" method)
- `lib/src/invokers/basic/basic_data_action_invoker.dart` -- Path/actionType/actionData fields
- `lib/src/invokers/actionhandler/app/redirect/handlers/handle_action_response_redirect_invoker.dart` -- Main redirect invoker
- `lib/src/invokers/actionhandler/base/data/handlers/session/flutter_session_data_action_invoker.dart` -- SharedPref invoker
- `android/.../helper/flutteraction/` -- Android-side action executor base classes
