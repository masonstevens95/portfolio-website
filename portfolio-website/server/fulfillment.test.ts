import { describe, it, expect } from "vitest";
import type { Plan } from "../src/data/plans.js";
import {
  evaluateEligibility,
  fulfillSession,
  isHandledEvent,
  isValidSessionId,
  ACCESS_WINDOW_MS,
  type FulfillDeps,
  type SessionFacts,
} from "./fulfillment.js";

const plan = (slug: string, testIds: string[], liveIds: string[] = []): Plan => ({
  slug,
  title: slug,
  listed: true,
  summary: "",
  description: "",
  format: "PDF",
  plates: [],
  included: [],
  cutList: [],
  price: { amount: 2900, currency: "usd" },
  modes: {
    test: {
      currentPriceId: testIds[0],
      acceptedPriceIds: testIds,
      files: [{ label: "Placeholder", pathname: `test/${slug}/placeholder.pdf` }],
    },
    live: {
      currentPriceId: liveIds[0],
      acceptedPriceIds: liveIds,
      files: [{ label: "Plan set", pathname: `live/${slug}/plans.pdf` }],
    },
  },
});

const catalog = [
  plan("shed", ["price_shed_new", "price_shed_old"], ["price_shed_live"]),
  plan("coop", ["price_coop"]),
];

const NOW = Date.UTC(2026, 10, 4, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

const charge = (overrides: Partial<{ amount: number; amount_refunded: number; refunded: boolean; disputed: boolean }> = {}) => ({
  amount: 2900,
  amount_refunded: 0,
  refunded: false,
  disputed: false,
  ...overrides,
});

const session = (overrides: Partial<SessionFacts> = {}): SessionFacts => ({
  id: "cs_test_abc",
  created: Math.floor((NOW - DAY) / 1000),
  payment_status: "paid",
  metadata: { slug: "shed" },
  line_items: { data: [{ price: { id: "price_shed_new" } }] },
  payment_intent: { id: "pi_1", metadata: {}, latest_charge: charge() },
  ...overrides,
});

const evaluate = (s: SessionFacts, mode: "test" | "live" = "test", now = NOW) =>
  evaluateEligibility(s, { now, mode, catalog });

describe("evaluateEligibility", () => {
  it("grants a recent, paid, matched purchase this mode's files", () => {
    const result = evaluate(session());
    expect(result).toMatchObject({ eligible: true, plan: { slug: "shed" } });
    if (result.eligible) {
      expect(result.files.map((f) => f.pathname)).toEqual(["test/shed/placeholder.pdf"]);
    }
  });

  it("still grants a purchase made under a price that has since been replaced", () => {
    const result = evaluate(session({ line_items: { data: [{ price: { id: "price_shed_old" } }] } }));
    expect(result).toMatchObject({ eligible: true, plan: { slug: "shed" } });
  });

  it("is eligible at exactly 30 days and expired one second later", () => {
    const created = Math.floor(NOW / 1000) - ACCESS_WINDOW_MS / 1000;
    expect(evaluate(session({ created }))).toMatchObject({ eligible: true });
    expect(evaluate(session({ created }), "test", NOW + 1000)).toEqual({ eligible: false, reason: "expired" });
  });

  it("reports an unpaid (delayed method) session as processing", () => {
    expect(evaluate(session({ payment_status: "unpaid" }))).toEqual({ eligible: false, reason: "processing" });
  });

  it("does not treat no_payment_required as paid", () => {
    expect(evaluate(session({ payment_status: "no_payment_required" }))).toEqual({
      eligible: false,
      reason: "unknown_purchase",
    });
  });

  it("revokes a fully refunded purchase", () => {
    const pi = { id: "pi_1", metadata: {}, latest_charge: charge({ amount_refunded: 2900, refunded: true }) };
    expect(evaluate(session({ payment_intent: pi }))).toEqual({ eligible: false, reason: "refunded" });
  });

  it("keeps access after a partial refund", () => {
    const pi = { id: "pi_1", metadata: {}, latest_charge: charge({ amount_refunded: 500 }) };
    expect(evaluate(session({ payment_intent: pi }))).toMatchObject({ eligible: true });
  });

  it("revokes a disputed purchase", () => {
    const pi = { id: "pi_1", metadata: {}, latest_charge: charge({ disputed: true }) };
    expect(evaluate(session({ payment_intent: pi }))).toEqual({ eligible: false, reason: "disputed" });
  });

  it("fails closed when refund state cannot be read (charge not expanded)", () => {
    const pi = { id: "pi_1", metadata: {}, latest_charge: "ch_123" };
    expect(evaluate(session({ payment_intent: pi }))).toEqual({ eligible: false, reason: "unknown_purchase" });
    expect(evaluate(session({ payment_intent: null }))).toEqual({ eligible: false, reason: "unknown_purchase" });
  });

  it("reports a price no plan accepts as an unknown purchase", () => {
    expect(evaluate(session({ line_items: { data: [{ price: { id: "price_other" } }] } }))).toEqual({
      eligible: false,
      reason: "unknown_purchase",
    });
  });

  it("only sells one plan per session", () => {
    const none = session({ line_items: { data: [] } });
    const two = session({
      line_items: { data: [{ price: { id: "price_shed_new" } }, { price: { id: "price_coop" } }] },
    });
    const missing = session({ line_items: undefined });
    expect(evaluate(none)).toEqual({ eligible: false, reason: "unknown_purchase" });
    expect(evaluate(two)).toEqual({ eligible: false, reason: "unknown_purchase" });
    expect(evaluate(missing)).toEqual({ eligible: false, reason: "unknown_purchase" });
  });

  it("picks files by the price paid, not by session metadata", () => {
    const tampered = session({ metadata: { slug: "coop" } });
    const result = evaluate(tampered);
    expect(result).toMatchObject({ eligible: true, plan: { slug: "shed" } });
  });

  it("never returns live files to a test-mode session", () => {
    const result = evaluate(session());
    if (!result.eligible) throw new Error("expected eligible");
    for (const file of result.files) expect(file.pathname.startsWith("live/")).toBe(false);
  });

  it("resolves live purchases against live prices only", () => {
    const live = session({ id: "cs_live_abc", line_items: { data: [{ price: { id: "price_shed_live" } }] } });
    expect(evaluate(live, "live")).toMatchObject({ eligible: true, plan: { slug: "shed" } });
    expect(evaluate(session(), "live")).toEqual({ eligible: false, reason: "unknown_purchase" });
  });
});

describe("isValidSessionId", () => {
  it("accepts the active mode's prefix with a normal body", () => {
    expect(isValidSessionId("cs_test_a1B2c3", "test")).toBe(true);
    expect(isValidSessionId("cs_live_a1B2c3", "live")).toBe(true);
  });

  it("rejects the other mode's sessions before any Stripe call", () => {
    expect(isValidSessionId("cs_test_a1B2c3", "live")).toBe(false);
    expect(isValidSessionId("cs_live_a1B2c3", "test")).toBe(false);
  });

  it("rejects wrong prefixes and bad characters", () => {
    expect(isValidSessionId("pi_test_a1B2c3", "test")).toBe(false);
    expect(isValidSessionId("cs_test_", "test")).toBe(false);
    expect(isValidSessionId("cs_test_abc/../x", "test")).toBe(false);
    expect(isValidSessionId("cs_test_abc def", "test")).toBe(false);
    expect(isValidSessionId(null, "test")).toBe(false);
  });

  it("accepts longer IDs than today's, since Stripe may lengthen them", () => {
    expect(isValidSessionId(`cs_test_${"a".repeat(200)}`, "test")).toBe(true);
    expect(isValidSessionId(`cs_test_${"a".repeat(400)}`, "test")).toBe(false);
  });
});

describe("fulfillSession", () => {
  const paidSession = (piMetadata: Record<string, string> = {}): SessionFacts => ({
    ...session(),
    customer_details: { email: "buyer@example.com" },
    payment_intent: { id: "pi_1", metadata: piMetadata, latest_charge: charge() },
  });

  const harness = (s: SessionFacts, overrides: Partial<FulfillDeps> = {}) => {
    const calls = { sent: [] as unknown[], marked: [] as string[] };
    const deps: FulfillDeps = {
      retrieve: async () => s,
      sendEmail: async (email) => {
        calls.sent.push(email);
      },
      markFulfilled: async (paymentIntentId) => {
        calls.marked.push(paymentIntentId);
      },
      now: () => NOW,
      mode: "test",
      siteUrl: "https://masonstevens.dev",
      catalog,
      ...overrides,
    };
    return { deps, calls };
  };

  it("sends one email with an idempotency key and a thanks-page link, then marks it", async () => {
    const { deps, calls } = harness(paidSession());
    expect(await fulfillSession("cs_test_abc", deps)).toEqual({ kind: "sent" });
    expect(calls.sent).toEqual([
      {
        to: "buyer@example.com",
        planTitle: "shed",
        thanksUrl: "https://masonstevens.dev/plans/thanks?session_id=cs_test_abc",
        idempotencyKey: "plan-download/cs_test_abc",
      },
    ]);
    expect(calls.marked).toEqual(["pi_1"]);
  });

  it("never puts a signed file URL in the email", async () => {
    const { deps, calls } = harness(paidSession());
    await fulfillSession("cs_test_abc", deps);
    expect(JSON.stringify(calls.sent)).not.toMatch(/blob|presign|\.pdf/i);
  });

  it("does nothing for a session already marked fulfilled", async () => {
    const { deps, calls } = harness(paidSession({ fulfilled_at: "2026-11-03T00:00:00Z" }));
    expect(await fulfillSession("cs_test_abc", deps)).toEqual({ kind: "already_sent" });
    expect(calls.sent).toEqual([]);
  });

  it("waits on an unpaid session without asking for a retry", async () => {
    const { deps, calls } = harness({ ...paidSession(), payment_status: "unpaid" });
    expect(await fulfillSession("cs_test_abc", deps)).toEqual({ kind: "skipped", reason: "processing" });
    expect(calls.sent).toEqual([]);
  });

  it("sends nothing for refunded, disputed or unknown purchases", async () => {
    const refunded = { ...paidSession(), payment_intent: { id: "pi_1", metadata: {}, latest_charge: charge({ refunded: true, amount_refunded: 2900 }) } };
    const disputed = { ...paidSession(), payment_intent: { id: "pi_1", metadata: {}, latest_charge: charge({ disputed: true }) } };
    const unknown = { ...paidSession(), line_items: { data: [{ price: { id: "price_other" } }] } };
    for (const [s, reason] of [[refunded, "refunded"], [disputed, "disputed"], [unknown, "unknown_purchase"]] as const) {
      const { deps, calls } = harness(s);
      expect(await fulfillSession("cs_test_abc", deps)).toEqual({ kind: "skipped", reason });
      expect(calls.sent).toEqual([]);
    }
  });

  it("skips (and does not retry) a paid session with no email address", async () => {
    const { deps } = harness({ ...paidSession(), customer_details: null });
    expect(await fulfillSession("cs_test_abc", deps)).toEqual({ kind: "skipped", reason: "no_email" });
  });

  it("leaves the session unmarked and retryable when sending fails", async () => {
    const { deps, calls } = harness(paidSession(), {
      sendEmail: async () => {
        throw new Error("resend down");
      },
    });
    await expect(fulfillSession("cs_test_abc", deps)).rejects.toThrow("resend down");
    expect(calls.marked).toEqual([]);
  });

  it("is retryable when marking fails after a send, and the retry reuses the same key", async () => {
    let failMark = true;
    const { deps, calls } = harness(paidSession(), {
      markFulfilled: async (id) => {
        if (failMark) throw new Error("stripe down");
        calls.marked.push(id);
      },
    });
    await expect(fulfillSession("cs_test_abc", deps)).rejects.toThrow("stripe down");
    failMark = false;
    await fulfillSession("cs_test_abc", deps);
    const keys = calls.sent.map((e) => (e as { idempotencyKey: string }).idempotencyKey);
    expect(keys).toEqual(["plan-download/cs_test_abc", "plan-download/cs_test_abc"]);
  });
});

describe("isHandledEvent", () => {
  it("handles only completed and async-succeeded checkout events", () => {
    expect(isHandledEvent("checkout.session.completed")).toBe(true);
    expect(isHandledEvent("checkout.session.async_payment_succeeded")).toBe(true);
    expect(isHandledEvent("checkout.session.expired")).toBe(false);
    expect(isHandledEvent("charge.refunded")).toBe(false);
  });
});
