/**
 * Push Link client-side primitives.
 * These helpers validate/classify destinations only. They do not create server
 * campaigns, record authoritative analytics, or prove external streams.
 * Server-side validation and campaign ownership checks remain mandatory.
 */
export type PushPlatform =
  | "spotify" | "apple_music" | "audiomack" | "youtube" | "soundcloud"
  | "tiktok" | "instagram" | "website" | "other";

export type PushDestination = {
  url: string;
  platform: PushPlatform;
  label: string;
};

export type PushCampaignStatus =
  | "draft" | "pending_review" | "scheduled" | "active"
  | "paused" | "completed" | "rejected";

export type PushCampaignDraft = {
  title: string;
  category: "music" | "creator" | "video" | "event" | "media" | "product" | "job" | "business" | "profile" | "other";
  destinations: PushDestination[];
  status: "draft";
};

const PLATFORM_RULES: Array<{ platform: PushPlatform; domains: string[]; label: string }> = [
  { platform: "spotify", domains: ["spotify.com", "open.spotify.com"], label: "Spotify" },
  { platform: "apple_music", domains: ["music.apple.com", "itunes.apple.com"], label: "Apple Music" },
  { platform: "audiomack", domains: ["audiomack.com"], label: "Audiomack" },
  { platform: "youtube", domains: ["youtube.com", "www.youtube.com", "youtu.be", "music.youtube.com"], label: "YouTube" },
  { platform: "soundcloud", domains: ["soundcloud.com", "on.soundcloud.com"], label: "SoundCloud" },
  { platform: "tiktok", domains: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"], label: "TikTok" },
  { platform: "instagram", domains: ["instagram.com", "www.instagram.com", "instagr.am"], label: "Instagram" },
];

function hostnameMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith("." + domain);
}

export function normalizePushDestination(input: string): PushDestination | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  // Never accept executable or opaque URL schemes as campaign destinations.
  if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  const rule = PLATFORM_RULES.find((candidate) =>
    candidate.domains.some((domain) => hostnameMatches(hostname, domain))
  );

  return {
    url: parsed.toString(),
    platform: rule?.platform ?? "website",
    label: rule?.label ?? hostname.replace(/^www\./, ""),
  };
}

export function createPushCampaignDraft(
  title: string,
  category: PushCampaignDraft["category"],
  rawDestinations: string[]
): PushCampaignDraft | null {
  const safeTitle = title.trim();
  if (!safeTitle || safeTitle.length > 120) return null;

  const destinations = rawDestinations
    .map(normalizePushDestination)
    .filter((destination): destination is PushDestination => destination !== null);

  if (destinations.length === 0) return null;

  const unique = new Map(destinations.map((destination) => [destination.url, destination]));
  return {
    title: safeTitle,
    category,
    destinations: Array.from(unique.values()),
    status: "draft",
  };
}

export type PushLinkMetricKind =
  | "impression" | "destination_click" | "external_redirect"
  | "internal_content_open" | "hosted_play_started"
  | "hosted_play_qualified" | "verified_external_stream";

export type PushLinkMetricEvent = {
  eventId: string;
  kind: PushLinkMetricKind;
  occurredAt: string;
  campaignId: string;
  contentId?: string;
  placement?: string;
  source: "kilode_client" | "music_player" | "authorised_external_provider";
};

/**
 * A verified external stream must only come from an authorised provider.
 * A redirect or outbound click is never sufficient evidence. Client events
 * are telemetry candidates, not trusted billing evidence.
 */
export function isAuthoritativeExternalStreamEvent(event: PushLinkMetricEvent): boolean {
  return event.kind === "verified_external_stream" &&
    event.source === "authorised_external_provider";
}
