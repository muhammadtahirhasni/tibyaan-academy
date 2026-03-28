"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:start-auto sm:end-4 sm:w-96 bg-card border shadow-lg rounded-xl p-4 z-50 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#1B4332] flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-sm">TA</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">Install Tibyaan Academy</p>
        <p className="text-xs text-muted-foreground">Add to your home screen for quick access</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="sm" onClick={handleInstall}>
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
