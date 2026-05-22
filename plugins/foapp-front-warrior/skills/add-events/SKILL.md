---
name: add-events
description: >
  Add analytics events to a feature from an events sheet or requirements. Use when the user
  says "add events", "add analytics", "integrate tracking", "event sheet", "add screen_view",
  or provides an events spreadsheet/list for a feature. Generates EventManager, EventName/
  EventCategory constants, and places events at correct locations in screens and BLoC.
metadata:
  version: "0.2.0"
---

# Add Events — Analytics Integration for Flutter + Android Features

Add analytics events to an existing feature by generating all required infrastructure. Works for both **Flutter** (OperatorAppFlutter) and **Android** (OperatorApp) sides of the hybrid app.

**CRITICAL:** Flutter analytics events are NOT independent — they forward to Android via MethodChannel (`eventTrigger` callback) → `WeLyticFromWeb` → Firebase + CleverTap. Both platforms share the same Firebase project and `v1_`-prefixed event namespace.

---

## Input

Ask the developer for (skip any already provided):

1. **Events sheet** — any of:
   - CSV or Excel file (columns: `screen_name`, `event_name`, `event_action`, `event_category`, `miscellaneous_keys`)
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

  void onSendMessage({String? vehicleId, String? messageType}) {
    super.sendEvent(
      eventName: AskMunshiEventName.sendBtn,
      screenName: ScreenName.askMunshiScreen,
      eventAction: CoreEventAction.click,
      vehicleID: vehicleId,
      miscellaneous: messageType != null
          ? EventMiscellaneous()
              .addMiscellaneous('message_type', messageType)
              .build()
          : null,
    );
  }
}
```

**NEVER do this:**
```dart
// WRONG — locator registration is NOT used for EventManagers
locator.registerSingleton<AskMunshiEventManager>(AskMunshiEventManager());

// WRONG — BaseEventManager is NOT directly extended
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
);
```

**Important:** The parameter is `vehicleID` (capital D), not `vehicleId`.

### Rule 3: EventName constants — Static const in a class

```dart
class AskMunshiEventName {
  static const screenView = 'screen_view';
  static const sendBtn = 'send_btn';
  static const attachmentBtn = 'attachment_btn';
  static const suggestionTap = 'suggestion_tap';
  static const historyItemTap = 'history_item_tap';
  static const retryBtn = 'retry_btn';
}
```

Naming rules:
- All values are **snake_case** strings
- `screen_view` is universal — always `'screen_view'`
- Buttons: `*_btn` suffix (`send_btn`, `submit_btn`, `retry_btn`)
- List item taps: `*_tap` suffix (`history_item_tap`, `vehicle_card_tap`)
- Other clicks: `*_click` suffix (`filter_click`, `tab_click`)
- Actions: verb + noun (`load_more`, `scroll_end`, `filter_applied`)

### Rule 4: EventCategory constants

```dart
class AskMunshiEventCategory {
  static const askMunshiScreen = 'ask_munshi_screen';
  static const munshiHistoryScreen = 'munshi_history_screen';
}
```

One category per distinct screen. Use snake_case.

### Rule 5: ScreenName constants

```dart
class AskMunshiScreenName {
  static const askMunshiScreen = 'ask_munshi_screen';
  static const munshiHistoryScreen = 'munshi_history_screen';
}
```

Or add to existing feature's `ScreenName` class if one exists.

### Rule 6: File placement

```
feature/
└── analytics/
    ├── event_manager.dart         // EventManager class (singleton)
    ├── event_name.dart            // EventName constants
    ├── event_category.dart        // EventCategory constants
    └── screen_name.dart           // ScreenName constants (or in event_name.dart)
```

Some features keep all constants in a single file. Check existing pattern in the feature before creating separate files.

### Rule 7: Calling events from UI

**screen_view — ALWAYS in initState:**
```dart
@override
void initState() {
  super.initState();
  AskMunshiEventManager.instance.screenView(
    screenName: AskMunshiScreenName.askMunshiScreen,
    vehicleId: widget.vehicleId,
  );
}
```

**Button click — in onTap callback:**
```dart
WEFlatButtonV2.primary(
  title: WeLangKeysStore.instance.send.string(context),
  onTap: () {
    AskMunshiEventManager.instance.onSendMessage(messageType: 'text');
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
    .addMiscellaneous('tab_type', tabType)
    .build()
// → "vehicle_id:V123::plan_name:Gold::tab_type:active"
```

The `EventMiscellaneous` class is available in some features locally. If not present, use inline string format:
```dart
miscellaneous: 'vehicle_id:$vehicleId::plan_name:$planName'
```

**Rules:**
- Format: `key:value::key:value` (colon between key-value, double-colon between pairs)
- Pass `null` when no extra data — never pass empty string `""`
- Keep it concise — Android side has 100 char limit and lowercases everything

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

// Button click event
WeLytic1.Builder(EventAction.CLICK, EventCategory.CHAT_INPUT, ScreenName.ASK_MUNSHI)
    .miscellaneous(
        WeLyticMiscellaneous.Builder()
            .addMiscellaneous("message_type", messageType)
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
    .addMiscellaneous("plan_name", planName)
    .build()
// → "vehicle_id:v123::plan_name:gold" (lowercased, max 100 chars)
```

---

## Process

### Step 1 — Parse the events sheet

Read the provided events sheet. Build an internal table:

| screen_name | event_name | event_action | event_category | miscellaneous_keys |
|---|---|---|---|---|

If `event_action` is missing, infer:
- `screen_view` → `view`
- Any `_btn` / `_tap` / `_click` suffix → `click`
- Filter, scroll, tab → `scroll` or `engagement`

### Step 2 — Map events to screens

Group events by `screen_name`. Show mapping table for approval:

```
Screen: ask_munshi_screen
  - screen_view (view) → initState
  - send_btn (click) → Send button onTap
  - attachment_btn (click) → Attachment button onTap

Screen: munshi_history_screen
  - screen_view (view) → initState
  - history_item_tap (click) → List item onTap
```

**Wait for developer approval before generating code.**

### Step 3 — Check existing event infra

Scan the feature directory for:
- Any existing `*event_manager.dart`, `*event_name.dart`, `analytics/` directory
- Any existing EventManager class that extends `WeLyticsEventManagerV2` or `WeLyticsEventManager`

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

### Step 7 — Place events in UI code

For each event, show **exact code change** with line numbers:

```
File: lib/features/ask_munshi/presentation/views/ask_munshi_screen.dart
Location: initState method (after super.initState())
Add: AskMunshiEventManager.instance.screenView(
       screenName: AskMunshiScreenName.askMunshiScreen);
```

Use the `Read` tool to find exact insertion points.

### Step 8 — Android events (if platform is Both)

For hybrid features, also generate:
- Constants in feature module's analytics directory
- `WeLytic1.Builder` calls in Activities/Fragments
- `WeLyticUtil.logScreenView` calls for screen views

### Step 9 — Compliance check

Verify:
- [ ] Every screen has exactly one `screen_view` event
- [ ] Every `WEFlatButtonV2` and `WeInkWell` `onTap` has a click event
- [ ] All event names are snake_case
- [ ] EventManager uses singleton pattern (not locator)
- [ ] EventManager extends `WeLyticsEventManagerV2` (not BaseEventManager)
- [ ] `sendEvent` uses named parameters (not EventDTO)
- [ ] `vehicleID` parameter spelled with capital D
- [ ] `miscellaneous` is `null` (not `""`) when no extra data
- [ ] screen_view fired in `initState()` (not build/BlocListener)
- [ ] Events fired from UI layer only (not from BLoC)
- [ ] `screenName` consistent across all events for same screen

---

## Rules Summary

1. EventManager uses **static singleton** — NOT GetIt locator
2. Extends **`WeLyticsEventManagerV2`** — NOT `BaseEventManager`
3. Constructor passes only **`targetProduct`** — NOT `EventDispatcherV2()`
4. `sendEvent` uses **named parameters** — NOT `EventDTO` object
5. Usage: **`MyEventManager.instance.method()`** — NOT `locator<MyEventManager>()`
6. screen_view in **`initState()`** — NOT build/BlocListener
7. Events from **UI only** — NOT from BLoC
8. Miscellaneous: **`EventMiscellaneous` builder** or inline `key:value::key:value`
9. `vehicleID` with **capital D** in sendEvent parameter
10. Flutter events **forward to Android** → Firebase + CleverTap (shared namespace)
11. All events get **`v1_` prefix** automatically on Android side

---

## Output

### Deliverable 1 — Event mapping table (approval gate)
Table showing every event mapped to screen and trigger location. **Get approval first.**

### Deliverable 2 — Generated files
- `analytics/event_name.dart` — EventName constants
- `analytics/event_category.dart` — EventCategory + ScreenName constants
- `analytics/event_manager.dart` — EventManager with singleton + typed methods

### Deliverable 3 — UI placement instructions
For each event: file path, method, exact lines to add with surrounding context.

### Deliverable 4 — Compliance report
Checklist confirming all 11 rules satisfied.

---

## Reference — Real examples from codebase

**GPS Route EventManager** (best reference for V2 pattern):
`apps/gps_route/lib/gps_route/analytics/event_manager.dart`

**GPS EventName** (200+ constants):
`apps/gps_route/lib/gps_route/analytics/event_name.dart`

**GPS EventCategory** (100+ constants):
`apps/gps_route/lib/gps_route/analytics/event_category.dart`

**Fuel Guard EventManager** (V1 pattern reference):
`apps/fuel_guard/lib/analytics/event_manager.dart`

**EventMiscellaneous builder**:
`apps/lubricants/lib/lubricants/analytics/event_miscellaneous.dart`

**EventDispatcher V1/V2 definitions**:
`packages/we_base/lib/src/analytics/we_lytics.dart`
