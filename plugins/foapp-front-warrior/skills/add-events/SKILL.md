---
name: add-events
description: >
  Add analytics events to a feature from an events sheet or requirements. Use when the user
  says "add events", "add analytics", "integrate tracking", "event sheet", "add screen_view",
  or provides an events spreadsheet/list for a feature. Generates EventManager, EventDTO
  constants, and places events at correct locations in screens and BLoC.
metadata:
  version: "0.1.0"
---

# Add Events — Analytics Integration for Flutter + Android Features

Add Firebase analytics events to an existing feature by generating all required infrastructure: `EventName` constants, `EventCategory` constants, a typed `EventManager` class, locator registration, and placement calls inside screens and BLoC. Works for both the **Flutter** (OperatorAppFlutter) and **Android** (OperatorApp / WeLytic) sides of the hybrid app.

---

## Input

Ask the developer for (skip any already provided):

1. **Events sheet** — any of:
   - CSV or Excel file pasted/attached (columns: `screen_name`, `event_name`, `event_action`, `event_category`, `miscellaneous_keys`)
   - A table copied from Confluence or a Google Sheet
   - A plain list of events with their properties
2. **Feature name** — short identifier like `ask-munshi`, `fuel-guard`, `fastag-recharge`
3. **Feature directory path** — location of the feature in `apps/` (e.g., `apps/operator-app/lib/features/ask_munshi/`)
4. **targetProduct** — the product string used in all events for this feature (e.g., `gps`, `fastag`, `fuel`, `buy_sell`, `khata`, `chatbot`)
5. **Platform** — `Flutter`, `Android`, or `Both`

If the events sheet is missing, ask: "Please share the events sheet (CSV, table, or list) for this feature."

---

## Event Infrastructure Rules

These rules are **mandatory** for all events in OperatorAppFlutter. Every generated file must follow them exactly.

### 1. File placement

All event constants and the `EventManager` for a feature live in a dedicated analytics file inside the feature's `presentation/` or root layer:

```
feature/
└── analytics/
    ├── <feature>_event_constants.dart   // EventName + EventCategory constants
    └── <feature>_event_manager.dart     // EventManager class
```

If the feature has an existing `analytics/` directory, **extend** what is there — do not create duplicates.

### 2. EventName constants

Defined as a class with `static const String` members. All values are **snake_case**. Common names:

| Constant | Value | When to fire |
|----------|-------|--------------|
| `screen_view` | `"screen_view"` | When screen becomes visible |
| `<action>_btn` | `"<action>_btn"` | Button tap (e.g., `submit_btn`, `continue_btn`) |
| `<element>_click` | `"<element>_click"` | Any tappable element that isn't a button |
| `<list_item>_tap` | `"<list_item>_tap"` | Tapping a list row |
| `filter_applied` | `"filter_applied"` | Applying a filter |
| `tab_switch` | `"tab_switch"` | Switching tabs |
| `scroll_end` | `"scroll_end"` | Reaching end of a scrollable list |

```dart
class AskMunshiEventName {
  static const String screen_view = "screen_view";
  static const String send_btn = "send_btn";
  static const String message_tap = "message_tap";
}
```

### 3. EventCategory constants

Defined as a class with `static const String` members. Names use **snake_case** and reflect the screen or module:

```dart
class AskMunshiEventCategory {
  static const String ask_munshi_screen = 'ask_munshi_screen';
  static const String munshi_history_screen = 'munshi_history_screen';
}
```

One category per distinct screen. If multiple events share a screen, they share the same category constant.

### 4. EventManager class

- Extends `BaseEventManager`
- Constructor passes `targetProduct` string and `EventDispatcherV2()` to `super`
- One typed method per event — method name mirrors what happens in the UI (e.g., `onSendMessage`, `screenView`, `onTapHistoryItem`)
- All `EventDTO` fields populated from parameters where relevant

```dart
import 'package:we_base/we_base_bridge.dart';

class AskMunshiEventManager extends BaseEventManager {
  AskMunshiEventManager()
      : super(
          targetProduct: 'chatbot',
          dispatcher: EventDispatcherV2(),
        );

  void screenView() {
    sendEvent(EventDTO(
      eventName: AskMunshiEventName.screen_view,
      eventAction: CoreEventAction.view,
      eventCategory: AskMunshiEventCategory.ask_munshi_screen,
      screenName: 'ask_munshi_screen',
      targetProduct: targetProduct,
    ));
  }

  void onSendMessage({String? vehicleId, String? messageType}) {
    sendEvent(EventDTO(
      eventName: AskMunshiEventName.send_btn,
      eventAction: CoreEventAction.click,
      eventCategory: AskMunshiEventCategory.ask_munshi_screen,
      screenName: 'ask_munshi_screen',
      targetProduct: targetProduct,
      vehicleId: vehicleId,
      miscellaneous: messageType != null ? 'message_type:$messageType' : null,
    ));
  }
}
```

### 5. locator.dart registration

Add `EventManager` as a **singleton** in the feature's `locator.dart`, inside `initializeDependencies`:

```dart
if (!locator.isRegistered<AskMunshiEventManager>()) {
  locator.registerSingleton<AskMunshiEventManager>(AskMunshiEventManager());
}
```

Registration must come **after** all repository and use-case registrations but **before** the function returns.

### 6. Calling events from UI

| Event type | Where to call |
|------------|---------------|
| `screen_view` | `initState` of the screen's `State` class, OR in a `BlocListener` when the initial loaded state is received — whichever is earlier |
| `click` events | Inside the `onTap` callback of `WEFlatButtonV2`, `WeInkWell`, or list item tap handler |
| `engagement` events | In the relevant interaction handler (scroll end, tab switch, filter apply) |

**initState pattern:**
```dart
@override
void initState() {
  super.initState();
  locator<AskMunshiEventManager>().screenView();
}
```

**Button tap pattern:**
```dart
WEFlatButtonV2.primary(
  title: WeLangKeysStore.instance.send.string(context),
  onTap: () {
    locator<AskMunshiEventManager>().onSendMessage(messageType: 'text');
    context.read<AskMunshiBloc>().add(SendMessageEvent(message));
  },
)
```

**BlocListener pattern (for events triggered by state):**
```dart
BlocListener<AskMunshiBloc, AskMunshiState>(
  listener: (context, state) {
    if (state is AskMunshiLoaded && state.isFirstLoad) {
      locator<AskMunshiEventManager>().screenView();
    }
  },
)
```

### 7. Miscellaneous data format

The `miscellaneous` field in `EventDTO` carries additional key-value data:

- Key-value pair: `"key:value"`
- Multiple pairs: `"key1:value1::key2:value2"` (double-colon separator)
- Values must not contain `:` or `::` — sanitize dynamic values if needed
- Build the string inline or with a helper:

```dart
miscellaneous: 'vehicle_id:$vehicleId::plan_type:$planType::tab:$tabName'
```

Only include `miscellaneous` when there is meaningful extra context. Do not pass an empty string — pass `null` instead.

### 8. CoreEventAction values

| Constant | String value | Use for |
|----------|-------------|---------|
| `CoreEventAction.view` | `"view"` | Screen appearing, content loaded |
| `CoreEventAction.click` | `"click"` | Button tap, list item tap |
| `CoreEventAction.engagement` | `"engagement"` | Scroll, filter, tab switch, search |

### 9. screenName convention

- **snake_case**
- Matches the feature and screen: `ask_munshi_screen`, `munshi_history_screen`
- Must be identical across `EventDTO.screenName` and any analytics dashboard definition
- Do not abbreviate — use the full readable name

### 10. eventName convention

- **snake_case**
- Suffix `_btn` for buttons, `_tap` for list items, `_click` for other tappable elements
- Use `screen_view` (never `pageView`, `screenView`, or `page_view`)
- Prefix with the action verb where helpful: `load_more_btn`, `retry_btn`

---

## Android (WeLytic) Events

For the Android side of hybrid features, analytics follow the WeLytic pattern inside `OperatorApp`:

- Event tracking calls are placed in `Activity`, `Fragment`, or `ViewModel` methods
- Use the WeLytic SDK methods present in the existing Android codebase
- Follow the same `screen_name`, `event_name`, and `miscellaneous` naming conventions as Flutter for consistency
- Check `references/bridge-map.md` (from `/sync`) to understand if the Flutter EventManager is sufficient or if Android-native tracking is also required for this feature

---

## Process

Follow these steps in order. Show output at each step and wait for developer approval before proceeding.

### Step 1 — Parse the events sheet

Read the provided events sheet. Build an internal table:

| screen_name | event_name | event_action | event_category | miscellaneous_keys | notes |
|-------------|------------|--------------|----------------|--------------------|-------|

If any row is missing `event_action`, infer it:
- `screen_view` → `view`
- Any `_btn` or `_tap` or `_click` suffix → `click`
- Filter, scroll, tab → `engagement`

Flag any ambiguous rows and ask the developer before proceeding.

### Step 2 — Map events to screens

Group events by `screen_name`. For each screen, list:
- The screen_view event
- All click events with their trigger location (which button/element)
- All engagement events

Show the mapping table to the developer for approval. Example output:

```
Screen: ask_munshi_screen
  - screen_view (view) → initState
  - send_btn (click) → Send button onTap
  - attachment_btn (click) → Attachment button onTap
  - suggestion_tap (click) → Suggestion chip onTap

Screen: munshi_history_screen
  - screen_view (view) → initState
  - history_item_tap (click) → List item onTap
```

**Wait for developer approval before generating any code.**

### Step 3 — Check for existing events

Scan the feature directory for:
- Any existing `*_event_manager.dart`, `*_event_constants.dart`, or `analytics/` directory
- Any existing `EventName` or `EventCategory` class in the feature
- Any existing `EventManager` registration in `locator.dart`

Read the files with the `Read` tool. Report findings:
- "Found existing `AskMunshiEventManager` — will extend it with new methods"
- "No existing analytics infrastructure — will create from scratch"

### Step 4 — Generate EventName constants

Create or update `<feature>_event_constants.dart`:
- Add only new constants (do not duplicate existing ones)
- Follow snake_case naming

Show the full file content for review.

### Step 5 — Generate EventCategory constants

Add category constants to the same constants file or the existing one. One constant per screen.

### Step 6 — Generate EventManager

Create or update `<feature>_event_manager.dart`:
- One method per event row from the sheet
- Parameters for any `miscellaneous_keys` columns that have values
- Null-safe miscellaneous string construction

Show the full class for review.

### Step 7 — Generate locator registration

Show the exact lines to add to `locator.dart` with correct placement context (after which existing registration).

### Step 8 — Place events in UI code

For each event, show the **exact code change** needed:

```
File: lib/features/ask_munshi/presentation/views/ask_munshi_screen.dart
Location: initState method
Change: Add locator<AskMunshiEventManager>().screenView(); after super.initState();
```

```
File: lib/features/ask_munshi/presentation/widgets/chat_input_widget.dart
Location: Send button onTap callback
Change: Add locator<AskMunshiEventManager>().onSendMessage(messageType: 'text'); before the BLoC event dispatch
```

Use the `Read` tool to inspect each screen file and find the exact insertion point. Show line number context.

### Step 9 — Compliance check

After all code is generated, verify:

- [ ] Every screen has exactly one `screen_view` event
- [ ] Every `WEFlatButtonV2` and `WeInkWell` `onTap` has a corresponding click event
- [ ] All event names are snake_case
- [ ] No event strings are hardcoded inline — all use constants
- [ ] `EventManager` extends `BaseEventManager`
- [ ] `EventDispatcherV2()` is used (not `EventDispatcherV1`)
- [ ] `EventManager` registered as singleton in `locator.dart`
- [ ] `miscellaneous` is `null` (not `""`) when no extra data is needed
- [ ] `screenName` is consistent across all events for the same screen

Report any violations and fix them before delivering final output.

---

## Rules

- Every screen **MUST** have a `screen_view` event — flag and add one if missing from the sheet
- Every tappable `WEFlatButtonV2` or `WeInkWell` **MUST** have a `click` event
- Event names are **snake_case** — reject or auto-correct camelCase or PascalCase inputs
- `screenName` must match the actual screen widget's identifier — not an arbitrary label
- `miscellaneous` must follow `"key1:val1::key2:val2"` — never use comma or pipe separators
- Never hardcode event strings inline in screens or BLoCs — always use constants from the constants class
- `EventManager` must always extend `BaseEventManager`
- Always use `EventDispatcherV2()` — never `EventDispatcherV1()`
- Register `EventManager` as singleton, with an `isRegistered` guard
- Extend existing `EventManager` classes — never create a duplicate for the same feature
- Do not fire analytics events directly from BLoC — only from UI layer (screen, widget)

---

## Output

### Deliverable 1 — Event mapping table (approval gate)

A table showing every event mapped to its screen and trigger location. **Get developer approval before writing any code.**

### Deliverable 2 — Generated files

Provide the complete content of each file to create or update:

1. `analytics/<feature>_event_constants.dart` — `EventName` + `EventCategory` classes
2. `analytics/<feature>_event_manager.dart` — `EventManager` class with typed methods
3. Diff/additions for `locator.dart` — registration snippet with surrounding context

### Deliverable 3 — UI placement instructions

For each event, show:
- File path
- Method or widget where the call is placed
- The exact line(s) to add (with 3 lines of surrounding context for clarity)

### Deliverable 4 — Compliance report

A checklist (all items checked) confirming every rule from the compliance step is satisfied.
