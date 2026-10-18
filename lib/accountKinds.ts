/** From Kilode-v2 src/lib/qonvo-data.ts — ACCOUNT_KINDS */
export const ACCOUNT_KINDS = [
  { id: "member", label: "Normal user", hint: "Chat, feeds, vote, apply to jobs" },
  { id: "artist", label: "Artist", hint: "List music URLs live — no pay, no staff approval" },
  { id: "writer", label: "Writer", hint: "News, blogs, reviews" },
  { id: "advertiser", label: "Ads Poster", hint: "Pay to place business ads (not cinema)" },
  { id: "cinema", label: "Cinema Poster", hint: "Pay to submit movie YouTube URLs" },
  { id: "job_poster", label: "Job Poster", hint: "Post jobs and manage applicants" },
  { id: "job_seeker", label: "Job Seeker", hint: "Resume + apply to jobs" },
  { id: "vendor", label: "Marketplace seller", hint: "Showcase products. No in-app checkout" },
  { id: "renter", label: "Rent / space lister", hint: "List properties with contact links" },
  { id: "brand", label: "Brand / business", hint: "Company page and ads" },
] as const;

export type AccountKind = (typeof ACCOUNT_KINDS)[number]["id"];

export function asAccountKind(v: string | undefined | null): AccountKind {
  const hit = ACCOUNT_KINDS.find((k) => k.id === v);
  return hit ? hit.id : "member";
}
