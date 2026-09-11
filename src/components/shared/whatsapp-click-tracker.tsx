"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { trackWhatsAppClick } from "@/lib/analytics";

/**
 * Fires `whatsapp_click` for every WhatsApp button or link on the site.
 *
 * A single delegated listener rather than an onClick on each element: several
 * WhatsApp links (contact, FAQ, about, footer) live in server components where
 * a handler cannot be attached, and this way a new link added anywhere is
 * tracked automatically.
 */
export function WhatsAppClickTracker() {
  const locale = useLocale();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.(
        'a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="web.whatsapp.com"], [data-whatsapp]'
      );
      if (!link) return;
      trackWhatsAppClick(locale, window.location.pathname);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [locale]);

  return null;
}
