"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPages");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-destructive/20 mb-4">500</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t("errorTitle")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("errorDescription")}
        </p>
        <Button onClick={reset} size="lg">
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  );
}
