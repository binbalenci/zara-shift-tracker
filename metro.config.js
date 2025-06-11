const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Disable the new package.json exports feature to fix Supabase compatibility
config.resolver.unstable_enablePackageExports = false;

module.exports = config;