/** Kilode design tokens — forest green, layered charcoal, warm white and restrained gold. */
export const ACCENT = "#39A875";
export const ACCENT_LIGHT = "#52C58B";

// Compatibility names retained for older UI primitives; values follow Kilode green surfaces.
export const BLUE = ACCENT;
export const BLUE_SOFT = "#17251E";
export const GREEN = "#52C58B";
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
