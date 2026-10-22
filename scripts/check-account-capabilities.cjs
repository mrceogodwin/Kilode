const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const kindsSource = fs.readFileSync(path.join(root, "lib/accountKinds.ts"), "utf8");
const capabilitiesSource = fs.readFileSync(path.join(root, "lib/accountCapabilities.ts"), "utf8");

const kindBlock = kindsSource.match(/export const ACCOUNT_KINDS = \[([\s\S]*?)\] as const;/);
assert.ok(kindBlock, "ACCOUNT_KINDS declaration must exist and remain parseable");
const kindIds = [...kindBlock[1].matchAll(/\bid:\s*"([a-z_]+)"/g)].map((match) => match[1]);
assert.equal(kindIds.length, 10, "Kilode must retain exactly ten public account kinds");
assert.equal(new Set(kindIds).size, kindIds.length, "Public account-kind IDs must be unique");
assert.ok(kindIds.includes("member"), "member must remain a supported fallback kind");
assert.ok(!kindIds.includes("creator") && !kindIds.includes("community"), "Creators and Communities are Socials sections, not public account kinds");
assert.match(kindsSource, /return hit \? hit\.id : "member";/, "Unknown account kinds must safely fall back to member");

const capabilityBlock = capabilitiesSource.match(/const CAPABILITIES_BY_KIND:\s*Record<AccountKind,\s*AccountCapabilities>\s*=\s*\{([\s\S]*?)\n\};/);
assert.ok(capabilityBlock, "Capability map must be explicitly typed as Record<AccountKind, AccountCapabilities>");
const capabilityIds = [...capabilityBlock[1].matchAll(/^  ([a-z_]+):\s*\{/gm)].map((match) => match[1]);
assert.equal(new Set(capabilityIds).size, capabilityIds.length, "Capability-map keys must be unique");
assert.deepEqual([...capabilityIds].sort(), [...kindIds].sort(), "Every public account kind must have exactly one capability entry");
assert.match(capabilitiesSource, /socials:\s*true/, "Socials participation must remain a shared capability");
assert.match(capabilitiesSource, /not an authorization boundary/i, "Client capabilities must remain documented as navigation hints, not security enforcement");

const capabilityNames = [
  "mediaAuthoring", "musicReleaseManagement", "cinemaManagement",
  "advertisingCampaigns", "businessWorkspace", "jobDiscovery",
  "jobManagement", "marketplaceSelling", "rentalListingManagement",
  "advancedCreatorTools",
];
const expectedCapabilities = {
  member: ["jobDiscovery"],
  artist: ["musicReleaseManagement", "advancedCreatorTools"],
  writer: ["mediaAuthoring", "advancedCreatorTools"],
  advertiser: ["advertisingCampaigns", "businessWorkspace"],
  cinema: ["cinemaManagement", "advancedCreatorTools"],
  job_poster: ["jobManagement"],
  job_seeker: ["jobDiscovery"],
  vendor: ["marketplaceSelling", "businessWorkspace"],
  renter: ["rentalListingManagement"],
  brand: ["advertisingCampaigns", "businessWorkspace", "advancedCreatorTools"],
};

for (const [kind, expected] of Object.entries(expectedCapabilities)) {
  const entry = capabilityBlock[1].match(new RegExp("^  " + kind + ": \\{([\\s\\S]*?)^  \\}", "m"));
  assert.ok(entry, kind + " must have a capability entry");
  const actual = capabilityNames.filter((name) => new RegExp("\\b" + name + ":\\s*true\\b").test(entry[1]));
  assert.deepEqual(actual.sort(), [...expected].sort(), kind + " must have exactly the approved native workspace capabilities");
  assert.match(entry[1], /\.\.\.DEFAULT_CAPABILITIES/, kind + " must inherit safe defaults");
}

assert.match(capabilitiesSource, /return CAPABILITIES_BY_KIND\[asAccountKind\(kind\)\]/, "Malformed account kinds must resolve through the safe fallback");
assert.match(capabilitiesSource, /socials:\s*true/, "Every account kind must retain the shared Socials baseline");

console.log("Account capability invariants passed: exactly ten unique kinds, complete one-to-one mapping, exact role capabilities, safe fallback, and shared Socials access.");
