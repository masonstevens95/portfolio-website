/*
  PlanThanksPage — /plans/thanks?session_id=cs_...

  Where Stripe sends the buyer after paying, and where the emailed link
  points. It asks /api/download for this purchase's files and explains every
  outcome (see the state table in the plan, U5).

  The session id is a bearer token for 30 days, so it is read once and then
  stripped from the address bar, the page loads nothing third-party, and the
  route is served with Referrer-Policy: no-referrer (vercel.json).

  Signed links last about 10 minutes. When they lapse the list is marked
  expired and Refresh fetches fresh ones; the buyer never lands on a raw
  storage error from this page.
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProjectPageTemplate } from "../ProjectPageTemplate";
import { Label } from "../../components/broadside";
import { CONTACT_EMAIL } from "../../data/site";

type Status =
  | "loading"
  | "eligible"
  | "processing"
  | "expired"
  | "refunded"
  | "disputed"
  | "unknown_purchase"
  | "not_found"
  | "error";

interface Download {
  status: Status;
  plan?: { title: string; slug: string };
  files?: { label: string; url: string }[];
  expiresAt?: number;
}

const KNOWN: Status[] = ["eligible", "processing", "expired", "refunded", "disputed", "unknown_purchase", "not_found", "error"];

const COPY: Record<Exclude<Status, "eligible">, { heading: string; body: string }> = {
  loading: { heading: "Retrieving your plan", body: "One moment." },
  processing: {
    heading: "Payment still settling",
    body: "Your payment hasn't cleared yet. This page and your email will have the files as soon as it does.",
  },
  expired: {
    heading: "This link has expired",
    body: "Downloads are open for 30 days after purchase. Write to me and I'll sort it out.",
  },
  refunded: {
    heading: "This purchase was refunded",
    body: "Refunded purchases no longer include downloads. If that's a mistake, write to me.",
  },
  disputed: {
    heading: "This purchase is under dispute",
    body: "Downloads are paused while the payment is disputed. Write to me if you have questions.",
  },
  unknown_purchase: {
    heading: "We couldn't match this purchase",
    body: "Your payment went through, but it isn't matching a plan on our side. Write to me with your receipt and I'll send the files.",
  },
  not_found: {
    heading: "We couldn't find that purchase",
    body: "The link may be incomplete. Use the link in your purchase email, or write to me.",
  },
  error: {
    heading: "Something went wrong on our side",
    body: "Your purchase is safe. Try again in a moment.",
  },
};

const readSessionId = (): string | null => new URLSearchParams(window.location.search).get("session_id");

const ContactLink = () => (
  <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Plan purchase")}`} className="label underline">
    Write to me &rarr;
  </a>
);

export const PlanThanksPage = () => {
  const [sessionId] = useState(readSessionId);
  const [data, setData] = useState<Download>({ status: sessionId ? "loading" : "not_found" });
  const [linksExpired, setLinksExpired] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Strip the bearer token from the address bar once it has been read.
  useEffect(() => {
    if (sessionId) window.history.replaceState(window.history.state, "", window.location.pathname);
  }, [sessionId]);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setData((d) => (d.status === "eligible" ? d : { status: "loading" }));
    try {
      const response = await fetch(`/api/download?session_id=${encodeURIComponent(sessionId)}`, {
        cache: "no-store",
      });
      const body = (await response.json().catch(() => null)) as Download | null;
      setData(body && KNOWN.includes(body.status) ? body : { status: "error" });
      setLinksExpired(false);
    } catch {
      setData({ status: "error" });
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  // Mark the list stale when the signed URLs lapse.
  useEffect(() => {
    if (data.status !== "eligible" || !data.expiresAt) return;
    const ms = data.expiresAt - Date.now();
    if (ms <= 0) {
      setLinksExpired(true);
      return;
    }
    const timer = window.setTimeout(() => setLinksExpired(true), ms);
    return () => window.clearTimeout(timer);
  }, [data]);

  // Move focus to the status heading whenever the outcome changes.
  useEffect(() => {
    if (data.status !== "loading") headingRef.current?.focus();
  }, [data.status]);

  const eligible = data.status === "eligible";
  const copy = eligible ? null : COPY[data.status];

  return (
    <ProjectPageTemplate title="Your plans" subtitle="Purchase" backTo="/plans" backLabel="All Plans">
      <section aria-live="polite" className="ink-frame p-5 flex flex-col gap-4" style={{ maxWidth: "640px" }}>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="display m-0"
          style={{ fontSize: "clamp(22px, 3.4vw, 30px)" }}
        >
          {eligible ? data.plan?.title : copy!.heading}
        </h2>

        {eligible ? (
          <>
            <p className="m-0 copy">
              Thank you. Your files are below, and a link back to this page is on its way to your
              email.
            </p>

            <Label as="p" className="m-0">
              {linksExpired ? "These links have expired — refresh for new ones" : "Links expire in 10 minutes"}
            </Label>

            <ul className="list-none m-0 p-0 flex flex-col gap-2">
              {data.files?.map((file) => (
                <li key={file.label}>
                  {linksExpired ? (
                    <span className="display" style={{ fontSize: "18px", opacity: 0.4 }}>
                      {file.label}
                    </span>
                  ) : (
                    <a
                      href={file.url}
                      className="display underline inline-block py-2"
                      style={{ fontSize: "18px" }}
                    >
                      Download {file.label} &darr;
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <button type="button" onClick={load} className="label underline self-start py-2">
              Refresh links
            </button>
          </>
        ) : (
          <>
            <p className="m-0 copy">{copy!.body}</p>
            {data.status === "processing" || data.status === "error" ? (
              <button type="button" onClick={load} className="label underline self-start py-2">
                {data.status === "error" ? "Try again" : "Refresh"}
              </button>
            ) : data.status === "loading" || data.status === "not_found" ? null : (
              <ContactLink />
            )}
          </>
        )}
      </section>

      <nav className="flex gap-6" aria-label="Leave this page">
        <Link to="/plans" className="label underline">
          All Plans
        </Link>
        <Link to="/" className="label underline">
          Home
        </Link>
      </nav>
    </ProjectPageTemplate>
  );
};
