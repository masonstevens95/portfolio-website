/*
  Short-lived signed GET URLs for plan files in the private Blob store.

  Each file gets its own delegation token scoped to that one pathname and
  the `get` operation, so a leaked URL cannot be widened to other files or
  replayed after it expires.

  Auth: on Vercel the SDK uses the deployment's OIDC token plus the
  connected store (no static secret in env). Locally, `vercel env pull`
  provides the same.
*/

import { issueSignedToken, presignUrl } from "@vercel/blob";
import type { PlanFile } from "../src/data/plans.js";
import { DOWNLOAD_URL_TTL_MS } from "../src/data/purchase.js";

export interface SignedFile {
  label: string;
  url: string;
}

export const signFiles = async (
  files: PlanFile[],
  now: number = Date.now()
): Promise<{ files: SignedFile[]; expiresAt: number }> => {
  const validUntil = now + DOWNLOAD_URL_TTL_MS;

  const signed = await Promise.all(
    files.map(async ({ label, pathname }) => {
      const token = await issueSignedToken({ pathname, operations: ["get"], validUntil });
      const { presignedUrl } = await presignUrl(token, {
        operation: "get",
        pathname,
        access: "private",
        validUntil,
      });
      return { label, url: presignedUrl };
    })
  );

  return { files: signed, expiresAt: validUntil };
};
