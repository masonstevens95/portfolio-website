import { describe, it, expect } from "vitest";
import { interpretCheckoutResponse } from "./checkoutClient";

describe("interpretCheckoutResponse", () => {
  it("accepts a Stripe checkout URL from a 2xx response", () => {
    expect(
      interpretCheckoutResponse(200, { url: "https://checkout.stripe.com/c/pay/cs_test_abc" })
    ).toEqual({ ok: true, url: "https://checkout.stripe.com/c/pay/cs_test_abc" });
  });

  it("treats any non-2xx response as a failure", () => {
    expect(interpretCheckoutResponse(409, { error: "nope" })).toEqual({ ok: false });
    expect(interpretCheckoutResponse(500, { url: "https://checkout.stripe.com/x" })).toEqual({ ok: false });
  });

  it("treats a malformed body as a failure", () => {
    expect(interpretCheckoutResponse(200, null)).toEqual({ ok: false });
    expect(interpretCheckoutResponse(200, "text")).toEqual({ ok: false });
    expect(interpretCheckoutResponse(200, { url: 42 })).toEqual({ ok: false });
    expect(interpretCheckoutResponse(200, { url: "not a url" })).toEqual({ ok: false });
  });

  it("refuses to redirect anywhere but Stripe's checkout origin", () => {
    expect(interpretCheckoutResponse(200, { url: "https://evil.example/pay" })).toEqual({ ok: false });
    expect(interpretCheckoutResponse(200, { url: "http://checkout.stripe.com/x" })).toEqual({ ok: false });
    expect(
      interpretCheckoutResponse(200, { url: "https://checkout.stripe.com.evil.example/x" })
    ).toEqual({ ok: false });
  });
});
