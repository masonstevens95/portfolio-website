/*
  POST /api/stripe-webhook

  Stripe → verify signature → (completed | async_payment_succeeded) →
  fulfillSession → one download email.

  The raw body is read with request.text() and verified before anything is
  parsed: a Web-standard handler never has its body pre-parsed by Vercel, so
  the signature check sees exactly the bytes Stripe signed.

  Responses:
    400  bad signature (no detail)
    200  handled, ignored event type, or expected ineligibility (logged)
    500  anything retryable — Stripe retries for up to 3 days

  Keep this fast: Checkout waits up to 10s on the webhook before
  redirecting the buyer.
*/

import { loadEmailConfig, loadStripeConfig } from "../server/config.js";
import { getStripe } from "../server/stripe.js";
import { fulfillSession, isHandledEvent, SESSION_EXPAND } from "../server/fulfillment.js";
import { sendDownloadEmail } from "../server/email.js";
import { json, log } from "../server/http.js";

export async function POST(request: Request): Promise<Response> {
  let config;
  try {
    config = loadStripeConfig();
  } catch (error) {
    log("webhook.config_error", { message: (error as Error).message });
    return json(500, { received: false });
  }

  const stripe = getStripe(config.secretKey);
  const raw = await request.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      raw,
      request.headers.get("stripe-signature") ?? "",
      config.webhookSecret
    );
  } catch {
    log("webhook.bad_signature");
    return json(400, { received: false });
  }

  if (!isHandledEvent(event.type)) return json(200, { received: true });

  const sessionId = (event.data.object as { id: string }).id;

  try {
    const emailConfig = loadEmailConfig();
    const outcome = await fulfillSession(sessionId, {
      retrieve: (id) => stripe.checkout.sessions.retrieve(id, { expand: SESSION_EXPAND }),
      sendEmail: (email) => sendDownloadEmail(emailConfig, email),
      markFulfilled: async (paymentIntentId) => {
        await stripe.paymentIntents.update(paymentIntentId, {
          metadata: { fulfilled_at: new Date().toISOString() },
        });
      },
      now: Date.now,
      mode: config.mode,
      siteUrl: config.siteUrl,
    });

    log("webhook.fulfilled", { eventId: event.id, type: event.type, sessionId, ...outcome });
    return json(200, { received: true });
  } catch (error) {
    log("webhook.retryable_error", {
      eventId: event.id,
      sessionId,
      message: error instanceof Error ? error.message : String(error),
    });
    return json(500, { received: false });
  }
}
