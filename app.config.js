/**
 * Expo dynamic config.
 * Intended Expo account: https://expo.dev/accounts/mudino
 * projectId is written by `eas init` after you run `eas login` as mudino.
 */
module.exports = ({ config }) => ({
  ...config,
  // Keep web explicitly enabled for the Vercel mirror while iOS remains the
  // primary native app target.
  platforms: ["ios", "android", "web"],
  owner: config.owner || "mudino",
  plugins: [...(config.plugins || []), "expo-font"],
  extra: {
    ...(config.extra || {}),
    eas: {
      projectId:
        (config.extra && config.extra.eas && config.extra.eas.projectId) ||
        process.env.EAS_PROJECT_ID ||
        "",
    },
    // Native builds must use an explicitly configured dedicated API; never
    // silently fall back to the legacy Kilode Nine web backend.
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "",
    appEnv: process.env.EXPO_PUBLIC_APP_ENV || "production",
  },
});
