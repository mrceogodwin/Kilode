import type { AccountKind } from "./accountKinds";
import { ACCOUNT_KINDS } from "./accountKinds";

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

/** Structured My Space tools — different labels/actions per kind, same brand system. */
export type AccountTool = {
  id: string;
  label: string;
  hint: string;
  /** Destination tab id in KilodeRoot, or "compose" for post sheet */
  tab: string;
};

export function toolsFor(kind: AccountKind | string | undefined | null): AccountTool[] {
  const k = (kind || "member") as AccountKind;
  const tools: AccountTool[] = [
    { id: "feed", label: "Post to Socials", hint: "Share a take", tab: "compose" },
  ];

  switch (k) {
    case "artist":
      tools.push(
        { id: "music", label: "Music desk", hint: "Tracks & charts", tab: "music" },
        { id: "socials", label: "Fan feed", hint: "Socials", tab: "socials" }
      );
      break;
    case "writer":
      tools.push(
        { id: "media", label: "Media desk", hint: "Stories & news", tab: "media" },
        { id: "socials", label: "Publish takes", hint: "Socials", tab: "socials" }
      );
      break;
    case "advertiser":
      tools.push(
        { id: "ads", label: "Ads workspace", hint: "Campaign tools (preview)", tab: "creators" },
        { id: "socials", label: "Promote in feed", hint: "Socials", tab: "socials" }
      );
      break;
    case "cinema":
      tools.push(
        { id: "cinema", label: "Cinema desk", hint: "Titles & trailers", tab: "cinema" },
        { id: "media", label: "Media", hint: "Editorial", tab: "media" }
      );
      break;
    case "job_poster":
      tools.push(
        { id: "jobs", label: "Post a job", hint: "Jobs desk", tab: "jobs" },
        { id: "socials", label: "Hiring updates", hint: "Socials", tab: "socials" }
      );
      break;
    case "job_seeker":
      tools.push(
        { id: "jobs", label: "Find work", hint: "Browse openings", tab: "jobs" },
        { id: "socials", label: "Network", hint: "Socials", tab: "socials" }
      );
      break;
    case "vendor":
      tools.push(
        { id: "market", label: "Market stall", hint: "Listings (no in-app checkout)", tab: "market" },
        { id: "socials", label: "Shop updates", hint: "Socials", tab: "socials" }
      );
      break;
    case "renter":
      tools.push(
        { id: "rent", label: "List a space", hint: "Rentals in Market", tab: "market" },
        { id: "socials", label: "Share listing", hint: "Socials", tab: "socials" }
      );
      break;
    case "brand":
      tools.push(
        { id: "brand", label: "Brand page", hint: "Creators / business", tab: "creators" },
        { id: "ads", label: "Ads", hint: "Promotion tools (preview)", tab: "creators" }
      );
      break;
    case "member":
    default:
      tools.push(
        { id: "jobs", label: "Jobs", hint: "Apply when listings are live", tab: "jobs" },
        { id: "media", label: "Media", hint: "News & stories", tab: "media" },
        { id: "events", label: "Events", hint: "What's on", tab: "events" }
      );
      break;
  }

  return tools;
}


export type WorkspaceIdentity = { title: string; subtitle: string; primaryLabel: string };

export function workspaceFor(kind: AccountKind | string | undefined | null): WorkspaceIdentity {
  switch (kind) {
    case "artist": return { title: "Artist Studio", subtitle: "Your music, releases and fan community in one place.", primaryLabel: "Music workspace" };
    case "writer": return { title: "Writer Desk", subtitle: "Your stories, editorial work and audience tools.", primaryLabel: "Editorial workspace" };
    case "advertiser": return { title: "Ads Workspace", subtitle: "Manage campaign preparation and promotion destinations.", primaryLabel: "Campaign tools" };
    case "cinema": return { title: "Cinema Desk", subtitle: "Organise film listings, trailers and audience discovery.", primaryLabel: "Cinema workspace" };
    case "job_poster": return { title: "Hiring Dashboard", subtitle: "Create opportunities and manage your hiring activity.", primaryLabel: "Hiring tools" };
    case "job_seeker": return { title: "Career Space", subtitle: "Discover openings and keep your job-search activity together.", primaryLabel: "Career tools" };
    case "vendor": return { title: "Market Stall", subtitle: "Manage product listings and bring shoppers to your store.", primaryLabel: "Seller tools" };
    case "renter": return { title: "Space Listings", subtitle: "Organise rental and space listings for discovery.", primaryLabel: "Listing tools" };
    case "brand": return { title: "Brand Workspace", subtitle: "Your business presence, audience and promotion tools.", primaryLabel: "Business tools" };
    case "member":
    default: return { title: "My Space", subtitle: "Your profile, activity and the parts of Kilode you use most.", primaryLabel: "Personal tools" };
  }
}

export function accountKindLabel(kind: AccountKind | string | undefined | null): string {
  const hit = ACCOUNT_KINDS.find((k) => k.id === kind);
  return hit?.label || "Member";
}
