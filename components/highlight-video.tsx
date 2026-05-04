"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { getExternalVideo } from "@/lib/video";

export type EmbedStatus = "working" | "unknown" | "blocked";

export function HighlightVideo({
  embedStatus = "unknown",
  signedUrl,
  unavailableLabel,
  videoUrl,
  title
}: {
  embedStatus?: EmbedStatus;
  signedUrl: string | null;
  unavailableLabel: string;
  videoUrl: string | null;
  title: string;
}) {
  const [iframeErrored, setIframeErrored] = useState(false);

  if (signedUrl) {
    return (
      <video
        className="h-full w-full object-cover"
        controls
        preload="metadata"
        src={signedUrl}
      />
    );
  }

  const externalVideo = getExternalVideo(videoUrl);

  if (externalVideo || videoUrl) {
    const href = videoUrl ?? "#";
    const isYouTube = externalVideo?.provider === "youtube";
    const isVimeo = externalVideo?.provider === "vimeo";
    const providerLabel = isYouTube ? "YouTube" : isVimeo ? "Vimeo" : "ytri síðu";

    if (embedStatus !== "blocked" && externalVideo && !iframeErrored) {
      return (
        <div className="relative h-full w-full">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
            loading="lazy"
            onError={() => setIframeErrored(true)}
            referrerPolicy="strict-origin-when-cross-origin"
            src={externalVideo.embedUrl}
            title={title}
          />
          <a
            className="pointer-events-auto absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-black/30 bg-black/70 px-2.5 py-1.5 text-xs font-bold text-white/80 backdrop-blur transition hover:bg-black hover:text-white"
            href={href}
            onClick={(event) => event.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-3 w-3" />
            {providerLabel}
          </a>
        </div>
      );
    }

    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-black via-pitch-950 to-pitch-900 px-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(215,251,79,0.05)_0%,transparent_70%)]" />
        <div className="relative grid h-14 w-14 place-items-center rounded-full border border-flood/25 bg-flood/10 transition hover:bg-flood/20">
          <Play className="h-6 w-6 fill-flood text-flood" />
        </div>
        <p className="relative line-clamp-2 max-w-xs text-sm font-semibold leading-snug text-white/65">
          {title}
        </p>
        <a
          className="relative inline-flex items-center gap-2 rounded-lg border border-flood/30 bg-flood/10 px-4 py-2 text-sm font-bold text-flood transition hover:bg-flood hover:text-pitch-950"
          href={href}
          onClick={(event) => event.stopPropagation()}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
          Horfa á {providerLabel}
        </a>
      </div>
    );
  }

  return (
    <div className="grid h-full place-items-center bg-pitch-900 px-6 text-center">
      <p className="text-sm text-white/30">{unavailableLabel}</p>
    </div>
  );
}
