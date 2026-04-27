"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { useLocale } from "next-intl";

interface VideoShareButtonsProps {
  videoId: string;
  title: string;
  teacherName: string;
  /** Optional extra className for the trigger button */
  className?: string;
}

function buildShareUrl(videoId: string, locale: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://tibyaan-academy.vercel.app";
  return `${base}/${locale}/videos/${videoId}`;
}

export function VideoShareButtons({
  videoId,
  title,
  teacherName,
  className = "",
}: VideoShareButtonsProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = buildShareUrl(videoId, locale);
  const shareText = `${title} — ${teacherName} | Tibyaan Academy`;

  const platforms = [
    {
      label: "WhatsApp",
      dot: "bg-green-500",
      href: `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
    },
    {
      label: "Facebook",
      dot: "bg-blue-600",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Twitter / X",
      dot: "bg-sky-500",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Instagram (copy link)",
      dot: "bg-gradient-to-br from-pink-500 to-orange-400",
      href: null, // copy-only
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // silent fail — browser may block clipboard without user gesture
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Share video"
        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute end-0 bottom-full mb-1 z-50 w-52 bg-popover border rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 space-y-0.5">
              {platforms.map((p) =>
                p.href ? (
                  <a
                    key={p.label}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                  >
                    <span className={`w-4 h-4 rounded-full flex-none ${p.dot}`} />
                    {p.label}
                  </a>
                ) : (
                  // Instagram — copy link
                  <button
                    key={p.label}
                    onClick={copyLink}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-start"
                  >
                    <span className={`w-4 h-4 rounded-full flex-none ${p.dot}`} />
                    {p.label}
                  </button>
                )
              )}

              <div className="border-t my-1" />

              <button
                onClick={copyLink}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-start"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600 flex-none" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground flex-none" />
                )}
                {copied ? "Copied!" : "Copy direct link"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
