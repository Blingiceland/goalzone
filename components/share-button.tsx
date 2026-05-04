"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { t } from "@/lib/i18n/translations";

export function ShareButton({
  className,
  title,
  url
}: {
  className?: string;
  title: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function shareHighlight() {
    const absoluteUrl = new URL(url, window.location.origin).toString();

    if (navigator.share) {
      try {
        await navigator.share({ title, url: absoluteUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
  }

  return (
    <button
      className={
        className ??
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white/72 transition hover:border-flood/40 hover:text-flood"
      }
      type="button"
      onClick={shareHighlight}
      aria-label={t.common.share}
      title={copied ? t.common.copied : t.common.share}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span>{copied ? t.common.copied : t.common.share}</span>
    </button>
  );
}
