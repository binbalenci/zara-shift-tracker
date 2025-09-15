const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Ensure package.json exports remain enabled for SDK 54 (required for metro-runtime resolution)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;