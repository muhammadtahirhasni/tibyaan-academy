"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  BookMarked,
  Bot,
  BarChart2,
  ClipboardList,
  Users,
  Video,
  DollarSign,
  Disc,
  LayoutDashboard,
  UserCheck,
  CreditCard,
} from "lucide-react";

const tabs = ["student", "teacher", "admin"] as const;
type Tab = (typeof tabs)[number];

const studentItems = [
  { icon: Calendar, key: "s1" },
  { icon: BookMarked, key: "s2" },
  { icon: Bot, key: "s3" },
  { icon: BarChart2, key: "s4" },
  { icon: ClipboardList, key: "s5" },
] as const;

const teacherItems = [
  { icon: Users, key: "t1" },
  { icon: Calendar, key: "t2" },
  { icon: DollarSign, key: "t3" },
  { icon: Disc, key: "t4" },
] as const;

const adminItems = [
  { icon: LayoutDashboard, key: "a1" },
  { icon: Video, key: "a2" },
  { icon: CreditCard, key: "a3" },
  { icon: UserCheck, key: "a4" },
] as const;

const itemsByTab: Record<Tab, readonly { icon: typeof Calendar; key: string }[]> = {
  student: studentItems,
  teacher: teacherItems,
  admin: adminItems,
};

export function DashboardPreviewSection() {
  const t = useTranslations("dashboardPreview");
  const [activeTab, setActiveTab] = useState<Tab>("student");

  const items = itemsByTab[activeTab];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-primary"
        >
          {t("title")}
        </motion.h2>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {t(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {t(item.key)}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
