/*
  Fulfillment: the access-control boundary for paid plan files.

  There is no database. Stripe is the record, and one pure function decides,
  from a retrieved Checkout Session, whether that purchase may download
  files right now. Both callers use it:

    api/download.ts        → signed URLs, or a reason the thanks page explains
    api/stripe-webhook.ts  → send the one email, or acknowledge and log

  The plan is identified by the Price actually paid (line item), never by
  session metadata, so tampered metadata cannot redirect to another plan's
  files. Files come from the active mode only, so a test-mode purchase can
  only ever unlock test placeholders.
*/

import {
  findPlanByPriceId,
  type Plan,
  type PlanFile,
  type StripeMode,
} from "../src/data/plans.js";

/** A paid session grants downloads for this long after it was created. */
export const ACCESS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** Expansions every caller must request so eligibility can see refunds and disputes. */
export const SESSION_EXPAND = ["line_items", "payment_intent.latest_charge"];

export type IneligibleReason =
  | "processing"
  | "expired"
  | "refunded"
  | "disputed"
  | "unknown_purchase";

export type Eligibility =
  | { eligible: true; plan: Plan; files: PlanFile[] }
  | { eligible: false; reason: IneligibleReason };

interface ChargeFacts {
  amount: number;
  amount_refunded: number;
  refunded: boolean;
  disputed: boolean;
}

/** The fields of a retrieved Stripe Checkout Session this decision reads. */
export interface SessionFacts {
  id: string;
  /** Unix seconds. */
  created: number;
  payment_status: string;
  metadata?: Record<string, string> | null;
  customer_details?: { email?: string | null } | null;
  line_items?: { data: { price: { id: string } | null }[] } | null;
  payment_intent:
    | string
    | { id: string; metadata: Record<string, string>; latest_charge: string | ChargeFacts | null }
    | null;
}

const latestCharge = (session: SessionFacts): ChargeFacts | null => {
  const pi = session.payment_intent;
  if (!pi || typeof pi === "string") return null;
  const charge = pi.latest_charge;
  return charge && typeof charge === "object" ? charge : null;
};

export const evaluateEligibility = (
  session: SessionFacts,
  { now, mode, catalog }: { now: number; mode: StripeMode; catalog?: Plan[] }
): Eligibility => {
  if (session.payment_status === "unpaid") return { eligible: false, reason: "processing" };
  if (session.payment_status !== "paid") return { eligible: false, reason: "unknown_purchase" };

  const items = session.line_items?.data ?? [];
  const priceId = items.length === 1 ? items[0].price?.id : undefined;
  const plan = priceId ? findPlanByPriceId(priceId, mode, catalog) : undefined;
  if (!plan) return { eligible: false, reason: "unknown_purchase" };

  // Refund and dispute state must be readable; if it isn't, fail closed.
  const charge = latestCharge(session);
  if (!charge) return { eligible: false, reason: "unknown_purchase" };
  if (charge.refunded || charge.amount_refunded >= charge.amount) {
    return { eligible: false, reason: "refunded" };
  }
  if (charge.disputed) return { eligible: false, reason: "disputed" };

  if (now - session.created * 1000 > ACCESS_WINDOW_MS) return { eligible: false, reason: "expired" };

  return { eligible: true, plan, files: plan.modes[mode].files };
};

/**
 * Cheap shape check before any Stripe call. Prefix must match the active
 * mode; the body is checked for charset and a generous ceiling only, since
 * Stripe does not guarantee ID lengths.
 */
export const isValidSessionId = (id: string | null | undefined, mode: StripeMode): id is string =>
  typeof id === "string" && new RegExp(`^cs_${mode}_[A-Za-z0-9_]{1,255}$`).test(id);

/* --- Webhook orchestration ------------------------------------------------

   eligibility → already marked? → send email → mark PaymentIntent

   Duplicate protection without a database:
     - Resend idempotency key per session covers concurrent and short-window
       (24h) webhook retries.
     - fulfilled_at on the PaymentIntent's metadata covers Stripe's retries
       for up to 3 days.
   Accepted residual: if marking keeps failing for over 24h after a
   successful send, a late retry can send a second email.

   Thrown errors mean "retry" (the webhook returns 5xx). Returned outcomes
   mean "done, do not retry", including expected ineligibility.
   ------------------------------------------------------------------------ */

export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
] as const;

export const isHandledEvent = (type: string): boolean =>
  (HANDLED_EVENTS as readonly string[]).includes(type);

export interface DownloadEmail {
  to: string;
  planTitle: string;
  /** Durable link to the thanks page. Never a raw signed file URL. */
  thanksUrl: string;
  idempotencyKey: string;
}

export interface FulfillDeps {
  retrieve: (sessionId: string) => Promise<SessionFacts>;
  sendEmail: (email: DownloadEmail) => Promise<void>;
  markFulfilled: (paymentIntentId: string) => Promise<void>;
  now: () => number;
  mode: StripeMode;
  siteUrl: string;
  catalog?: Plan[];
}

export type FulfillOutcome =
  | { kind: "sent" }
  | { kind: "already_sent" }
  | { kind: "skipped"; reason: IneligibleReason | "no_email" };

export const fulfillSession = async (sessionId: string, deps: FulfillDeps): Promise<FulfillOutcome> => {
  const session = await deps.retrieve(sessionId);
  const result = evaluateEligibility(session, { now: deps.now(), mode: deps.mode, catalog: deps.catalog });
  if (!result.eligible) return { kind: "skipped", reason: result.reason };

  // Eligibility already guaranteed an expanded PaymentIntent.
  const pi = session.payment_intent as Exclude<SessionFacts["payment_intent"], string | null>;
  if (pi.metadata.fulfilled_at) return { kind: "already_sent" };

  const to = session.customer_details?.email;
  if (!to) return { kind: "skipped", reason: "no_email" };

  await deps.sendEmail({
    to,
    planTitle: result.plan.title,
    thanksUrl: `${deps.siteUrl}/plans/thanks?session_id=${encodeURIComponent(session.id)}`,
    idempotencyKey: `plan-download/${session.id}`,
  });
  await deps.markFulfilled(pi.id);
  return { kind: "sent" };
};
