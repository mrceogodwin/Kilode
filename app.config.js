/**
 * Expo dynamic config.
 * Intended Expo account: https://expo.dev/accounts/mudino
 * projectId is written by `eas init` after you run `eas login` as mudino.
 */
module.exports = ({ config }) => ({
  ...config,
  owner: config.owner || "mudino",
  extra: {
    ...(config.extra || {}),
    eas: {
      projectId:
        (config.extra && config.extra.eas && config.extra.eas.projectId) ||
        process.env.EAS_PROJECT_ID ||
        "",
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://kilode-nine.vercel.app",
    appEnv: process.env.EXPO_PUBLIC_APP_ENV || "production",
  },
});
