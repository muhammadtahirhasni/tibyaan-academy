"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Youtube, Linkedin, Facebook, Instagram, ExternalLink } from "lucide-react";

const socialLinks = [
  {
    key: "youtube",
    href: "https://www.youtube.com/channel/UCBU7Fc9ZjYU42SHfSQM9_rg",
    icon: Youtube,
    color: "bg-red-600 hover:bg-red-700",
  },
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/tibyaan-academy-0263b73bb/",
    icon: Linkedin,
    color: "bg-blue-700 hover:bg-blue-800",
  },
  {
    key: "x",
    href: "https://x.com/TibyaanAcademy",
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-black hover:bg-gray-800",
  },
  {
    key: "facebook",
    href: "https://web.facebook.com/profile.php?id=61576509186955",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/tibyaanacademy/",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600",
  },
];

export function SocialLinksSection() {
  const t = useTranslations("socialLinks");

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 px-6 flex items-center gap-4 justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${social.color} flex items-center justify-center text-white shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-start">
                      <div className="font-semibold text-foreground">
                        {t(social.key)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t(`${social.key}Desc`)}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Button>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
