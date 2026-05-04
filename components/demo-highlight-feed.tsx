"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Eye, Heart, MapPin, Play, Trophy } from "lucide-react";
import { HighlightVideo } from "@/components/highlight-video";
import { ShareButton } from "@/components/share-button";
import {
  getCategoriesWithHighlights,
  demoHighlights,
  getDemoHighlightsByCategory,
  type DemoCategory,
  type DemoHighlight
} from "@/lib/demo-data";
import { t } from "@/lib/i18n/translations";

const ALL_SLUG = "allt";

const dateFormatter = new Intl.DateTimeFormat("is-IS", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function DemoHighlightFeed() {
  const [activeSlug, setActiveSlug] = useState(ALL_SLUG);
  const populatedCategories = getCategoriesWithHighlights();

  const visibleHighlights =
    activeSlug === ALL_SLUG ? demoHighlights : getDemoHighlightsByCategory(activeSlug);

  const activeCategory = populatedCategories.find((c) => c.slug === activeSlug) ?? null;

  return (
    <section className="space-y-7" id="latest">
      {/* Section header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Demo efni</p>
          <h2 className="mt-2 text-4xl font-black tracking-normal text-white">
            Myndbönd &amp; Augnablik
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56">
            Úrval klippur — mörk, vörslur, klúður og tilþrif. Veldu flokk til að sía.
          </p>
        </div>
        <span className="w-fit rounded-full border border-flood/30 bg-flood/10 px-3 py-1 text-sm font-bold text-flood">
          {visibleHighlights.length} klippur
        </span>
      </div>

      {/* Category tabs — horizontal scroll on mobile */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap">
        <CategoryTab
          active={activeSlug === ALL_SLUG}
          label="Allt"
          slug={ALL_SLUG}
          onSelect={setActiveSlug}
        />
        {populatedCategories.map((cat) => (
          <CategoryTab
            active={activeSlug === cat.slug}
            key={cat.slug}
            label={cat.name_is}
            slug={cat.slug}
            onSelect={setActiveSlug}
          />
        ))}
      </div>

      {/* Category description */}
      {activeCategory && (
        <p className="text-sm leading-6 text-white/52">{activeCategory.description_is}</p>
      )}

      {/* Grid */}
      {visibleHighlights.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleHighlights.map((highlight) => (
            <DemoHighlightCard highlight={highlight} key={highlight.id} />
          ))}
        </div>
      ) : (
        <div className="panel p-6 text-sm text-white/58">Engar klippur í þessum flokki.</div>
      )}

      <div className="flex items-center gap-2 text-sm font-semibold text-white/40">
        <Trophy className="h-4 w-4 text-flood" />
        Demo efni — klippur eru staðgengilsgögn. Raunverulegar klippur koma þegar kerfið fer í loftið.
      </div>
    </section>
  );
}

function CategoryTab({
  active,
  label,
  slug,
  onSelect
}: {
  active: boolean;
  label: string;
  slug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      id={`category-tab-${slug}`}
      type="button"
      onClick={() => onSelect(slug)}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-flood bg-flood text-pitch-950 shadow-glow"
          : "border-white/12 bg-white/[0.06] text-white/65 hover:border-white/25 hover:text-white"
      }`}
    >
      <span>{label}</span>
    </button>
  );
}

function DemoHighlightCard({ highlight }: { highlight: DemoHighlight }) {
  const [likes, setLikes] = useState(highlight.likes);
  const [liked, setLiked] = useState(false);
  const shareUrl = `/h/${highlight.id}`;

  return (
    <article
      className="panel overflow-hidden"
      id={`demo-highlight-${highlight.id}`}
    >
      {/* Video thumbnail / player */}
      <div className="relative aspect-video bg-black">
        <HighlightVideo
          embedStatus={highlight.embed_status}
          signedUrl={null}
          unavailableLabel={t.home.videoUnavailable}
          videoUrl={highlight.external_url}
          title={highlight.title}
        />
        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/60 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur">
          <Play className="h-3.5 w-3.5 text-flood" />
          {t.home.watchHere}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-flood px-2.5 py-1 text-xs font-black text-pitch-950">
              {t.highlightTypes[highlight.type]}
            </span>
            {highlight.competition && (
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/58">
                {highlight.competition}
              </span>
            )}
          </div>
          <ShareButton
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-flood/30 bg-flood/10 px-2.5 text-xs font-black text-flood transition hover:bg-flood hover:text-pitch-950"
            title={highlight.title}
            url={shareUrl}
          />
        </div>

        {/* Title */}
        <Link href={shareUrl} className="group block">
          <h3 className="text-lg font-black leading-tight text-white transition group-hover:text-flood">
            {highlight.title}
          </h3>
        </Link>

        {/* Meta */}
        <div className="space-y-1 text-sm text-white/55">
          {highlight.player_name && (
            <p className="font-semibold text-white/78">{highlight.player_name}</p>
          )}
          {highlight.team_name && highlight.opponent_team_name && (
            <p>
              {highlight.team_name} gegn {highlight.opponent_team_name}
            </p>
          )}
          {highlight.match_date && (
            <p className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-flood" />
              {dateFormatter.format(new Date(highlight.match_date))}
            </p>
          )}
          {highlight.location && (
            <p className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-signal" />
              {highlight.location}
            </p>
          )}
        </div>

        {/* Discussion prompt */}
        {highlight.discussion_prompt && (
          <p className="rounded-lg border border-flood/15 bg-flood/8 px-3 py-2 text-xs font-semibold italic text-flood/85">
            💬 {highlight.discussion_prompt}
          </p>
        )}

        {/* Engagement row */}
        <div className="flex items-center gap-3 border-t border-white/8 pt-3">
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Eye className="h-3.5 w-3.5" />
            {formatCount(highlight.views)}
          </div>
          <button
            type="button"
            onClick={() => {
              setLiked((prev) => !prev);
              setLikes((prev) => (liked ? prev - 1 : prev + 1));
            }}
            className={`flex items-center gap-1 text-xs font-bold transition ${
              liked ? "text-ember" : "text-white/40 hover:text-ember"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-ember" : ""}`} />
            {formatCount(likes)}
          </button>
          <Link
            href={shareUrl}
            className="ml-auto text-xs font-bold text-white/40 transition hover:text-flood"
          >
            Sjá meira →
          </Link>
        </div>
      </div>
    </article>
  );
}
