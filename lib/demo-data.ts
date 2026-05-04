/**
 * demo-data.ts
 *
 * Adapter layer between goalzone-demo-highlights.json and the app.
 *
 * Supports two JSON shapes — they are automatically normalised into one
 * consistent `DemoHighlight` type so the rest of the app never needs to
 * know which shape was used.
 *
 * ── Shape A (flat, original) ─────────────────────────────────────────────
 * {
 *   "categories": [ { "slug", "name_is", "icon", "description_is" } ],
 *   "highlights":  [ { "id", "category_slug", "type", "youtube_url", ... } ]
 * }
 *
 * ── Shape B (nested, new) ────────────────────────────────────────────────
 * {
 *   "categories": [
 *     {
 *       "slug", "name_is", "icon", "description_is",
 *       "highlights": [
 *         { "id", "externalUrl", "provider", "highlightType", "playerName", ... }
 *       ]
 *     }
 *   ]
 * }
 *
 * Both shapes can coexist in the same file.
 * To add a new category batch: just add a category object with its
 * highlights array (Shape B) to the "categories" array.
 */

const raw = require("@/goalzone-demo-highlights.json") as RawFile;

// ── Raw JSON types ──────────────────────────────────────────────────────────

type RawCategory = {
  slug: string;
  name_is: string;
  icon?: string;
  description_is?: string;
  /** Shape B: highlights nested inside the category */
  highlights?: RawNestedHighlight[];
};

/** Shape A — flat highlights with category_slug */
type RawFlatHighlight = {
  id: string;
  category_slug: string;
  type?: string;
  title: string;
  description?: string;
  player_name?: string | null;
  club_name?: string | null;
  team_name?: string | null;
  opponent_team_name?: string | null;
  competition?: string | null;
  season?: string | null;
  match_date?: string | null;
  location?: string | null;
  youtube_url?: string | null;
  tags?: string[];
  submitted_by?: string | null;
  submitted_by_club?: string | null;
  discussion_prompt?: string | null;
  views?: number;
  likes?: number;
  comments_count?: number;
  featured?: boolean;
  embedStatus?: "working" | "unknown" | "blocked";
};

/** Shape B — highlights nested inside a category object */
type RawNestedHighlight = {
  id: string;
  title: string;
  externalUrl?: string | null;
  provider?: string | null;
  highlightType?: string;
  playerName?: string | null;
  teamName?: string | null;
  opponentTeamName?: string | null;
  competition?: string | null;
  season?: string | null;
  country?: string | null;
  tags?: string[];
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  /** Legacy: treated as embedStatus "working" if true */
  embedLikely?: boolean;
  embedStatus?: "working" | "unknown" | "blocked";
  discussion_prompt?: string | null;
  submitted_by?: string | null;
  submitted_by_club?: string | null;
  match_date?: string | null;
  location?: string | null;
  featured?: boolean;
};

type RawFile = {
  categories?: RawCategory[];
  highlights?: RawFlatHighlight[];
};

// ── Normalised types (what the rest of the app uses) ────────────────────────

export type DemoHighlightType =
  | "goal"
  | "save"
  | "skill"
  | "assist"
  | "shot"
  | "mistake"
  | "funny"
  | "celebration"
  | "historic"
  | "other";

export type DemoCategory = {
  slug: string;
  name_is: string;
  icon: string;
  description_is: string;
};

export type EmbedStatus = "working" | "unknown" | "blocked";

export type DemoHighlight = {
  id: string;
  category_slug: string;
  type: DemoHighlightType;
  title: string;
  description: string;
  external_url: string | null;
  embed_status: EmbedStatus;
  player_name: string | null;
  team_name: string | null;
  opponent_team_name: string | null;
  competition: string | null;
  season: string | null;
  match_date: string | null;
  location: string | null;
  tags: string[];
  submitted_by: string | null;
  submitted_by_club: string | null;
  discussion_prompt: string | null;
  views: number;
  likes: number;
  comments_count: number;
  featured: boolean;
};

// ── Normalisation helpers ────────────────────────────────────────────────────

function resolveType(raw?: string): DemoHighlightType {
  const valid: DemoHighlightType[] = [
    "goal", "save", "skill", "assist", "shot",
    "mistake", "funny", "celebration", "historic", "other",
  ];
  return valid.includes(raw as DemoHighlightType)
    ? (raw as DemoHighlightType)
    : "other";
}

function normaliseFlat(h: RawFlatHighlight): DemoHighlight {
  return {
    id: h.id,
    category_slug: h.category_slug,
    type: resolveType(h.type),
    title: h.title,
    description: h.description ?? "",
    external_url: h.youtube_url ?? null,
    embed_status: h.embedStatus ?? "unknown",
    player_name: h.player_name ?? null,
    team_name: h.team_name ?? null,
    opponent_team_name: h.opponent_team_name ?? null,
    competition: h.competition ?? null,
    season: h.season ?? null,
    match_date: h.match_date ?? null,
    location: h.location ?? null,
    tags: h.tags ?? [],
    submitted_by: h.submitted_by ?? null,
    submitted_by_club: h.submitted_by_club ?? null,
    discussion_prompt: h.discussion_prompt ?? null,
    views: h.views ?? 0,
    likes: h.likes ?? 0,
    comments_count: h.comments_count ?? 0,
    featured: h.featured ?? false,
  };
}

function normaliseNested(h: RawNestedHighlight, categorySlug: string): DemoHighlight {
  // embedLikely (old field) maps to "working" for backward compat
  const embedStatus: EmbedStatus = h.embedStatus ?? (h.embedLikely ? "working" : "unknown");
  return {
    id: h.id,
    category_slug: categorySlug,
    type: resolveType(h.highlightType),
    title: h.title,
    description: "",
    external_url: h.externalUrl ?? null,
    embed_status: embedStatus,
    player_name: h.playerName ?? null,
    team_name: h.teamName ?? null,
    opponent_team_name: h.opponentTeamName ?? null,
    competition: h.competition ?? null,
    season: h.season ?? null,
    match_date: h.match_date ?? null,
    location: h.location ?? null,
    tags: h.tags ?? [],
    submitted_by: h.submitted_by ?? null,
    submitted_by_club: h.submitted_by_club ?? null,
    discussion_prompt: h.discussion_prompt ?? null,
    views: h.viewsCount ?? 0,
    likes: h.likesCount ?? 0,
    comments_count: h.commentsCount ?? 0,
    featured: h.featured ?? false,
  };
}

// ── Build exported data ──────────────────────────────────────────────────────

/** All categories (metadata only, no nested highlights) */
export const demoCategories: DemoCategory[] = (raw.categories ?? []).map((c) => ({
  slug: c.slug,
  name_is: c.name_is,
  icon: c.icon ?? "⚽",
  description_is: c.description_is ?? "",
}));

/** All highlights, flattened and normalised from both shapes */
export const demoHighlights: DemoHighlight[] = [
  // Shape A — top-level "highlights" array
  ...(raw.highlights ?? []).map(normaliseFlat),
  // Shape B — "highlights" arrays nested inside each category
  ...(raw.categories ?? []).flatMap((cat) =>
    (cat.highlights ?? []).map((h) => normaliseNested(h, cat.slug))
  ),
];

// ── Helper functions ─────────────────────────────────────────────────────────

export function getDemoHighlight(id: string): DemoHighlight | null {
  return demoHighlights.find((h) => h.id === id) ?? null;
}

export function getDemoHighlightsByCategory(categorySlug: string): DemoHighlight[] {
  return demoHighlights.filter((h) => h.category_slug === categorySlug);
}

export function getFeaturedDemoHighlight(): DemoHighlight | null {
  return (
    demoHighlights.find((h) => h.featured) ??
    demoHighlights[0] ??
    null
  );
}

export function getCategoryBySlug(slug: string): DemoCategory | null {
  return demoCategories.find((c) => c.slug === slug) ?? null;
}

/** Only return categories that actually have highlights */
export function getCategoriesWithHighlights(): DemoCategory[] {
  const slugsWithData = new Set(demoHighlights.map((h) => h.category_slug));
  return demoCategories.filter((c) => slugsWithData.has(c.slug));
}
