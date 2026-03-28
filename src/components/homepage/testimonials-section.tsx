"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { key: "t1", rating: 5 },
  { key: "t2", rating: 5 },
  { key: "t3", rating: 5 },
] as const;

export function TestimonialsSection() {
  const t = useTranslations("testimonials");

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center text-primary"
        >
          {t("title")}
        </motion.h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((review, i) => (
            <motion.div
              key={review.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }, (_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="mt-4 text-sm text-foreground leading-relaxed">
                &ldquo;{t(`${review.key}Text`)}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-4 pt-4 border-t">
                <div className="font-semibold text-sm text-foreground">
                  {t(`${review.key}Name`)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t(`${review.key}Country`)} &middot;{" "}
                  {t(`${review.key}Course`)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/reviews">
            <Button variant="outline" className="border-primary/30">
              {t("viewAll")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
