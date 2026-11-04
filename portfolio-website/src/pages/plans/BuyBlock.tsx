/*
  BuyBlock

  The plan's title block for purchase: price (pre-tax, labelled), format,
  and the Buy action. Coming-soon plans keep the block but replace the action
  with a note, never a disabled button that looks clickable.
*/

import { formatPrice, type Plan } from "../../data/plans";
import { ComingSoonNote } from "./ComingSoonNote";

interface Props {
  plan: Plan;
  buyable: boolean;
}

export const BuyBlock = ({ plan, buyable }: Props) => (
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
      <button
        type="button"
        className="display ink-frame px-5 py-3 text-left hover:underline"
        style={{ fontSize: "18px", minHeight: "48px", background: "var(--stock)", color: "var(--ink)" }}
      >
        Buy the plans &rarr;
      </button>
    ) : (
      <ComingSoonNote planTitle={plan.title} />
    )}

    {buyable && (
      <p className="m-0" style={{ fontSize: "13px", lineHeight: 1.5, opacity: 0.75 }}>
        Secure checkout by Stripe. US buyers only for now. Download links arrive on the next
        page and by email.
      </p>
    )}
  </div>
);
