"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";

const languages = [
  { value: "ur", label: "اردو" },
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "id", label: "Indonesia" },
];

const socials = [
  { name: "YouTube", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "Facebook", href: "#" },
  { name: "WhatsApp", href: "#" },
];

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo + Tagline */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold">Tibyaan</div>
            <div className="text-sm opacity-80">Academy</div>
            <p className="mt-3 text-sm opacity-70">{t("tagline")}</p>

            {/* Social Links */}
            <div className="mt-4 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("courses")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">{t("legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4 className="font-semibold mb-3">{t("languages")}</h4>
            <ul className="space-y-2 text-sm">
              {languages.map((lang) => (
                <li key={lang.value}>
                  <button
                    onClick={() => router.replace(pathname, { locale: lang.value })}
                    className={`opacity-70 hover:opacity-100 transition-opacity ${
                      locale === lang.value ? "font-semibold opacity-100" : ""
                    }`}
                  >
                    {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm opacity-60">
          <p>
            &copy; {new Date().getFullYear()} {tc("appName")}. {t("rights")}
          </p>
          <p>{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
