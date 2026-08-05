"use client";

import { LOGO_BASE64 } from "./logoData";

interface LogoProps {
  className?: string;
  alt?: string;
}

export default function Logo({
  className = "w-full h-full object-contain",
  alt = "Logo Yayasan Munazarah",
}: LogoProps) {
  return (
    <img
      src="/yayasan.png"
      onError={(e) => {
        // Fallback to embedded inline base64 data URI if static file fails to load
        (e.currentTarget as HTMLImageElement).src = LOGO_BASE64;
      }}
      alt={alt}
      className={className}
    />
  );
}
