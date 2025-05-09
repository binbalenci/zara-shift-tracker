# Changelog

## 1.3.1 - 2024-04-08

### Changed

- Statistics page improvements:
  - Removed amount labels from top of bars for cleaner visualization
  - Values are now only visible when clicking on bars
- Project structure:
  - Removed redundant App.tsx as navigation is now fully handled by Expo Router

### Fixed

- Statistics calculations now properly use shift_calculations data
- Removed dependency on active profile for statistics display

## 1.3.0 - 2024-04-08

### Added

- Statistics page improvements:
  - Display amount labels on top of bars
  - Add year navigation and display
  - Show total hours worked
- Shifts page enhancements:
  - Interactive shift details with earnings breakdown modal
  - Real-time calculation updates when modifying shifts

### Fixed

- Corrected base pay calculation logic across the app

## 1.2.1 - 2024-04-07

### Fixed

- Time input validation for entries ending with "00"

## 1.1.1 - 2024-04-07

### Added

- Celebration features:
  - Confetti animation
  - Love image display

## 1.1.0 - 2024-04-07

### Changed

- Complete redesign of Statistics page:
  - Bar chart visualization
  - Monthly data overview
  - Earnings breakdown

## 1.0.4 - 2024-04-07

### Fixed

- Home and Shifts page functionality
- Earnings calculations accuracy

## 1.0.2 - 2024-04-07

### Fixed

- Home page functionality and layout

## 1.0.1 - 2024-04-07

### Added

- Initial release with core features:
  - Home page
  - Settings page
  - Salary Profile management
  - Supabase integration
  - React Native Paper components

## 1.3.3 - 2024-04-08

### Changed

- Improved tab navigation layout:
  - Fixed tab bar positioning across all devices
  - Adjusted spacing for tab icons and labels
  - Better handling of safe areas and device-specific insets

### Fixed

- Tab bar text visibility on devices with home indicator
- Navigation layout issues on iPhone models with Dynamic Island

## [1.3.4] - 2024-03-26

### Fixed

- Fixed shift calculation to properly apply 0.5-hour deduction to Sunday hours for shifts 8 hours or longer

## [1.3.5] - 2024-04-30

### Changed

- Updated to Expo SDK 53:
  - Upgraded React Native to 0.79
  - Upgraded React to 19
  - Enabled New Architecture by default
  - Added Metro configuration for Supabase compatibility
  - Updated runtime version to match app version
