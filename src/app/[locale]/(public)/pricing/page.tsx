import type { Metadata } from "next";
import PricingPageClient from "@/components/pricing/pricing-page-client";

const BASE_URL = "https://tibyaan.com";

const pricingMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "قیمتیں — سستے آن لائن قرآن کورسز",
    description:
      "تبیان اکیڈمی کی قیمتیں دیکھیں — $8 ماہانہ سے شروع۔ لائیو ٹیچر + AI پلان۔ فیملی ڈسکاؤنٹ۔ 7 دن فری ٹرائل۔",
  },
  ar: {
    title: "الأسعار — دورات قرآنية بأسعار معقولة",
    description:
      "تصفح أسعار أكاديمية تبيان — تبدأ من 8 دولار شهرياً. معلم مباشر + خطة ذكاء اصطناعي. خصم عائلي. تجربة مجانية 7 أيام.",
  },
  en: {
    title: "Pricing — Affordable Online Quran Courses",
    description:
      "View Tibyaan Academy pricing — plans from $8/month. Live Teacher + AI plans. Family discount. 7-day free trial.",
  },
  fr: {
    title: "Tarifs — Cours de Coran en Ligne Abordables",
    description:
      "Découvrez les tarifs de Tibyaan Academy — à partir de 8$/mois. Enseignant en direct + plans IA. Réduction familiale. Essai gratuit 7 jours.",
  },
  id: {
    title: "Harga — Kursus Quran Online Terjangkau",
    description:
      "Lihat harga Tibyaan Academy — mulai dari $8/bulan. Guru langsung + paket AI. Diskon keluarga. Uji coba gratis 7 hari.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = pricingMeta[locale] || pricingMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/pricing`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/pricing`,
    },
  };
}

export default function PricingPage() {
  return <PricingPageClient />;
}
