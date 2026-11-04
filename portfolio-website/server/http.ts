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

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const log = (event: string, fields: Record<string, unknown> = {}): void => {
  console.log(JSON.stringify({ event, ...fields }));
};
