"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Check, Clapperboard, Save, X } from "lucide-react";
import { HighlightVideo } from "@/components/highlight-video";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { competitionOptions } from "@/lib/classification";
import { highlightTypes, t, type HighlightType } from "@/lib/i18n/translations";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Highlight = Database["public"]["Tables"]["highlights"]["Row"] & {
  profiles?: Pick<Profile, "email" | "display_name" | "role"> | null;
};

type ModerationHighlight = Highlight & {
  signedUrl: string | null;
};

type ModerationUpdate = {
  title: string;
  description: string | null;
  type: HighlightType;
  category_id: string | null;
  player_name: string | null;
  club_name: string | null;
  team_name: string | null;
  opponent_team_name: string | null;
  competition: string | null;
  season: string | null;
  match_date: string | null;
  location: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("is-IS", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const videoBucket = "highlight-videos";

export default function AdminHighlightsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [highlights, setHighlights] = useState<ModerationHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!supabase) return;

    const { data, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name_is", { ascending: true });

    if (categoryError) {
      setError(categoryError.message);
      return;
    }

    setCategories(data ?? []);
  }, [supabase]);

  const loadHighlights = useCallback(async () => {
    if (!supabase) return;

    const { data, error: queryError } = await supabase
      .from("highlights")
      .select("*, profiles!highlights_uploader_id_fkey(email, display_name, role)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      return;
    }

    const rows = (data ?? []) as Highlight[];
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

    setHighlights(withUrls);
  }, [supabase]);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData.user;
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      if (profileData?.role === "admin") {
        await Promise.all([loadCategories(), loadHighlights()]);
      }

      setLoading(false);
    }

    void load();
  }, [loadCategories, loadHighlights, supabase]);

  async function saveHighlight(
    id: string,
    values: ModerationUpdate,
    status?: "approved" | "rejected"
  ) {
    if (!supabase || !user) return false;

    if (!values.title.trim()) {
      setError(t.adminHighlights.titleRequired);
      return false;
    }

    if (status === "approved" && categories.length > 0 && !values.category_id) {
      setError(t.adminHighlights.categoryRequired);
      return false;
    }

    if (status === "approved" && !values.competition) {
      setError(t.adminHighlights.competitionRequired);
      return false;
    }

    setBusyId(id);
    setError(null);

    const update: Database["public"]["Tables"]["highlights"]["Update"] = {
      title: values.title.trim(),
      description: values.description,
      type: values.type,
      category_id: values.category_id,
      player_name: values.player_name,
      club_name: values.club_name,
      team_name: values.team_name,
      opponent_team_name: values.opponent_team_name,
      competition: values.competition,
      season: values.season,
      match_date: values.match_date,
      location: values.location
    };

    if (status) {
      update.status = status;
      update.reviewed_by = user.id;
      update.reviewed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase.from("highlights").update(update).eq("id", id);

    setBusyId(null);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    if (status === "rejected") {
      const rejectedHighlight = highlights.find((highlight) => highlight.id === id);
      if (rejectedHighlight?.video_path) {
        const { error: removeError } = await supabase.storage
          .from(videoBucket)
          .remove([rejectedHighlight.video_path]);

        if (removeError) {
          setError(removeError.message);
          return false;
        }
      }
    }

    await loadHighlights();
    return true;
  }

  if (!supabase) {
    return (
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="label">{t.common.configuredMissing}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{t.common.configuredMissing}</h1>
      </div>
    );
  }

  if (loading) {
    return <p className="text-white/62">{t.adminHighlights.loading}</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="label">{t.common.admin}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{t.adminHighlights.signInRequired}</h1>
        <Link href="/login" className="button-primary mt-5">
          {t.common.signIn}
        </Link>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="label">{t.common.admin}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{t.adminHighlights.requiresAdmin}</h1>
        <p className="mt-3 text-sm leading-6 text-white/62">
          {t.apply.currentRole}: {t.roleLabels[profile?.role ?? "viewer"]}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label">{t.adminHighlights.queue}</p>
          <h1 className="mt-2 text-4xl font-black text-white">{t.adminHighlights.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
            {t.adminHighlights.classificationHelp}
          </p>
        </div>
        <p className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-white/58">
          {highlights.length} {t.adminHighlights.countSuffix}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm text-red-100">
          {t.common.errorPrefix}: {error}
        </p>
      )}

      <section className="grid gap-4">
        {highlights.map((highlight) => (
          <ModerationCard
            busy={busyId === highlight.id}
            categories={categories}
            highlight={highlight}
            key={highlight.id}
            onSave={saveHighlight}
          />
        ))}

        {highlights.length === 0 && (
          <div className="panel p-8 text-sm text-white/58">
            <div className="flex items-center gap-3">
              <Clapperboard className="h-5 w-5 text-flood" />
              {t.adminHighlights.empty}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ModerationCard({
  busy,
  categories,
  highlight,
  onSave
}: {
  busy: boolean;
  categories: Category[];
  highlight: ModerationHighlight;
  onSave: (
    id: string,
    values: ModerationUpdate,
    status?: "approved" | "rejected"
  ) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(highlight.title);
  const [description, setDescription] = useState(highlight.description ?? "");
  const [highlightType, setHighlightType] = useState<HighlightType>(highlight.type as HighlightType);
  const [categoryId, setCategoryId] = useState(highlight.category_id ?? "");
  const [playerName, setPlayerName] = useState(highlight.player_name ?? "");
  const [clubName, setClubName] = useState(highlight.club_name ?? "");
  const [teamName, setTeamName] = useState(highlight.team_name ?? "");
  const [opponentTeamName, setOpponentTeamName] = useState(highlight.opponent_team_name ?? "");
  const [competition, setCompetition] = useState(highlight.competition ?? "");
  const [season, setSeason] = useState(highlight.season ?? "");
  const [matchDate, setMatchDate] = useState(highlight.match_date ?? "");
  const [location, setLocation] = useState(highlight.location ?? "");
  const [saved, setSaved] = useState(false);

  const applicant =
    highlight.profiles?.display_name || highlight.profiles?.email || highlight.uploader_id;
  const selectedCategory = categories.find((category) => category.id === categoryId);

  async function handleSave(status?: "approved" | "rejected") {
    const wasSaved = await onSave(
      highlight.id,
      {
        title,
        description: nullableText(description),
        type: highlightType,
        category_id: categoryId || null,
        player_name: nullableText(playerName),
        club_name: nullableText(clubName),
        team_name: nullableText(teamName),
        opponent_team_name: nullableText(opponentTeamName),
        competition: nullableText(competition),
        season: nullableText(season),
        match_date: matchDate || null,
        location: nullableText(location)
      },
      status
    );

    if (wasSaved && !status) {
      setSaved(true);
    }
  }

  return (
    <article className="panel overflow-hidden">
      <div className="grid gap-0 xl:grid-cols-[27rem_1fr]">
        <div className="bg-black">
          <div className="aspect-video xl:sticky xl:top-24">
            <HighlightVideo
              signedUrl={highlight.signedUrl}
              unavailableLabel={t.adminHighlights.videoMissing}
              videoUrl={highlight.external_video_url ?? highlight.video_url}
              title={highlight.title}
            />
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-flood px-2.5 py-1 text-xs font-black text-pitch-950">
              {t.highlightTypes[highlightType]}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/58">
              {t.statusLabels[highlight.status]}
            </span>
            {selectedCategory && (
              <span className="rounded-full border border-flood/20 bg-flood/10 px-2.5 py-1 text-xs font-semibold text-flood">
                {selectedCategory.name_is}
              </span>
            )}
            {highlight.match_date && (
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/58">
                {dateFormatter.format(new Date(highlight.match_date))}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label={t.submit.titleField} htmlFor={`title-${highlight.id}`} required>
              <input
                className="field"
                id={`title-${highlight.id}`}
                value={title}
                onChange={(event) => {
                  setSaved(false);
                  setTitle(event.target.value);
                }}
                required
              />
            </AdminField>

            <AdminField label={t.submit.type} htmlFor={`type-${highlight.id}`} required>
              <select
                className="field"
                id={`type-${highlight.id}`}
                value={highlightType}
                onChange={(event) => {
                  setSaved(false);
                  setHighlightType(event.target.value as HighlightType);
                }}
                required
              >
                {highlightTypes.map((type) => (
                  <option key={type} value={type}>
                    {t.highlightTypes[type]}
                  </option>
                ))}
              </select>
            </AdminField>

            {categories.length > 0 && (
              <AdminField label={t.submit.category} htmlFor={`category-${highlight.id}`} required>
                <select
                  className="field"
                  id={`category-${highlight.id}`}
                  value={categoryId}
                  onChange={(event) => {
                    setSaved(false);
                    setCategoryId(event.target.value);
                  }}
                  required
                >
                  <option value="">{t.submit.selectCategory}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_is}
                    </option>
                  ))}
                </select>
              </AdminField>
            )}

            <AdminField label={t.submit.competition} htmlFor={`competition-${highlight.id}`} required>
              <select
                className="field"
                id={`competition-${highlight.id}`}
                value={competition}
                onChange={(event) => {
                  setSaved(false);
                  setCompetition(event.target.value);
                }}
                required
              >
                <option value="">{t.submit.selectCompetition}</option>
                {competition && !competitionOptions.includes(competition as (typeof competitionOptions)[number]) && (
                  <option value={competition}>{competition}</option>
                )}
                {competitionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label={t.submit.playerName} htmlFor={`player-${highlight.id}`}>
              <input
                className="field"
                id={`player-${highlight.id}`}
                value={playerName}
                onChange={(event) => {
                  setSaved(false);
                  setPlayerName(event.target.value);
                }}
              />
            </AdminField>

            <AdminField label={t.submit.clubName} htmlFor={`club-${highlight.id}`}>
              <input
                className="field"
                id={`club-${highlight.id}`}
                value={clubName}
                onChange={(event) => {
                  setSaved(false);
                  setClubName(event.target.value);
                }}
              />
            </AdminField>

            <AdminField label={t.submit.teamName} htmlFor={`team-${highlight.id}`}>
              <input
                className="field"
                id={`team-${highlight.id}`}
                value={teamName}
                onChange={(event) => {
                  setSaved(false);
                  setTeamName(event.target.value);
                }}
              />
            </AdminField>

            <AdminField label={t.submit.opponentTeamName} htmlFor={`opponent-${highlight.id}`}>
              <input
                className="field"
                id={`opponent-${highlight.id}`}
                value={opponentTeamName}
                onChange={(event) => {
                  setSaved(false);
                  setOpponentTeamName(event.target.value);
                }}
              />
            </AdminField>

            <AdminField label={t.submit.season} htmlFor={`season-${highlight.id}`}>
              <input
                className="field"
                id={`season-${highlight.id}`}
                value={season}
                onChange={(event) => {
                  setSaved(false);
                  setSeason(event.target.value);
                }}
              />
            </AdminField>

            <AdminField label={t.submit.matchDate} htmlFor={`match-date-${highlight.id}`}>
              <input
                className="field"
                id={`match-date-${highlight.id}`}
                type="date"
                value={matchDate}
                onChange={(event) => {
                  setSaved(false);
                  setMatchDate(event.target.value);
                }}
              />
            </AdminField>

            <AdminField label={t.submit.location} htmlFor={`location-${highlight.id}`}>
              <input
                className="field"
                id={`location-${highlight.id}`}
                value={location}
                onChange={(event) => {
                  setSaved(false);
                  setLocation(event.target.value);
                }}
              />
            </AdminField>
          </div>

          <AdminField label={t.submit.description} htmlFor={`description-${highlight.id}`}>
            <textarea
              className="field min-h-24 resize-y"
              id={`description-${highlight.id}`}
              value={description}
              onChange={(event) => {
                setSaved(false);
                setDescription(event.target.value);
              }}
            />
          </AdminField>

          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-white/56">
            {t.adminApplications.applicant}: <span className="font-bold text-white/76">{applicant}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              className="button-secondary"
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
            >
              <Save className="h-4 w-4" />
              {t.adminHighlights.saveMetadata}
            </button>
            <button
              className="button-primary"
              type="button"
              disabled={busy}
              onClick={() => void handleSave("approved")}
            >
              <Check className="h-4 w-4" />
              {t.adminHighlights.approveWithMetadata}
            </button>
            <button
              className="button-secondary"
              type="button"
              disabled={busy}
              onClick={() => void handleSave("rejected")}
            >
              <X className="h-4 w-4" />
              {t.common.reject}
            </button>
            {saved && <span className="text-sm font-semibold text-flood">{t.adminHighlights.saved}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

function AdminField({
  children,
  htmlFor,
  label,
  required = false
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="label" htmlFor={htmlFor}>
        {label}
        {!required && <span className="ml-2 text-white/35">{t.common.optional}</span>}
      </label>
      {children}
    </div>
  );
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
