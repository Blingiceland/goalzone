"use client";

import { useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { HighlightVideo } from "@/components/highlight-video";
import { ShareButton } from "@/components/share-button";
import {
  demoHighlights,
  getCategoriesWithHighlights,
  getDemoHighlightsByCategory,
  type DemoHighlight
} from "@/lib/demo-data";
import { t } from "@/lib/i18n/translations";

const ALL_SLUG = "allt";

export function DemoHighlightFeed() {
  const [activeSlug, setActiveSlug] = useState(ALL_SLUG);
  const populatedCategories = getCategoriesWithHighlights();
  const visibleHighlights =
    activeSlug === ALL_SLUG ? demoHighlights : getDemoHighlightsByCategory(activeSlug);
  const activeCategory = populatedCategories.find((category) => category.slug === activeSlug);

  return (
    <section className="space-y-7" id="latest">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">{t.home.feedEyebrow}</p>
          <h2 className="mt-2 text-4xl font-black tracking-normal text-white">
            {t.home.feedTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56">
            {activeCategory?.description_is ?? t.home.feedIntro}
          </p>
        </div>
        <span className="w-fit rounded-full border border-flood/30 bg-flood/10 px-3 py-1 text-sm font-bold text-flood">
          {visibleHighlights.length} klippur
        </span>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap">
        <CategoryTab
          active={activeSlug === ALL_SLUG}
          label={t.home.filterAll}
          slug={ALL_SLUG}
          onSelect={setActiveSlug}
        />
        {populatedCategories.map((category) => (
          <CategoryTab
            active={activeSlug === category.slug}
            key={category.slug}
            label={category.name_is}
            slug={category.slug}
            onSelect={setActiveSlug}
          />
        ))}
      </div>

      {visibleHighlights.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleHighlights.map((highlight) => (
            <DemoHighlightCard highlight={highlight} key={highlight.id} />
          ))}
        </div>
      ) : (
        <div className="panel p-6 text-sm text-white/58">Engar klippur í þessum flokki.</div>
      )}
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
      className={`inline-flex shrink-0 items-center rounded-lg border px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-flood bg-flood text-pitch-950 shadow-glow"
          : "border-white/12 bg-white/[0.06] text-white/65 hover:border-white/25 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function DemoHighlightCard({ highlight }: { highlight: DemoHighlight }) {
  const shareUrl = `/h/${highlight.id}`;

  return (
    <article className="panel overflow-hidden" id={`demo-highlight-${highlight.id}`}>
      <div className="relative aspect-video bg-black">
        <HighlightVideo
          embedStatus={highlight.embed_status}
          signedUrl={null}
          unavailableLabel={t.home.videoUnavailable}
          videoUrl={highlight.external_url}
          title={highlight.title}
        />
        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/60 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur">
          <Play className="h-3.5 w-3.5 fill-flood text-flood" />
          {t.home.watchHere}
        </div>
      </div>

      <div className="space-y-4 p-4">
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

        <div>
          <Link href={shareUrl} className="group block">
            <h3 className="text-xl font-black leading-tight text-white transition group-hover:text-flood">
              {highlight.title}
            </h3>
          </Link>
          {highlight.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">
              {highlight.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/46">
          {highlight.player_name && <span>{highlight.player_name}</span>}
          {highlight.team_name && highlight.opponent_team_name && (
            <span>
              {highlight.team_name} gegn {highlight.opponent_team_name}
            </span>
          )}
          {highlight.season && <span>{highlight.season}</span>}
        </div>
      </div>
    </article>
  );
}
