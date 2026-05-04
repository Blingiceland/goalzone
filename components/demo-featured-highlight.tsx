import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { HighlightVideo } from "@/components/highlight-video";
import { ShareButton } from "@/components/share-button";
import { getFeaturedDemoHighlight } from "@/lib/demo-data";
import { t } from "@/lib/i18n/translations";

export function DemoFeaturedHighlight() {
  const highlight = getFeaturedDemoHighlight();

  if (!highlight) {
    return (
      <div className="panel p-6">
        <p className="text-sm text-white/58">{t.home.featuredEmptyCopy}</p>
      </div>
    );
  }

  const shareUrl = `/h/${highlight.id}`;

  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-black shadow-glow">
      <div className="relative aspect-video bg-black lg:aspect-[16/10]">
        <HighlightVideo
          embedStatus={highlight.embed_status}
          signedUrl={null}
          unavailableLabel={t.home.videoUnavailable}
          videoUrl={highlight.external_url}
          title={highlight.title}
        />
        <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-flood backdrop-blur">
          <Play className="h-3.5 w-3.5 fill-flood" />
          {t.home.featuredEyebrow}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-flood">
            {t.highlightTypes[highlight.type]}
            {highlight.competition ? ` / ${highlight.competition}` : ""}
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white">{highlight.title}</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 text-sm font-semibold text-white/56">
            {highlight.player_name && (
              <p className="truncate text-white/78">{highlight.player_name}</p>
            )}
            {highlight.team_name && highlight.opponent_team_name && (
              <p className="truncate">
                {highlight.team_name} gegn {highlight.opponent_team_name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={shareUrl}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white/65 transition hover:border-white/25 hover:text-white"
            >
              Opna
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <ShareButton
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-flood px-3 text-sm font-black text-pitch-950 transition hover:bg-white"
              title={highlight.title}
              url={shareUrl}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
