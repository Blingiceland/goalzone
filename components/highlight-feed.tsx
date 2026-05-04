"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Play, Trophy } from "lucide-react";
import Link from "next/link";
import { HighlightVideo } from "@/components/highlight-video";
import { ShareButton } from "@/components/share-button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { t } from "@/lib/i18n/translations";

type Category = Database["public"]["Tables"]["categories"]["Row"];

type Highlight = Pick<
  Database["public"]["Tables"]["highlights"]["Row"],
  | "id"
  | "category_id"
  | "title"
  | "description"
  | "type"
  | "player_name"
  | "club_name"
  | "team_name"
  | "opponent_team_name"
  | "competition"
  | "season"
  | "match_date"
  | "location"
  | "video_path"
  | "video_url"
  | "external_video_url"
  | "created_at"
>;

type FeedHighlight = Highlight & {
  signedUrl: string | null;
};

const allFilter = "all";

const dateFormatter = new Intl.DateTimeFormat("is-IS", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export function HighlightFeed() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [highlights, setHighlights] = useState<FeedHighlight[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState(allFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHighlights() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const [{ data: categoryRows, error: categoryError }, { data: highlightRows, error: queryError }] =
        await Promise.all([
          supabase
            .from("categories")
            .select("*")
            .order("display_order", { ascending: true })
            .order("name_is", { ascending: true }),
          supabase
            .from("highlights")
            .select(
              "id,category_id,title,description,type,player_name,club_name,team_name,opponent_team_name,competition,season,match_date,location,video_path,video_url,external_video_url,created_at"
            )
            .eq("status", "approved")
            .order("match_date", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false })
            .limit(60)
        ]);

      const loadError = categoryError ?? queryError;
      if (loadError) {
        setError(loadError.message);
        setLoading(false);
        return;
      }

      const rows = highlightRows ?? [];
      const withUrls = await Promise.all(
        rows.map(async (highlight) => {
          if (!highlight.video_path) {
            return {
              ...highlight,
              signedUrl: null
            };
          }

          const { data: signedData } = await supabase.storage
            .from("highlight-videos")
            .createSignedUrl(highlight.video_path, 60 * 60);

          return {
            ...highlight,
            signedUrl: signedData?.signedUrl ?? null
          };
        })
      );

      setCategories(categoryRows ?? []);
      setHighlights(withUrls);
      setLoading(false);
    }

    void loadHighlights();
  }, [supabase]);

  const activeCategory = categories.find((category) => category.slug === activeCategorySlug);
  const visibleHighlights =
    activeCategorySlug === allFilter
      ? highlights
      : highlights.filter((highlight) => highlight.category_id === activeCategory?.id);

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const categoriesWithHighlights = categories.filter((category) =>
    highlights.some((highlight) => highlight.category_id === category.id)
  );

  if (!supabase) {
    return (
      <section className="panel p-5">
        <p className="label">{t.home.feedEyebrow}</p>
        <h2 className="mt-2 text-2xl font-black text-white">{t.common.configuredMissing}</h2>
      </section>
    );
  }

  return (
    <section className="space-y-6" id="latest">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">{t.home.feedEyebrow}</p>
          <h2 className="mt-2 text-4xl font-black tracking-normal text-white">{t.home.feedTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56">{t.home.feedIntro}</p>
        </div>
        <span className="w-fit rounded-full border border-flood/30 bg-flood/10 px-3 py-1 text-sm font-bold text-flood">
          {visibleHighlights.length} {t.home.approvedCountSuffix}
        </span>
      </div>

      {categoriesWithHighlights.length > 0 && (
        <div className="max-w-sm space-y-2">
          <label className="label" htmlFor="category-filter">
            {t.home.filterByCategory}
          </label>
          <select
            className="field"
            id="category-filter"
            value={activeCategorySlug}
            onChange={(event) => setActiveCategorySlug(event.target.value)}
          >
            <option value={allFilter}>{t.home.filterAll}</option>
            {categoriesWithHighlights.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name_is}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="text-sm text-white/58">{t.common.loading}</p>}

      {error && (
        <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm text-red-100">
          {t.common.errorPrefix}: {error}
        </p>
      )}

      {!loading && !error && highlights.length === 0 && (
        <div className="panel p-6 text-sm text-white/58">{t.home.emptyHighlights}</div>
      )}

      {!loading && activeCategorySlug !== allFilter && activeCategory && (
        <div>
          <h3 className="text-2xl font-black text-white">{activeCategory.name_is}</h3>
          {activeCategory.short_description_is && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
              {activeCategory.short_description_is}
            </p>
          )}
        </div>
      )}

      {!loading && !error && visibleHighlights.length > 0 && (
        <HighlightGrid categoryById={categoryById} highlights={visibleHighlights} />
      )}

      {!loading && !error && highlights.length > 0 && visibleHighlights.length === 0 && (
        <div className="panel p-6 text-sm text-white/58">{t.home.emptyHighlights}</div>
      )}

      {!loading && highlights.length > 0 && (
        <div className="flex items-center gap-2 text-sm font-semibold text-white/45">
          <Trophy className="h-4 w-4 text-flood" />
          {t.home.latestApprovedCopy}
        </div>
      )}
    </section>
  );
}

function HighlightGrid({
  categoryById,
  highlights
}: {
  categoryById: Map<string, Category>;
  highlights: FeedHighlight[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {highlights.map((highlight) => (
        <HighlightCard
          category={highlight.category_id ? categoryById.get(highlight.category_id) : undefined}
          highlight={highlight}
          key={highlight.id}
        />
      ))}
    </div>
  );
}

function HighlightCard({
  category,
  highlight
}: {
  category?: Category;
  highlight: FeedHighlight;
}) {
  const shareUrl = `/h/${highlight.id}`;

  return (
    <article className="panel scroll-mt-20 overflow-hidden" id={`highlight-${highlight.id}`}>
      <div className="relative aspect-video bg-black">
        <HighlightVideo
          signedUrl={highlight.signedUrl}
          unavailableLabel={t.home.videoUnavailable}
          videoUrl={highlight.external_video_url ?? highlight.video_url}
          title={highlight.title}
        />
        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/60 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur">
          <Play className="h-3.5 w-3.5 text-flood" />
          {t.home.watchHere}
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-flood px-2.5 py-1 text-xs font-black text-pitch-950">
              {t.highlightTypes[highlight.type]}
            </span>
            {category && (
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/58">
                {category.name_is}
              </span>
            )}
            {highlight.competition && (
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/58">
                {highlight.competition}
              </span>
            )}
          </div>
          <ShareButton
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-flood/30 bg-flood/10 px-3 text-xs font-black text-flood transition hover:bg-flood hover:text-pitch-950"
            title={highlight.title}
            url={shareUrl}
          />
        </div>

        <div>
          <Link href={shareUrl} className="group">
            <h3 className="text-xl font-black leading-tight text-white group-hover:text-flood transition">{highlight.title}</h3>
          </Link>
          {highlight.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/62">
              {highlight.description}
            </p>
          )}
        </div>

        <div className="grid gap-2 text-sm text-white/56 sm:grid-cols-2">
          {highlight.player_name && (
            <p className="font-semibold text-white/72">{highlight.player_name}</p>
          )}
          {highlight.club_name && <p>{highlight.club_name}</p>}
          {highlight.team_name && highlight.opponent_team_name && (
            <p>
              {highlight.team_name} gegn {highlight.opponent_team_name}
            </p>
          )}
          {highlight.season && <p>{highlight.season}</p>}
          {highlight.match_date && (
            <p className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-flood" />
              {dateFormatter.format(new Date(highlight.match_date))}
            </p>
          )}
          {highlight.location && (
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-signal" />
              {highlight.location}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
