"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function PricingTeaserSection() {
  const t = useTranslations("pricingTeaser");

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center text-primary"
        >
          {t("title")}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Plan 1 */}
          <div className="p-6 rounded-xl border-2 border-accent bg-accent/5 relative">
            <Badge className="absolute -top-3 start-4 bg-accent text-white">
              Popular
            </Badge>
            <h3 className="text-lg font-bold text-foreground">{t("plan1")}</h3>
            <p className="text-2xl font-bold text-accent mt-2">
              {t("plan1Price")}
            </p>
            <ul className="mt-4 space-y-2">
              {["Live 1-on-1 classes", "AI Ustaz 24/7", "Hifz Tracker", "Weekly Tests"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Plan 2 */}
          <div className="p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold text-foreground">{t("plan2")}</h3>
            <p className="text-2xl font-bold text-primary mt-2">
              {t("plan2Price")}
            </p>
            <ul className="mt-4 space-y-2">
              {["AI Ustaz 24/7", "Self-paced learning", "Hifz Tracker", "Kids Activities"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary hover:text-primary-foreground"
            >
              {t("viewPricing")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
