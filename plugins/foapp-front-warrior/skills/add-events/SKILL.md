---
name: add-events
description: >
  Add analytics events to a feature from an events sheet or requirements. Use when the user
  says "add events", "add analytics", "integrate tracking", "event sheet", "add screen_view",
  or provides an events spreadsheet/list for a feature. Generates EventManager, EventName/
  EventCategory constants, and places events at correct locations in screens and BLoC.
metadata:
  version: "0.3.0"
---

# Add Events — Analytics Integration for Flutter + Android Features

Add analytics events to an existing feature by generating all required infrastructure. Works for both **Flutter** (OperatorAppFlutter) and **Android** (OperatorApp) sides of the hybrid app.

**CRITICAL:** Flutter analytics events are NOT independent — they forward to Android via MethodChannel (`eventTrigger` callback) → `WeLyticFromWeb` → Firebase + CleverTap. Both platforms share the same Firebase project and `v1_`-prefixed event namespace.

---

## Input

Ask the developer for (skip any already provided):

1. **Events sheet** — any of:
   - CSV or Excel file (columns: `screen_name`, `event_name`, `event_action`, `event_category`, `user_screen`, `miscellaneous_keys`)
   - A table copied from Confluence or a Google Sheet
   - A plain list of events with their properties
2. **Feature name** — short identifier like `ask-munshi`, `fuel-guard`, `fastag-recharge`
3. **Feature directory path** — location in `apps/` (e.g., `apps/gps_route/lib/gps_route/`)
4. **targetProduct** — product string: `gps`, `fastag`, `fuel`, `buy_sell`, `khata`, `chatbot`, etc.
5. **Platform** — `Flutter`, `Android`, or `Both`

If the events sheet is missing, ask: "Please share the events sheet (CSV, table, or list) for this feature."

---

## Flutter Event Infrastructure Rules

These rules are derived from **actual repo patterns** (GPS Route, Fuel Guard, Buy-Sell, Khata as references). Every generated file must follow them exactly.

### Rule 1: EventManager class — Singleton pattern (NOT GetIt locator)

EventManagers use **static singleton pattern** — they are NOT registered in `locator.dart` / GetIt.

**V2 pattern (for all new features):**
```dart
import 'package:we_base/we_lytics_manager.dart';

class AskMunshiEventManager extends WeLyticsEventManagerV2 {
  static final AskMunshiEventManager instance = AskMunshiEventManager._();

  AskMunshiEventManager._() : super(targetProduct: 'chatbot');

  void screenView({String? vehicleId, required String screenName}) {
    super.sendEvent(
      eventName: EventName.screenView,
      screenName: screenName,
      eventAction: CoreEventAction.view,
      vehicleID: vehicleId,
    );
  }

  void onSendMessage({String? vehicleId, String? messageType, String? userScreen}) {
    super.sendEvent(
      eventName: EventName.sendBtn,
      screenName: ScreenName.askMunshiScreen,
      eventAction: CoreEventAction.click,
      vehicleID: vehicleId,
      miscellaneous: EventMiscellaneous()
          .addMiscellaneous('message_type', messageType)
          .addMiscellaneous('user_screen', userScreen)
          .build(),
    );
  }
}
```

**NEVER do this:**
```dart
// WRONG — locator registration is NOT used for EventManagers
locator.registerSingleton<AskMunshiEventManager>(AskMunshiEventManager());

// WRONG — BaseEventManager is NOT directly extended by your feature class
class AskMunshiEventManager extends BaseEventManager { ... }

// WRONG — EventDispatcherV2 is NOT passed in constructor
AskMunshiEventManager() : super(targetProduct: 'chatbot', dispatcher: EventDispatcherV2());
```

**Two versions exist — use V2 for new features:**

| Class | Import | Used by |
|-------|--------|---------|
| `WeLyticsEventManagerV2` | `package:we_base/we_lytics_manager.dart` | GPS Route, Buy Flow, Offline DashCam (modern) |
| `WeLyticsEventManager` | `package:we_base/we_lytics_manager.dart` | Fuel Guard, Khata, Buy-Sell (older) |

Both are defined in `packages/we_base/lib/src/analytics/we_lytics.dart`.
`WeLyticsEventManagerV2` internally extends `BaseEventManager` and passes `EventDispatcherV2()` — you do NOT pass it yourself.

### Rule 2: sendEvent API — Named parameters (NOT EventDTO object)

The `sendEvent` method uses **named parameters**, not an `EventDTO` object:

```dart
super.sendEvent(
  eventName: EventName.screenView,        // required String
  screenName: ScreenName.askMunshiScreen,  // required String
  eventAction: CoreEventAction.click,      // String, defaults to 'click'
  eventCategory: EventCategory.chatInput,  // String? optional
  vehicleID: vehicleId,                    // String? optional (note: capital D)
  miscellaneous: miscString,               // String? optional
  entity: entityId,                        // String? optional (ticket ID, order ID, etc.)
  refId: referenceId,                      // String? optional (reference identifier)
);
```

**Important:** The parameter is `vehicleID` (capital D), not `vehicleId`.

### Rule 3: Constant class naming — Two valid patterns

Check the existing feature's pattern. If the feature already has constants, follow that pattern. For new features, either pattern is valid:

**Pattern A — Non-prefixed (GPS Route style, recommended for larger features):**
```dart
// event_name.dart
class EventName {
  static const screenView = 'screen_view';
  static const sendBtn = 'send_btn';
  static const viewLiveBtn = 'view_live_btn';
}

// screen_name.dart
class ScreenName {
  static const askMunshiScreen = 'ask_munshi_screen';
  static const munshiHistoryScreen = 'munshi_history_screen';
}

// event_category.dart
class EventCategory {
  static const chatInput = 'chat_input';
  static const historyList = 'history_list';
}
```

**Pattern B — Prefixed (for smaller features to avoid name collisions):**
```dart
class AskMunshiEventName {
  static const screenView = 'screen_view';
  static const sendBtn = 'send_btn';
}

class AskMunshiScreenName {
  static const askMunshiScreen = 'ask_munshi_screen';
}

class AskMunshiEventCategory {
  static const askMunshiScreen = 'ask_munshi_screen';
}
```

**CRITICAL — pick ONE pattern and use it consistently across all constant classes AND the EventManager.**

EventName value naming rules:
- All values are **snake_case** strings
- `screen_view` is universal — always `'screen_view'`
- Buttons: `*_btn` suffix (`send_btn`, `submit_btn`, `retry_btn`)
- List item taps: `*_tap` suffix (`history_item_tap`, `vehicle_card_tap`)
- Other clicks: `*_click` suffix (`filter_click`, `tab_click`)
- Actions: verb + noun (`load_more`, `scroll_end`, `filter_applied`)

### Rule 4: ScreenName and EventCategory — One per screen

```dart
// One ScreenName constant per distinct screen
class ScreenName {
  static const askMunshiScreen = 'ask_munshi_screen';
  static const munshiHistoryScreen = 'munshi_history_screen';
}

// One EventCategory constant per distinct screen (often same values as ScreenName)
class EventCategory {
  static const askMunshiScreen = 'ask_munshi_screen';
  static const munshiHistoryScreen = 'munshi_history_screen';
}
```

Use snake_case for all values.

### Rule 5: File placement

```
feature/
└── analytics/
    ├── event_manager.dart         // EventManager class (singleton)
    ├── event_name.dart            // EventName constants
    ├── event_category.dart        // EventCategory constants
    └── screen_name.dart           // ScreenName constants (or in event_name.dart)
```

Some features keep all constants in a single file. Check existing pattern in the feature before creating separate files.

### Rule 6: Calling events from UI

**screen_view — ALWAYS in initState:**
```dart
@override
void initState() {
  super.initState();
  AskMunshiEventManager.instance.screenView(
    screenName: ScreenName.askMunshiScreen,
    vehicleId: widget.vehicleId,
  );
}
```

**Button click — in onTap callback:**
```dart
WEFlatButtonV2.primary(
  title: WeLangKeysStore.instance.send.string(context),
  onTap: () {
    AskMunshiEventManager.instance.onSendMessage(
      messageType: 'text',
      userScreen: widget.sourceScreen,
    );
    context.read<AskMunshiBloc>().add(SendMessageEvent(message));
  },
)
```

**WeInkWell tap — in onTap:**
```dart
WeInkWell(
  onTap: () {
    AskMunshiEventManager.instance.onHistoryItemTap(itemId: item.id);
    // navigation or action...
  },
  child: HistoryItemWidget(item: item),
)
```

**NEVER:**
- Call events from BLoC — always from UI layer (screen, widget)
- Use `locator<EventManager>()` — use `EventManager.instance`
- Fire screen_view in `build()` or `BlocListener` — always in `initState()`
- Exception: popup/bottom sheet "view" events fire in the callback that opens them

### Rule 7: user_screen — Source screen tracking

If the events sheet has a `user_screen` column, it means this feature/widget can be opened from multiple places in the app. The `user_screen` value identifies **where the user came from** (the source screen).

**How it works:**
- The source screen passes its screen name when launching the feature
- The feature receives it as a constructor parameter (e.g., `widget.sourceScreen`)
- Every event from this feature includes `user_screen` in `miscellaneous` so analytics can track which entry point the user used

**Implementation pattern:**

1. **Screen constructor receives the source screen:**
```dart
class AskMunshiScreen extends StatefulWidget {
  final String? vehicleId;
  final String? sourceScreen;  // ← where user came from

  const AskMunshiScreen({
    super.key,
    this.vehicleId,
    this.sourceScreen,
  });
}
```

2. **EventManager methods accept `userScreen` parameter:**
```dart
void onSendMessage({String? vehicleId, String? messageType, String? userScreen}) {
  super.sendEvent(
    eventName: EventName.sendBtn,
    screenName: ScreenName.askMunshiScreen,
    eventAction: CoreEventAction.click,
    vehicleID: vehicleId,
    miscellaneous: EventMiscellaneous()
        .addMiscellaneous('message_type', messageType)
        .addMiscellaneous('user_screen', userScreen)
        .build(),
  );
}
```

3. **UI passes `widget.sourceScreen` to every event call:**
```dart
AskMunshiEventManager.instance.onSendMessage(
  messageType: 'text',
  userScreen: widget.sourceScreen,  // ← passed to miscellaneous
);
```

4. **Caller passes its screen name when navigating to this feature:**
```dart
// From Dashboard
WeNavigator.push(context,
  routeName: '/ask-munshi',
  arguments: {'sourceScreen': 'dashboard_screen'},
);

// From Vehicle Details
WeNavigator.push(context,
  routeName: '/ask-munshi',
  arguments: {'sourceScreen': 'vehicle_details_screen'},
);
```

**Rules:**
- `user_screen` is always a `miscellaneous` key — it is NOT a `sendEvent` parameter
- Pass `null` for `userScreen` if the sheet does not have a `user_screen` column for this feature
- If `user_screen` is present for ANY event in the sheet, add the `sourceScreen` constructor param to the screen widget and pass it in ALL events for that screen
- The value of `user_screen` is always a snake_case screen name string (e.g., `'dashboard_screen'`, `'vehicle_details_screen'`)

### Rule 8: Miscellaneous data — Use EventMiscellaneous builder

```dart
// Single key
miscellaneous: EventMiscellaneous()
    .addMiscellaneous('message_type', messageType)
    .build()
// → "message_type:text"

// Multiple keys (chained)
miscellaneous: EventMiscellaneous()
    .addMiscellaneous('vehicle_id', vehicleId)
    .addMiscellaneous('plan_name', planName)
    .addMiscellaneous('user_screen', userScreen)
    .build()
// → "vehicle_id:V123::plan_name:Gold::user_screen:dashboard_screen"
```

The `EventMiscellaneous` class is available in some features locally. If not present, use inline string format:
```dart
miscellaneous: 'vehicle_id:$vehicleId::plan_name:$planName::user_screen:$userScreen'
```

**Rules:**
- Format: `key:value::key:value` (colon between key-value, double-colon between pairs)
- Pass `null` when no extra data — never pass empty string `""`
- Keep it concise — Android side has 100 char limit and lowercases everything
- `user_screen` is a miscellaneous key, not a sendEvent parameter

### Rule 9: CoreEventAction values

| Constant | String | Use for |
|----------|--------|---------|
| `CoreEventAction.view` | `"view"` | Screen appearing, popup shown |
| `CoreEventAction.click` | `"click"` | Button tap, list item tap (DEFAULT) |
| `CoreEventAction.scroll` | `"scroll"` | Scroll interactions |
| `CoreEventAction.engagement` | `"engagement"` | Used in some web modules |

Default action is `click` if not specified.

### Rule 10: Event forwarding — Flutter → Android → Firebase

Flutter events are NOT sent directly to Firebase. The dispatch chain is:

```
Flutter EventManager.sendEvent()
  → EventDispatcherV2.dispatch()
    → FireBaseEventsActionInvoker(eventJson).execute()
      → MethodChannel 'eventTrigger' to Android
        → FlutterAppManger.eventTrigger(payload)
          → WeLyticFromWeb.sendEventToFirebaseFromWebView()
            → Firebase Analytics + CleverTap
```

This means:
- All Flutter events appear in Firebase with `v1_` prefix (added by Android side)
- `screen_view` events from Flutter are routed through `WeLyticUtil.logScreenViewWithVehicleId`
- Event field names must match Android's `WebEventModel`: `event_name`, `event_action`, `event_category`, `screen_name`, `vehicle_id`, `miscellaneous`, `target_product`, `entity`

---

## Android Event Infrastructure Rules

When adding events on the Android side (for hybrid features or Android-only screens):

### Android EventManager pattern — WeLytic1.Builder

```kotlin
// Screen view
WeLyticUtil.logScreenView(
    WeLyticConstant1.GpsScreenName.SETTINGS_SCREEN,
    SettingsActivity::class.java
)

// Screen view with vehicle ID
WeLyticUtil.logScreenViewWithVehicleId(
    vehicleId.toString(),
    WeLyticConstant1.GpsScreenName.PLAY_ROUTE,
    PlayItineraryActivity::class.java
)

// Button click event with user_screen in miscellaneous
WeLytic1.Builder(EventAction.CLICK, EventCategory.CHAT_INPUT, ScreenName.ASK_MUNSHI)
    .miscellaneous(
        WeLyticMiscellaneous.Builder()
            .addMiscellaneous("message_type", messageType)
            .addMiscellaneous("user_screen", lastVisitedScreen)
            .build()
    )
    .vehicleId(vehicleId)
    .targetProduct("chatbot")
    .sendEvent(context, "send_btn")
```

### Android constants location

| Constant type | Location |
|---|---|
| Global event names | `welytics/.../WeEventName.kt` |
| Event actions, categories, screen names | `welytics/.../WeLyticConstant1.kt` |
| Feature-specific events | Feature module's own `analytics/` directory |
| Miscellaneous builder | `welytics/.../WeLyticMiscellaneous.kt` |

### Android miscellaneous — WeLyticMiscellaneous.Builder

```kotlin
val misc = WeLyticMiscellaneous.Builder()
    .addMiscellaneous("vehicle_id", vehicleId)
    .addMiscellaneous("user_screen", getLastVisitedScreen())
    .build()
// → "vehicle_id:v123::user_screen:dashboard_screen" (lowercased, max 100 chars)
```

### Android user_screen pattern

On Android, `user_screen` is typically retrieved via `getLastVisitedScreen()` from `AppUtility`:
```kotlin
put("userScreen", getLastVisitedScreen())
```

The Android `ReportEventScreen` pattern uses `userScreen` as a DSL helper:
```kotlin
val userScreen by lazy { basicCategoryFunc("", getLastVisitedScreen(), "gps") }
```

---

## Process

### Step 1 — Parse the events sheet

Read the provided events sheet. Build an internal table:

| screen_name | event_name | event_action | event_category | user_screen | miscellaneous_keys |
|---|---|---|---|---|---|

If `event_action` is missing, infer:
- `screen_view` → `view`
- Any `_btn` / `_tap` / `_click` suffix → `click`
- Filter, scroll, tab → `scroll` or `engagement`

If `user_screen` column is present with values, note that the feature needs a `sourceScreen` constructor parameter and all events must include `user_screen` in miscellaneous.

### Step 2 — Map events to screens

Group events by `screen_name`. Show mapping table for approval:

```
Screen: ask_munshi_screen
  - screen_view (view) → initState
  - send_btn (click) → Send button onTap [user_screen in misc]
  - attachment_btn (click) → Attachment button onTap [user_screen in misc]

Screen: munshi_history_screen
  - screen_view (view) → initState
  - history_item_tap (click) → List item onTap
```

If `user_screen` is present, mark it clearly: `[user_screen: sourceScreen passed via constructor]`

**Wait for developer approval before generating code.**

### Step 3 — Check existing event infra

Scan the feature directory for:
- Any existing `*event_manager.dart`, `*event_name.dart`, `analytics/` directory
- Any existing EventManager class that extends `WeLyticsEventManagerV2` or `WeLyticsEventManager`
- Which naming pattern is used: non-prefixed (`EventName`) or prefixed (`FeatureEventName`)

Report: "Found existing XEventManager — will extend" or "No existing infra — creating from scratch"

### Step 4 — Generate EventName constants

Create or update the constants file. Follow existing naming pattern in the feature.

### Step 5 — Generate EventCategory + ScreenName constants

Add constants. One per screen.

### Step 6 — Generate EventManager

Create with **static singleton pattern**:
- `static final instance = ClassName._()`
- Extends `WeLyticsEventManagerV2`
- Constructor passes only `targetProduct` to super
- One method per event — uses `super.sendEvent(named params)`
- Uses `EventMiscellaneous` builder for miscellaneous data
- If `user_screen` is needed, each method takes `String? userScreen` param and includes it in miscellaneous

### Step 7 — Place events in UI code

For each event, show **exact code change** with line numbers:

```
File: lib/features/ask_munshi/presentation/views/ask_munshi_screen.dart
Location: initState method (after super.initState())
Add: AskMunshiEventManager.instance.screenView(
       screenName: ScreenName.askMunshiScreen);
```

If `user_screen` is needed, also show:
- Adding `sourceScreen` param to the screen's constructor
- Passing `userScreen: widget.sourceScreen` in every event call
- Updating the navigation call at the caller side to pass `sourceScreen`

Use the `Read` tool to find exact insertion points.

### Step 8 — Android events (if platform is Both)

For hybrid features, also generate:
- Constants in feature module's analytics directory
- `WeLytic1.Builder` calls in Activities/Fragments
- `WeLyticUtil.logScreenView` calls for screen views
- `user_screen` via `getLastVisitedScreen()` in miscellaneous (Android pattern)

### Step 9 — Compliance check

Verify:
- [ ] Every screen has exactly one `screen_view` event
- [ ] Every `WEFlatButtonV2` and `WeInkWell` `onTap` has a click event
- [ ] All event names are snake_case
- [ ] EventManager uses singleton pattern (not locator)
- [ ] EventManager extends `WeLyticsEventManagerV2` (not BaseEventManager directly)
- [ ] `sendEvent` uses named parameters (not EventDTO)
- [ ] `vehicleID` parameter spelled with capital D
- [ ] `miscellaneous` is `null` (not `""`) when no extra data
- [ ] screen_view fired in `initState()` (not build/BlocListener)
- [ ] Events fired from UI layer only (not from BLoC)
- [ ] `screenName` consistent across all events for same screen
- [ ] Constant class naming is consistent (all prefixed OR all non-prefixed)
- [ ] If `user_screen` in sheet → `sourceScreen` constructor param exists + passed in all events

---

## Rules Summary

1. EventManager uses **static singleton** — NOT GetIt locator
2. Extends **`WeLyticsEventManagerV2`** — NOT `BaseEventManager` directly
3. Constructor passes only **`targetProduct`** — NOT `EventDispatcherV2()`
4. `sendEvent` uses **named parameters** — NOT `EventDTO` object
5. Usage: **`MyEventManager.instance.method()`** — NOT `locator<MyEventManager>()`
6. screen_view in **`initState()`** — NOT build/BlocListener
7. Events from **UI only** — NOT from BLoC
8. Miscellaneous: **`EventMiscellaneous` builder** or inline `key:value::key:value`
9. `vehicleID` with **capital D** in sendEvent parameter
10. Flutter events **forward to Android** → Firebase + CleverTap (shared namespace)
11. All events get **`v1_` prefix** automatically on Android side
12. Constant class naming — **pick one pattern** (prefixed or non-prefixed) and use consistently
13. `user_screen` — passed as **miscellaneous key**, NOT a sendEvent parameter. Feature receives source screen via constructor, passes to all events

---

## Output

### Deliverable 1 — Event mapping table (approval gate)
Table showing every event mapped to screen and trigger location. Mark `user_screen` events clearly. **Get approval first.**

### Deliverable 2 — Generated files
- `analytics/event_name.dart` — EventName constants
- `analytics/event_category.dart` — EventCategory + ScreenName constants
- `analytics/event_manager.dart` — EventManager with singleton + typed methods

### Deliverable 3 — UI placement instructions
For each event: file path, method, exact lines to add with surrounding context.
If `user_screen` is present: include constructor param addition + caller-side navigation update.

### Deliverable 4 — Compliance report
Checklist confirming all 13 rules satisfied.

---

## Reference — Real examples from codebase

**GPS Route EventManager** (best reference for V2 pattern — non-prefixed naming):
`apps/gps_route/lib/gps_route/analytics/event_manager.dart`

**GPS EventName** (200+ constants — non-prefixed `EventName`):
`apps/gps_route/lib/gps_route/analytics/event_name.dart`

**GPS ScreenName** (94 constants):
`apps/gps_route/lib/gps_route/analytics/screen_name.dart`

**GPS EventCategory** (100+ constants):
`apps/gps_route/lib/gps_route/analytics/event_category.dart`

**Fuel Guard EventManager** (V1 pattern reference):
`apps/fuel_guard/lib/analytics/event_manager.dart`

**EventMiscellaneous builder**:
`apps/lubricants/lib/lubricants/analytics/event_miscellaneous.dart`

**EventDispatcher V1/V2 + BaseEventManager definitions**:
`packages/we_base/lib/src/analytics/we_lytics.dart`

**Android user_screen pattern**:
`OperatorApp/.../utils/AppUtility.kt` — `getLastVisitedScreen()`
`OperatorApp/.../gpsReporting/analytics/ReportEventScreen.kt` — `userScreen` DSL helper
