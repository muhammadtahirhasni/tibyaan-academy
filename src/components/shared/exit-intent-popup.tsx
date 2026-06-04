"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { X } from "lucide-react";

const content = {
  en: {
    heading: "Wait! Before you go...",
    subheading: "Get 5 days of free Quran classes — no credit card needed",
    button: "Start Free Trial",
  },
  ur: {
    heading: "رکیں! جانے سے پہلے...",
    subheading: "5 دن مفت قرآن کلاسز پائیں — کوئی کریڈٹ کارڈ ضروری نہیں",
    button: "مفت ٹرائل شروع کریں",
  },
  ar: {
    heading: "انتظر! قبل أن تغادر...",
    subheading: "احصل على 5 أيام مجانية من دروس القرآن — دون بطاقة ائتمان",
    button: "ابدأ التجربة المجانية",
  },
  fr: {
    heading: "Attendez! Avant de partir...",
    subheading: "Obtenez 5 jours de cours de Coran gratuits — aucune carte de crédit",
    button: "Commencer l'essai gratuit",
  },
  id: {
    heading: "Tunggu! Sebelum pergi...",
    subheading: "Dapatkan 5 hari kelas Quran gratis — tidak perlu kartu kredit",
    button: "Mulai Uji Coba Gratis",
  },
};

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();

  const isAuthPage = pathname.includes("/login") || pathname.includes("/signup");

  useEffect(() => {
    if (isAuthPage) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("exit_intent_shown")) return;

    // Mobile check
    if (window.innerWidth < 768) return;

    let timer: ReturnType<typeof setTimeout>;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        timer = setTimeout(() => {
          setVisible(true);
          sessionStorage.setItem("exit_intent_shown", "1");
        }, 2000);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [isAuthPage, pathname]);

  if (!visible || isAuthPage) return null;

  const t = content[(locale as keyof typeof content)] || content.en;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setVisible(false)}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl border shadow-2xl p-8 max-w-md w-full text-center">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-4xl mb-4">🕌</div>
        <h2 className="text-2xl font-bold text-foreground">{t.heading}</h2>
        <p className="mt-3 text-muted-foreground">{t.subheading}</p>

        <Link
          href="/signup"
          onClick={() => setVisible(false)}
          className="mt-6 inline-flex items-center justify-center w-full bg-[#1B4332] hover:bg-[#1B4332]/90 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          {t.button}
        </Link>

        <button
          onClick={() => setVisible(false)}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
