"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * An <Image> that falls back to a placeholder when the file is missing.
 *
 * This exists because the fallback needs an `onError` handler, and passing an
 * event handler to <Image> from a server component throws at render time
 * ("Event handlers cannot be passed to Client Component props") — which took
 * down /[locale]/about with a 500 twice. Keeping the handler behind this
 * client boundary means a server page can use the fallback safely.
 */
export function AvatarImage({
  src,
  alt,
  fallbackSrc = "/placeholder-teacher.svg",
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      {...(fill ? { fill: true } : { width: width ?? 0, height: height ?? 0 })}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
