# Changelog

## [1.5.2] - 2024-12-19

### Changed

- **Sentry Project Configuration**:
  - Updated Sentry project slug from "react-native" to "zara-shift-tracker"
  - Aligned project naming with app identity for better organization
  - Updated app.json configuration to reflect new project slug
  - Maintained all existing error monitoring and logging functionality

### Technical

- Updated Expo plugin configuration in app.json
- Ensured consistent project naming across all monitoring tools
- No breaking changes to existing Sentry integration

## [1.5.1] - 2024-12-19

### Added

- **Average Salary Calculation in Statistics Overview**:
  - Added "Average Salary" statistic to the monthly overview card
  - Calculates total earnings divided by total hours for the selected month
  - Displays as €X.X/h format with 1 decimal place precision
  - Handles edge cases where total hours is zero to prevent division by zero
  - Provides users with insight into their hourly earnings efficiency

## [1.5.0] - 2024-12-19

### Added

- **Comprehensive Error Monitoring with Sentry**:

  - Production-ready error tracking and monitoring system
  - Enhanced Logger utility with specialized database operation methods
  - Critical error logging for all database operations (create, read, update, delete)
  - Comprehensive error context tracking for debugging user-reported issues
  - Performance monitoring for slow operations
  - Environment and context tagging for better error categorization

- **Comprehensive Breadcrumb Tracking**:
  - Navigation tracking across all main screens (Home, Shifts, Statistics, Settings)
  - User action breadcrumbs for critical interactions (form submissions, button clicks, data operations)
  - Chart interaction tracking (bar clicks, year navigation, monthly breakdowns)
  - CRUD operation flow tracking (create, update, delete shifts and profiles)
  - Form interaction breadcrumbs (date pickers, time pickers, modal openings)
  - Data operation success/failure breadcrumbs for complete user journey visibility

### Changed

- **Error Handling**: Replaced all console.error statements with proper Sentry error reporting
- **Database Operations**: Enhanced error tracking for shift creation, modification, deletion, and profile management
- **Statistics Processing**: Improved error handling for chart data generation and monthly calculations
- **Context Tracking**: Added detailed operation context for all critical app functions
- **User Flow Monitoring**: Comprehensive breadcrumb trails showing user behavior before errors occur

### Technical

- Created new Logger utility with specialized methods for different error types
- Added database-specific error logging with operation context
- Implemented critical error flagging for data loss scenarios
- Enhanced error reporting across all main screens (Home, Shifts, Statistics, Settings)
- Added comprehensive error context for debugging production issues
- Implemented breadcrumb tracking for user actions, navigation, and data operations
- Enhanced user flow visibility with detailed interaction logging

## [1.4.0] - 2024-12-19

### Added

- **Public Holiday Support**:
  - Public holiday checkbox in shift modification
  - 100% bonus calculation (double pay for holiday shifts)
  - Visual indicators with amber background and orange "HOLIDAY" badge
- **Sick Leave Functionality**:
  - Sick leave checkbox in shift modification
  - Base pay only calculation (no bonuses for sick leave)
  - Visual indicators with red background and red "SICK" badge
- **Enhanced Statistics**:
  - Holiday shifts tracking with count and day numbers in Overview section
  - Sick leave tracking with count and day numbers in Overview section
  - Split evening bonus tracking (weekday vs Saturday)
- **Improved User Experience**:
  - Simplified breakdown view showing only non-zero fields
  - Better hour formatting (5h instead of 5.00h)
  - Proper precedence logic: sick leave overrides all other bonuses including holiday pay

### Changed

- **Database Schema**: Added `sick_leave`, `public_holiday` fields to shifts table and `holiday_bonus` to calculations
- **Calculation Logic**: Updated to handle sick leave precedence and split evening rates
- **Visual Design**: Color-coded shift types for quick identification

### Technical

- Updated TypeScript interfaces for new fields
- Enhanced database migrations for backward compatibility
- Improved shift modification modal with new checkboxes

## [1.3.6] - 2024-05-09

### Fixed

- Fixed app configuration schema for Expo 53 compatibility
- Fixed dependency version conflicts by aligning React and React Native packages
- Improved project health by updating all Expo packages to their compatible versions
- Added configuration to suppress warnings about third-party packages

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
