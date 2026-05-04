"use client";

import { useState } from "react";
import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { ShareButton } from "@/components/share-button";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function HighlightDetailEngagement({
  commentsCount,
  highlightId,
  initialLikes,
  shareTitle,
  shareUrl,
  views,
}: {
  commentsCount: number;
  highlightId: string;
  initialLikes: number;
  shareTitle: string;
  shareUrl: string;
  views: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  function handleLike() {
    if (liked) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    setLiked((prev) => !prev);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Views */}
      <div className="flex items-center gap-1.5 text-sm font-semibold text-white/50">
        <Eye className="h-4 w-4" />
        <span>{formatCount(views)} áhorf</span>
      </div>

      {/* Divider */}
      <span className="h-4 w-px bg-white/15" />

      {/* Like button */}
      <button
        id={`like-btn-${highlightId}`}
        type="button"
        onClick={handleLike}
        aria-pressed={liked}
        aria-label={liked ? "Taka líkar" : "Líkar við þetta"}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-bold transition ${
          liked
            ? "border-ember/40 bg-ember/10 text-ember"
            : "border-white/10 bg-white/[0.06] text-white/60 hover:border-ember/30 hover:text-ember"
        }`}
      >
        <Heart
          className={`h-4 w-4 transition ${liked ? "fill-ember text-ember" : ""}`}
        />
        <span>{formatCount(likes)}</span>
      </button>

      {/* Comments count */}
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-white/60">
        <MessageCircle className="h-4 w-4" />
        <span>{formatCount(commentsCount)}</span>
      </div>

      {/* Share */}
      <ShareButton
        className="inline-flex items-center gap-1.5 rounded-lg border border-flood/25 bg-flood/10 px-3 py-2 text-sm font-bold text-flood transition hover:bg-flood hover:text-pitch-950"
        title={shareTitle}
        url={shareUrl}
      />
    </div>
  );
}
