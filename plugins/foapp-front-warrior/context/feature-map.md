# Feature Map — OperatorAppFlutter (Flutter)

## Apps Overview (15 total)

| # | App | Directory | Screens | BLoCs | APIs | Status |
|---|-----|-----------|---------|-------|------|--------|
| 1 | GPS Route | `apps/gps_route` | 80+ | 120+ | 6 services | Active, largest |
| 2 | FASTag | `apps/fastag` | 36 | 40+ | 9 services | Active |
| 3 | Fuel Guard | `apps/fuel_guard` | 13 | 14+ | 3 services | Active |
| 4 | Buy Sell Truck | `apps/buy-sell-truck` | — | 20+ | 3 services | Active |
| 5 | Khata | `apps/khata` | 9 | 12+ | shared | Active |
| 6 | Ticket Status Revamp | `apps/ticket_status_revamp` | 5 | 8 | 2 services | Active |
| 7 | Settings Page | `apps/settings_page` | 8 | — | 1 service | Active |
| 8 | User Onboarding | `apps/user_onboarding` | 6 | 5 | 1 service | Active |
| 9 | Vehicle Safety Score | `apps/vehicle-safety-score` | 3 | 1 | 1 service | Active |
| 10 | Lubricants | `apps/lubricants` | 5 | — | 1 service | Active |
| 11 | Average Revenue Per Truck | `apps/average_reveue_per_truck` | — | 3 | 1 service | Active |
| 12 | GPS Pending Payments | `apps/gps_pending_payments` | — | — | — | Shell/Entry |
| 13 | Dashboard | `apps/dashboard` | — | — | — | Shell/Entry |
| 14 | Flutter Android Umbrella | `apps/flutter_android_umbrella` | — | — | — | Host app |
| 15 | Flutter iOS Umbrella | `apps/flutter_ios_umbrella` | — | — | — | Host app |

## Web Modules (4 total)

| Module | Directory | Screens | Purpose |
|--------|-----------|---------|---------|
| Chatbot Web | `web/chatbot_web` | 2 | AI chatbot interface (101 dart files) |
| Multiplan | `web/multiplan` | 11 | Plan subscription + payment (142 dart files) |
| Self Activation | `web/self_activation` | 7 | GPS/dashcam device installation (120 dart files) |
| Load Web | `web/load_web` | 1 | Freight rate collection overlay |

## Shared Packages (5 total)

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `we_style` | Design tokens | AssetsColors, SVGAssetsPath, PNGAssetsPath, LottieAssetsPath, spacing constants |
| `we_common_widgets` | Shared UI | WEFlatButtonV2, WeTextFieldV2, WeCardV2, WeLoaderWidget, WeConfirmationDialog, ThumbnailVideoPlayer |
| `we_op_common` | Operator widgets | WEScaffold, WeOpTextFieldWidget, WECalendar, WeRadioTileV2, WeStarRatingWidget, WeLangKeysStore, EventManager |
| `we_base` | Core infra | WeNavigator, BaseBridge, REST client, analytics, SharedPreferences, RemoteConfig |
| `we_lib_manager` | Facade/re-exports | Re-exports WEColors, WETheme, WeNavigator from internal packages |

## Feature-Wise Key Files

### GPS Route (Largest — 80+ screens)
```
apps/gps_route/
├── presentation/views/
│   ├── vehicle_detail/          — Vehicle detail page + near by
│   ├── all_map_view/            — All vehicles on map
│   ├── geo_fence/               — Geofence CRUD (6 screens)
│   ├── dashcam/                 — Dashcam streaming + gallery
│   ├── eta/                     — ETA trips (4 screens)
│   ├── gps_reports/             — Reports generation (6 screens)
│   ├── new_buy_flow/            — GPS purchase (10 screens)
│   ├── vehicle_sold/            — Vehicle sold flow (8 screens)
│   ├── renewals/                — Plan renewals (3 screens)
│   ├── subscription/            — Subscription management (3 screens)
│   ├── unlock_flow_ble/         — BLE unlock (5 screens)
│   ├── driver_flow_ble/         — BLE driver (4 screens)
│   └── ... (20+ more groups)
├── data/remote/
│   ├── gps_api_service.dart     — 100+ endpoints (main)
│   ├── gps_dashcam_api_service.dart
│   ├── gps_reports_api_service.dart
│   ├── add_driver_api_service.dart
│   ├── gk7201_chipset_api_service.dart
│   └── hisilicon_chipset_api_service.dart
└── locator.dart                 — DI registration
```

### FASTag (36 screens)
```
apps/fastag/
├── presentation/views/
│   ├── activation/              — FASTag activation flow (10 screens)
│   ├── homepage/                — FASTag home + buy/wallet (12 screens)
│   ├── kyc/                     — KYC upload/view (5 screens)
│   ├── expense_summary/         — Expense tracking
│   ├── free_fastag/             — Free FASTag switch
│   ├── enter_amount/            — Recharge entry
│   ├── transaction_details/     — Transaction history
│   └── vdp/                     — Vehicle detail (KYC + update)
├── data/remote/                 — 9 API services
└── locator.dart
```

### Fuel Guard (13 screens)
```
apps/fuel_guard/
├── presentation/views/
│   ├── fuel_sensor/             — Real-time fueling + graphs (8 screens)
│   └── lead_form/               — Sensor buy lead (5 screens)
├── data/remote/                 — 3 API services
└── locator.dart
```

### User Onboarding
```
apps/user_onboarding/
├── presentation/views/
│   ├── login_via_phone_number.dart
│   ├── login_via_vehicle_number_page.dart
│   ├── login_via_password_page.dart
│   ├── otp_verification_page.dart
│   ├── create_new_password_page.dart
│   └── user_profile_name_page.dart
├── data/remote/login_api_service.dart
└── locator.dart
```

## Backend Microservices (by API path prefix)

| Service | Path Prefix | Covers |
|---------|-------------|--------|
| Argus | `/rest/argus/` | GPS, vehicles, geofence, trips, dashcam |
| Shield | `/rest/shield/` | Commerce, payments, subscriptions |
| Cyborg | `/rest/cyborg/` | FASTag operations |
| Saathi | `/rest/saathi/` | IoT, hardware, installation |
| Daredevil | `/rest/daredevil/` | Support tickets, help section |
| SuperSell | `/rest/supersell/` | Buy-Sell marketplace |
| TruckArt | `/rest/truckart/` | Vehicle compliance, documents |
| Tesseract | `/rest/tesseract/` | Logistics, loads, freight |

## Summary Stats

- **Total Screens:** ~200+
- **Total BLoCs:** ~250+
- **Total API Services:** 32 Retrofit service files
- **Total Endpoints:** ~350+
- **Total Dart Files:** 1500+ (estimated)
