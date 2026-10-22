/**
 * Expo dynamic config.
 * Intended Expo account: https://expo.dev/accounts/mudino
 * projectId is written by `eas init` after you run `eas login` as mudino.
 */
module.exports = ({ config }) => ({
  ...config,
  // Vercel mirrors the native iOS UI, so explicitly allow Expo's web export.
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
    appEnv: process.env.EXPO_PUBLIC_APP_ENV || "production",
  },
});
