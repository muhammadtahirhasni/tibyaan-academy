import type { Metadata } from "next";
import { CountryPageTemplate } from "@/components/country/country-page-template";
import { GERMANY_PAGE } from "@/lib/data/country-pages";
import { SITE_URL } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: { title: "Online Quran Lernen Deutschland | Tibyaan Academy", description: "Join Muslim families across Germany learning Quran online. 5-day free trial." },
  ur: { title: "جرمنی میں آن لائن قرآن کلاسز | تبیان اکیڈمی", description: "جرمنی میں مسلم خاندانوں کے ساتھ آن لائن قرآن سیکھیں۔" },
  ar: { title: "تعلم القرآن أونلاين في ألمانيا | أكاديمية تبيان", description: "انضم للعائلات المسلمة في ألمانيا." },
  fr: { title: "Cours de Coran en ligne en Allemagne | Tibyaan Academy", description: "Rejoignez les familles musulmanes en Allemagne." },
  id: { title: "Kelas Quran Online Jerman | Tibyaan Academy", description: "Bergabunglah dengan keluarga Muslim di Jerman." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  return { title: meta.title, description: meta.description, alternates: { canonical: `${SITE_URL}/${locale}/germany` } };
}

export default async function GermanyLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <CountryPageTemplate locale={locale} data={GERMANY_PAGE} />;
}
