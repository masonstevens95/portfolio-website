/*
  purchase.ts

  The contract between /api/download and /plans/thanks, plus the access
  numbers both sides quote to buyers. Framework-free: imported by the SPA
  and by server/.

  Keeping the reasons in one list means a new server outcome is a type error
  on the page, not a silent fall-through to "error".
*/

export const INELIGIBLE_REASONS = [
  "processing",
  "expired",
  "refunded",
  "disputed",
  "unknown_purchase",
] as const;

export type IneligibleReason = (typeof INELIGIBLE_REASONS)[number];

export type DownloadStatus = "eligible" | IneligibleReason | "not_found" | "error";

export const DOWNLOAD_STATUSES: readonly DownloadStatus[] = [
  "eligible",
  ...INELIGIBLE_REASONS,
  "not_found",
  "error",
];

export interface DownloadResponse {
  status: DownloadStatus;
  plan?: { title: string };
  files?: { label: string; url: string }[];
  /** ms since epoch when the signed URLs stop working. */
  expiresAt?: number;
}

/** A paid session grants downloads for this many days after it was created. */
export const ACCESS_WINDOW_DAYS = 30;
export const ACCESS_WINDOW_MS = ACCESS_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/** Signed download URLs live this long. */
export const DOWNLOAD_LINK_MINUTES = 10;
export const DOWNLOAD_URL_TTL_MS = DOWNLOAD_LINK_MINUTES * 60 * 1000;

/** The post-purchase page. Also Stripe's success_url and the emailed link. */
export const THANKS_PATH = "/plans/thanks";

export const thanksUrl = (siteUrl: string, sessionId: string): string =>
  `${siteUrl}${THANKS_PATH}?session_id=${sessionId}`;
