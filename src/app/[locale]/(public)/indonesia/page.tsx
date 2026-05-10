import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Link } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

export const metadata: Metadata = {
  title: "Belajar Quran Online Indonesia | Tibyaan Academy",
  description: "Pelajari Quran, Hifz, Bahasa Arab, dan Ilmu Islam online bersama guru bersertifikat + AI Ustaz. Tersedia untuk seluruh Indonesia. Coba gratis 5 hari.",
  keywords: ["belajar Quran online Indonesia", "kelas Quran online", "program Hifz online", "belajar bahasa Arab online", "pendidikan Islam online", "madrasah online Indonesia"],
  alternates: { canonical: `${BASE_URL}/id/indonesia` },
  openGraph: { title: "Belajar Quran Online Indonesia | Tibyaan Academy", description: "Pelajari Quran, Hifz, dan Bahasa Arab online dengan guru bersertifikat + AI Ustaz.", url: `${BASE_URL}/id/indonesia`, locale: "id_ID" },
};

export default function IndonesiaLandingPage() {
  return (
    <><Navbar /><main className="flex-1">
      <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">🇮🇩 Melayani Keluarga Muslim di Seluruh Indonesia</div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Belajar Quran Online Indonesia</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">Tibyaan Academy menghubungkan keluarga Muslim di Jakarta, Surabaya, Bandung, Medan, dan seluruh Indonesia dengan guru Quran bersertifikat. Belajar Al-Quran, Hifz, Bahasa Arab, dan Ilmu Islam — online, fleksibel, dari rumah.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">Mulai Coba Gratis</Link>
            <Link href="/courses" className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">Lihat Kursus</Link>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-white dark:bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">Mengapa Memilih Tibyaan Academy</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {["Sesi 1-on-1 langsung dengan guru Quran bersertifikat","Jadwal fleksibel (WIB, WITA, WIT)","AI Ustaz tersedia 24/7","Program untuk anak-anak dan dewasa","Kursus Hifz, Nazra, Bahasa Arab, dan Aalim","Coba gratis 5 hari — tanpa kartu kredit"].map((f) => (
              <div key={f} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20"><CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" /><span className="text-foreground">{f}</span></div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">Kursus Kami</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[{slug:"nazra-quran",title:"Nazra Quran",desc:"Belajar membaca Al-Quran dengan tajwid yang benar.",price:"Mulai $33/bulan"},{slug:"hifz-quran",title:"Hifz Quran",desc:"Program hafalan Al-Quran terstruktur dengan pelacakan harian.",price:"Mulai $37/bulan"},{slug:"arabic-language",title:"Bahasa Arab",desc:"Bahasa Arab Al-Quran dan tata bahasa untuk pemula.",price:"Mulai $35/bulan"},{slug:"aalim-course",title:"Kursus Aalim",desc:"Program ilmu Islam lengkap — Fiqih, Hadits, Tafsir.",price:"Mulai $40/bulan"}].map((c) => (
              <Link key={c.slug} href={`/courses/${c.slug}`} className="block p-6 rounded-xl border bg-white dark:bg-card hover:border-emerald-400 transition-colors"><h3 className="text-lg font-semibold text-foreground mb-2">{c.title}</h3><p className="text-sm text-muted-foreground mb-3">{c.desc}</p><span className="text-emerald-600 font-medium text-sm">{c.price}</span></Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Mulai Coba Gratis Hari Ini</h2>
          <p className="text-emerald-100 mb-8">5 hari gratis — tanpa kartu kredit. Rasakan pengajaran Quran langsung dari guru bersertifikat bersama Tibyaan Academy.</p>
          <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors">Mulai Sekarang</Link>
        </div>
      </section>
    </main><Footer /></>
  );
}
