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

## 5. Localization / Strings

### All user-visible strings MUST use `WeLangKeysStore`:

```dart
// Display text
Text(WeLangKeysStore.instance.vehicleNumber.string(context))

// With placeholder substitution
String raw = WeLangKeysStore.instance.comOrderId.string(context); // "Order ID:%s"
String result = formatStringWithNames(raw, ['ORD-12345']);        // "Order ID:ORD-12345"
```

### Adding a new key:
```dart
// File: packages/we_op_common/lib/utils/we_lang_key_store.dart
final KeyValueStore myNewLabel = const KeyValueStore(
  key: 'my_feature_label_key',
  defaultString: "My Default Label",
);
```

### NEVER:
- Hardcode strings like `Text("Vehicle Number")` in UI
- Use string literals in button titles, labels, hints, or error messages

---

## 6. Buttons

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

## 7. Text Fields

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

## 8. Common Widgets — Use Before Creating

Before creating any new UI component, check if it exists in:
- `packages/we_common_widgets/`
- `packages/we_op_common/`

### Key available components:

| Need | Use |
|------|-----|
| Card | `WeCard` / `WeCardV2` / `WeCardWidget` |
| Loading spinner | `WeLoaderWidget` |
| Confirmation popup | `WeConfirmationDialog` |
| Bottom sheet | `WeOpBottomSheetHelperWidgetV2` |
| Success screen | `WESuccessScreen` / `WeSuccessScreenV2` |
| Scaffold | `WEScaffold` |
| Divider | `WEDividerWidget` |
| Checkbox | `WeCheckboxWidget` |
| Radio | `WeRadioTile` / `WeRadioV2` / `WeRadioTileV2` |
| OTP input | `WEOtpBottomSheet` / `WeOtpBoxesWidgetV2` |
| Image upload | `WeImageUploadWidget` |
| Shimmer loading | `ShimmerEffect` / `AssetLoadShimmer` |
| Web view | `WEWebViewScreen` |
| Video player | `ThumbnailVideoPlayer` |
| Star rating | `WeStarRatingWidget` |
| Calendar | `WECalendar` |
| Toggle | `WeHorizontalToggleButton` |
| Bottom nav button | `WEBottomNavButtonWidget` |
| Dashed container | `WeDashedContainerWidget` |
| Banner | `WEBanner` / `BannerAnimationWidget` |
| Rive animation | `WeRiveWidget` |

### If the required component does NOT exist → **ask the user** before building a new one.

---

## 9. Navigation

### Use `WeNavigator` — never raw `Navigator.push`/`Navigator.pop`:

```dart
// Push a named route
WeNavigator.push(context, routeName: '/home', arguments: data)

// Pop current route
WeNavigator.pop(context)
WeNavigator.pop(context, result)   // with result

// Per-app AppNavigator wrapper
AppNavigator.of(context).pushNamed('/route', arguments: args)
AppNavigator.of(context).pop()
AppNavigator.of(context).canPop()
```

### NEVER:
- Use `Navigator.of(context).push(...)`
- Use `Navigator.pop(context)` directly

---

## 10. State Management — BLoC

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

**BLoC**:
```dart
class MyBloc extends Bloc<MyEvent, MyState> {
  final MyRepository repository;

  MyBloc({required this.repository}) : super(MyInitial()) {
    on<LoadDataEvent>(_onLoad);
  }

  Future<void> _onLoad(LoadDataEvent event, Emitter<MyState> emit) async {
    emit(MyLoading());
    try {
      final result = await repository.fetchData(event.id);
      await result.when(
        onSuccess: (res) => emit(MyLoaded(res.response!.data!)),
        onFailed: (_) => emit(MyError()),
      );
    } catch (_) {
      emit(MyError());
    }
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

## 11. API Integration

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
  Future<DataState<BaseAPIResponse<MyModel>>> fetchData(String param);
}
```

**Repository Implementation** (data layer):
```dart
class MyRepositoryImpl extends BaseApiRepository implements MyRepository {
  final MyApiService _api;
  MyRepositoryImpl(this._api);

  @override
  Future<DataState<BaseAPIResponse<MyModel>>> fetchData(String param) {
    return getStateOf(request: () => _api.fetchData(param));
  }
}
```

**UseCase** (domain layer):
```dart
class MyUseCase {
  final MyRepository _repository;
  MyUseCase(this._repository);

  Future<DataState<BaseAPIResponse<MyModel>>> call(String param) {
    return _repository.fetchData(param);
  }
}
```

---

## 12. JSON Models

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

## 13. Dependency Injection — GetIt / locator

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

## 14. Firebase Analytics / WeLytics

### Event structure using `EventDTO`:

```dart
EventDTO(
  eventName: EventName.screen_view,      // snake_case constant
  eventAction: CoreEventAction.view,     // 'view' | 'click' | 'engagement'
  eventCategory: EventCategory.my_screen,
  screenName: 'my_feature_screen',
  targetProduct: 'gps',                  // product identifier
  vehicleId: vehicleId,                  // optional
  miscellaneous: 'key1:val1::key2:val2', // pipe-delimited key-value pairs
)
```

### Define event constants in the feature's analytics file:
```dart
class EventName {
  static const String screen_view = "screen_view";
  static const String my_btn = "my_btn";
  static const String submit_btn = "submit_btn";
}

class EventCategory {
  static const String my_feature_screen = 'my_feature_screen';
}
```

### Build miscellaneous string with helpers:
```dart
// Pattern: "key1:value1::key2:value2"
miscellaneous: "vehicle_id:$vehicleId::plan_name:$planName::tab_type:$tabType"
```

### Send events via EventManager:
```dart
class MyEventManager extends BaseEventManager {
  MyEventManager() : super(
    targetProduct: 'gps',
    dispatcher: EventDispatcherV2(),
  );

  void screenView() {
    sendEvent(EventDTO(
      eventName: EventName.screen_view,
      eventAction: CoreEventAction.view,
      screenName: 'my_screen',
      targetProduct: targetProduct,
    ));
  }

  void onTapContinue(String vehicleId) {
    sendEvent(EventDTO(
      eventName: EventName.submit_btn,
      eventAction: CoreEventAction.click,
      screenName: 'my_screen',
      targetProduct: targetProduct,
      vehicleId: vehicleId,
    ));
  }
}
```

### Register and use via locator:
```dart
locator.registerSingleton<MyEventManager>(MyEventManager());

// Usage:
locator<MyEventManager>().screenView();
locator<MyEventManager>().onTapContinue(vehicleId);
```

---

## 15. Error Handling / User Feedback

### Use `SnackBars` utility for error messages:
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

---

## 16. Native Communication — MethodChannel

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

## 17. Image Loading

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

## 18. Form Validation

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

## 19. New Feature Checklist

When building any new feature, verify every item:

- [ ] Strings → `WeLangKeysStore.instance.myKey.string(context)`
- [ ] Colors → `WEColors.colorXX` or `AssetsColors.colorXX`
- [ ] Text styles → `WETheme.textStyleMedium14`
- [ ] Spacing → `verticalSpace16` / `horizontalPadding16`
- [ ] Buttons → `WEFlatButtonV2.primary(...)` or variant
- [ ] Text fields → `WeTextFieldV2(...)`
- [ ] Navigation → `WeNavigator.push/pop`
- [ ] State management → BLoC (event / sealed state / bloc)
- [ ] API → Retrofit service → Repository impl → UseCase
- [ ] Models → Manual `fromJson`/`toJson`
- [ ] DI → Register in `locator.dart`
- [ ] Analytics → `EventDTO` via `EventManager`
- [ ] Errors → `ShowSnackBarState` → `SnackBars(...).show(context)`
- [ ] Architecture → presentation / domain / data folders
- [ ] Common widgets → check `we_common_widgets` and `we_op_common` first
- [ ] Tap handling → `WeInkWell(onTap: ..., child: ...)` not `GestureDetector`
- [ ] Icons/Images → `AssetsHelper.svg()` / `.png()` / `.pngNetwork()` with path constants

---

## 20. Tap / Click Handling — WeInkWell

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

## 21. Icon & Image Loading — AssetsHelper

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

## 22. What to Ask the User

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
