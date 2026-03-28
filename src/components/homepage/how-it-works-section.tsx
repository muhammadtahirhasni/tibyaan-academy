"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { UserPlus, BookMarked, Rocket } from "lucide-react";

const steps = [
  { key: "step1", icon: UserPlus, num: "1" },
  { key: "step2", icon: BookMarked, num: "2" },
  { key: "step3", icon: Rocket, num: "3" },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("howItWorks");

  return (
    <section className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center text-primary"
        >
          {t("title")}
        </motion.h2>

        <div className="mt-14 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 start-[16.67%] end-[16.67%] h-0.5 bg-gradient-to-r from-primary/30 via-accent/50 to-primary/30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="text-center relative"
                >
                  <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative z-10 border-4 border-background">
                    <Icon className="w-10 h-10 text-primary" />
                    <span className="absolute -top-2 -end-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">
                    {t(`${step.key}Title`)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`${step.key}Desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
