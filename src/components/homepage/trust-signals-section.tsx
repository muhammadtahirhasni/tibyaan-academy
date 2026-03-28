"use client";

import { useTranslations } from "next-intl";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Users, Globe, BookOpen, Award } from "lucide-react";

function AnimatedCounter({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, target]);

  return <motion.span>{rounded}</motion.span>;
}

const signals = [
  { key: "students", value: 500, suffix: "+", icon: Users },
  { key: "countries", value: 15, suffix: "+", icon: Globe },
  { key: "classes", value: 10000, suffix: "+", icon: BookOpen },
  { key: "huffaz", value: 50, suffix: "+", icon: Award },
] as const;

export function TrustSignalsSection() {
  const t = useTranslations("stats");

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.key} className="text-center">
                <Icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold">
                  <AnimatedCounter target={signal.value} />
                  {signal.suffix}
                </div>
                <div className="text-sm mt-1 opacity-80">{t(signal.key)}</div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
