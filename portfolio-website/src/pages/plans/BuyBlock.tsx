/*
  BuyBlock

  The plan's title block for purchase: price (pre-tax, labelled), format,
  and the Buy action. Coming-soon plans keep the block but replace the action
  with a note, never a disabled button that looks clickable.

  Buy is disabled while a session is being created so a double click cannot
  open two sessions. It re-enables on failure, and on `pageshow` so that
  coming Back from Stripe (bfcache restores the pending state) does not
  leave it stuck. Cancelling at Stripe returns here with no banner.
*/

import { useEffect, useState } from "react";
import { formatPrice, type Plan } from "../../data/plans";
import { startCheckout } from "../../data/checkoutClient";
import { ComingSoonNote } from "./ComingSoonNote";

interface Props {
  plan: Plan;
  buyable: boolean;
}

export const BuyBlock = ({ plan, buyable }: Props) => {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reset = () => setPending(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const buy = async () => {
    if (pending) return;
    setPending(true);
    setFailed(false);

    const result = await startCheckout(plan.slug);
    if (result.ok) {
      window.location.assign(result.url);
      return;
    }
    setPending(false);
    setFailed(true);
  };

  return (
    <div className="ink-frame-top pt-3 flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="display" style={{ fontSize: "28px", lineHeight: 1 }}>
          {buyable ? formatPrice(plan.price) : "Coming soon"}
        </span>
        {buyable && <span className="label">plus tax</span>}
      </div>
      <p className="label m-0" style={{ letterSpacing: "0.1em" }}>
        {plan.format}
      </p>

      {buyable ? (
        <>
          <button
            type="button"
            onClick={buy}
            disabled={pending}
            aria-busy={pending}
            className="display ink-frame px-5 py-3 text-left hover:underline disabled:no-underline"
            style={{
              fontSize: "18px",
              minHeight: "48px",
              background: "var(--stock)",
              color: "var(--ink)",
              opacity: pending ? 0.6 : 1,
              cursor: pending ? "progress" : "pointer",
            }}
          >
            {pending ? "Opening checkout…" : "Buy the plans →"}
          </button>

          <p role="status" aria-live="polite" className="m-0" style={{ fontSize: "14px", minHeight: "1em" }}>
            {failed && "Checkout didn't open. Nothing was charged. Try again in a moment."}
          </p>

          <p className="m-0" style={{ fontSize: "13px", lineHeight: 1.5, opacity: 0.75 }}>
            Secure checkout by Stripe. US buyers only for now. Download links arrive on the next
            page and by email.
          </p>
        </>
      ) : (
        <ComingSoonNote planTitle={plan.title} />
      )}
    </div>
  );
};
