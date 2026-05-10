import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Link } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

export const metadata: Metadata = {
  title: "تعلم القرآن أونلاين — المملكة العربية السعودية | أكاديمية تبيان",
  description: "تعلم القرآن الكريم والحفظ واللغة العربية والعلوم الإسلامية عبر الإنترنت مع معلمين معتمدين + أستاذ ذكاء اصطناعي. جرّب مجاناً 5 أيام.",
  keywords: ["تعلم القرآن أونلاين", "تحفيظ القرآن عبر الإنترنت", "دروس القرآن السعودية", "تعليم إسلامي أونلاين", "معلم قرآن أونلاين"],
  alternates: { canonical: `${BASE_URL}/ar/saudi` },
  openGraph: { title: "تعلم القرآن أونلاين — المملكة العربية السعودية | أكاديمية تبيان", description: "تعلم القرآن والحفظ واللغة العربية عبر الإنترنت مع معلمين معتمدين.", url: `${BASE_URL}/ar/saudi`, locale: "ar_SA" },
};

export default function SaudiLandingPage() {
  return (
    <><Navbar /><main className="flex-1" dir="rtl">
      <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">🇸🇦 نخدم الأسر المسلمة في المملكة العربية السعودية</div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">تعلم القرآن أونلاين — المملكة العربية السعودية</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">تربط أكاديمية تبيان الأسر المسلمة في الرياض، جدة، مكة المكرمة، المدينة المنورة، وسائر أنحاء المملكة العربية السعودية بمعلمين قرآنيين معتمدين. تعلم القرآن الكريم، الحفظ، اللغة العربية، والعلوم الإسلامية عبر الإنترنت.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">ابدأ التجربة المجانية</Link>
            <Link href="/courses" className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">استعرض الدورات</Link>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-white dark:bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">لماذا يختار المسلمون في السعودية أكاديمية تبيان؟</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {["جلسات فردية مباشرة مع معلمين قرآنيين معتمدين","مواعيد مرنة تناسب التوقيت السعودي","أستاذ الذكاء الاصطناعي متاح 24/7","برامج للأطفال والكبار","دورات الحفظ، الناظرة، اللغة العربية، ودورة العالم","5 أيام مجاناً — بدون بطاقة ائتمان"].map((f) => (
              <div key={f} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20"><CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" /><span className="text-foreground">{f}</span></div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">دوراتنا</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[{slug:"nazra-quran",title:"الناظرة — قراءة القرآن",desc:"تعلم قراءة القرآن بالتجويد الصحيح.",price:"من $8 شهرياً"},{slug:"hifz-quran",title:"حفظ القرآن الكريم",desc:"برنامج حفظ منظم مع تتبع يومي.",price:"من $12 شهرياً"},{slug:"arabic-language",title:"اللغة العربية",desc:"العربية القرآنية وقواعد اللغة.",price:"من $10 شهرياً"},{slug:"aalim-course",title:"دورة العالم",desc:"برنامج العلوم الإسلامية الكامل — الفقه، الحديث، التفسير.",price:"من $15 شهرياً"}].map((c) => (
              <Link key={c.slug} href={`/courses/${c.slug}`} className="block p-6 rounded-xl border bg-white dark:bg-card hover:border-emerald-400 transition-colors"><h3 className="text-lg font-semibold text-foreground mb-2">{c.title}</h3><p className="text-sm text-muted-foreground mb-3">{c.desc}</p><span className="text-emerald-600 font-medium text-sm">{c.price}</span></Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">ابدأ تجربتك المجانية اليوم</h2>
          <p className="text-emerald-100 mb-8">5 أيام مجاناً — بدون بطاقة ائتمان. تعلم القرآن والعلوم الإسلامية عبر الإنترنت مع معلمين معتمدين.</p>
          <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors">ابدأ الآن</Link>
        </div>
      </section>
    </main><Footer /></>
  );
}
