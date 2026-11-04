/*
  The one email a buyer gets: a durable link back to /plans/thanks, where
  fresh signed download links are issued on demand. Never a raw signed URL,
  which would be dead in ten minutes.

  Stripe sends the payment receipt; this is only the download pointer.
*/

import { Resend } from "resend";
import { CONTACT_EMAIL } from "../src/data/site.js";
import { ACCESS_WINDOW_DAYS } from "../src/data/purchase.js";
import type { EmailConfig } from "./config.js";
import type { DownloadEmail } from "./fulfillment.js";

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const renderDownloadEmail = ({ planTitle, thanksUrl }: Pick<DownloadEmail, "planTitle" | "thanksUrl">) => {
  const subject = `Your plans: ${planTitle}`;
  const text = [
    `Thanks for buying the ${planTitle} plans.`,
    ``,
    `Download them here:`,
    thanksUrl,
    ``,
    `That page issues fresh download links whenever you open it, for ${ACCESS_WINDOW_DAYS} days after purchase.`,
    `Reply to this email if anything goes wrong.`,
    ``,
    `Mason Stevens`,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#EEECE4;color:#17140F;font-family:Helvetica Neue,Arial,sans-serif;">
<p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#0E4A45;">Your plans</p>
<h1 style="margin:0 0 16px;font-size:24px;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(planTitle)}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Thanks for buying these plans. Your download page:</p>
<p style="margin:0 0 16px;"><a href="${escapeHtml(thanksUrl)}" style="color:#17140F;font-size:17px;">Download the ${escapeHtml(planTitle)} plans &rarr;</a></p>
<p style="margin:0 0 16px;font-size:13px;line-height:1.5;">That page issues fresh download links whenever you open it, for ${ACCESS_WINDOW_DAYS} days after purchase. Reply to this email if anything goes wrong.</p>
<p style="margin:0;font-size:13px;">Mason Stevens</p>
</body></html>`;

  return { subject, text, html };
};

let client: Resend | undefined;

const SEND_TIMEOUT_MS = 8000;

/** Rejects if the send hasn't settled in time, so the webhook returns 5xx and
 *  Stripe retries (the idempotency key dedupes a send that did land). */
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Resend send timed out after ${ms}ms`)), ms)),
  ]);

export const sendDownloadEmail = async (config: EmailConfig, email: DownloadEmail): Promise<void> => {
  client ??= new Resend(config.apiKey);
  const { subject, text, html } = renderDownloadEmail(email);

  const { error } = await withTimeout(
    client.emails.send(
      { from: config.from, to: email.to, replyTo: CONTACT_EMAIL, subject, text, html },
      { idempotencyKey: email.idempotencyKey }
    ),
    SEND_TIMEOUT_MS
  );

  // The same key is already being sent by a concurrent delivery: that send
  // owns it, so this one counts as done.
  if (error && error.name !== "concurrent_idempotent_requests") {
    throw new Error(`Resend ${error.name}: ${error.message}`);
  }
};
