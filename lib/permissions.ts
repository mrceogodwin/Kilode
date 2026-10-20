import type { AccountKind } from "./accountKinds";

/**
 * Role → capability map for native Kilode.
 * Gates UI affordances; real enforcement remains on the server when APIs are live.
 */
export type Capability =
  | "feed_post"
  | "music_list"
  | "news_write"
  | "ads_place"
  | "cinema_submit"
  | "jobs_post"
  | "jobs_apply"
  | "market_sell"
  | "rent_list"
  | "brand_page";

const BY_KIND: Record<AccountKind, Capability[]> = {
  member: ["feed_post", "jobs_apply"],
  artist: ["feed_post", "music_list"],
  writer: ["feed_post", "news_write"],
  advertiser: ["feed_post", "ads_place"],
  cinema: ["feed_post", "cinema_submit"],
  job_poster: ["feed_post", "jobs_post"],
  job_seeker: ["feed_post", "jobs_apply"],
  vendor: ["feed_post", "market_sell"],
  renter: ["feed_post", "rent_list"],
  brand: ["feed_post", "brand_page", "ads_place"],
};

export function capabilitiesFor(kind: AccountKind | string | undefined | null): Capability[] {
  const k = (kind || "member") as AccountKind;
  return BY_KIND[k] || BY_KIND.member;
}

export function can(kind: AccountKind | string | undefined | null, cap: Capability): boolean {
  return capabilitiesFor(kind).includes(cap);
}

/** Primary destinations to highlight for this account type in More / My Space. */
export function primaryDesksFor(kind: AccountKind | string | undefined | null): string[] {
  const caps = capabilitiesFor(kind);
  const desks: string[] = ["socials", "media"];
  if (caps.includes("music_list")) desks.push("music");
  if (caps.includes("news_write")) desks.push("media");
  if (caps.includes("cinema_submit")) desks.push("cinema");
  if (caps.includes("jobs_post") || caps.includes("jobs_apply")) desks.push("jobs");
  if (caps.includes("market_sell")) desks.push("market");
  if (caps.includes("ads_place") || caps.includes("brand_page")) desks.push("creators");
  if (caps.includes("rent_list")) desks.push("market");
  return Array.from(new Set(desks));
}
