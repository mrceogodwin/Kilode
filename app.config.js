/**
 * Expo dynamic config — merges app.json with public env.
 * Owner: Expo account https://expo.dev/accounts/mudino
 * EAS projectId is written by `eas build:configure` / `eas init` after you log in.
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
