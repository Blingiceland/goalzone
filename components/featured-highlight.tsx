"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import { HighlightVideo } from "@/components/highlight-video";
import { ShareButton } from "@/components/share-button";
import { t } from "@/lib/i18n/translations";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Highlight = Pick<
  Database["public"]["Tables"]["highlights"]["Row"],
  | "id"
  | "title"
  | "description"
  | "type"
  | "player_name"
  | "team_name"
  | "opponent_team_name"
  | "competition"
  | "season"
  | "video_path"
  | "video_url"
  | "external_video_url"
>;

type FeaturedHighlight = Highlight & {
  signedUrl: string | null;
};

export function FeaturedHighlight() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [highlight, setHighlight] = useState<FeaturedHighlight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedHighlight() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("highlights")
        .select(
          "id,title,description,type,player_name,team_name,opponent_team_name,competition,season,video_path,video_url,external_video_url"
        )
        .eq("status", "approved")
        .not("category_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      if (!data.video_path) {
        setHighlight({ ...data, signedUrl: null });
        setLoading(false);
        return;
      }

      const { data: signedData } = await supabase.storage
        .from("highlight-videos")
        .createSignedUrl(data.video_path, 60 * 60);

      setHighlight({ ...data, signedUrl: signedData?.signedUrl ?? null });
      setLoading(false);
    }

    void loadFeaturedHighlight();
  }, [supabase]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-flood/15 bg-black/30 shadow-glow">
        <div className="aspect-video animate-pulse bg-white/[0.06]" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-28 rounded bg-white/[0.08]" />
          <div className="h-7 w-3/4 rounded bg-white/[0.08]" />
          <div className="h-4 w-2/3 rounded bg-white/[0.08]" />
        </div>
      </div>
    );
  }

  if (!highlight) {
    return (
      <div className="panel p-6">
        <div className="flex items-center gap-2 text-flood">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm font-black">{t.home.featuredEmptyTitle}</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/58">{t.home.featuredEmptyCopy}</p>
        <Link href="/submit" className="button-primary mt-5">
          {t.home.secondaryCta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const shareUrl = `/h/${highlight.id}`;

  return (
    <article className="overflow-hidden rounded-lg border border-flood/15 bg-black/30 shadow-glow">
      <div className="relative aspect-video bg-black">
        <HighlightVideo
          signedUrl={highlight.signedUrl}
          unavailableLabel={t.home.videoUnavailable}
          videoUrl={highlight.external_video_url ?? highlight.video_url}
          title={highlight.title}
        />
        <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/65 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-flood backdrop-blur">
          <Flame className="h-3.5 w-3.5" />
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
            {highlight.player_name && <p className="truncate text-white/78">{highlight.player_name}</p>}
            {highlight.team_name && highlight.opponent_team_name && (
              <p className="truncate">
                {highlight.team_name} gegn {highlight.opponent_team_name}
              </p>
            )}
          </div>
          <ShareButton
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-flood px-3 text-sm font-black text-pitch-950 transition hover:bg-white"
            title={highlight.title}
            url={shareUrl}
          />
        </div>
      </div>
    </article>
  );
}
