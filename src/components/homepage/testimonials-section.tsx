"use client";

import Image from "next/image";
import { useTranslations, useMessages } from "next-intl";
import { Star } from "lucide-react";

const staticReviews = [
  { id: 1, name: "Aaliya Mahmood", image: "/Reviewer/Aaliya_Mahmood.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 2, name: "Aamir Nazir", image: "/Reviewer/Aamir_Nazir.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 3, name: "Abdullah Asad", image: "/Reviewer/Abdullah_Asad.jpg", country: "United Kingdom", flag: "🇬🇧", rating: 5 },
  { id: 4, name: "Abdullah", image: "/Reviewer/Abdullah.jpg", country: "Nigeria", flag: "🇳🇬", rating: 5 },
  { id: 5, name: "Ahmet Kurt", image: "/Reviewer/Ahmet_kurt.jpg", country: "Germany", flag: "🇩🇪", rating: 5 },
  { id: 6, name: "Al Hoque", image: "/Reviewer/Al_Hoque.jpg", country: "Bangladesh", flag: "🇧🇩", rating: 5 },
  { id: 7, name: "Aliyan Ali", image: "/Reviewer/Aliyan_Ali.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 8, name: "Amet Kurt Albani", image: "/Reviewer/Amet_kurt_Albani.jpg", country: "Turkey", flag: "🇹🇷", rating: 5 },
  { id: 9, name: "Bakarii", image: "/Reviewer/Bakarii.jpg", country: "West Africa", flag: "🌍", rating: 5 },
  { id: 10, name: "Daruth Tahjeeb", image: "/Reviewer/Daruth_Tahjeeb.jpg", country: "Bangladesh", flag: "🇧🇩", rating: 5 },
  { id: 11, name: "Febryarya", image: "/Reviewer/Febryarya.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 12, name: "Halid Elosman", image: "/Reviewer/Halid_Elosman.jpg", country: "Saudi Arabia", flag: "🇸🇦", rating: 5 },
  { id: 13, name: "Imran Ejaz", image: "/Reviewer/Imran_Ejaz.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 14, name: "Irfan Shahzad", image: "/Reviewer/Irfan_Shahzad.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 15, name: "Jalal Ahmed", image: "/Reviewer/Jalal_Ahmed.jpg", country: "UAE", flag: "🇦🇪", rating: 5 },
  { id: 16, name: "Javaistan", image: "/Reviewer/Javaistan.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 17, name: "Jibar", image: "/Reviewer/Jibar.jpg", country: "Canada", flag: "🇨🇦", rating: 5 },
  { id: 18, name: "Kalamata", image: "/Reviewer/kalamata.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 19, name: "Kaniz Fatima", image: "/Reviewer/Kaniz_Fatima.jpg", country: "United Kingdom", flag: "🇬🇧", rating: 5 },
  { id: 20, name: "Kanwal Shaheen", image: "/Reviewer/Kanwal_Shaheen.jpg", country: "Australia", flag: "🇦🇺", rating: 5 },
  { id: 21, name: "Krar", image: "/Reviewer/krar.jpg", country: "Iraq", flag: "🇮🇶", rating: 5 },
  { id: 22, name: "M. Zass", image: "/Reviewer/M_Zass.jpg", country: "Nigeria", flag: "🇳🇬", rating: 5 },
  { id: 23, name: "Mikhail Nilov", image: "/Reviewer/Mikhail_Nilov.jpg", country: "Russia", flag: "🇷🇺", rating: 5 },
  { id: 24, name: "Mohameden Beinbe", image: "/Reviewer/Mohameden_Beinbe.jpg", country: "Mauritania", flag: "🇲🇷", rating: 5 },
  { id: 25, name: "Mohammad Asbad", image: "/Reviewer/Mohammad_Asbad.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 26, name: "Monir-ul-Islam", image: "/Reviewer/Monir-ul-Islam.jpg", country: "Bangladesh", flag: "🇧🇩", rating: 5 },
  { id: 27, name: "Mujeeb Zain", image: "/Reviewer/Mujeeb_Zain.jpg", country: "Bangladesh", flag: "🇧🇩", rating: 5 },
  { id: 28, name: "Murtaza Wahhab", image: "/Reviewer/Murtaza_Wahhab.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 29, name: "Panditwiguna", image: "/Reviewer/Panditwiguna.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 30, name: "Qamar Rehman", image: "/Reviewer/Qamar_Rehman.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 31, name: "Quang Nguyen Vinh", image: "/Reviewer/Quang_Nguyen_Vinh.jpg", country: "Vietnam", flag: "🇻🇳", rating: 5 },
  { id: 32, name: "Riki Risnandar", image: "/Reviewer/Riki_Risnandar.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 33, name: "Sabrian Syah", image: "/Reviewer/Sabrian_Syah.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 34, name: "Seyh Muskino", image: "/Reviewer/Seyh_muskino.jpg", country: "Egypt", flag: "🇪🇬", rating: 5 },
  { id: 35, name: "Shaheer Nawaz", image: "/Reviewer/Shaheer_Nawaz.jpg", country: "United Kingdom", flag: "🇬🇧", rating: 5 },
  { id: 36, name: "Shahzaib Jahan", image: "/Reviewer/Shahzaib_Jahan.jpg", country: "Canada", flag: "🇨🇦", rating: 5 },
  { id: 37, name: "Shaista Touseef", image: "/Reviewer/Shaista_Touseef.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 38, name: "Sheikh Toulouse", image: "/Reviewer/Sheikh_Toulouse.jpg", country: "France", flag: "🇫🇷", rating: 5 },
  { id: 39, name: "Sheikh Yousuf", image: "/Reviewer/Sheikh_Yousuf.jpg", country: "Saudi Arabia", flag: "🇸🇦", rating: 5 },
  { id: 40, name: "Sheza Shehzad", image: "/Reviewer/Sheza_Shehzad.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 41, name: "Sirmudi", image: "/Reviewer/Sirmudi.jpg", country: "Tanzania", flag: "🇹🇿", rating: 5 },
  { id: 42, name: "Sonyfeo", image: "/Reviewer/Sonyfeo.jpg", country: "Indonesia", flag: "🇮🇩", rating: 5 },
  { id: 43, name: "Talha Shafique", image: "/Reviewer/Talha_Shafique.jpg", country: "Bangladesh", flag: "🇧🇩", rating: 5 },
  { id: 44, name: "Timur Weber", image: "/Reviewer/Timur_Weber.jpg", country: "UAE", flag: "🇦🇪", rating: 5 },
  { id: 45, name: "Ubaid-ul-llah", image: "/Reviewer/Ubaid-ul-llah.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 46, name: "Zohair Ashraf", image: "/Reviewer/Zohair_Ashraf.jpg", country: "Bangladesh", flag: "🇧🇩", rating: 5 },
  { id: 47, name: "Zuhaib Junaid", image: "/Reviewer/Zuhaib_Junaid.jpg", country: "Pakistan", flag: "🇵🇰", rating: 5 },
  { id: 48, name: "Zulekha Jawed", image: "/Reviewer/Zulekha_Jawed.jpg", country: "Turkey", flag: "🇹🇷", rating: 5 },
];

type ReviewWithTranslation = (typeof staticReviews)[0] & { review: string; role: string; course: string };

function ReviewCard({ review }: { review: ReviewWithTranslation }) {
  return (
    <div className="min-w-[300px] max-w-[300px] p-5 rounded-xl border bg-card shadow-sm mx-3 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: review.rating }, (_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
          ))}
        </div>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          {review.course}
        </span>
      </div>
      <p className="mt-3 text-sm text-foreground leading-relaxed flex-1">
        &ldquo;{review.review}&rdquo;
      </p>
      <div className="mt-4 pt-4 border-t flex items-center gap-3">
        <div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0">
          <Image
            src={review.image}
            alt={review.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{review.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {review.flag} {review.country} &middot; {review.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const t = useTranslations("testimonials");
  const messages = useMessages();
  const reviewsI18n = ((messages.testimonials as Record<string, unknown>)?.reviews ?? []) as Array<{ review: string; role: string; course: string }>;

  const reviews: ReviewWithTranslation[] = staticReviews.map((r, i) => ({
    ...r,
    review: reviewsI18n[i]?.review ?? "",
    role: reviewsI18n[i]?.role ?? "",
    course: reviewsI18n[i]?.course ?? "",
  }));

  const row1 = reviews.slice(0, 24);
  const row2 = reviews.slice(24);

  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-primary">
          {t("title")}
        </h2>
        <p className="mt-3 text-muted-foreground">
          Real stories from our global community of 5,000+ students
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative mb-4 w-full">
        <div
          className="flex"
          style={{ animation: "marquee-left 90s linear infinite", width: "max-content" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "paused")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "running")}
        >
          {[...row1, ...row1].map((review, i) => (
            <ReviewCard key={`r1-${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative w-full">
        <div
          className="flex"
          style={{ animation: "marquee-right 90s linear infinite", width: "max-content" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "paused")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "running")}
        >
          {[...row2, ...row2].map((review, i) => (
            <ReviewCard key={`r2-${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
