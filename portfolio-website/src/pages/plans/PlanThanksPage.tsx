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
import { mailtoContact } from "../../data/site";
import {
  ACCESS_WINDOW_DAYS,
  DOWNLOAD_LINK_MINUTES,
  DOWNLOAD_STATUSES,
  type DownloadResponse,
  type DownloadStatus,
} from "../../data/purchase";

type Status = "loading" | DownloadStatus;
type Action = "refresh" | "retry" | "contact" | null;

const OUTCOMES: Record<Exclude<Status, "eligible">, { heading: string; body: string; action: Action }> = {
  loading: { heading: "Retrieving your plan", body: "One moment.", action: null },
  processing: {
    heading: "Payment still settling",
    body: "Your payment hasn't cleared yet. This page and your email will have the files as soon as it does.",
    action: "refresh",
  },
  expired: {
    heading: "This link has expired",
    body: `Downloads are open for ${ACCESS_WINDOW_DAYS} days after purchase. Write to me and I'll sort it out.`,
    action: "contact",
  },
  refunded: {
    heading: "This purchase was refunded",
    body: "Refunded purchases no longer include downloads. If that's a mistake, write to me.",
    action: "contact",
  },
  disputed: {
    heading: "This purchase is under dispute",
    body: "Downloads are paused while the payment is disputed. Write to me if you have questions.",
    action: "contact",
  },
  unknown_purchase: {
    heading: "We couldn't match this purchase",
    body: "Your payment went through, but it isn't matching a plan on our side. Write to me with your receipt and I'll send the files.",
    action: "contact",
  },
  not_found: {
    heading: "We couldn't find that purchase",
    body: "The link may be incomplete. Use the link in your purchase email, or write to me.",
    action: null,
  },
  error: {
    heading: "Something went wrong on our side",
    body: "Your purchase is safe. Try again in a moment.",
    action: "retry",
  },
};

type PageData = Omit<DownloadResponse, "status"> & { status: Status };

const readSessionId = (): string | null => new URLSearchParams(window.location.search).get("session_id");

export const PlanThanksPage = () => {
  const [sessionId] = useState(readSessionId);
  const [data, setData] = useState<PageData>({ status: sessionId ? "loading" : "not_found" });
  /** The expiresAt of the link set that has lapsed; a fresh response clears it implicitly. */
  const [lapsedAt, setLapsedAt] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inFlight = useRef<AbortController | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Strip the bearer token from the address bar once it has been read.
  useEffect(() => {
    if (sessionId) window.history.replaceState(window.history.state, "", window.location.pathname);
  }, [sessionId]);

  // Each load supersedes the previous one, so a slow earlier response can
  // never overwrite a newer one.
  const load = useCallback(async () => {
    if (!sessionId) return;
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setRefreshing(true);
    setData((d) => (d.status === "eligible" ? d : { status: "loading" }));
    try {
      const response = await fetch(`/api/download?session_id=${encodeURIComponent(sessionId)}`, {
        cache: "no-store",
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      });
      const body = (await response.json().catch(() => null)) as DownloadResponse | null;
      if (controller.signal.aborted) return;
      setData(body && DOWNLOAD_STATUSES.includes(body.status) ? body : { status: "error" });
    } catch {
      if (controller.signal.aborted) return;
      setData({ status: "error" });
    } finally {
      if (inFlight.current === controller) setRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
    return () => inFlight.current?.abort();
  }, [load]);

  // Mark the list stale when the signed URLs lapse.
  const { expiresAt } = data;
  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setTimeout(() => setLapsedAt(expiresAt), Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [expiresAt]);
  const linksExpired = expiresAt !== undefined && lapsedAt === expiresAt;

  // Move focus to the status heading whenever the outcome changes.
  useEffect(() => {
    if (data.status !== "loading") headingRef.current?.focus();
  }, [data.status]);

  const outcome = data.status === "eligible" ? null : OUTCOMES[data.status];

  const actionButton = (label: string) => (
    <button
      type="button"
      onClick={load}
      disabled={refreshing}
      className="label underline self-start py-2"
      style={{ opacity: refreshing ? 0.5 : 1 }}
    >
      {label}
    </button>
  );

  return (
    <ProjectPageTemplate title="Your plans" subtitle="Purchase" backTo="/plans" backLabel="All Plans">
      <section aria-live="polite" className="ink-frame p-5 flex flex-col gap-4" style={{ maxWidth: "640px" }}>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="display m-0"
          style={{ fontSize: "clamp(22px, 3.4vw, 30px)" }}
        >
          {outcome ? outcome.heading : data.plan?.title}
        </h2>

        {outcome ? (
          <>
            <p className="m-0 copy">{outcome.body}</p>
            {outcome.action === "refresh" && actionButton("Refresh")}
            {outcome.action === "retry" && actionButton("Try again")}
            {outcome.action === "contact" && (
              <a href={mailtoContact("Plan purchase")} className="label underline">
                Write to me &rarr;
              </a>
            )}
          </>
        ) : (
          <>
            <p className="m-0 copy">
              Thank you. Your files are below, and a link back to this page is on its way to your
              email.
            </p>

            <Label as="p" className="m-0">
              {linksExpired
                ? "These links have expired — refresh for new ones"
                : `Links expire in ${DOWNLOAD_LINK_MINUTES} minutes`}
            </Label>

            <ul className="list-none m-0 p-0 flex flex-col gap-2">
              {data.files?.map((file) => (
                <li key={file.label}>
                  {linksExpired ? (
                    <span className="display" style={{ fontSize: "18px", opacity: 0.4 }}>
                      {file.label}
                    </span>
                  ) : (
                    <a href={file.url} className="display underline inline-block py-2" style={{ fontSize: "18px" }}>
                      Download {file.label} &darr;
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {actionButton("Refresh links")}
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
