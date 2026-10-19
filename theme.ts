/** Kilode design tokens — muted gold accent, calm neutrals (preview/web identity). */
export const ACCENT = "#C5A66A";
export const ACCENT_LIGHT = "#A88A4E";

// Compatibility tokens for older UI primitives; mapped to Kilode gold/neutrals.
export const BLUE = ACCENT;
export const BLUE_SOFT = "#2A2419";
export const GREEN = ACCENT;
export const BORDER = "#303030";
export const TEXT = "#F5F5F5";
export const TEXT2 = "#A3A3A3";
export const TEXT3 = "#737373";
export const WHITE = "#191919";
export const BG = "#101010";
export const BLACK = "#09090B";
export const GRAY = "#A3A3A3";
export const GRAY2 = "#737373";

/** Type scale — hierarchy for headlines → meta */
export const TYPE = {
  brand: { fontSize: 22, fontWeight: "800" as const, letterSpacing: -0.6 },
  h1: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: "700" as const, letterSpacing: -0.3 },
  section: { fontSize: 16, fontWeight: "700" as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: "600" as const },
  meta: { fontSize: 12, fontWeight: "500" as const },
  caption: { fontSize: 11, fontWeight: "600" as const },
  button: { fontSize: 14, fontWeight: "700" as const },
  tab: { fontSize: 10, fontWeight: "600" as const },
};

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 } as const;
