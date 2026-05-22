# OperatorAppFlutter — Widget & API Endpoint Catalogs

---

## PART 1: WIDGET CATALOG

### A. `packages/we_common_widgets/lib/`

| Widget | File Path | Key Props | Description |
|--------|-----------|-----------|-------------|
| `WEFlatButtonV2` | `button/we_flat_button_v2.dart` | `title`, `onTap`, `prefixIcon`, `suffixIcon`, `backgroundColor` | Primary button with named constructors: `.primary`, `.primaryMedium`, `.primarySmall`, `.primarySmall32`, `.secondary`, `.secondaryMedium`, `.secondarySmall`, `.greySecondary`, `.greySecondaryMedium`, `.tertiary`, `.promotion` |
| `WeDeleteBtn` | `button/we_delete_btn.dart` | — | Delete button widget |
| `WeFlatPromotionBtn` | `button/we_flat_promotion_btn.dart` | — | Promotion-styled flat button |
| `WeGlowText` | `button/we_glow_text.dart` | — | Text with glow animation effect |
| `WeTextFieldV2` | `text_field/we_text_field_v2.dart` | `weTextFieldV2Controller` (required), `label`, `hintText`, `textInputType`, `textInputFormatter`, `maxLength`, `onChanged`, `debounceTime`, `suffixIcon`, `prefixIcon`, `readOnly`, `validator`, `maxLine`, `autoFocus` | Standard text input field with debounce, validation, keyboard visibility handling |
| `MultiViewTextField` | `text_field/multi_view_text_field.dart` | — | Multi-view text field variant |
| `UpperCaseTextInputFormatter` | `text_field/formatters/upper_case_text_input.dart` | — | Formatter that uppercases input text |
| `WeCardV2` | `card/we_card.dart` | `child` (required), `padding`, `margin`, `elevation`, `bgColor`, `borderRadius`, `borderWidth`, `borderColor`, `onTap`, `clipBehavior` | Card container with optional tap, border, elevation |
| `WeBannerCardShader` | `card/we_banner_card_shader.dart` | — | Card with gradient shader effect for banners |
| `WeConfirmationDialog` | `dialog_box/we_confirmation_dialog.dart` | `title` (required), `titleStyle`, `leftButton`, `rightButton`, `padding`, `borderRadius`, `dismissOnButtonTap`. Static `.show()` method | Two-button confirmation dialog with static show helper |
| `WeLoaderWidget` | `general/we_loader_widget.dart` | (none) | Centered 80x80 Lottie loading spinner |
| `WeOpBottomSheetHelperWidgetV2` | `bottomsheet/we_op_bottom_sheet_helper_widget_v2.dart` | `headerText`, `description`, `primaryBtnText`, `primaryBtnCallBack`, `secondaryBtnText`, `secondaryBtnCallBack`, `centerIconS3Path`, `centerIconWidget`, `showCloseButton` | Standardized bottom sheet with icon, header, description, primary/secondary buttons |
| `WeOpBottomSheetHelperWidget` | `bottomsheet/we_op_bottomsheet_helper_widget.dart` | — | Legacy bottom sheet helper (v1) |
| `WEBottomNavButtonWidget` | `we_bottom_nav_button_widget/we_bottom_nav_btn_widget.dart` | `btnText` (required), `btnOnTapCallback` (required), `showBoxShadow`, `showTopBorder`, `backgroundColor` | Bottom navigation bar with a single primary button |
| `ThumbnailVideoPlayer` | `video/thumbnail_video_player.dart` | `getController` (required), `clearController` (required), `thumbnailUrl` (required), `height`, `width`, `radius`, `onPlay` | Video player with thumbnail preview, auto-pause on scroll |
| `AssetLoadShimmer` | `video/asset_load_shimmer.dart` | `height`, `width`, `radius` | Shimmer loading placeholder animation |
| `PausePlayButton` | `video/pause_play_button.dart` | — | Play/pause overlay button for video |
| `SuccessScreenWithInfo` | `success_screen/success_screen_with_info.dart` | `data` (SuccessScreenWithInfoRouteModel required) | Success screen with info card and CTA button |
| `SuccessScreenWithoutInfo` | `success_screen/success_screen_without_info.dart` | — | Simple success screen without info card |
| `DatePickerSpinner` | `calendar/date_picker_spinner.dart` | `onDateSelected` (required), `buttonText` (required), `title` (required), `minDateTime`, `maxDateTime`, `initialDateTime`, `onValuesScroll` | iOS-style spinning date picker with day/month/year wheels |
| `WeDashedContainerWidget` | `image_upload/we_dashed_container_widget.dart` | `uploadText` (required), `uploadIcon` (required), `onFileSelected` (required), `showDelete` (required) | Dashed border container for image upload with camera/gallery picker |
| `ImageSourceDialog` | `image_upload/image_source_dialog.dart` | — | Dialog to choose camera or gallery source |
| `WeBackgroundMulticolorAnimation` | `animated/we_background_multicolor_animation.dart` | `child` (required), `enabler` (required ValueNotifier<bool>), `gradientColors` | Animated multicolor gradient background wrapper |
| `WEOpToast` | `we_op_toast.dart` | Methods: `.showSuccessToast(context, message:)`, `.showErrorToast(context, message:)` | Success/error toast with icon |
| `WePageBaseView` | `page_view/we_page_base_view.dart` | Abstract base; subclass `WeCustomPageView` or `WeCustomPageListView` with `keyValue`, `parentPageController`, `pageIndex`, `isLastPage` | Base class for paginated page views |
| `WePageViewWithListView` | `page_view/we_page_view_with_list_view.dart` | — | Page view combined with list view |
| `BorderTriangleBottomPainter` | `painter/border_triangle_bottom_painter.dart` | — | Custom painter for triangle-bottom border |
| `WeOpLoader` | `src/we_op_loader.dart` | — | Alternative loader widget |
| `MultiplanWebViewScreen` | `src/web_multiplan/presentation/views/multiplan_web_view_screen.dart` | — | WebView screen for multiplan payment flow |

---

### B. `packages/we_op_common/lib/` (Operator-specific widgets)

| Widget | File Path | Key Props | Description |
|--------|-----------|-----------|-------------|
| `WEScaffold` | `we_common_widgets/we_scaffold.dart` | `appBar`, `body`, `backgroundColor`, `bottomNavigationBar`, `resizeToAvoidBottomInset`, `extendBody` | Scaffold wrapper that dismisses keyboard on tap |
| `WeOpTextFieldWidget` | `we_op_text_field/we_op_text_field_widget.dart` | `hintText`, `enableAudioSearch`, `voiceSearchDto`, `autoFocus`, `textEditingController`, `onTextFieldChanged`, `onTapCrossIcon`, `onTapMicIcon`, `fillColor`, `inputFormatters` | Search text field with voice/mic input support |
| `WESuccessScreen` | `we_success_screen/we_success_screen.dart` | `btnText`, `displayBottomNavBtn`, `child`, `title`, `subTitle`, `iconWidget`, `nestedChild`, `showAppBar`, `initStateTapCallback` | Configurable success screen with icon, title, subtitle, bottom button |
| `WeSuccessScreenV2` | `we_success_screen/we_success_screen_v2.dart` | `data` (WeSuccessScreenModel) | V2 success screen with green background, checkmark, auto-nav |
| `WEWebViewScreen` | `we_web_view_widget/we_web_view_screen.dart` | `webViewScreenRouteModel` (required) — contains `url`, `title` | Full-screen WebView with app bar |
| `WeRiveWidget` | `we_rive/we_rive_widget.dart` | `bloc` (required), `eventListener` (required), `weLangMap`, `fit` | Rive animation player with BLoC state management |
| `WeRadioTileV2` | `we_widgets_v2/we_radio_tile_v2.dart` | `title` (required), `url` (required), `onTap` (required), `subTitle`, `groupValue` | Radio tile with network icon, title, subtitle |
| `WeRadioV2` | `we_widgets_v2/we_radio_v2.dart` | `title` (required), `groupValue` (required), `onTap` (required) | Simple radio button widget |
| `WeOtpBoxesWidgetV2` | `we_widgets_v2/we_otp_boxes_widget_v2.dart` | `weOtpBoxesV2Controller` (required), `onSubmitCallback` (required), `otpLength`, `onChanged`, `inputFormatters`, `textInputType` | OTP input boxes with pinput |
| `WEOtpBottomSheet` | `we_otp_bottom_sheet/otp_bottom_sheet.dart` | `bottomSheetTitle` (required), `otpSentToText` (required), `didNotReceiveOtpText` (required), `buttonText` (required), `otpBoxesWidget` (required), `timerWidget` | Full OTP bottom sheet with title, timer, boxes, button |
| `WeCheckboxWidget` | `we_check_box/we_check_box.dart` | `onChange` (required), `displayText` (required), `isSingleSelect`, `isChecked`, `size`, `backgroundColor`, `borderColor`, `spaceBtwElements` | Multi/single select checkbox list |
| `WeRadioTile` | `we_radio/we_radio_tile.dart` | — | Radio tile widget (v1) |
| `WECalendar` | `we_calendar/we_calendar.dart` | (none — config via PageDataExtractorHelper) | Full-screen vertical calendar in bottom sheet |
| `WeCalendarFullTextWidget` | `we_calendar/we_calendar_full_text_widget.dart` | — | Calendar with full text display |
| `WeDividerWidget` | `we_divider/we_divider_widget.dart` | `height`, `thickness`, `color`, `padding` | Themed horizontal divider (default: colorEBEDF1) |
| `WeHorizontalToggleButton` | `we_toggle_button/horizontal_toggle_button.dart` | `onIndexSelected` (required), `itemBuilder` (required), `itemCount` (required), `controller` (required), `operationalIndex`, `spacingBtwButtons`, `selectedBackgroundColor`, `unSelectedBackgroundColor`, `borderRadius` | Horizontal toggle button group with controller |
| `WeStarRatingWidget` | `we_star_rating_widget/we_star_rating_widget.dart` | `starCount` (required), `indexButtonCallback` (required), `initialStarSelected`, `readOnly`, `size` | Interactive star rating widget |
| `WeCard` (deprecated) | `we_card/views/we_card.dart` | `child` (required), `padding`, `margin`, `elevation`, `bgColor`, `borderRadius`, `borderWidth`, `borderColor`, `onTap` | Deprecated — use `WeCardV2` |
| `WeCardWidget` | `we_card/views/we_card_slots_list.dart` | `cardList` (required), `labelText`, `width`, `height`, `padding`, `cardOnTapCallBack` | Card list with selectable slots |
| `WeImageUploadWidget` | `we_image_upload_widget/presentation/presentation/widget/we_image_upload_widget.dart` | `preSignedUrlEndPoint` (required), `onFileSubmitted` (required) | Image upload with pre-signed URL S3 upload flow |
| `WEBottomNavBtnWidget` | `we_bottom_nav_button/we_bottom_nav_btn_widget.dart` | — | Bottom navigation button (op_common variant) |
| `WEBorderContainerWidget` | `we_border_container_widget/border_container_widget.dart` | — | Container with styled border |
| `SoftPromptContainer` | `we_soft_prompt/soft_prompt_container.dart` | `text` (required), `icon`, `s3icon`, `textStyle`, `bgColor`, `padding`, `height`, `width`, `borderRadius` | Info/prompt card with icon and text (purple tint default) |
| `ShimmerEffect` | `we_street_view/utils/shimmer_effect/shimmer_effect.dart` | — | Shimmer loading effect widget |
| `StreetViewWidget` | `we_street_view/presentation/street_view_widget.dart` | — | Google Street View / drone image viewer |
| `DroneImageWidget` | `we_street_view/presentation/drone_image_widget.dart` | — | Drone captured image display |
| `BannerAnimationWidget` | `we_banners/presentation/views/banners/banner_animation_widget.dart` | — | Animated banner carousel |
| `WEBanner` | `we_rating/presentation/widget/we_banner.dart` | — | Rating/promo banner widget |
| `GradientShader` | `gradient_shader/gradient_shader.dart` | — | Gradient shader overlay widget |
| `PgSuccessScreen` | `payment_success/pg_success_screen.dart` | — | Payment gateway success screen |
| `VoiceSearchSheet` | `voice_search/voice_search_sheet.dart` | — | Voice search bottom sheet |
| `VoicePermissionDenied` | `voice_search/voice_permission_denied_sheet.dart` | — | Mic permission denied sheet |
| `GeofenceAreaScreen` | `we_area_search_screen/presentation/views/area_search_screen.dart` | — | Area/geofence search screen |
| `WeDateAvailabilityPage` | `we_date_availability_page/presentation/views/we_date_availability_page.dart` | — | Date & time slot availability picker |
| `VehicleLocationPage` | `we_location_selection_page/presentation/views/vehicle_location_page.dart` | — | Vehicle location state/city selection |
| `ContactDetailsPage` | `we_contact_details_page/presentation/views/contact_details_page.dart` | — | Contact details form page |
| `CreateOrderScreen` | `we_buy_order/create_order/presentation/screens/create_order_screen.dart` | — | Order creation screen with vehicle search |
| `OrderSummaryScreen` | `we_buy_order/summary/presentation/screens/order_summary_screen.dart` | — | Order summary with payment details |
| `WeScheduleInstallationScreen` | `we_schedule_installation/presentation/view/we_schedule_installation_screen.dart` | — | Installation scheduling screen |
| `WeScheduleDemoScreen` | `we_schedule_demo/presentation/view/we_schedule_demo_screen.dart` | — | Schedule demo appointment screen |
| `AutoPayListScreen` | `we_auto_pay_flow/presentation/views/auto_pay_list_screen.dart` | — | Auto-pay mandates list |
| `VehicleSelectionScreen` | `we_vehicle_selection_screen/presentation/view/we_vehicle_selection_screen.dart` | — | Vehicle selection screen |
| `VehicleSoldOtpBottomSheet` | `vehicle_sold_otp_bottom_sheet/presentation/views/vehicle_sold_otp_bottom_sheet.dart` | — | OTP verification for vehicle sold flow |
| `CancelOrderBottomSheet` | `we_cancel_order_bottom_sheet/presentation/views/vehicle_cancel_order_bottom_sheet.dart` | — | Order cancellation confirmation |
| `VehicleRenewalBottomSheet` | `we_vehicle_renewal_bottom_sheet/presentation/views/vehicle_renewal_bottom_sheet.dart` | — | Vehicle subscription renewal sheet |
| `SDUIPromotionPage` | `we_sdui/promotion/sdui_promotion_page.dart` | — | Server-Driven UI promotion page renderer |
| `WeRatingWidget` | `we_rating/presentation/widget/we_rating_widget.dart` | — | Full rating widget with questions panel |
| `WeNumberRatingWidget` | `we_rating/presentation/widget/we_number_rating_widget.dart` | — | Numeric (1-10) rating widget |
| `SaarthiPromoBottomSheet` | `we_saarthi_promo_bottom_sheet/presentation/views/saarthi_promo_bottom_sheet.dart` | — | Saarthi AI promo bottom sheet |
| `TimerWidget` | `we_common_widgets/timer_widget.dart` | — | Countdown timer widget |
| `TrapeziumBannerWidget` | `we_common_widgets/trapezium_banner_widget.dart` | — | Trapezoid-shaped banner/tag widget |
| `KAMButton` | `we_kam/kam_button.dart` | — | Key Account Manager contact button |
| `OneTapPaymentWidget` | `we_one_tap_payment/presentation/widgets/preferred_payment_widget.dart` | — | One-tap payment method selector |
| `WeVideoPlayBtnWidget` | `we_video_play_btn/we_video_play_btn_widget.dart` | — | Video play button overlay |
| `OtpGenerationScreen` | `we_otp/presentation/views/otp_generation_screen.dart` | — | OTP generation/verification full screen |
| `WeCsatForTerminatingTicketScreen` | `we_csat_bottom_sheet/presentation/view/we_csat_for_terminating_ticket_screen.dart` | — | CSAT rating for ticket closure |

---

## PART 2: API ENDPOINTS CATALOG

### App: `average_revenue_per_truck`
| Method | Path | Service |
|--------|------|---------|
| POST | `rest/shield/pages/update-story` | ArptApiService |
| GET | `/shield/pages/awareness-redirection` | ArptApiService |

### App: `buy-sell-truck` (Buyer Flow)
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/supersell/buy-sell/document/{vehicle_number}` | BuyApiService |
| POST | `/rest/supersell/buy-sell/user/help` | BuyApiService |
| POST | `/rest/supersell/buy-sell/fetch-filters` | BuyApiService |
| POST | `/rest/supersell/buy-sell/order/wishlist/create` | BuyApiService |
| GET | `/rest/supersell/listing/wishlist/count` | BuyApiService |
| POST | `/rest/supersell/buy-sell/vehicle/v1/increase-view` | BuyApiService |
| POST | `/rest/supersell/buy-sell/buyer-preferences/v2` | BuyApiService |
| GET | `/rest/supersell/buy-sell/buyer-preferences/v2` | BuyApiService |
| GET | `/rest/supersell/search/listing/type-ahead-suggestions` | BuyApiService |
| GET | `/rest/supersell/search/listing/trending` | BuyApiService |
| PUT | `/rest/supersell/search/listing/history` | BuyApiService |
| GET | `/rest/supersell/search/listing/ticker` | BuyApiService |
| GET | `/rest/supersell/place/location/buyer` | BuyApiService |
| GET | `/rest/supersell/place/id/buyer` | BuyApiService |
| POST | `/rest/supersell/place/location/suggestions` | BuyApiService |
| GET | `/rest/supersell/config/listing-page` | BuyApiService |
| POST | `/rest/supersell/listing/buyer` | BuyApiService |
| GET | `/rest/supersell/listing/buyer/{id}` | BuyApiService |
| GET | `/rest/supersell/listing/recommendation/{id}` | BuyApiService |

### App: `buy-sell-truck` (Seller Flow)
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/supersell/buy-sell/brands` | SellApiService |
| GET | `/rest/supersell/buy-sell/models/{id}` | SellApiService |
| GET | `/rest/supersell/buy-sell/reviews` | SellApiService |
| GET | `/rest/supersell/buy-sell/document/{vno}` | SellApiService |
| GET | `/rest/supersell/listing/wishlist` | SellApiService |
| GET | `/rest/supersell/buy-sell/navigation/data` | SellApiService |
| GET | `/rest/supersell/buy-sell/operator/vehicles` | SellApiService |
| GET | `/rest/supersell/buy-sell/seller-listing` | SellApiService |
| DELETE | `/rest/supersell/buy-sell/order/{id}` | SellApiService |
| GET | `/rest/supersell/buy-sell/vehicle/specification` | SellApiService |
| GET | `/rest/supersell/buy-sell/vehicle-user-engagement/{order_id}` | SellApiService |
| GET | `/rest/supersell/image/generate-put-presigned-url` | SellApiService |
| GET | `/rest/supersell/buy-sell/media-config` | SellApiService |
| GET | `/rest/supersell/buy-sell/vehicle-info/{vehicle_no}` | SellApiService |
| GET | `/rest/supersell/buy-sell/order/{id}` | SellApiService |
| POST | `/rest/supersell/buy-sell/order` | SellApiService |
| PUT | `/rest/supersell/buy-sell/order/{id}` | SellApiService |
| GET | `/rest/supersell/place/autocomplete-address` | SellApiService |
| GET | `/rest/supersell/place/current-location` | SellApiService |

### App: `buy-sell-truck` (Truck Loan)
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/supersell/v1/finance/used-truck` | TruckLoanApiService |
| GET | `/rest/supersell/v1/finance/user-details` | TruckLoanApiService |
| GET | `/rest/supersell/v1/finance/loan-applications` | TruckLoanApiService |
| DELETE | `/rest/supersell/v1/finance/loan-applications` | TruckLoanApiService |
| POST | `/rest/supersell/v1/finance/loan-application` | TruckLoanApiService |

### App: `fastag` (Activation)
| Method | Path | Service |
|--------|------|---------|
| POST | `/rest/cyborg/api/v1/self-activation/inventory/list` | ActivationApiService |
| GET | `/rest/cyborg/api/v1/self-activation/validate-vehicle` | ActivationApiService |
| GET | `/rest/cyborg/api/v1/self-activation/search-vehicle` | ActivationApiService |
| GET | `/rest/cyborg/api/v1/self-activation/inventory/select` | ActivationApiService |
| GET | `/rest/cyborg/docs/v3/kyc-fields` | ActivationApiService |
| POST | `/rest/cyborg/api/v1/self-activation/bill-details` | ActivationApiService |
| POST | `/rest/cyborg/api/v1/self-activation/map-vehicle/{orderId}` | ActivationApiService |
| POST | `/rest/cyborg/docs/v3/kyc-fields` | ActivationApiService |
| POST | `/rest/cyborg/api/v1/self-activation/create-order` | ActivationApiService |
| POST | `/rest/cyborg/api/v1/self-activation/otp/generate` | ActivationApiService |
| POST | `/rest/cyborg/api/v1/self-activation/otp/verify` | ActivationApiService |

### App: `fastag` (Upload KYC Documents)
| Method | Path | Service |
|--------|------|---------|
| GET | `rest/cyborg/docs/v3/category-wise/status` | UploadKycDocumentsApiService |
| POST | `rest/cyborg/docs/v3/doc-urls/update` | UploadKycDocumentsApiService |
| PUT | `{url}` (pre-signed S3) | UploadKycDocumentsApiService |

### App: `fastag` (Enter Amount / Recharge)
| Method | Path | Service |
|--------|------|---------|
| POST | `rest/cyborg/subscription/settlement/v2/api/bill-details` | EnterAmountScreenApiService |
| GET | `rest/cyborg/subscription/suggested-amount` | EnterAmountScreenApiService |
| POST | `rest/shield/wallet/v2/payment/fetch-status` | EnterAmountScreenApiService |

### App: `fastag` (Expense Summary)
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/cyborg/expense/summary` | FTagSummaryApiService |
| GET | `/rest/cyborg/vehicles` | FTagSummaryApiService |

### App: `fastag` (Transaction Details)
| Method | Path | Service |
|--------|------|---------|
| GET | `rest/cyborg/transactions/v3/{transactionCode}` | FastagTransactionDetailsApiService |

### App: `fastag` (Free FASTag)
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/cyborg/lead/get-day-slots` | FreeFastagApiService |
| GET | `/rest/cyborg/lead/get-time-slots` | FreeFastagApiService |
| GET | `/rest/cyborg/lead/eligible-vehicles` | FreeFastagApiService |
| POST | `/rest/cyborg/lead/fulFillment/details/{orderId}` | FreeFastagApiService |
| POST | `/rest/cyborg/lead/otp/generate` | FreeFastagApiService |
| POST | `/rest/cyborg/lead/otp/verify` | FreeFastagApiService |
| POST | `/rest/cyborg/activation/v1/tag` | FreeFastagApiService |
| POST | `/rest/cyborg/activation/v1/otp` | FreeFastagApiService |

### App: `fastag` (Homepage)
| Method | Path | Service |
|--------|------|---------|
| GET | `rest/cyborg/external-vehicle/fetch/bill` | HomePageApiService |
| POST | `rest/cyborg/app/fastag/home/component` | HomePageApiService |
| GET | `rest/cyborg/app/fastag/service/info` | HomePageApiService |
| GET | `rest/cyborg/account/user-account` | HomePageApiService |
| GET | `wallet` | HomePageApiService |
| GET | `rest/cyborg/buy-flow/fastag/landing-page` | HomePageApiService |
| POST | `rest/cyborg/buy-flow/fastag/add-vehicle` | HomePageApiService |
| POST | `rest/cyborg/buy-flow/fastag/order/indent` | HomePageApiService |
| POST | `rest/cyborg/buy-flow/fastag/add-address` | HomePageApiService |
| GET | `rest/cyborg/buy-flow/fastag/address` | HomePageApiService |
| GET | `rest/cyborg/buy-flow/fastag/vehicle-list` | HomePageApiService |
| PUT | `rest/cyborg/buy-flow/fastag/add-referral` | HomePageApiService |
| GET | `/rest/argus/sauron/autocomplete` | HomePageApiService |
| GET | `/rest/argus/sauron/place/{id}/detail` | HomePageApiService |

### App: `fastag` (KYC)
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/cyborg/docs/v2/category-wise/status` | KycApiService |
| GET | `/rest/cyborg/docs/category-wise/status` | KycApiService |
| POST | `/rest/cyborg/docs/v2/preSignedUrl/upload` | KycApiService |
| PUT | `/rest/cyborg/docs/v2/details/update` | KycApiService |

### App: `fastag` (External Vehicle / Non-FASTag)
| Method | Path | Service |
|--------|------|---------|
| GET | `rest/cyborg/external-vehicle/fetch/bill` | FTagExternalVehicleApiService |
| GET | `rest/cyborg/external-vehicle/bbps/bank-list` | FTagExternalVehicleApiService |
| GET | `rest/cyborg/external-vehicle/fetch/bill/manual` | FTagExternalVehicleApiService |
| GET | `rest/cyborg/recharge/suggested-amount` | FTagExternalVehicleApiService |
| DELETE | `rest/cyborg/external-vehicle/{id}` | FTagExternalVehicleApiService |
| POST | `rest/shield/wallet/v2/payment/fetch-status` | FTagExternalVehicleApiService |

### App: `fastag` (Smart Pass / Subscription)
| Method | Path | Service |
|--------|------|---------|
| GET | `rest/cyborg/subscription/smartpass/fee` | FtagSmartPassApiService |
| POST | `rest/cyborg/subscription/smartpass/lead-generate` | FtagSmartPassApiService |
| GET | `rest/cyborg/subscription/bill-details` | FtagSmartPassApiService |

### App: `fastag` (Upload Documents B2B)
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/shield/b2b/onboarding-docs/required` | UploadDocumentsApiService |
| PUT | `/rest/shield/b2b/onboarding-docs/update` | UploadDocumentsApiService |

### App: `fastag` (VDP — Vehicle Detail Page)
| Method | Path | Service |
|--------|------|---------|
| GET | `/onboarding/b2b/kyv/getVehicleDocDetails` | VdpApiService |
| POST | `/onboarding/b2b/kyv/upload` | VdpApiService |
| PUT | `{url}` (pre-signed) | VdpApiService |
| GET | `/rest/cyborg/recharge/auto/suggestion-amount` | VdpApiService |
| GET | `/rest/cyborg/fastags/balance-card/bank-details` | VdpApiService |
| GET | `/rest/cyborg/fastags/balance-card/settings` | VdpApiService |
| GET | `/rest/cyborg/fastags/transactions/v2/overview/{vId}` | VdpApiService |
| PUT | `/rest/cyborg/account-manage/account` | VdpApiService |
| POST | `/rest/cyborg/api/vehicle/v5/transactions/download` | VdpApiService |
| POST | `/rest/cyborg/api/vehicle/v5/transactions` | VdpApiService |
| GET | `/rest/cyborg/kyc/availability-dates` | VdpApiService |
| GET | `/rest/cyborg/kyc/time-slots` | VdpApiService |
| GET | `/rest/cyborg/vehicle-update/doc-details/` | VdpApiService |
| POST | `/rest/cyborg/vehicle-update/upload/` | VdpApiService |
| GET | `rest/cyborg/external-vehicle/fetch/bill` | VdpApiService |
| GET | `/rest/cyborg/fastags/validate` | VdpApiService |
| POST | `/rest/cyborg/kyc/create-ticket` | VdpApiService |
| PUT | `/rest/cyborg/external-vehicle/{vId}` | VdpApiService |

### App: `fuel_guard`
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/saathi/fuel-sensor/events/` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/v2/vehicle` | FuelGuardApiService |
| GET | `/rest/shield/pages/{pageID}` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/time-series` | FuelGuardApiService |
| PUT | `/rest/saathi/fuel-sensor/state` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/state` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/real-time/fueling` | FuelGuardApiService |
| GET | `shield/api/v1/buy-flow/installation/instructions` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/report/itinerary` | FuelGuardApiService |
| POST | `shield/api/v1/buy-flow/installation` | FuelGuardApiService |
| GET | `rest/saathi/fuel-sensor/analytics-graph/v2` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/fetchStaticContentByEvent` | FuelGuardApiService |
| GET | `/rest/shield/api/v1/operator-driver/onboarding-banner` | FuelGuardApiService |
| GET | `/rest/shield/api/v1/operator-driver/legacy` | FuelGuardApiService |
| GET | `/rest/shield/api/v1/operator-driver/check-eligibility` | FuelGuardApiService |
| POST | `/rest/shield/v1/otp/send` | FuelGuardApiService |
| POST | `/rest/shield/v1/otp/verify` | FuelGuardApiService |
| POST | `/rest/shield/api/v1/operator-driver/attach` | FuelGuardApiService |
| POST | `/rest/shield/api/v1/operator-driver/detach` | FuelGuardApiService |
| GET | `/rest/shield/api/v1/operator-driver/total-balances-and-cashback` | FuelGuardApiService |
| GET | `/rest/shield/api/v1/operator-driver/drivers` | FuelGuardApiService |
| GET | `/rest/shield/api/v1/operator-driver/detail` | FuelGuardApiService |
| GET | `/rest/shield/api/v1/operator-vehicle/` | FuelGuardApiService |
| POST | `/rest/shield/api/v1/driver-vehicle/attach` | FuelGuardApiService |
| POST | `/rest/shield/api/v1/driver-vehicle/detach` | FuelGuardApiService |
| GET | `/rest/shield/erupi/voucher-recharge-cap` | FuelGuardApiService |
| POST | `/rest/shield/erupi/voucher/transfer/wallet` | FuelGuardApiService |
| POST | `/rest/shield/erupi/voucher/transfer/driver` | FuelGuardApiService |
| GET | `/rest/shield/erupi/driver-ledger` | FuelGuardApiService |
| GET | `/rest/shield/erupi/suggested-amounts/{type}` | FuelGuardApiService |
| GET | `/rest/shield/erupi/flag/feature/{type}` | FuelGuardApiService |
| GET | `/rest/shield/erupi/vehicle-ledger` | FuelGuardApiService |
| GET | `/rest/shield/api/v1/operator-driver/is-authorized` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/distance-travelled` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/slot-details` | FuelGuardApiService |
| PUT | `/rest/saathi/fuel-sensor/event/status` | FuelGuardApiService |
| POST | `/rest/daredevil/escalations/fuel-sensor` | FuelGuardApiService |
| GET | `/rest/saathi/fuel-sensor/event-ticket/details` | FuelGuardApiService |
| POST | `rest/shield/dashboard/esc-calibration/respond` | FuelGuardApiService |

### App: `fuel_guard` (Buy Flow)
| Method | Path | Service |
|--------|------|---------|
| GET | `/shield/api/v1/buy-flow/packages` | BuyFuelApiService |

### App: `fuel_guard` (Lead Form)
| Method | Path | Service |
|--------|------|---------|
| GET | `rest/argus/forms?campaignName=DIESEL` | LeadFormApiService |
| POST | `rest/argus/diesel/appointment` | LeadFormApiService |
| POST | `rest/argus/diesel/appointment/register` | LeadFormApiService |
| GET | `/rest/argus/sauron/autocomplete` | LeadFormApiService |
| GET | `/rest/argus/sauron/place/{key}/detail` | LeadFormApiService |

### App: `gps_route` (Add Driver)
| Method | Path | Service |
|--------|------|---------|
| POST | `/driver/createOrUpdate` | AddDriverApiService |
| GET | `/driver` | AddDriverApiService |
| POST | `/vehicle/createOrUpdate` | AddDriverApiService |

### App: `gps_route` (Dashcam)
| Method | Path | Service |
|--------|------|---------|
| POST | `/rest/saathi/dashcam/signalling` | GpsDashCamApiService |
| GET | `/rest/saathi/dashcam/info` | GpsDashCamApiService |
| GET | `/rest/shield/insta-search/suggested-prompts` | GpsDashCamApiService |
| GET | `/rest/shield/insta-search/search` | GpsDashCamApiService |
| GET | `/rest/saathi/dashcam/preview` | GpsDashCamApiService |
| GET | `/shield/offline-dashcam/vehicles` | GpsDashCamApiService |
| GET | `/shield/offline-dashcam/search` | GpsDashCamApiService |
| PUT | `/shield/offline-dashcam/deboard` | GpsDashCamApiService |
| POST | `/shield/offline-dashcam/onboard` | GpsDashCamApiService |
| GET | `/argus/app/user-type` | GpsDashCamApiService |
| GET | `/rest/saathi/dashcam/speed-test/presigned-url` | GpsDashCamApiService |
| POST | `/rest/saathi/dashcam/speed-test/bandwidth` | GpsDashCamApiService |

### App: `gps_route` (Reports)
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/argus/reports` | GpsReportsApiService |
| GET | `/rest/argus/reports/filters` | GpsReportsApiService |
| POST | `/rest/argus/reports/generate/v2` | GpsReportsApiService |
| POST | `/rest/argus/reports/send-email` | GpsReportsApiService |
| POST | `/rest/argus/reports/download` | GpsReportsApiService |
| POST | `/rest/argus/reports/suggestion` | GpsReportsApiService |

### App: `gps_route` (Main GPS — large service, key endpoints)
| Method | Path | Service |
|--------|------|---------|
| GET | `/vehicle/getItinerary` | GpsApiService |
| GET | `/v2/vehicle/getPathDetail` | GpsApiService |
| GET | `/rest/argus/vehicle/getCurrentLocation` | GpsApiService |
| GET | `/rest/argus/geofences/list` | GpsApiService |
| GET | `/rest/argus/sauron/autocomplete` | GpsApiService |
| GET | `/rest/argus/sauron/reverseGeoCode` | GpsApiService |
| GET | `/rest/argus/sauron/place/{key}/detail` | GpsApiService |
| GET | `/setting` | GpsApiService |
| GET | `/rest/argus/geofences/recommendation` | GpsApiService |
| GET | `/argus/vehicle/{vehicleId}/bottom-menu` | GpsApiService |
| GET | `/app/vehicle/suggestedVehicle` | GpsApiService |
| GET | `/nearByPetrolPumps` | GpsApiService |
| GET | `/rest/argus/vehicle/{relayStatus}` | GpsApiService |
| GET | `/rest/argus/vehicle/stopVehicle/v2` | GpsApiService |
| GET | `/rest/argus/app/vehicles/v2` | GpsApiService |
| GET | `/rest/argus/app/vehicles/static` | GpsApiService |
| POST | `/rest/argus/app/vehicles-dynamic` | GpsApiService |
| GET | `/rest/daredevil/escalations/get-day-slots` | GpsApiService |
| GET | `/rest/daredevil/escalations/get-time-slots` | GpsApiService |
| GET | `/rest/daredevil/escalations/states/v2` | GpsApiService |
| GET | `/rest/daredevil/escalations/cities` | GpsApiService |
| GET | `/escalations/payment-flow-details/v2` | GpsApiService |
| GET | `/rest/argus/geofences/geofence-location/v2` | GpsApiService |
| GET | `/rest/argus/vehicle/transfer/getTransferForm` | GpsApiService |
| POST | `/escalations/v2/order` | GpsApiService |
| POST | `/setting` | GpsApiService |
| POST | `/rest/argus/geofences` | GpsApiService |
| POST | `/rest/argus/vehicle/{vId}/obd/change/{type}` | GpsApiService |
| POST | `/rest/argus/vehicle/update-prompt` | GpsApiService |
| PUT | `/rest/argus/geofences` | GpsApiService |
| DELETE | `/rest/argus/geofences` | GpsApiService |
| POST | `/app/device/command` | GpsApiService |
| POST | `/app/driver/generate-link` | GpsApiService |
| POST | `/app/driver/share-link` | GpsApiService |
| POST | `/app/link/share/screen` | GpsApiService |
| POST | `/app/driver/verify-token` | GpsApiService |
| POST | `rest/shield/pages/update-story` | GpsApiService |
| POST | `/vehicle/deactivateLock` | GpsApiService |
| POST | `/vehicle/activateLock/v2` | GpsApiService |
| GET | `/argus/geofences/saved-locations` | GpsApiService |
| GET | `/argus/eta/trip/recent-search` | GpsApiService |
| GET | `/argus/eta/trip/sta` | GpsApiService |
| POST | `/argus/eta/trip` | GpsApiService |
| POST | `/argus/eta/trip/sub-trip/{tripId}` | GpsApiService |
| PATCH | `/argus/eta/trip/sub-trip/{tripId}/status` | GpsApiService |
| GET | `/argus/eta/trip/fetch-eta/{tripId}` | GpsApiService |
| GET | `/argus/eta/trip/seen-eta/{vId}` | GpsApiService |
| POST | `/argus/eta/trip/routes` | GpsApiService |
| GET | `/argus/app/getVehicleIcon/{vId}` | GpsApiService |
| GET | `/argus/nearby/getNearByEntities` | GpsApiService |
| GET | `/argus/nearby/getNearByData` | GpsApiService |
| PUT | `/escalations/ticket` | GpsApiService |
| GET | `/banner` | GpsApiService |
| GET | `/rest/argus/vehicle/transfer/requests` | GpsApiService |
| GET | `/rest/argus/app/services/gps/info` | GpsApiService |
| POST | `/rest/shield/api/recent-search` | GpsApiService |
| GET | `/rest/shield/api/recent-search/filter` | GpsApiService |
| PUT | `/app/maintenance/{vId}` | GpsApiService |
| GET | `/rest/shield/package/{vehicleId}/upgrade-plan` | GpsApiService |
| POST | `/rest/shield/orders` | GpsApiService |
| POST | `/rest/argus/vehicle/{vehicleId}/obd/change/security-mode` | GpsApiService |
| GET | `/escalations/device/priceRange` | GpsApiService |
| GET | `/app/vehicles/gps` | GpsApiService |
| GET | `/rest/shield/pages/{pageName}` | GpsApiService |
| GET | `/rest/argus/vehicle/transfer/list` | GpsApiService |
| POST | `/rest/argus/vehicle/transfer/incentivize` | GpsApiService |
| POST | `/rest/argus/vehicle/transfer/reject-prompt` | GpsApiService |
| POST | `/rest/cyborg/external-vehicle/link-fastag` | GpsApiService |
| GET | `/app/alert/detail/v2` | GpsApiService |
| GET | `/argus/vehicle-tag/getAll` | GpsApiService |
| GET | `/rest/argus/vehicle/information` | GpsApiService |
| GET | `/rest/argus/vehicle/challan-summary` | GpsApiService |
| GET | `/rest/truckart/document/filter` | GpsApiService |
| GET | `/rest/truckart/challan` | GpsApiService |
| POST | `/rest/argus/v1/network/strength` | GpsApiService |
| POST | `/rest/argus/v1/fuelSensor/vehicles/info` | GpsApiService |
| POST | `/rest/saathi/dashcam/batch/info` | GpsApiService |
| GET | `/rest/argus/banner/bottom-sheet` | GpsApiService |
| GET | `/v2/transactions` | GpsApiService |
| GET | `/v2/transactions/{code}` | GpsApiService |
| GET | `/rest/argus/app/getVehicleTypes` | GpsApiService |
| POST | `/rest/argus/app/updateVehicleIcon/{vId}` | GpsApiService |
| GET | `/shield/orders/v3` | GpsApiService |
| GET | `/shield/orders/{orderId}/details` | GpsApiService |
| GET | `/argus/document/vehicleList` | GpsApiService |
| GET | `/argus/document/documentList` | GpsApiService |
| GET | `/argus/document/bottomMessage` | GpsApiService |
| GET | `/argus/app/fastag/balance` | GpsApiService |
| POST | `/argus/app/external-vehicle/details` | GpsApiService |
| GET | `/argus/app/vehicle-detail` | GpsApiService |
| POST | `/shield/user-preference` | GpsApiService |
| POST | `/shield/dashboard/bottom-overlay` | GpsApiService |
| GET | `/app/device-software-subscription-status` | GpsApiService |
| GET | `/shield/payment/pending-orders` | GpsApiService |
| GET | `/app/vehicle/invoice` | GpsApiService |
| POST | `/app/gps-certificate` | GpsApiService |
| GET | `/shield/payment/invoice` | GpsApiService |
| PUT | `/rest/argus/vehicle/update-dummy-number` | GpsApiService |
| GET | `/rest/argus/app/vehicle-categories` | GpsApiService |
| POST | `/rest/argus/app/external-vehicle` | GpsApiService |
| GET | `/rest/argus/app/external-vehicle` | GpsApiService |
| GET | `/rest/argus/eta/trip/trip-history` | GpsApiService |
| GET | `/rest/argus/eta/trip/get-trip-info` | GpsApiService |
| PUT | `/rest/argus/app/external-vehicle/{vehicleId}` | GpsApiService |
| PUT | `/rest/argus/app/external-vehicle/gps-request/{vehicleId}` | GpsApiService |
| POST | `/rest/shield/autopay/reason-action` | GpsApiService |
| POST | `/rest/argus/banner/dynamic` | GpsApiService |
| POST | `/rest/argus/diesel/appointment/leads/v2` | GpsApiService |
| GET | `/rest/argus/gps/vehicles/non_expired` | GpsApiService |
| GET | `/argus/vehicle-tag/categories` | GpsApiService |
| GET | `/argus/app/vehicles/getAllFilterCount` | GpsApiService |
| POST | `/argus/vehicle-tag/create` | GpsApiService |
| PUT | `/argus/vehicle-tag/{tagId}` | GpsApiService |
| DELETE | `/argus/vehicle-tag/{tagId}` | GpsApiService |
| GET | `/vehicle/aggregatedDataForMap` | GpsApiService |
| POST | `/rest/argus/generic-order/add-vehicle` | GpsApiService |
| POST | `/rest/argus/generic-order` | GpsApiService |
| GET | `/rest/argus/api/v1/packages` | GpsApiService |
| POST | `/rest/shield/api/v2/buy-flow/orders/{orderId}/vehicles` | GpsApiService |
| GET | `/rest/shield/api/v2/buy-flow/orders/{orderId}/vehicles` | GpsApiService |
| GET | `rest/shield/api/v2/buy-flow/{omsOrderId}/installation-summary` | GpsApiService |
| GET | `/rest/shield/api/v1/buy-flow/installation/availability-dates` | GpsApiService |
| GET | `/rest/shield/api/v1/buy-flow/installation/time-slots` | GpsApiService |
| GET | `/rest/shield/api/v1/buy-flow/installation/allStates` | GpsApiService |
| POST | `/rest/shield/api/v1/buy-flow/installation/v2` | GpsApiService |
| POST | `/rest/shield/api/v2/buy-flow/installation` | GpsApiService |
| DELETE | `/rest/shield/api/v2/buy-flow/orders/{orderId}/vehicles/{vehicleId}` | GpsApiService |
| GET | `/shield/dashboard/keyAccountManager` | GpsApiService |
| GET | `shield/package/buy-flow` | GpsApiService |
| GET | `rest/shield/api/v2/buy-flow/vehicles/upgrade` | GpsApiService |
| GET | `/rest/shield/api/v2/buy-flow/secode/validate` | GpsApiService |
| GET | `rest/shield/api/v2/buy-flow/gstNumbers` | GpsApiService |
| GET | `rest/shield/payment/summary/{packageId}` | GpsApiService |
| POST | `/shield/gst/update-gst` | GpsApiService |
| POST | `/rest/shield/api/v2/buy-flow/orders` | GpsApiService |
| POST | `/rest/shield/orders/v2/{weOrderId}/buy-flow` | GpsApiService |
| GET | `/rest/shield/orders/v2/{orderId}/detail` | GpsApiService |

### App: `gps_route` (Offline Dashcam — GK7201 Chipset)
| Method | Path | Service |
|--------|------|---------|
| GET | `/app/setsystime` | Gk7201ChipsetApiService |
| GET | `/app/getdeviceattr` | Gk7201ChipsetApiService |
| GET | `/app/getproductinfo` | Gk7201ChipsetApiService |
| GET | `/app/getmediainfo` | Gk7201ChipsetApiService |
| GET | `/app/getparamvalue` | Gk7201ChipsetApiService |
| GET | `/app/setparamvalue` | Gk7201ChipsetApiService |
| GET | `/app/deletefile?file={filePath}` | Gk7201ChipsetApiService |
| GET | `/app/snapshot` | Gk7201ChipsetApiService |
| GET | `/app/getfilelist` | Gk7201ChipsetApiService |
| GET | `/app/getsdinfo` | Gk7201ChipsetApiService |
| GET | `/app/sdformat` | Gk7201ChipsetApiService |
| GET | `/app/reset` | Gk7201ChipsetApiService |
| GET | `/app/setwifi` | Gk7201ChipsetApiService |

### App: `gps_route` (Offline Dashcam — Hisilicon Chipset)
| Method | Path | Service |
|--------|------|---------|
| GET | `/cgi-bin/hisnet/getworkstate.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/workmodecmd.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/setsystime.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getsdstatus.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/sdcommand.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getdircapability.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getdirfilecount.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getdirfilelist.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getfileinfo.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/deletefile.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getcommparam.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/setcommparam.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getcamparam.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/setcamparam.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getwifi.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/setwifi.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getdeviceattr.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/reset.cgi` | HisiliconChipsetApiService |
| GET | `/cgi-bin/hisnet/getcamnum.cgi` | HisiliconChipsetApiService |

### App: `lubricants`
| Method | Path | Service |
|--------|------|---------|
| GET | `/homepage` | LubricantApiService |
| POST | `/scan` | LubricantApiService |
| GET | `/product-list` | LubricantApiService |
| GET | `/cashback-transactions` | LubricantApiService |

### App: `settings_page`
| Method | Path | Service |
|--------|------|---------|
| GET | `/setting` | SettingsApiService |
| GET | `/argus/geofences/list` | SettingsApiService |
| POST | `/setting` | SettingsApiService |
| GET | `/lang/getAll` | SettingsApiService |
| GET | `/rest/argus/gps/vehicles/non_expired` | SettingsApiService |
| POST | `/escalations/generic/web` | SettingsApiService |
| GET | `/admin/sendOtp` | SettingsApiService |
| POST | `/shield/admin/v3/verifyOtp` | SettingsApiService |
| PUT | `/rest/shield/user/v2/reset-password` | SettingsApiService |
| GET | `/rest/shield/app/notification/test` | SettingsApiService |

### App: `ticket_status_revamp` (Help Section)
| Method | Path | Service |
|--------|------|---------|
| PUT | `/escalations/feedback/{tId}` | HelpSectionApiService |
| GET | `/escalations/v4` | HelpSectionApiService |
| GET | `/shield/pages/help_support_new_v1` | HelpSectionApiService |

### App: `ticket_status_revamp` (Saarthi AI / Munshi Bot)
| Method | Path | Service |
|--------|------|---------|
| GET | `shield/munshi-bot/home` | SaarthiApiService |
| POST | `shield/munshi-bot/chat` | SaarthiApiService |
| GET | `shield/munshi-bot/chat/history` | SaarthiApiService |
| POST | `shield/munshi-bot/chat/cache/clear` | SaarthiApiService |

### App: `ticket_status_revamp` (Upload Document)
| Method | Path | Service |
|--------|------|---------|
| GET | `/escalations/docs` | UploadDocumentApiService |
| POST | `/escalations/docs/get-presigned-url` | UploadDocumentApiService |
| POST | `/escalations/docs/upload` | UploadDocumentApiService |

### App: `user_onboarding`
| Method | Path | Service |
|--------|------|---------|
| POST | `/shield/admin/v3/login` | LoginApiService |
| POST | `/shield/user/send-otp` | LoginApiService |
| POST | `/shield/user/v2/verify-otp-register` | LoginApiService |
| GET | `/admin/login/{vehicle_number}` | LoginApiService |
| PUT | `/shield/admin/v2/update-password` | LoginApiService |
| PUT | `/shield/admin/v2/update-userDetails` | LoginApiService |
| GET | `/shield/user/password/regex` | LoginApiService |

### App: `vehicle-safety-score`
| Method | Path | Service |
|--------|------|---------|
| GET | `/rest/truckart/driver-score/all-vehicle` | VehicleSafetyApiService |
| GET | `/rest/truckart/driver-score/{vehicleNumber}` | VehicleSafetyApiService |

---

### Shared Package: `we_op_common` API Services

| Method | Path | Service | Module |
|--------|------|---------|--------|
| GET | `/argus/geofences/saved-locations` | AreaApiService | we_area_search_screen |
| GET | `/rest/argus/sauron/autocomplete` | AreaApiService | we_area_search_screen |
| GET | `/rest/argus/sauron/place/{key}/detail` | AreaApiService | we_area_search_screen |
| GET | `/shield/api/v1/buy-flow/vehicle/search` | CreateOrderApiService | we_buy_order |
| GET | `/shield/api/v1/buy-flow/vehicle/eligible` | CreateOrderApiService | we_buy_order |
| POST | `/shield/api/v1/buy-flow/order` | CreateOrderApiService | we_buy_order |
| PUT | `shield/api/v1/buy-flow/order/{orderId}` | CreateOrderApiService | we_buy_order |
| GET | `shield/api/v1/buy-flow/referral` | CreateOrderApiService | we_buy_order |
| GET | `shield/api/v1/buy-flow/installation/instructions` | CreateOrderApiService | we_buy_order |
| GET | `/shield/api/v1/buy-flow/{path}/availability-dates` | DateAvailabilityApiService | we_date_availability_page |
| GET | `/shield/api/v1/buy-flow/{path}/time-slots` | DateAvailabilityApiService | we_date_availability_page |
| POST | `/rest/shield/autopay/reason-action` | VehicleSelectionApiService | we_vehicle_selection_screen |
| POST | `{endpoint}` (presigned upload) | UploadDocumentApiService | we_image_upload_widget |
| GET | `/shield/csat/ratings` | CsatApiService | we_csat_bottom_sheet |
| GET | `/banner` | BannerApiService | we_banners |
| POST | `{endPoint}` | BannerApiService | we_banners |
| POST | `/rest/argus/diesel/appointment/leads/v2` | WeScheduleDemoApiService | we_schedule_demo |
| GET | `shield/api/v1/buy-flow/installation/allStates` | LocationApiService | we_location_selection_page |
| GET | `shield/api/v1/buy-flow/installation/allCities` | LocationApiService | we_location_selection_page |
| PUT | `/shield/orders/{orderId}` | CancelPaymentApiService | we_cancel_order_bottom_sheet |
| GET | `/rest/shield/wallet/v2/mandates` | AutoPayApiService | we_auto_pay_flow |
| GET | `/rest/shield/autopay/cancellation-reason` | AutoPayApiService | we_auto_pay_flow |
| GET | `/rest/shield/wallet/v2/mandates/{mandateCode}/transactions` | AutoPayApiService | we_auto_pay_flow |
| GET | `/rest/shield/autopay/get-reason-data` | AutoPayApiService | we_auto_pay_flow |
| POST | `/rest/shield/autopay/reason-action` | AutoPayApiService | we_auto_pay_flow |
| GET | `/rest/argus/vehicle/transfer/getTransferForm` | AutoPayApiService | we_auto_pay_flow |
| GET | `/rest/shield/autopay/edit-plan` | AutoPayApiService | we_auto_pay_flow |
| POST | `/shield/orders` | AutoPayApiService | we_auto_pay_flow |
| POST | `shield/api/v1/buy-flow/installation` | WeScheduleInstallationApiService | we_schedule_installation |
| GET | `/rest/shield/pages/{pageID}` | SduiPageApiService | we_sdui |
| GET | `/rest/shield/pages/{pageName}` | RatingApiService | we_rating |
| POST | `/rest/shield/feedback` | RatingApiService | we_rating |
| GET | `/rest/shield/feedback/master/reasons` | RatingApiService | we_rating |
| GET | `/shield/orders/latest-order` | RatingApiService | we_rating |
| POST | `rest/shield/pages/update-story` | RatingApiService | we_rating |

---

### Web Modules

| Method | Path | Service | Module |
|--------|------|---------|--------|
| GET | `/shield/gst/gst-info` | GstApiService | web/multiplan |
| POST | `/shield/gst/update-gst` | GstApiService | web/multiplan |
| GET | `/rest/cyborg/account-manage/wallet` | PaymentApiService | web/multiplan |
| GET | `shield/package/v2` | MultiPlanApiService | web/multiplan |
| GET | `shield/package/v3` | MultiPlanApiService | web/multiplan |
| POST | `/shield/orders` | MultiPlanApiService | web/multiplan |
| GET | `shield/orders/{id}` | MultiPlanApiService | web/multiplan |
| GET | `/argus/banner/view-plans` | MultiPlanApiService | web/multiplan |
| POST | `/rest/shield/autopay/reason-action` | MultiPlanApiService | web/multiplan |
| GET | `/banner` | MultiPlanApiService | web/multiplan |
| POST | `/shield/user/send-otp` | SelfActivationApiService | web/self_activation |
| POST | `/shield/user/v2/verify-otp-register` | SelfActivationApiService | web/self_activation |
| GET | `/rest/shield/retail/device/search` | SelfActivationApiService | web/self_activation |
| POST | `/rest/shield/retail/vehicle` | SelfActivationApiService | web/self_activation |
| GET | `/rest/shield/retail/deviceModelType` | SelfActivationApiService | web/self_activation |
| GET | `/rest/shield/retail/checks` | SelfActivationApiService | web/self_activation |
| POST | `/rest/shield/retail/checks/complete` | SelfActivationApiService | web/self_activation |
| POST | `/rest/shield/retail/updateMacId` | SelfActivationApiService | web/self_activation |
| POST | `/rest/shield/retail/checks/complete/v2` | SelfActivationApiService | web/self_activation |
| GET | `/rest/saathi/dashcam/info` | SelfActivationApiService | web/self_activation |
| POST | `/rest/saathi/dashcam/signalling` | SelfActivationApiService | web/self_activation |
| GET | `/rest/tesseract/v1/load/{demandId}/missed` | OverlayLoadRateCollectionApiService | web/load_web |
| PUT | `/rest/tesseract/v1/load/{demandId}/quote` | OverlayLoadRateCollectionApiService | web/load_web |

---

## Base URL / Backend Services Summary

Based on path prefixes, the app communicates with these backend microservices:

| Prefix | Backend Service | Domain |
|--------|----------------|--------|
| `/rest/argus/` | Argus (GPS tracking, vehicles, geofences, ETA) | Core GPS |
| `/rest/shield/` | Shield (orders, payments, buy-flow, user, autopay, feedback) | Commerce/Payments |
| `/rest/cyborg/` | Cyborg (FASTag, subscriptions, KYC, external vehicles) | FASTag |
| `/rest/saathi/` | Saathi (fuel sensor, dashcam) | IoT/Hardware |
| `/rest/daredevil/` | Daredevil (escalations, support tickets) | Support |
| `/rest/supersell/` | SuperSell (buy-sell truck marketplace) | Marketplace |
| `/rest/truckart/` | TruckArt (documents, challans, driver score) | Compliance |
| `/rest/tesseract/` | Tesseract (load/freight management) | Logistics |
| `/shield/` | Shield (non-rest prefix variant) | Commerce |
| `/argus/` | Argus (non-rest prefix variant) | GPS |
| `/escalations/` | Escalations (ticket management) | Support |
| `/banner` | Banner service | Marketing |
| `/driver`, `/vehicle`, `/setting` | Legacy API paths | Core |
