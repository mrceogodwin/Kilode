module.exports = ({ config }) => ({
  ...config,
  owner: config.owner || "mudino",

  plugins: [
    ...(config.plugins || []),
    [
      "expo-audio",
      {
        enableBackgroundPlayback: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0B0B0F",
      },
    ],
    "expo-video",
  ],

  extra: {
    ...(config.extra || {}),
    eas: {
      projectId:
        (config.extra && config.extra.eas && config.extra.eas.projectId) ||
        process.env.EAS_PROJECT_ID ||
        "",
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "",
    appEnv: process.env.EXPO_PUBLIC_APP_ENV || "production",
  },
});