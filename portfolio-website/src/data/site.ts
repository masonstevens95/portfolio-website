/*
  site.ts

  Site-wide constants shared by the home page and the plans storefront.
  Framework-free so server code can import it too.
*/

/** Public contact address, and the support reply-to for plan buyers. */
export const CONTACT_EMAIL = "mason.c.stevens@gmail.com";

export const mailtoContact = (subject?: string): string =>
  `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
