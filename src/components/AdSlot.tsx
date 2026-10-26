"use client";

import { useEffect, useRef } from "react";
import { site } from "@/config/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Reserved-height ad container so ads never shift the layout (CLS).
 * Renders nothing until an AdSense client id is configured.
 */
export function AdSlot({ label, slot, className = "" }: { label: string; slot?: string; className?: string }) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    if (!site.adsenseClient || !ref.current || ref.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blockers */
    }
  }, []);
  if (!site.adsenseClient) return null;
  return (
    <aside aria-label={label} className={`my-8 min-h-[280px] ${className}`}>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={site.adsenseClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
