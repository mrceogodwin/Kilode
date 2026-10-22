/** From Kilode-v2 src/lib/qonvo-data.ts — ACCOUNT_KINDS */
export const ACCOUNT_KINDS = [
  { id: "member", label: "Everyday member", hint: "Explore feeds, join communities, connect and participate." },
  { id: "artist", label: "Artist / musician", hint: "Build your artist presence and share music with fans." },
  { id: "writer", label: "Writer / publisher", hint: "Create articles, news, stories and reviews." },
  { id: "advertiser", label: "Advertiser", hint: "Promote products, services or campaigns with ads." },
  { id: "cinema", label: "Cinema / film publisher", hint: "Submit and promote film or cinema content." },
  { id: "job_poster", label: "Employer / job poster", hint: "Publish vacancies and manage applicants." },
  { id: "job_seeker", label: "Job seeker", hint: "Build your profile and discover job opportunities." },
  { id: "vendor", label: "Marketplace seller", hint: "Showcase products and connect with interested buyers." },
  { id: "renter", label: "Space / property lister", hint: "Present available spaces or properties to potential renters." },
  { id: "brand", label: "Brand / business", hint: "Represent your organisation and grow its audience." },
] as const;

export type AccountKind = (typeof ACCOUNT_KINDS)[number]["id"];

export function asAccountKind(v: string | undefined | null): AccountKind {
  const hit = ACCOUNT_KINDS.find((k) => k.id === v);
  return hit ? hit.id : "member";
}
