/*
  GET /api/download?session_id=cs_...  →  { status, plan?, files?, expiresAt? }

  Called by /plans/thanks on load and on "Refresh links". Retrieves the
  Checkout Session from Stripe (the only record of the purchase), runs the
  shared eligibility decision, and on success returns ~10-minute signed URLs
  for this mode's files.

  The session id is effectively a bearer token, so: shape-checked against
  the active mode before any Stripe call, never cached (no-store), and the
  page that calls this is served with Referrer-Policy: no-referrer.
*/

import { loadStripeConfig } from "../server/config.js";
import { getStripe } from "../server/stripe.js";
import { evaluateEligibility, isValidSessionId, SESSION_EXPAND, type SessionFacts } from "../server/fulfillment.js";
import { signFiles } from "../server/blob.js";
import { json, log } from "../server/http.js";

export async function GET(request: Request): Promise<Response> {
  const sessionId = new URL(request.url).searchParams.get("session_id");

  try {
    const config = loadStripeConfig();
    if (!isValidSessionId(sessionId, config.mode)) return json(404, { status: "not_found" });

    const stripe = getStripe(config.secretKey);
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, { expand: SESSION_EXPAND });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) return json(404, { status: "not_found" });
      throw error;
    }

    const result = evaluateEligibility(session satisfies SessionFacts, {
      now: Date.now(),
      mode: config.mode,
    });

    if (!result.eligible) {
      log("download.ineligible", { sessionId, reason: result.reason });
      return json(200, { status: result.reason });
    }

    const { files, expiresAt } = await signFiles(result.files);
    log("download.issued", { sessionId, slug: result.plan.slug, files: files.length });
    return json(200, { status: "eligible", plan: { title: result.plan.title, slug: result.plan.slug }, files, expiresAt });
  } catch (error) {
    log("download.error", { sessionId, message: error instanceof Error ? error.message : String(error) });
    return json(500, { status: "error" });
  }
}
