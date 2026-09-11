export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "Tibyaan Academy";

/**
 * The one real mailbox. Used as the support address shown to users, the
 * recipient of admin notifications, and the From: on outgoing mail.
 * The old @tibyaan.com addresses were never real inboxes.
 */
export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL ?? "academytibyaan@gmail.com";

/** From: header for transactional mail, e.g. `Tibyaan Academy <...>`. */
export const MAIL_FROM = `${SITE_NAME} <${SUPPORT_EMAIL}>`;

/** @deprecated use SUPPORT_EMAIL */
export const ADMIN_EMAIL = SUPPORT_EMAIL;
export const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP ?? "+923129114002";

export const SITE_LOCALES = ["ur", "ar", "en", "fr", "id"] as const;
export const DEFAULT_LOCALE = "ur";

/** Absolute URL for a locale-prefixed path, e.g. absoluteUrl("en", "/pricing"). */
export function absoluteUrl(locale: string, path = ""): string {
  return `${SITE_URL}/${locale}${path}`;
}

/**
 * hreflang map for a page: every locale version of the same path,
 * plus an x-default pointing at the site's default locale.
 */
export function localeAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of SITE_LOCALES) {
    languages[locale] = absoluteUrl(locale, path);
  }
  languages["x-default"] = absoluteUrl(DEFAULT_LOCALE, path);
  return languages;
}

export function isSiteLocale(locale: string): boolean {
  return (SITE_LOCALES as readonly string[]).includes(locale);
}

/**
 * Ready-made `alternates` block: self-referencing canonical + hreflang map.
 *
 * An unknown locale segment is a 404 (e.g. /uk, whose real page is /en/uk).
 * Returning an empty block there keeps the 404 from advertising itself to
 * Google with a self-canonical and a full hreflang set.
 */
export function localeMetadataAlternates(locale: string, path = "") {
  if (!isSiteLocale(locale)) return {};
  return {
    canonical: absoluteUrl(locale, path),
    languages: localeAlternates(path),
  };
}
