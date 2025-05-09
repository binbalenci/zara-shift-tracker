const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Disable the new package.json exports feature to fix Supabase compatibility
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
