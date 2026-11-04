# Plans storefront runbook

How to take the `/plans` storefront from code to selling, and how to run it.
The plan behind it is
`docs/plans/2026-11-04-001-feat-plans-storefront-stripe-plan.md`.

**The rule that matters most:** don't add a **live** Price ID to
`portfolio-website/src/data/plans.ts` until every box in
[Pre-launch checklist](#pre-launch-checklist) is ticked.

---

## How it fits together

| Piece | Where | Job |
|---|---|---|
| Catalog | `portfolio-website/src/data/plans.ts` | Plans, prices (per mode), files (per mode). Shared by the site and the functions |
| `POST /api/checkout` | `portfolio-website/api/checkout.ts` | Turns a slug into a Stripe hosted Checkout URL, after checking that the Stripe price matches the catalog |
| `POST /api/stripe-webhook` | `portfolio-website/api/stripe-webhook.ts` | Verifies Stripe's signature and sends one download email |
| `GET /api/download` | `portfolio-website/api/download.ts` | Checks the purchase in Stripe and returns 10-minute signed links |
| `/plans/thanks` | `portfolio-website/src/pages/plans/PlanThanksPage.tsx` | Where buyers land after paying, and where the email links |

There's no database. Stripe is the record of every purchase.

---

## 1. Vercel prerequisites

- [ ] The project's **Root Directory** is `portfolio-website` (Settings → General). The `api/` folder must sit under it.
- [ ] The team plan is **Pro**. Hobby is non-commercial only, and selling plans is commercial use.
- [ ] **Deployment Protection** is on for Preview deployments (Settings → Deployment Protection). Previews run test-mode checkout, so keep them private.
- [ ] **Protection Bypass for Automation** is enabled. Copy the secret; Stripe uses it to reach previews (step 3).

## 2. Stripe setup (do it once in test mode, then again in live mode)

Test and live modes are separate worlds. Products, Prices, webhooks and keys all exist twice.

1. **Product per plan.**
   - Set its **tax code** to a digital-goods code from https://docs.stripe.com/tax/tax-codes?type=digital (not `txcd_10000000` for US sales).
2. **Price per plan.**
   - One-time, USD.
   - **Tax behavior: exclusive.**
   - Checkout refuses a price whose tax behavior isn't `exclusive`, or whose amount doesn't match the catalog's `price.amount`.
3. **Stripe Tax.**
   - Add the US state registrations where you have obligations.
   - Stripe only collects tax where you're registered.
4. **US-only enforcement.**
   - Block non-US buyers. A Radar rule works: `Block if :card_country: != 'US'`, or use whatever hosted Checkout currently offers for restricting billing country.
   - Verify it with a non-US test card (see the checklist).
5. **Settings → Emails.**
   - Turn on "Successful payments" receipts. Stripe sends the receipt; the site only sends the download link.
6. **Radar** is on (default).
7. **Restricted API key** (`rk_test_…` / `rk_live_…`) with only these permissions:
   - Checkout Sessions: **Write**
   - Prices: **Read**
   - Charges: **Read**
   - PaymentIntents: **Write** (the webhook stores `fulfilled_at` in PaymentIntent metadata)
8. **Webhook endpoint** subscribed to exactly two events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`

   URLs:
   - **Live:** `https://masonstevens.dev/api/stripe-webhook`
   - **Test:** a stable preview branch alias plus the bypass secret:
     `https://<project>-git-<branch>-<team>.vercel.app/api/stripe-webhook?x-vercel-protection-bypass=<secret>`

   Copy each endpoint's signing secret (`whsec_…`).

## 3. Vercel environment variables

Set these **as pairs per environment**. The build fails if `VITE_STRIPE_MODE` disagrees with the key's mode.

| Variable | Production | Preview / Development |
|---|---|---|
| `STRIPE_SECRET_KEY` | `rk_live_…` | `rk_test_…` |
| `VITE_STRIPE_MODE` | `live` | `test` |
| `STRIPE_WEBHOOK_SECRET` | live endpoint's `whsec_…` | test endpoint's `whsec_…` |
| `SITE_URL` | `https://masonstevens.dev` | *(unset: previews use their branch URL)* |
| `RESEND_API_KEY` | Resend key | Resend key |
| `EMAIL_FROM` | `Mason Stevens <plans@masonstevens.dev>` | same |

The Blob store needs no variable on Vercel, because it authenticates by OIDC once connected (next step).

## 4. Private Blob store and files

1. Storage → Create → Blob.
   - Access: **private**. This can't be changed after creation, so make a dedicated store.
   - Connect it to this project.
2. Upload files to exactly the pathnames in the catalog:
   - **Live:** the real plan set (e.g. `live/tool-cage/tool-cage-plans.pdf`, `live/tool-cage/tool-cage.skp`).
   - **Test:** a **placeholder** PDF (e.g. `test/tool-cage/placeholder.pdf`). Never upload real plans under `test/`. A test-card purchase on a preview can download whatever is there.

## 5. Resend

- [ ] Add and verify `masonstevens.dev` as a sending domain (DNS records).
- [ ] Create an API key with sending access.

## 6. Rate limits

In Vercel → Firewall, add a rate-limit rule for `/api/checkout` and `/api/download`. Something like 20 requests per minute per IP is plenty for a person and stops card-testing and enumeration.

## 7. Put the plan on sale

In `portfolio-website/src/data/plans.ts`, for the plan:

- `modes.test.currentPriceId` = the test Price ID, also added to `modes.test.acceptedPriceIds`
- after the checklist passes: `modes.live.currentPriceId` = the live Price ID, also added to `modes.live.acceptedPriceIds`
- `price.amount` must equal the Stripe Price's amount in cents

`npm test` enforces the catalog invariants: unique IDs, current inside accepted, files present, test and live files distinct.

---

## Pre-launch checklist

Run all of these on the preview branch alias in test mode before adding any live Price ID.

- [ ] `/plans` and `/plans/<slug>` show the price "plus tax" and a Buy button.
- [ ] Buy opens Stripe Checkout with the right product, pre-tax price and a tax line.
- [ ] Cancel returns to the plan page. Browser Back from Checkout leaves Buy usable.
- [ ] Pay with `4242 4242 4242 4242`. `/plans/thanks` shows links to the **placeholder** file.
- [ ] Exactly one email arrives from the production sender, linking back to `/plans/thanks`.
- [ ] `stripe events resend <evt_id>` produces **no** second email.
- [ ] After 10 minutes the links show as expired, and **Refresh links** issues working ones.
- [ ] Opening a signed URL after it expires fails. The raw Blob URL without a signature fails.
- [ ] Refund the test payment. The thanks page now says refunded.
- [ ] A non-US test card is blocked.
- [ ] WAF rate-limit rules are active.
- [ ] Vercel logs show `checkout.created`, `webhook.fulfilled` and `download.issued`, with no buyer emails or addresses in the log lines.

---

## Operating it

**Repricing.** Stripe Prices can't be edited.
1. Create a new Price.
2. Add the old ID to `acceptedPriceIds`, so past buyers keep access.
3. Set `currentPriceId` to the new one and update `price.amount`.

**Retiring a plan.** Set `listed: false`. Never delete an entry that has sold, or its buyers' links stop working.

**A buyer lost their email.** Find the payment by email in the Stripe Dashboard and open its Checkout Session. Send them `https://masonstevens.dev/plans/thanks?session_id=<cs_live_…>`. Access lasts 30 days from purchase.

**Refunds and disputes.** Refund in the Dashboard as usual. Fully refunded or disputed purchases stop issuing links automatically. Partial refunds keep access.

**Something's wrong at checkout.** Search the Vercel logs for `checkout.refused`:
- `price_mismatch`: the Stripe Price's amount, currency, tax behavior or active flag doesn't match the catalog.
- `mode_mismatch`: the plan has a Price ID only for the other mode.
- `not_for_sale`: no current Price ID for this mode.

**Webhook failures.** Stripe Dashboard → Webhooks shows failed deliveries, and Stripe retries for 3 days. Search the Vercel logs for `webhook.retryable_error`.

**Rotating keys.**
1. Create a new restricted key.
2. Update `STRIPE_SECRET_KEY` in Vercel and redeploy.
3. Delete the old key.

For webhook secrets, "Roll secret" on the endpoint, update `STRIPE_WEBHOOK_SECRET`, then redeploy.

**Known accepted risks.**
- A forwarded `/plans/thanks` link works for its 30 days.
- If marking a session fulfilled keeps failing for over 24 hours, a late Stripe retry can send a second email.
