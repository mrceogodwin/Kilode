/** Kilode design tokens — forest green, layered charcoal, warm white and restrained gold. */
export const ACCENT = "#2E8B57";
export const ACCENT_LIGHT = "#46B978";

// Compatibility tokens for older UI primitives; mapped to Kilode gold/neutrals.
export const BLUE = ACCENT;
export const BLUE_SOFT = "#20362A";
export const GREEN = "#46B978";
export const BORDER = "#304238";
export const TEXT = "#F5F5F5";
export const TEXT2 = "#A8B5AC";
export const TEXT3 = "#7F9185";
export const WHITE = "#1B2821";
export const BG = "#101714";
export const BLACK = "#0B100D";
export const GRAY = "#A3A3A3";
export const GRAY2 = "#737373";

/** Type scale — hierarchy for headlines → meta */
export const TYPE = {
  brand: { fontSize: 22, fontWeight: "800" as const, letterSpacing: -0.7 },
  h1: { fontSize: 26, fontWeight: "800" as const, letterSpacing: -0.7, lineHeight: 31 },
  h2: { fontSize: 19, fontWeight: "700" as const, letterSpacing: -0.4, lineHeight: 25 },
  section: { fontSize: 16, fontWeight: "700" as const, letterSpacing: -0.25 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 23 },
  bodyStrong: { fontSize: 15, fontWeight: "600" as const },
  meta: { fontSize: 12, fontWeight: "500" as const },
  caption: { fontSize: 11, fontWeight: "600" as const },
  button: { fontSize: 14, fontWeight: "700" as const },
  tab: { fontSize: 10, fontWeight: "600" as const },
};

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 } as const;
