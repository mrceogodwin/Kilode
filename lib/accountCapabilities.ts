import { asAccountKind, type AccountKind } from "./accountKinds";

/**
 * Native navigation/workspace hints for the ten existing public account kinds.
 *
 * IMPORTANT: this is not an authorization boundary and does not grant paid
 * entitlements. The trusted backend must independently enforce permissions,
 * object ownership, quotas, staff access, and payment state.
 *
 * Keep account kind separate from plan/subscription and staff permissions.
 * All account kinds may participate in ordinary Socials; Creators and
 * Communities remain sections within Socials, not separate top-level roles.
 */
export type AccountCapabilities = Readonly<{
  socials: true;
  mediaAuthoring: boolean;
  musicReleaseManagement: boolean;
  cinemaManagement: boolean;
  advertisingCampaigns: boolean;
  businessWorkspace: boolean;
  jobDiscovery: boolean;
  jobManagement: boolean;
  marketplaceSelling: boolean;
  rentalListingManagement: boolean;
  advancedCreatorTools: boolean;
}>;

const DEFAULT_CAPABILITIES: AccountCapabilities = {
  socials: true,
  mediaAuthoring: false,
  musicReleaseManagement: false,
  cinemaManagement: false,
  advertisingCampaigns: false,
  businessWorkspace: false,
  jobDiscovery: false,
  jobManagement: false,
  marketplaceSelling: false,
  rentalListingManagement: false,
  advancedCreatorTools: false,
};

/**
 * Defines intended workspace relevance only. It does not imply that a
 * corresponding feature or its backend is implemented or available.
 */
const CAPABILITIES_BY_KIND: Record<AccountKind, AccountCapabilities> = {
  member: {
    ...DEFAULT_CAPABILITIES,
    jobDiscovery: true,
  },
  artist: {
    ...DEFAULT_CAPABILITIES,
    musicReleaseManagement: true,
    advancedCreatorTools: true,
  },
  writer: {
    ...DEFAULT_CAPABILITIES,
    mediaAuthoring: true,
    advancedCreatorTools: true,
  },
  advertiser: {
    ...DEFAULT_CAPABILITIES,
    advertisingCampaigns: true,
    businessWorkspace: true,
  },
  cinema: {
    ...DEFAULT_CAPABILITIES,
    cinemaManagement: true,
    advancedCreatorTools: true,
  },
  job_poster: {
    ...DEFAULT_CAPABILITIES,
    jobManagement: true,
  },
  job_seeker: {
    ...DEFAULT_CAPABILITIES,
    jobDiscovery: true,
  },
  vendor: {
    ...DEFAULT_CAPABILITIES,
    marketplaceSelling: true,
    businessWorkspace: true,
  },
  renter: {
    ...DEFAULT_CAPABILITIES,
    rentalListingManagement: true,
  },
  brand: {
    ...DEFAULT_CAPABILITIES,
    advertisingCampaigns: true,
    businessWorkspace: true,
    advancedCreatorTools: true,
  },
};

/** Unknown or malformed kinds safely fall back to ordinary member defaults. */
export function getAccountCapabilities(
  kind: string | null | undefined,
): AccountCapabilities {
  return CAPABILITIES_BY_KIND[asAccountKind(kind)];
}

/** Exposes the stable, supported account-kind keys for audits and tests. */
export function getSupportedCapabilityKinds(): readonly AccountKind[] {
  return Object.keys(CAPABILITIES_BY_KIND) as AccountKind[];
}
