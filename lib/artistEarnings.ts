/**
 * Kilode artist earnings domain model.
 *
 * Fan-powered earnings are the initial product scope. Traditional streaming
 * royalties are deliberately kept separate until licensing and reporting
 * arrangements exist. This module calculates only from supplied transaction
 * records; it never invents balances, streams, or payouts.
 */

export type FanEarningKind =
  | "track_purchase"
  | "release_purchase"
  | "fan_subscription"
  | "fan_tip"
  | "exclusive_content"
  | "ticket_sale"
  | "merchandise_sale";

export type FanEarningStatus =
  | "pending"
  | "available"
  | "paid"
  | "refunded"
  | "reversed";

export type FanEarningTransaction = {
  id: string;
  artistId: string;
  kind: FanEarningKind;
  status: FanEarningStatus;
  currency: string;
  /** Amount actually charged to the fan, in major currency units. */
  grossAmount: number;
  /** Actual payment processing fee, if returned by the payment provider. */
  processingFee?: number;
  /** Configured platform fee for this transaction, in major currency units. */
  platformFee?: number;
  /** Tax withheld or collected, only when supplied by a trusted calculation. */
  taxAmount?: number;
  createdAt: string;
  /** Reference to the original transaction for a refund or reversal. */
  reversesTransactionId?: string;
};

export type ArtistEarningsSummary = {
  currency: string;
  grossFanPayments: number;
  processingFees: number;
  platformFees: number;
  taxes: number;
  netArtistEarnings: number;
  pending: number;
  available: number;
  paid: number;
  refundedOrReversed: number;
  transactionCount: number;
  /** Traditional streaming royalties are intentionally not included. */
  streamingRoyaltiesIncluded: false;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function validAmount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

/**
 * Summarizes actual fan-payment ledger rows in one currency.
 * Rows in other currencies are excluded rather than silently converted.
 * Refund/reversal rows are reported separately and never treated as positive
 * artist earnings. The backend remains responsible for authoritative balances,
 * idempotency, reconciliation, currency conversion, and payout eligibility.
 */
export function summarizeFanEarnings(
  transactions: FanEarningTransaction[],
  currency: string
): ArtistEarningsSummary {
  const normalizedCurrency = currency.trim().toUpperCase();
  const rows = transactions.filter(
    (row) => row.currency.trim().toUpperCase() === normalizedCurrency
  );

  const summary: ArtistEarningsSummary = {
    currency: normalizedCurrency,
    grossFanPayments: 0,
    processingFees: 0,
    platformFees: 0,
    taxes: 0,
    netArtistEarnings: 0,
    pending: 0,
    available: 0,
    paid: 0,
    refundedOrReversed: 0,
    transactionCount: rows.length,
    streamingRoyaltiesIncluded: false,
  };

  for (const row of rows) {
    const gross = validAmount(row.grossAmount);
    if (row.status === "refunded" || row.status === "reversed") {
      summary.refundedOrReversed += gross;
      continue;
    }

    const processing = validAmount(row.processingFee);
    const platform = validAmount(row.platformFee);
    const taxes = validAmount(row.taxAmount);
    const net = Math.max(0, gross - processing - platform - taxes);

    summary.grossFanPayments += gross;
    summary.processingFees += processing;
    summary.platformFees += platform;
    summary.taxes += taxes;
    summary.netArtistEarnings += net;

    if (row.status === "pending") summary.pending += net;
    if (row.status === "available") summary.available += net;
    if (row.status === "paid") summary.paid += net;
  }

  for (const key of [
    "grossFanPayments",
    "processingFees",
    "platformFees",
    "taxes",
    "netArtistEarnings",
    "pending",
    "available",
    "paid",
    "refundedOrReversed",
  ] as const) {
    summary[key] = roundMoney(summary[key]);
  }

  return summary;
}


/**
 * Summarizes earnings for exactly one artist. Call this when reading a shared
 * ledger so transactions belonging to other artists cannot be mixed into the
 * requested artist's totals. The backend must still enforce authorization and
 * return only records the requesting user is allowed to access.
 */
export function summarizeArtistFanEarnings(
  transactions: FanEarningTransaction[],
  artistId: string,
  currency: string
): ArtistEarningsSummary {
  const normalizedArtistId = artistId.trim();
  if (!normalizedArtistId) {
    return summarizeFanEarnings([], currency);
  }
  return summarizeFanEarnings(
    transactions.filter((row) => row.artistId === normalizedArtistId),
    currency
  );
}
