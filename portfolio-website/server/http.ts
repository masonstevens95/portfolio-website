/*
  Small response and logging helpers shared by the api/ handlers.

  Logging rule: log identifiers and outcomes (session id, slug, reason),
  never raw Stripe payloads — they carry buyer names, emails and addresses.
*/

export const json = (status: number, body: unknown, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });

/**
 * Checkout Session ids are 30-day download credentials, so logs keep only
 * the mode prefix and last 6 characters: enough to find the session in the
 * Stripe Dashboard, useless as a token.
 */
export const redactId = (id: string | null | undefined): string | null => {
  if (!id) return null;
  const prefix = /^cs_(test|live)_/.exec(id)?.[0] ?? "";
  return `${prefix}…${id.slice(-6)}`;
};

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const log = (event: string, fields: Record<string, unknown> = {}): void => {
  console.log(JSON.stringify({ event, ...fields }));
};
