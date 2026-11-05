/*
  Handler-level test for api/stripe-webhook.ts. Lives in server/ because
  every file under api/ is deployed by Vercel as a public function.

  Real Stripe signature verification (no network), real Stripe signature verification (no network),
  stubbed Stripe API calls and email send. Proves the status-code contract
  Stripe's retry behaviour depends on.
*/

import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import Stripe from "stripe";
import { plans, type Plan } from "../src/data/plans.js";

const SECRET = "whsec_test_secret";
const retrieve = vi.fn();
const update = vi.fn();
const sendDownloadEmail = vi.fn();

vi.mock("./stripe.js", async () => {
  const { default: RealStripe } = await import("stripe");
  const real = new RealStripe("sk_test_dummy");
  return {
    getStripe: () => ({
      webhooks: real.webhooks,
      checkout: { sessions: { retrieve } },
      paymentIntents: { update },
    }),
  };
});
vi.mock("./email.js", () => ({ sendDownloadEmail }));

const { POST } = await import("../api/stripe-webhook.js");

const fixturePlan: Plan = {
  slug: "webhook-fixture",
  title: "Webhook Fixture",
  listed: false,
  summary: "",
  description: "",
  format: "PDF",
  plates: [],
  included: [],
  cutList: [],
  price: { amount: 1000, currency: "usd" },
  modes: {
    test: { currentPriceId: "price_wh", acceptedPriceIds: ["price_wh"], files: [{ label: "x", pathname: "test/x.pdf" }] },
    live: { acceptedPriceIds: [], files: [] },
  },
};

const signer = new Stripe("sk_test_dummy");

const deliver = (type: string, sig?: string) => {
  const payload = JSON.stringify({ id: "evt_1", object: "event", type, data: { object: { id: "cs_test_abc" } } });
  const header = sig ?? signer.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  return POST(new Request("http://x/api/stripe-webhook", { method: "POST", body: payload, headers: { "stripe-signature": header } }));
};

const paidSession = (priceId = "price_wh") => ({
  id: "cs_test_abc",
  created: Math.floor(Date.now() / 1000) - 60,
  payment_status: "paid",
  customer_details: { email: "buyer@example.com" },
  line_items: { data: [{ price: { id: priceId } }] },
  payment_intent: {
    id: "pi_1",
    status: "succeeded",
    metadata: {},
    latest_charge: { amount: 1000, amount_refunded: 0, refunded: false, disputed: false },
  },
});

beforeAll(() => {
  plans.push(fixturePlan);
});

beforeEach(() => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("EMAIL_FROM", "plans@example.com");
  vi.stubEnv("VERCEL_ENV", "");
  retrieve.mockReset();
  update.mockReset().mockResolvedValue({});
  sendDownloadEmail.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("POST /api/stripe-webhook", () => {
  it("rejects a bad signature with 400 and touches nothing", async () => {
    const res = await deliver("checkout.session.completed", "t=1,v1=bad");
    expect(res.status).toBe(400);
    expect(retrieve).not.toHaveBeenCalled();
    expect(sendDownloadEmail).not.toHaveBeenCalled();
  });

  it("acknowledges unhandled event types without fulfilling", async () => {
    const res = await deliver("customer.created");
    expect(res.status).toBe(200);
    expect(retrieve).not.toHaveBeenCalled();
  });

  it("sends one email and marks the payment for a paid, matched session", async () => {
    retrieve.mockResolvedValue(paidSession());
    const res = await deliver("checkout.session.completed");
    expect(res.status).toBe(200);
    expect(sendDownloadEmail).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith("pi_1", { metadata: { fulfilled_at: expect.any(String) } });
  });

  it("returns 500 (so Stripe retries) when a paid session matches no plan", async () => {
    retrieve.mockResolvedValue(paidSession("price_unknown"));
    const res = await deliver("checkout.session.completed");
    expect(res.status).toBe(500);
    expect(sendDownloadEmail).not.toHaveBeenCalled();
  });

  it("returns 500 when the email send fails, and does not mark the payment", async () => {
    retrieve.mockResolvedValue(paidSession());
    sendDownloadEmail.mockRejectedValue(new Error("Resend down"));
    const res = await deliver("checkout.session.async_payment_succeeded");
    expect(res.status).toBe(500);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns 500 when Stripe is unreachable", async () => {
    retrieve.mockRejectedValue(new Error("ECONNRESET"));
    const res = await deliver("checkout.session.completed");
    expect(res.status).toBe(500);
  });

  it("logs only redacted session ids", async () => {
    retrieve.mockResolvedValue(paidSession());
    await deliver("checkout.session.completed");
    const lines = (console.log as unknown as { mock: { calls: string[][] } }).mock.calls.map((c) => c[0]).join("\n");
    expect(lines).not.toContain("cs_test_abc");
  });
});
