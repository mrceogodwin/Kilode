/** Kilode design tokens — forest green, layered charcoal, warm white and restrained gold. */
export const ACCENT = "#E6A94A";
export const ACCENT_LIGHT = "#F2C66D";

// Compatibility names retained for older UI primitives; brand accent is warm amber, not green.
export const BLUE = ACCENT;
export const BLUE_SOFT = "#2A2418";
export const GREEN = "#58B88A";
export const ORANGE = "#F08A4B";
export const YELLOW = "#F2C94C";
export const RED = "#E56B6F";
export const BORDER = "#2B2E35";
export const TEXT = "#F4F5F0";
export const TEXT2 = "#A7ABB4";
export const TEXT3 = "#777D88";
export const WHITE = "#15171B";
export const BG = "#0B0C0F";
export const BLACK = "#07080A";
export const GRAY = "#A3A3A3";
export const GRAY2 = "#737373";

/** Type scale — hierarchy for headlines → meta */
export const TYPE = {
  brand: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.65 },
  h1: { fontSize: 23, fontWeight: "700" as const, letterSpacing: -0.65, lineHeight: 28 },
  h2: { fontSize: 17, fontWeight: "650" as const, letterSpacing: -0.35, lineHeight: 22 },
  section: { fontSize: 15, fontWeight: "600" as const, letterSpacing: -0.2 },
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 21 },
  bodyStrong: { fontSize: 14, fontWeight: "600" as const },
  meta: { fontSize: 12, fontWeight: "500" as const },
  caption: { fontSize: 11, fontWeight: "600" as const },
  button: { fontSize: 13, fontWeight: "600" as const },
  tab: { fontSize: 10, fontWeight: "600" as const },
};

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 } as const;
