import type { Metadata } from "next";
import PricingPageClient from "@/components/pricing/pricing-page-client";

const BASE_URL = "https://tibyaan.com";

const pricingMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "قیمتیں — سستے آن لائن قرآن کورسز",
    description:
      "تبیان اکیڈمی کی قیمتیں دیکھیں — $33 ماہانہ سے شروع۔ لائیو ٹیچر + AI پلان۔ فیملی ڈسکاؤنٹ۔ 5 دن فری ٹرائل۔",
  },
  ar: {
    title: "الأسعار — دورات قرآنية بأسعار معقولة",
    description:
      "تصفح أسعار أكاديمية تبيان — تبدأ من 33 دولار شهرياً. معلم مباشر + خطة ذكاء اصطناعي. خصم عائلي. تجربة مجانية 5 أيام.",
  },
  en: {
    title: "Pricing — Affordable Online Quran Courses",
    description:
      "View Tibyaan Academy pricing — plans from $33/month. Live Teacher + AI plans. Family discount. 5-day free trial.",
  },
  fr: {
    title: "Tarifs — Cours de Coran en Ligne Abordables",
    description:
      "Découvrez les tarifs de Tibyaan Academy — à partir de 33$/mois. Enseignant en direct + plans IA. Réduction familiale. Essai gratuit 5 jours.",
  },
  id: {
    title: "Harga — Kursus Quran Online Terjangkau",
    description:
      "Lihat harga Tibyaan Academy — mulai dari $33/bulan. Guru langsung + paket AI. Diskon keluarga. Uji coba gratis 5 hari.",
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
