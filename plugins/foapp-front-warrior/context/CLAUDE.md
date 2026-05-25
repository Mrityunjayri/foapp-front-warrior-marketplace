# OperatorAppFlutter — AI Working Rules

This document defines the mandatory patterns, conventions, and rules that any AI must follow when working on this Flutter project. These rules are derived from the existing codebase and must be followed without deviation.

---

## 0. Golden Rule — Ask Before Inventing

If a required common widget, color, text style, spacing constant, or localization key **does not exist** in the shared packages, **STOP and ask the user** what to do. Do not invent new utilities — use or extend what already exists.

---

## 1. Project Structure

This is a **Melos monorepo**. Key directories:

```
apps/          — Feature apps (buy-sell-truck, operator-app, etc.)
packages/      — Shared packages
  we_style/        — Colors, spacing, assets
  we_common_widgets/  — Shared UI widgets
  we_op_common/    — Operator-specific common widgets
  we_base/         — Core: analytics, navigation, base classes
  we_lib_manager/  — Re-exports WEColors, WETheme, WeNavigator
web/           — Web feature modules (multiplan, etc.)
```

Each feature follows **Clean Architecture** with 3 layers:

```
feature/
├── presentation/
│   ├── views/        # Screens (StatefulWidget / StatelessWidget)
│   ├── widgets/      # Feature-local widgets
│   └── bloc/         # BLoC: *_bloc.dart, *_event.dart, *_state.dart
├── domain/
│   ├── repositories/ # Abstract interfaces only
│   ├── usecases/     # Business logic classes
│   └── models/       # Domain models (request/ and response/)
└── data/
    ├── remote/       # Retrofit API service
    ├── repositories/ # Concrete implementations
    └── models/       # DTOs with fromJson/toJson
```

---

## 2. Colors

### Rule: Always check colors in this order before using any color value:

1. `WEColors.colorXXXXXX` — from `package:we_lib_manager/we_lib_manager.dart` (semantic/primary colors)
2. `AssetsColors.colorXXXXXX` — from `package:we_style/we_style.dart` (feature/hex colors)
3. If the color does **not exist** in either → **ask the user**, then add to `AssetsColors` only

### Adding a new color:
```dart
// File: packages/we_style/lib/assets_colors.dart
static const colorABCDEF = Color(0xffABCDEF);
```

### Common colors reference:
```dart
// WEColors (semantic)
WEColors.color0066FF   // Primary blue
WEColors.colorFFFFFF   // White
WEColors.color000000   // Black
WEColors.color888888   // Secondary gray
WEColors.colorD33636   // Error/danger red
WEColors.colorEBEDF1   // Light gray border

// AssetsColors (raw hex)
AssetsColors.colorE0E0E0  // Light gray
AssetsColors.color666666  // Medium gray
AssetsColors.color248E28  // Success green
AssetsColors.color4E87E5  // Erupi/Fuel blue
AssetsColors.colorFFF5DD  // Light yellow
```

### NEVER:
- Hardcode `Color(0xff...)` inline in widgets
- Create a new color constant in any file other than `AssetsColors`

---

## 3. Text Styles

### Always use `WETheme` for text styles:
```dart
WETheme.textStyleMedium12
WETheme.textStyleMedium14   // Default body text
WETheme.textStyleMedium16   // Section titles
WETheme.textStyleBold16     // Headings
WETheme.textStyleBold14
```

### Customization via copyWith only:
```dart
WETheme.textStyleMedium14.copyWith(
  color: WEColors.color888888,
  fontWeight: FontWeight.w600,
)
```

### NEVER:
- Define a `TextStyle(...)` inline in UI code
- Hardcode `fontSize`, `fontWeight`, `fontFamily` directly
- Add `height:` (line height) in `.copyWith()` — this project does NOT use line height

---

## 4. Spacing

### Always use spacing constants from `package:we_style/we_style.dart`:

```dart
// Vertical spacing (SizedBox height)
verticalSpace2 / verticalSpace4 / verticalSpace8 / verticalSpace12
verticalSpace16 / verticalSpace20 / verticalSpace24 / verticalSpace32
verticalSpace48 / verticalSpace80 / verticalSpace120

// Horizontal spacing (SizedBox width)
horizontalSpace2 / horizontalSpace8 / horizontalSpace16
horizontalSpace20 / horizontalSpace80

// EdgeInsets padding constants
horizontalPadding16   // EdgeInsets.symmetric(horizontal: 16)
verticalPadding12     // EdgeInsets.symmetric(vertical: 12)
padding16             // EdgeInsets.all(16)
bottomPadding12       // EdgeInsets.only(bottom: 12)
topPadding16          // EdgeInsets.only(top: 16)
rightPadding16        // EdgeInsets.only(right: 16)

// Empty widget
emptyWidget           // SizedBox.shrink()
```

### NEVER:
- Write `SizedBox(height: 16)` inline — use `verticalSpace16`
- Write `SizedBox(width: 8)` inline — use `horizontalSpace8`
- Write `EdgeInsets.symmetric(horizontal: 16)` inline — use `horizontalPadding16`

---

## 5. Text Widget — WeText

### Always use `WeText` — never raw `Text`:

`WeText` is the project's standardized text widget from `package:we_widgets` (re-exported via `we_lib_manager`). It provides consistent text rendering across the app.

```dart
// Basic usage with WETheme style
WeText(
  WeLangKeysStore.instance.vehicleNumber.string(context),
  style: WETheme.textStyleMedium14,
)

// With style customization (color only — NEVER add height)
WeText(
  'Display text',
  style: WETheme.textStyleBold16.copyWith(
    color: WEColors.color0066FF,
  ),
  textAlign: TextAlign.center,
)
```

### NEVER:
- Use raw `Text(...)` widget — always use `WeText(...)`
- The only exception is inside `TextSpan` children (which use `text:` parameter, not a widget)

---

## 6. Localization / Strings — WeLangKeysStore + RawStrings

This project uses **two string systems**. Use the correct one based on context:

### A) `WeLangKeysStore` — for localized / dynamic strings (multi-language support):
```dart
// Display text with localization
WeText(
  WeLangKeysStore.instance.vehicleNumber.string(context),
  style: WETheme.textStyleMedium14,
)

// With placeholder substitution
String raw = WeLangKeysStore.instance.comOrderId.string(context); // "Order ID:%s"
String result = formatStringWithNames(raw, ['ORD-12345']);        // "Order ID:ORD-12345"
```

### Adding a new WeLangKeysStore key:
```dart
// File: packages/we_op_common/lib/utils/we_lang_key_store.dart
final KeyValueStore myNewLabel = const KeyValueStore(
  key: 'my_feature_label_key',
  defaultString: "My Default Label",
);
```

### B) `RawStrings` — for static, hardcoded English-only strings:

Each feature has its own `raw_strings.dart` file in `utils/` folder with static const strings.

```dart
// File: apps/my_feature/lib/utils/raw_strings.dart
class RawStrings {
  static const String screenTitle = 'My Feature';
  static const String errorMessage = 'Something went wrong';
  static const String confirmBtn = 'Confirm';
}

// Usage:
WeText(RawStrings.screenTitle, style: WETheme.textStyleBold16)
```

### When to use which:
- **WeLangKeysStore** → Strings that need multi-language support (user-facing labels, buttons, descriptions)
- **RawStrings** → Static strings that will always be English (internal labels, debug text, fixed copy)
- When unsure → **ask the user**

### NEVER:
- Hardcode strings inline like `WeText("Vehicle Number")` — use `WeLangKeysStore` or `RawStrings`
- Use string literals in button titles, labels, hints, or error messages
- Create `RawStrings` class outside the feature's `utils/` folder

---

## 7. Buttons

### Use `WEFlatButtonV2` variants — never raw `ElevatedButton`/`TextButton`:

```dart
// Large primary (blue fill, 48px, full width)
WEFlatButtonV2.primary(
  title: WeLangKeysStore.instance.continueBtn.string(context),
  onTap: () => context.read<MyBloc>().add(MyEvent()),
)

// Medium primary (40px)
WEFlatButtonV2.primaryMedium(title: '...', onTap: () {})

// Small (36px / 32px)
WEFlatButtonV2.primarySmall(title: '...', onTap: () {})
WEFlatButtonV2.primarySmall32(title: '...', onTap: () {})

// Secondary (outlined)
WEFlatButtonV2.secondary(title: '...', onTap: () {})
WEFlatButtonV2.secondaryMedium(title: '...', onTap: () {})

// Tertiary (transparent)
WEFlatButtonV2.tertiary(title: '...', onTap: () {})

// Promotion (gold/special)
WEFlatButtonV2.promotion(title: '...', onTap: () {})

// Gray secondary
WEFlatButtonV2.greySecondary(title: '...', onTap: () {})
```

### If none of these variants fit → **ask the user** before creating a new button style.

---

## 8. Text Fields

### Use `WeTextFieldV2` — never raw `TextField`/`TextFormField`:

```dart
WeTextFieldV2(
  weTextFieldV2Controller: WeTextFieldV2Controller(),
  label: WeLangKeysStore.instance.vehicleNumber.string(context),
  hintText: WeLangKeysStore.instance.enterVehicleNumber.string(context),
  textInputType: TextInputType.text,
  textCapitalization: TextCapitalization.characters,
  textInputFormatter: [UpperCaseTextInputFormatter()],
  maxLength: 10,
  debounceTime: 300,          // ms debounce for onChanged
  onChanged: (val) => bloc.add(VehicleNumberChanged(val)),
  suffixIcon: Icon(Icons.search),
  readOnly: false,
  validator: (val) => val!.isEmpty ? 'Required' : null,
)
```

### Operator text field with voice input:
```dart
WeOpTextFieldWidget(
  // ... same API + voice input support
)
```

---

## 9. Common Widgets — Use Before Creating

Before creating any new UI component, check if it exists in:
- `packages/we_common_widgets/`
- `packages/we_op_common/`

### Key available components:

| Need | Use |
|------|-----|
| Card | `WeCard` / `WeCardV2` / `WeCardWidget` |
| Loading spinner | `WeLoaderWidget` / `WeOpLoader` |
| Confirmation popup | `WeConfirmationDialog` |
| Bottom sheet | `WeOpBottomSheetHelperWidgetV2` + `showCustomBottomSheet()` |
| Success screen | `WESuccessScreen` / `WeSuccessScreenV2` |
| Scaffold | `WEScaffold` |
| Divider | `WEDividerWidget` |
| Checkbox | `WeCheckboxWidget` |
| Radio | `WeRadioTile` / `WeRadioV2` / `WeRadioTileV2` |
| Radio chip | `WeRadioChipWidget` |
| OTP input | `WEOtpBottomSheet` / `WeOtpBoxesWidgetV2` |
| Image upload | `WeImageUploadWidget` |
| Shimmer loading | `ShimmerEffect` / `AssetLoadShimmer` |
| Web view | `WEWebViewScreen` |
| Video player | `ThumbnailVideoPlayer` / `WeVideoPlayBtnWidget` |
| Star rating | `WeStarRatingWidget` |
| Calendar | `WECalendar` |
| Toggle | `WeHorizontalToggleButton` |
| Bottom nav button | `WEBottomNavButtonWidget` |
| Dashed container | `WeDashedContainerWidget` |
| Banner | `WEBanner` / `BannerAnimationWidget` / `WEBannerCardShader` |
| Rive animation | `WeRiveWidget` |
| Toast (success/error) | `WEOpToast().showSuccessToast()` / `.showErrorToast()` |
| Border container | `WEBorderContainerWidget` |
| Contact picker | `WEContactPicker` |
| Delete button | `WeDeleteBtn` |
| Promotion button | `WeFlatPromotionBtn` |
| Glow text | `WeGlowText` |
| Dialog button config | `WeDialogButtonConfig` |
| Keep-alive page | `WeKeepAlivePage` |
| Page view with list | `WePageViewWithListView` |
| Network image | `CachedNetworkImage` (for cached network images) |
| Timer/countdown | `TimerWidget` (OTP, payment, verification flows) |
| Paginated list | `WEPagingController` + `WEPagedListView` + `PaginationFilteredWidget` |

### HARD RULES — Always use project widgets instead of raw Flutter widgets:

| Raw Flutter Widget | NEVER use | ALWAYS use instead |
|---|---|---|
| `Scaffold(...)` | ❌ | `WEScaffold(...)` |
| `AppBar(...)` | ❌ | `WEAppBar(title: ...)` |
| `Text(...)` | ❌ | `WeText(...)` |
| `Card(...)` | ❌ | `WeCardV2(...)` |
| `CircularProgressIndicator()` | ❌ | `WeLoaderWidget()` |
| `AlertDialog(...)` | ❌ | `WeConfirmationDialog.show(...)` |
| `Divider()` | ❌ | `WeDividerWidget()` |
| `Checkbox(...)` | ❌ | `WeCheckboxWidget(...)` |
| `ElevatedButton` / `TextButton` | ❌ | `WEFlatButtonV2.primary(...)` |
| `TextField` / `TextFormField` | ❌ | `WeTextFieldV2(...)` |
| `GestureDetector(onTap:)` | ❌ | `WeInkWell(onTap:)` |
| `InkWell(...)` | ❌ | `WeInkWell(...)` |
| `SvgPicture.asset(...)` | ❌ | `AssetsHelper.svg(...)` |
| `Image.asset(...)` | ❌ | `AssetsHelper.png(...)` |
| `SizedBox.shrink()` | ❌ | `emptyWidget` |
| `SizedBox()` (empty) | ❌ | `emptyWidget` |
| `Navigator.push/pop` | ❌ | `WeNavigator.push/pop` |
| `showModalBottomSheet(...)` | ❌ | `showCustomBottomSheet(...)` |
| `SnackBar(...)` (for success/error) | ❌ | `WEOpToast().showSuccessToast/showErrorToast` |

### NEVER add `height` (line height) in text style copyWith:
The project does NOT use line height in text styles. Never write:
```dart
// ❌ WRONG — do NOT add height
WETheme.textStyleMedium14.copyWith(height: 1.3)

// ✅ CORRECT — no height parameter
WETheme.textStyleMedium14.copyWith(color: WEColors.color888888)
```

### If a widget you need does NOT exist in this table or the catalog below → **STOP and ask the user**. Do not use raw Flutter widgets.

### If the required component does NOT exist → **ask the user** before building a new one.

---

## 10. Scaffold — WEScaffold

### Always use `WEScaffold` — never raw `Scaffold`:

`WEScaffold` wraps Flutter's Scaffold with auto-dismiss keyboard on tap. Available from `package:we_op_common`.

```dart
WEScaffold(
  appBar: WEAppBar(title: RawStrings.screenTitle),
  body: BlocBuilder<MyBloc, MyState>(
    builder: (context, state) => MyContent(),
  ),
  bottomNavigationBar: WEBottomNavButtonWidget(...),
  backgroundColor: WEColors.colorFFFFFF,
)
```

### NEVER:
- Use raw `Scaffold(...)` — always use `WEScaffold(...)`

---

## 11. AppBar — WEAppBar

### Always use `WEAppBar` — never raw `AppBar`:

```dart
WEAppBar(
  title: RawStrings.screenTitle,       // required
  backIcon: true,                       // default true, shows back button
  icon: PNGAssetsPath.myIcon,          // optional icon before title
  screenName: MyScreenName.myScreen,    // optional, for analytics
  eventCategory: MyEventCategory.nav,   // optional, for analytics
)
```

`WEAppBar` automatically calls `WeNavigator.pop(context)` on back press and fires analytics events if `screenName`/`eventCategory` are provided.

### NEVER:
- Use raw `AppBar(...)` — always use `WEAppBar(...)`

---

## 12. Navigation

### Use `WeNavigator` — never raw `Navigator.push`/`Navigator.pop`:

```dart
// Push a named route
WeNavigator.push(context, routeName: '/home', arguments: data)

// Pop current route
WeNavigator.pop(context)
WeNavigator.pop(context, result)   // with result

// Push replacement (replaces current route)
WeNavigator.pushReplacement(context, routeName: '/new-screen')

// Push and remove all previous routes
WeNavigator.pushAndRemoveUntil(context, routeName: '/home')

// Pop until specific route
WeNavigator.popUntilRoute(context, routeName: '/dashboard')

// Pop to first route
WeNavigator.popUntilFirstRoute(context)

// Safe pop (only if can pop)
WeNavigator.maybePop(context)

// Per-app AppNavigator wrapper
AppNavigator.of(context).pushNamed('/route', arguments: args)
AppNavigator.of(context).pop()
AppNavigator.of(context).canPop()
```

### NEVER:
- Use `Navigator.of(context).push(...)`
- Use `Navigator.pop(context)` directly
- Use `Navigator.pushReplacement(...)` directly

---

## 13. State Management — BLoC

### Every feature uses flutter_bloc. Pattern:

**Events** — extend `Equatable`:
```dart
abstract class MyEvent extends Equatable {
  const MyEvent();
  @override List<Object?> get props => [];
}

class LoadDataEvent extends MyEvent {
  final String id;
  const LoadDataEvent(this.id);
  @override List<Object?> get props => [id];
}
```

**States** — use `sealed class`:
```dart
sealed class MyState extends Equatable {
  const MyState();
  @override List<Object?> get props => [];
}
class MyInitial extends MyState {}
class MyLoading extends MyState {}
class MyLoaded extends MyState {
  final MyModel data;
  const MyLoaded(this.data);
  @override List<Object?> get props => [data];
}
class MyError extends MyState {}

// For side effects (snackbar, toast, navigation):
class ShowSnackBarState extends MyState {
  final String errorText;
  ShowSnackBarState(this.errorText);
}
```

**BLoC** (using current `ResponseState` pattern):
```dart
class MyBloc extends Bloc<MyEvent, MyState> {
  final MyRepository _repository;

  MyBloc({required MyRepository repository})
      : _repository = repository,
        super(MyInitial()) {
    on<LoadDataEvent>(_onLoad);
  }

  Future<void> _onLoad(LoadDataEvent event, Emitter<MyState> emit) async {
    emit(MyLoading());
    final response = await _repository.fetchData(event.id);
    response.when(
      onSuccess: (SuccessResponse<BaseAPIResponse<MyModel>> success) {
        final data = success.response?.data;
        if (data != null) {
          emit(MyLoaded(data));
        } else {
          emit(ShowSnackBarState(
            success.response?.message ?? RawStrings.somethingWentWrong,
          ));
        }
      },
      onFailed: (failed) {
        emit(ShowSnackBarState(
          failed.exception.message ?? RawStrings.somethingWentWrong,
        ));
      },
    );
  }
}
```

**UI** — BlocBuilder / BlocListener:
```dart
BlocConsumer<MyBloc, MyState>(
  listener: (context, state) {
    if (state is ShowSnackBarState) {
      SnackBars(message: state.errorText).show(context);
    }
  },
  builder: (context, state) {
    if (state is MyLoading) return WeLoaderWidget();
    if (state is MyLoaded) return MyContentWidget(data: state.data);
    return emptyWidget;
  },
)
```

---

## 14. API Integration

### Layer order: UI → BLoC → UseCase → Repository → API Service

**API Service** (Retrofit + Dio):
```dart
@RestApi()
abstract class MyApiService {
  factory MyApiService(Dio dio, {String? baseUrl}) = _MyApiService;

  @GET('/rest/endpoint')
  Future<HttpResponse<BaseAPIResponse<MyModel>>> fetchData(
    @Query('param') String param,
  );

  @POST('/rest/endpoint')
  Future<HttpResponse<BaseAPIResponse<MyModel>>> postData(
    @Body() MyRequestModel body,
  );
}
```

**Repository Interface** (domain layer):
```dart
abstract class MyRepository {
  Future<ResponseState<BaseAPIResponse<MyModel>>> fetchData(String param);
}
```

**Repository Implementation** (data layer) — use `handleResponse` (current pattern):
```dart
class MyRepositoryImpl extends BaseApiRepository implements MyRepository {
  final MyApiService _api;
  MyRepositoryImpl(this._api);

  @override
  Future<ResponseState<BaseAPIResponse<MyModel>>> fetchData(String param) {
    return handleResponse<BaseAPIResponse<MyModel>>(
      () => _api.fetchData(param),
    );
  }
}
```

> **Note:** Older features use `getStateOf` + `DataState` (legacy). New code MUST use `handleResponse` + `ResponseState`. See Section 30 for full details.

**UseCase** (domain layer):
```dart
class MyUseCase {
  final MyRepository _repository;
  MyUseCase(this._repository);

  Future<ResponseState<BaseAPIResponse<MyModel>>> call(String param) {
    return _repository.fetchData(param);
  }
}
```

---

## 15. JSON Models

### Manual `fromJson`/`toJson` — no code generation (no freezed, no json_serializable):

```dart
class MyModel {
  final String? id;
  final String? name;
  final bool? isActive;

  MyModel({this.id, this.name, this.isActive});

  factory MyModel.fromJson(Map<String, dynamic> json) => MyModel(
    id: json['id'],
    name: json['name'],
    isActive: json['is_active'],   // map snake_case JSON to camelCase field
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'is_active': isActive,
  };
}
```

### Wrap top-level JSON conversion in helpers:
```dart
MyModel myModelFromJson(String str) => MyModel.fromJson(json.decode(str));
String myModelToJson(MyModel data) => json.encode(data.toJson());
```

---

## 16. Dependency Injection — GetIt / locator

### Register in feature's `locator.dart`:
```dart
final locator = GetIt.instance;

Future<void> initializeDependencies({String? baseURL}) async {
  // Dio (check first)
  if (!locator.isRegistered<Dio>()) {
    locator.registerSingleton<Dio>(
      WEDioClient(header: ClientStaticData.headers).getDioObject()
    );
  }

  // API Service
  if (!locator.isRegistered<MyApiService>()) {
    locator.registerSingleton<MyApiService>(
      MyApiService(locator<Dio>(), baseUrl: baseURL ?? ClientStaticData.baseUrl),
    );
  }

  // Repository
  if (!locator.isRegistered<MyRepository>()) {
    locator.registerSingleton<MyRepository>(
      MyRepositoryImpl(locator<MyApiService>()),
    );
  }

  // UseCase
  if (!locator.isRegistered<MyUseCase>()) {
    locator.registerSingleton<MyUseCase>(
      MyUseCase(locator<MyRepository>()),
    );
  }
}
```

### Usage:
```dart
locator<MyUseCase>()
locator<MyRepository>()
```

---

## 17. Firebase Analytics / WeLytics

### EventManager — Static singleton pattern (NOT GetIt locator):

EventManagers use **static singleton pattern** — they are NOT registered in `locator.dart` / GetIt.
For new features, extend `WeLyticsEventManagerV2` (from `package:we_base/we_lytics_manager.dart`).

```dart
import 'package:we_base/we_lytics_manager.dart';

class MyEventManager extends WeLyticsEventManagerV2 {
  static final MyEventManager instance = MyEventManager._();

  MyEventManager._() : super(targetProduct: 'gps');

  void screenView({String? vehicleId, required String screenName}) {
    super.sendEvent(
      eventName: EventName.screenView,
      screenName: screenName,
      eventAction: CoreEventAction.view,
      vehicleID: vehicleId,   // note: capital D
    );
  }

  void onTapContinue({String? vehicleId}) {
    super.sendEvent(
      eventName: MyEventName.submitBtn,
      screenName: MyScreenName.myScreen,
      eventAction: CoreEventAction.click,
      vehicleID: vehicleId,
    );
  }
}
```

### Usage — always via `.instance`:
```dart
// In initState (screen_view):
MyEventManager.instance.screenView(
  screenName: MyScreenName.myScreen,
  vehicleId: widget.vehicleId,
);

// In onTap (click event):
MyEventManager.instance.onTapContinue(vehicleId: vehicleId);
```

### Define event constants in the feature's analytics file:
```dart
class MyEventName {
  static const screenView = 'screen_view';
  static const submitBtn = 'submit_btn';
  static const filterClick = 'filter_click';
}

class MyScreenName {
  static const myScreen = 'my_feature_screen';
}
```

### Build miscellaneous string with `EventMiscellaneous` builder:
```dart
miscellaneous: EventMiscellaneous()
    .addMiscellaneous('vehicle_id', vehicleId)
    .addMiscellaneous('plan_name', planName)
    .build()
// → "vehicle_id:V123::plan_name:Gold"
```

### NEVER:
- Use `EventDTO` object — use `super.sendEvent(named params)` directly
- Extend `BaseEventManager` — extend `WeLyticsEventManagerV2`
- Pass `EventDispatcherV2()` in constructor — pass only `targetProduct`
- Register EventManager in `locator.dart` / GetIt — use static singleton `instance`
- Use `locator<MyEventManager>()` — use `MyEventManager.instance`
- Fire `screen_view` in `build()` or `BlocListener` — always in `initState()`
- Fire events from BLoC — always from UI layer (screen, widget)
- Use `vehicleId` (lowercase d) — parameter is `vehicleID` (capital D)

---

## 18. Error Handling / User Feedback

### A) `SnackBars` — for inline error messages from BLoC:
```dart
// Show
SnackBars(message: state.errorText).show(context);

// Show and clear previous
SnackBars(message: 'Something went wrong').closeAllAndShow(context);
```

### Emit side-effect states from BLoC (never call SnackBars directly from BLoC):
```dart
// In BLoC:
emit(ShowSnackBarState('Error occurred'));

// In UI BlocListener:
if (state is ShowSnackBarState) {
  SnackBars(message: state.errorText).show(context);
}
```

### B) `WEOpToast` — for success/error toast notifications:

Use `WEOpToast` from `package:we_common_widgets` for visual toast feedback (success ticks, error crosses):
```dart
// Success toast (green with tick icon)
WEOpToast().showSuccessToast(context, message: 'Vehicle added successfully');

// Error toast (red with error icon)
WEOpToast().showErrorToast(context, message: 'Failed to save changes');
```

### When to use which:
- **SnackBars** → Simple text error messages from BLoC failure states
- **WEOpToast** → Visual success/error feedback after user actions (form submit, save, delete)

### NEVER:
- Use raw `ScaffoldMessenger.of(context).showSnackBar(SnackBar(...))` — use `SnackBars` or `WEOpToast`
- Use raw `SnackBar(...)` widget directly

---

## 19. Native Communication — MethodChannel

### Channel names used in this project:
```dart
static const MethodChannel _mainChannel =
    MethodChannel('COMMUNICATION_WITH_NATIVE_APP');

static const MethodChannel _activityChannel =
    MethodChannel('COMMUNICATION_WITH_ACTIVITY');
```

### Sending data to native:
```dart
await _mainChannel.invokeMethod('methodName', jsonEncode({'key': 'value'}));
```

### Receiving data from native (Invoker pattern):
```dart
String data = await MyNativeActionInvoker().getResult() ?? "";
MyModel model = MyModel.fromJson(jsonDecode(data));
```

### Fire-and-forget native action:
```dart
await MyNativeActionInvoker({'type': 'action', 'data': payload.toJson()}).execute();
```

---

## 20. Image Loading

### Network images:
```dart
Image.network(imageUrl)

// Wrapped in ClipRRect for rounded corners:
ClipRRect(
  borderRadius: BorderRadius.circular(12),
  child: Image.network(iconUrl),
)
```

### Use existing image widgets when available:
- `WeImageUploadWidget` — for image upload flows
- `StreetViewWidget` / `DroneImageWidget` — for map/drone views
- `AssetLoadShimmer` — for shimmer while video/asset loads

---

## 21. Form Validation

### Pass validator to `WeTextFieldV2`:
```dart
WeTextFieldV2(
  weTextFieldV2Controller: WeTextFieldV2Controller(),
  validator: (value) {
    if (value == null || value.isEmpty) return 'Field is required';
    if (value.length < 3) return 'Minimum 3 characters';
    return null; // valid
  },
)
```

---

## 22. New Feature Checklist

When building any new feature, verify every item:

- [ ] Scaffold → `WEScaffold(...)` not raw `Scaffold(...)`
- [ ] AppBar → `WEAppBar(title: ...)` not raw `AppBar(...)`
- [ ] Text widget → `WeText(...)` not raw `Text(...)`
- [ ] Strings → `WeLangKeysStore.instance.myKey.string(context)` or `RawStrings.myKey`
- [ ] Colors → `WEColors.colorXX` or `AssetsColors.colorXX`
- [ ] Text styles → `WETheme.textStyleMedium14` (NEVER add `height:` in copyWith)
- [ ] Spacing → `verticalSpace16` / `horizontalPadding16`
- [ ] Empty widget → `emptyWidget` not `SizedBox.shrink()` or `SizedBox()`
- [ ] Buttons → `WEFlatButtonV2.primary(...)` or variant
- [ ] Text fields → `WeTextFieldV2(...)`
- [ ] Navigation → `WeNavigator.push/pop` (NEVER raw `Navigator`)
- [ ] Cards → `WeCardV2(...)` not raw `Card(...)`
- [ ] Loading → `WeLoaderWidget()` not `CircularProgressIndicator()`
- [ ] Dialogs → `WeConfirmationDialog.show(...)` not raw `AlertDialog`
- [ ] Dividers → `WeDividerWidget()` not raw `Divider()`
- [ ] Checkboxes → `WeCheckboxWidget(...)` not raw `Checkbox`
- [ ] State management → BLoC (event / sealed state / bloc)
- [ ] API → Retrofit service → Repository impl → UseCase
- [ ] Models → Manual `fromJson`/`toJson`
- [ ] DI → Register in `locator.dart`
- [ ] Analytics → `WeLyticsEventManagerV2` singleton via `.instance`
- [ ] Errors → `ShowSnackBarState` → `SnackBars(...).show(context)`
- [ ] Toasts → `WEOpToast().showSuccessToast/showErrorToast` not raw SnackBar
- [ ] Bottom sheets → `showCustomBottomSheet(...)` not raw `showModalBottomSheet`
- [ ] Architecture → presentation / domain / data folders
- [ ] Common widgets → check `we_common_widgets` and `we_op_common` first
- [ ] Tap handling → `WeInkWell(onTap: ..., child: ...)` not `GestureDetector`
- [ ] Icons/Images → `AssetsHelper.svg()` / `.png()` / `.pngNetwork()` with path constants
- [ ] Text formatters → `UpperCaseTextFormatter` / `AlphaNumericTextFormatter` from `we_base`
- [ ] Routes → `ModuleRouteNames.myScreen` not hardcoded strings
- [ ] Date/time → `DateTimeUtils` not custom formatting logic

---

## 23. Tap / Click Handling — WeInkWell

### Always use `WeInkWell` — never raw `GestureDetector` or `InkWell`:

```dart
WeInkWell(
  onTap: () {
    // handle tap
  },
  child: MyChildWidget(),
)
```

`WeInkWell` is the project's standardized tap wrapper. It is available via `package:we_base/we_base_bridge.dart` (re-exported from `we_widgets` package). It provides consistent ripple, accessibility, and hit-testing behavior across the app.

### NEVER:
- Use `GestureDetector(onTap: ...)` for simple taps — use `WeInkWell`
- Use raw `InkWell(...)` directly — use `WeInkWell`

### When `GestureDetector` is acceptable:
- Complex gestures: `onLongPress`, `onPanUpdate`, `onScaleStart`, drag/swipe handling
- If you only need `onTap` → always use `WeInkWell`

---

## 24. Icon & Image Loading — AssetsHelper

### All icons and images MUST be loaded through `AssetsHelper`:

Icons are hosted on S3 (WheelsEye CDN). During development, request icon URLs from the designer/helper. Never hardcode raw S3 URLs inline — always use path constants.

**SVG icons (local or network):**
```dart
AssetsHelper.svg(
  assetName: SVGAssetsPath.searchIcon,    // from package:we_style
  height: 24,
  width: 24,
  color: WEColors.color0066FF,            // optional tint
)
```

**PNG icons (local bundled assets):**
```dart
AssetsHelper.png(
  assetName: PNGAssetsPath.callIcon,      // from package:we_style
  height: 20,
  width: 20,
)
```

**PNG/JPG from network (S3 CDN URLs):**
```dart
AssetsHelper.pngNetwork(
  assetName: iconUrl,                     // S3 URL string or PNGAssetsPath constant
  height: 48,
  width: 48,
  fit: BoxFit.cover,                      // optional BoxFit
)
```

**Lottie animations:**
```dart
AssetsHelper.lottieAsset(
  assetName: LottieAssetsPath.loaderLottieJson,
)
```

### Path constant classes (in `package:we_style`):

| Class | File | Use for |
|-------|------|---------|
| `SVGAssetsPath` | `packages/we_style/lib/svg_assets_path.dart` | SVG icon paths (local `assets/icons/` and network `wheelseye.com/static-content/...`) |
| `PNGAssetsPath` | `packages/we_style/lib/png_assets_path.dart` | PNG/JPG icon paths (local and network) |
| `LottieAssetsPath` | `packages/we_style/lib/lottie_assets_path.dart` | Lottie JSON animation paths |

### Adding a new icon:

1. Upload the icon to S3 (via designer/helper) — get the URL
2. Add a constant to the appropriate path class:
```dart
// File: packages/we_style/lib/svg_assets_path.dart
static const String myNewIcon = '${_gpsNetworkBasePath}my_new_icon.svg';

// File: packages/we_style/lib/png_assets_path.dart
static const String myNewIcon = '${_networkGpsBasePath}my_new_icon.png';
```
3. Use via `AssetsHelper.svg(assetName: SVGAssetsPath.myNewIcon)`

### NEVER:
- Hardcode S3 URLs inline: `SvgPicture.network('https://wheelseye.com/...')`
- Use `Image.asset(...)` or `SvgPicture.asset(...)` directly — use `AssetsHelper`
- Use `Icon(Icons.xxx)` for custom icons — use `AssetsHelper.svg()` with SVG assets
- Create icon files outside `packages/we_style/lib/` path classes

### When `Image.network()` is acceptable:
- Only for dynamic user-uploaded images (profile photos, documents) where the URL comes from API response — not for app icons/assets

---

## 25. Bottom Sheets — showCustomBottomSheet

### Always use `showCustomBottomSheet()` — never raw `showModalBottomSheet()`:

The project wraps all bottom sheets using `showCustomBottomSheet()` from `package:we_common_widgets`. For content-heavy bottom sheets, use `WeOpBottomSheetHelperWidgetV2`:

```dart
// Simple bottom sheet with custom content
showCustomBottomSheet(
  context: context,
  builder: (context) => MyBottomSheetContent(),
  isDismissible: true,
  enableDrag: true,
);

// Standard bottom sheet with header, description, and buttons
showCustomBottomSheet(
  context: context,
  builder: (context) => WeOpBottomSheetHelperWidgetV2(
    headerText: RawStrings.confirmTitle,
    description: RawStrings.confirmDescription,
    primaryBtnText: WeLangKeysStore.instance.confirm.string(context),
    primaryBtnCallBack: () => handleConfirm(),
    secondaryBtnText: WeLangKeysStore.instance.cancel.string(context),
    secondaryBtnCallBack: () => WeNavigator.pop(context),
  ),
);
```

### NEVER:
- Use raw `showModalBottomSheet(...)` — always use `showCustomBottomSheet(...)`
- Build bottom sheet content without using `WeOpBottomSheetHelperWidgetV2` when the design includes header + description + buttons

---

## 26. Text Input Formatters

### Available formatters from `package:we_base`:

```dart
// Force uppercase text (e.g., vehicle numbers)
WeTextFieldV2(
  textInputFormatter: [UpperCaseTextFormatter()],
)

// Allow only alphanumeric characters
WeTextFieldV2(
  textInputFormatter: [AlphaNumericTextFormatter()],
)
```

### Import from:
```dart
import 'package:we_base/we_base_bridge.dart';
// Provides: UpperCaseTextFormatter, AlphaNumericTextFormatter
```

### NEVER:
- Create custom `TextInputFormatter` for uppercase or alphanumeric filtering — use the existing ones
- If you need a formatter that doesn't exist → **ask the user**

---

## 27. Extensions & Utility Helpers

### Available extensions from `package:we_base`:

```dart
// String → Color conversion (hex string to Color)
'#FF5733'.fromHexColor  // → Color(0xFFFF5733)

// Number formatting with rupee symbol
(12470).formatAmount    // → "₹12,470"
(100.0).formatAmount    // → "₹100"
```

### DateTimeUtils — from `package:we_op_common`:

```dart
final dateUtils = DateTimeUtils();

// Epoch seconds → start/end of day
dateUtils.getDayStartInSecond(epochSeconds);
dateUtils.getDayEndInSecond(epochSeconds);

// Format dates
dateUtils.formatDateToDDMMYYYY(dateTime);  // → "05/11/2025"
dateUtils.formatEpoch1(epochMillis);        // → "23 Nov 25"

// Current/past epoch
dateUtils.getCurrentEpocInSeconds();
dateUtils.getLast30DayEpocInSeconds();
```

### WeOpSharedPreference — from `package:we_base`:

For storing/reading local preferences, use `WeOpSharedPreference` — never raw `SharedPreferences` directly.

### NEVER:
- Write custom date formatting logic — check `DateTimeUtils` first
- Write custom number formatting — check `NumExtension.formatAmount` first
- Use raw `SharedPreferences.getInstance()` — use `WeOpSharedPreference`

---

## 28. Route Registration — ModuleRouteNames

### All feature routes are registered in `ModuleRouteNames` (from `package:we_base`):

```dart
// Route names follow pattern: "{ModuleServiceName}/{screen_name}"
static String get myFeatureScreen =>
    "${ModuleServiceName.myFeature}/my_feature_screen";
```

### When adding a new screen:
1. Add route name to `ModuleRouteNames` in `packages/we_base/lib/src/bridge/module_route_names.dart`
2. Register the route in your feature's route configuration
3. Navigate using: `WeNavigator.push(context, routeName: ModuleRouteNames.myFeatureScreen)`

### NEVER:
- Hardcode route strings like `WeNavigator.push(context, routeName: '/my-screen')` — use `ModuleRouteNames`

---

## 29. Pagination — WEPagingController + WEPagedListView

### For paginated lists, use the project's pagination system:

```dart
// BLoC state tracking
int _pageNumber = 1;
final int _pageSize = 5;
bool isLastPage = false;

// Register events with transformers
on<LoadInitialPage>(
  (event, emit) => _loadInitialPageData(event, emit),
  transformer: restartableDebounce(const Duration(milliseconds: 300)),
);

on<LoadAdditionalPage>(
  (event, emit) async {
    if (isLastPage == true) return;
    await _loadAdditionalPages(emit);
  },
  transformer: droppable(),
);
```

### UI uses `WEPagingController` + `WEPagedListView`:
```dart
final WEPagingController<int, MyItemDto> pagingController =
    WEPagingController(firstPageKey: 0);

WEPagedListView<int, MyItemDto>(
  pagingController: pagingController,
  builderDelegate: WEPagedChildBuilderDelegate<MyItemDto>(
    itemBuilder: (context, item, index) => MyItemWidget(item: item),
    noItemsFoundIndicatorBuilder: (_) => emptyWidget,
  ),
)
```

### BLoC event transformers (from `bloc_concurrency` + `rxdart`):
```dart
// Debounce search/filter events (waits, then restarts on new event)
EventTransformer<E> restartableDebounce<E>(Duration duration) {
  return (events, mapper) => events.debounceTime(duration).switchMap(mapper);
}

// Drop events while previous is still processing (for load-more pagination)
// Import: import 'package:bloc_concurrency/bloc_concurrency.dart';
// Usage: transformer: droppable()
```

### NEVER:
- Write custom scroll-based pagination — use `WEPagingController` + `WEPagedListView`
- Handle load-more without `droppable()` transformer — prevents duplicate API calls

---

## 30. API Response Handling — ResponseState + handleResponse (Current) vs DataState + getStateOf (Legacy)

This project has **two API response patterns**. New code MUST use `handleResponse` + `ResponseState`. The old `getStateOf` + `DataState` pattern exists in older features but is deprecated.

All API base classes come from `package:we_rest` (private pub), re-exported via `package:we_base/we_base_bridge.dart`.

### ✅ CURRENT Pattern — `handleResponse` + `ResponseState` (use this for ALL new code)

**Repository implementation:**
```dart
class MyRepositoryImpl extends BaseApiRepository implements MyRepository {
  final MyApiService _api;
  MyRepositoryImpl(this._api);

  @override
  Future<ResponseState<BaseAPIResponse<MyModel>>> fetchData(String param) {
    return handleResponse<BaseAPIResponse<MyModel>>(
      () => _api.fetchData(param),
    );
  }
}
```

**Repository interface (domain layer):**
```dart
abstract class MyRepository {
  Future<ResponseState<BaseAPIResponse<MyModel>>> fetchData(String param);
}
```

**BLoC — Option A: `.when()` callback (recommended for simple cases):**
```dart
final response = await _repository.fetchData(param);
response.when(
  onSuccess: (SuccessResponse<BaseAPIResponse<MyModel>> success) {
    final data = success.response?.data;
    if (data != null) {
      emit(MyLoaded(data));
    } else {
      emit(ShowSnackBarState(success.response?.message ?? RawStrings.somethingWentWrong));
    }
  },
  onFailed: (failed) {
    emit(ShowSnackBarState(failed.exception.message ?? RawStrings.somethingWentWrong));
  },
);
```

**BLoC — Option B: Type check with `is SuccessResponse` (when you need more control):**
```dart
final response = await _repository.fetchData(param);
if (response is SuccessResponse<BaseAPIResponse<MyModel>>) {
  if (response.response?.data != null) {
    emit(MyLoaded(response.response!.data!));
  } else {
    emit(ShowSnackBarState(response.response?.message ?? RawStrings.somethingWentWrong));
  }
}
```

**ResponseState classes (from `package:we_rest`):**
```dart
ResponseState<T>       // base sealed class
SuccessResponse<T>     // holds response data — access via .response
FailureResponse<T>     // holds exception — access via .exception
```

### ❌ LEGACY Pattern — `getStateOf` + `DataState` (do NOT use for new code)

This pattern exists in older features (buy-sell-truck, lubricants, older gps_route code). It still works but is deprecated.

```dart
// OLD — do NOT use for new features
Future<DataState<BaseAPIResponse<MyModel>>> fetchData(String param) {
  return getStateOf(request: () => _api.fetchData(param));
}

// OLD BLoC handling
final result = await repository.fetchData(param);
await result.when(
  onSuccess: (successResponse) {
    emit(MyLoaded(successResponse.response!.data!));
  },
  onFailed: (failedResponse) {
    emit(ShowSnackBarState(RawStrings.errorOccurred));
  },
);
```

**DataState classes (legacy):**
```dart
DataState<T>     // base class
DataSuccess<T>   // holds response data
DataFailed<T>    // holds DioException
DataNotSet<T>    // initial/unset state
```

### When to use which:
- **New features** → ALWAYS use `handleResponse` + `ResponseState`
- **Bug fixes in existing code** → use whichever pattern the file already uses (don't mix patterns in one file)
- **If adding a new API call to a file that uses old pattern** → ask the developer whether to use old or new pattern for consistency

### NEVER:
- Use `getStateOf` + `DataState` in new features — use `handleResponse` + `ResponseState`
- Use raw `try-catch` on API calls without `ResponseState`/`DataState` — use `handleResponse`/`getStateOf` in BaseApiRepository
- Access `response.response!.data!` without null check inside `onSuccess` — always check `response?.data != null` first
- Mix `DataState` and `ResponseState` patterns in the same repository file
- Use hardcoded error strings in `onFailed` — use `RawStrings.myErrorKey` or `WeLangKeysStore`

---

## 31. Performance Tracking — PagePerformanceMetricTracker

### Add performance tracking mixin to screens:

```dart
class MyScreen extends StatefulWidget {
  // ...
}

class _MyScreenState extends State<MyScreen> with PagePerformanceMetricTracker {
  @override
  void initState() {
    super.initState();
    // After data loads:
    dataLoadedTrackForFinalDraw();
  }

  @override
  String getFlowNameForPageLoadMetricTracking() => 'my_feature_screen';
}
```

Used across 14+ screens for page load performance metrics.

---

## 32. PDF Download & Share — DownloadSharePdfHandler

### Use `DownloadSharePdfHandler` mixin for report/document downloads:

```dart
class _MyScreenState extends State<MyScreen> with DownloadSharePdfHandler {
  void onDownloadTap() {
    downloadAndShareReport(
      context,
      downloadLink: reportUrl,
      fileName: 'My Report',
      shareFile: true,   // opens share sheet after download
      format: 'pdf',     // optional file extension
    );
  }
}
```

From `package:we_op_common/utils/download_share_pdf_handler.dart`. Handles iOS/Android download paths, file sanitization, and share flow.

### NEVER:
- Write custom download/share logic for PDFs — use `DownloadSharePdfHandler` mixin

---

## 33. What to Ask the User

Stop and ask the user when:

1. A required color does not exist in `WEColors` or `AssetsColors`
2. A required text style does not exist in `WETheme`
3. A required spacing value has no matching constant
4. A required localization key does not exist in `WeLangKeysStore`
5. The needed UI component does not exist in `we_common_widgets` or `we_op_common`
6. A button style variant does not match any `WEFlatButtonV2` constructor
7. Native channel method name is unknown
8. The `targetProduct` value for analytics is unclear
9. The feature's route name or navigation structure is not yet defined
10. DI registration order or scope (singleton vs factory) is unclear
11. An icon/image is needed but no matching constant exists in `SVGAssetsPath` / `PNGAssetsPath` — ask designer for S3 URL
12. A complex gesture is needed and you're unsure whether `WeInkWell` or `GestureDetector` is appropriate
13. A text input formatter for a specific pattern does not exist in `we_base`
14. The route name for a new screen is not yet defined in `ModuleRouteNames`
15. A date/time formatting utility is needed but doesn't exist in `DateTimeUtils`
