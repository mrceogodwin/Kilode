/**
 * Expo dynamic config — merges app.json with public env.
 * EAS injects EXPO_PUBLIC_* at build time via eas.json profiles.
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    eas: {
      projectId: (config.extra && config.extra.eas && config.extra.eas.projectId) || process.env.EAS_PROJECT_ID || "",
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://kilode-nine.vercel.app",
    appEnv: process.env.EXPO_PUBLIC_APP_ENV || "production",
  },
});
