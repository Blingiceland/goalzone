"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { FileVideo, Link2, Send, ShieldCheck, Upload } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { competitionOptions } from "@/lib/classification";
import { highlightTypes, t, type HighlightType } from "@/lib/i18n/translations";
import { getExternalVideo } from "@/lib/video";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type VideoSource = "external" | "upload";

const videoBucket = "highlight-videos";
const maxUploadBytes = 500 * 1024 * 1024;

export default function SubmitPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [highlightType, setHighlightType] = useState<HighlightType>("goal");
  const [categoryId, setCategoryId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [clubName, setClubName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [opponentTeamName, setOpponentTeamName] = useState("");
  const [competition, setCompetition] = useState("");
  const [season, setSeason] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [location, setLocation] = useState("");
  const [videoSource, setVideoSource] = useState<VideoSource>("external");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

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

      const [
        { data: profileData, error: profileError },
        { data: categoryRows, error: categoryError }
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
        supabase
          .from("categories")
          .select("*")
          .order("display_order", { ascending: true })
          .order("name_is", { ascending: true })
      ]);

      const loadError = profileError ?? categoryError;
      if (loadError) {
        setError(loadError.message);
      }

      setProfile(profileData);
      setCategories(categoryRows ?? []);
      setLoading(false);
    }

    void load();
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setMessage(null);

    if (!supabase || !user) {
      setError(t.adminHighlights.signInRequired);
      return;
    }

    const externalVideo = videoSource === "external" ? getExternalVideo(videoUrl) : null;

    if (videoSource === "external" && !externalVideo) {
      setError(t.submit.unsupportedVideoUrl);
      return;
    }

    if (videoSource === "upload" && !videoFile) {
      setError(t.submit.selectFile);
      return;
    }

    if (videoSource === "upload" && videoFile && videoFile.size > maxUploadBytes) {
      setError(t.submit.fileTooLarge);
      return;
    }

    if (categories.length > 0 && !categoryId) {
      setError(t.submit.categoryRequired);
      return;
    }

    if (!competition) {
      setError(t.submit.competitionRequired);
      return;
    }

    const timestamp = Date.now();
    const videoPath =
      videoSource === "upload" && videoFile
        ? `${user.id}/${timestamp}-${sanitizeFileName(videoFile.name)}`
        : null;

    setSubmitting(true);

    if (videoSource === "upload" && videoFile && videoPath) {
      const { error: uploadError } = await supabase.storage.from(videoBucket).upload(videoPath, videoFile, {
        cacheControl: "3600",
        contentType: videoFile.type || "video/mp4",
        upsert: false
      });

      if (uploadError) {
        setSubmitting(false);
        setError(uploadError.message);
        return;
      }
    }

    const { error: insertError } = await supabase.from("highlights").insert({
      uploader_id: user.id,
      title,
      description: nullableText(description),
      type: highlightType,
      category_id: categoryId || null,
      status: "pending",
      player_name: nullableText(playerName),
      club_name: nullableText(clubName),
      team_name: nullableText(teamName),
      opponent_team_name: nullableText(opponentTeamName),
      competition: nullableText(competition),
      season: nullableText(season),
      match_date: matchDate || null,
      location: nullableText(location),
      video_path: videoPath,
      video_url: videoSource === "external" ? nullableText(videoUrl) : null,
      video_provider: externalVideo?.provider ?? (videoSource === "upload" ? "upload" : null),
      external_video_url: videoSource === "external" ? nullableText(videoUrl) : null,
      external_video_provider: externalVideo?.provider ?? null
    });

    setSubmitting(false);

    if (insertError) {
      if (videoPath) {
        await supabase.storage.from(videoBucket).remove([videoPath]);
      }
      setError(insertError.message);
      return;
    }

    setMessage(t.submit.success);
    setTitle("");
    setDescription("");
    setHighlightType("goal");
    setCategoryId("");
    setPlayerName("");
    setClubName("");
    setTeamName("");
    setOpponentTeamName("");
    setCompetition("");
    setSeason("");
    setMatchDate("");
    setLocation("");
    setVideoSource("external");
    setVideoUrl("");
    setVideoFile(null);
    form.reset();
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
    return <p className="text-white/62">{t.submit.loading}</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="label">{t.submit.uploadAccess}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{t.adminHighlights.signInRequired}</h1>
        <Link href="/login" className="button-primary mt-5">
          {t.common.signIn}
        </Link>
      </div>
    );
  }

  const canSubmit = profile?.role === "uploader" || profile?.role === "admin";

  if (!canSubmit) {
    return (
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="label">{t.submit.uploadAccess}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{t.submit.requiresApproval}</h1>
        <p className="mt-3 text-sm leading-6 text-white/62">
          {t.apply.currentRole}: {t.roleLabels[profile?.role ?? "viewer"]}.
        </p>
        <Link href="/apply" className="button-primary mt-5">
          {t.nav.apply}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr]">
      <section className="space-y-5">
        <p className="label">{t.submit.uploadAccess}</p>
        <h1 className="text-4xl font-black leading-tight text-white">{t.submit.title}</h1>
        <p className="text-base leading-7 text-white/62">{t.submit.simpleIntro}</p>
        <div className="panel p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-flood" />
            <div>
              <p className="text-sm font-bold text-white">{t.statusLabels.pending}</p>
              <p className="mt-1 text-sm leading-6 text-white/56">{t.home.statModeratedCopy}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="label">{t.submit.formTitle}</p>
            <h2 className="mt-1 text-2xl font-black text-white">{t.submit.title}</h2>
          </div>
          <FileVideo className="h-7 w-7 text-flood" />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.submit.titleField} htmlFor="title" required>
              <input
                className="field"
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Field>

            <Field label={t.submit.type} htmlFor="highlightType" required>
              <select
                className="field"
                id="highlightType"
                value={highlightType}
                onChange={(event) => setHighlightType(event.target.value as HighlightType)}
                required
              >
                {highlightTypes.map((type) => (
                  <option key={type} value={type}>
                    {t.highlightTypes[type]}
                  </option>
                ))}
              </select>
            </Field>

            {categories.length > 0 && (
              <Field label={t.submit.category} htmlFor="categoryId" required>
                <select
                  className="field"
                  id="categoryId"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  required
                >
                  <option value="">{t.submit.selectCategory}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_is}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label={t.submit.competition} htmlFor="competition" required>
              <select
                className="field"
                id="competition"
                value={competition}
                onChange={(event) => setCompetition(event.target.value)}
                required
              >
                <option value="">{t.submit.selectCompetition}</option>
                {competitionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="space-y-3">
            <p className="label">{t.submit.videoSource}</p>
            <div className="grid gap-2 rounded-lg bg-white/[0.05] p-1 sm:grid-cols-2">
              <button
                className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                  videoSource === "external"
                    ? "bg-flood text-pitch-950"
                    : "text-white/62 hover:text-white"
                }`}
                type="button"
                onClick={() => setVideoSource("external")}
              >
                <Link2 className="h-4 w-4" />
                {t.submit.videoLink}
              </button>
              <button
                className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                  videoSource === "upload"
                    ? "bg-flood text-pitch-950"
                    : "text-white/62 hover:text-white"
                }`}
                type="button"
                onClick={() => setVideoSource("upload")}
              >
                <Upload className="h-4 w-4" />
                {t.submit.uploadFile}
              </button>
            </div>
          </div>

          {videoSource === "external" ? (
            <Field label={t.submit.videoUrl} htmlFor="videoUrl" required>
              <input
                className="field"
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </Field>
          ) : (
            <Field label={t.submit.file} htmlFor="videoFile" required>
              <input
                className="field file:mr-4 file:rounded-md file:border-0 file:bg-flood file:px-3 file:py-2 file:text-sm file:font-black file:text-pitch-950"
                id="videoFile"
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setVideoFile(file);
                  if (file && file.size > maxUploadBytes) {
                    setError(t.submit.fileTooLarge);
                  } else {
                    setError(null);
                  }
                }}
                required
              />
              {videoFile && (
                <p className="text-sm text-white/48">
                  {(videoFile.size / 1024 / 1024).toFixed(1)} MB / 500 MB
                </p>
              )}
            </Field>
          )}

          <details className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <summary className="cursor-pointer text-sm font-black text-white">
              {t.submit.moreDetails}
            </summary>
            <div className="mt-4 space-y-4">
              <Field label={t.submit.description} htmlFor="description">
                <textarea
                  className="field min-h-24 resize-y"
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.submit.playerName} htmlFor="playerName">
                  <input
                    className="field"
                    id="playerName"
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                  />
                </Field>
                <Field label={t.submit.clubName} htmlFor="clubName">
                  <input
                    className="field"
                    id="clubName"
                    value={clubName}
                    onChange={(event) => setClubName(event.target.value)}
                  />
                </Field>
                <Field label={t.submit.teamName} htmlFor="teamName">
                  <input
                    className="field"
                    id="teamName"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                  />
                </Field>
                <Field label={t.submit.opponentTeamName} htmlFor="opponentTeamName">
                  <input
                    className="field"
                    id="opponentTeamName"
                    value={opponentTeamName}
                    onChange={(event) => setOpponentTeamName(event.target.value)}
                  />
                </Field>
                <Field label={t.submit.season} htmlFor="season">
                  <input
                    className="field"
                    id="season"
                    value={season}
                    onChange={(event) => setSeason(event.target.value)}
                  />
                </Field>
                <Field label={t.submit.matchDate} htmlFor="matchDate">
                  <input
                    className="field"
                    id="matchDate"
                    type="date"
                    value={matchDate}
                    onChange={(event) => setMatchDate(event.target.value)}
                  />
                </Field>
                <Field label={t.submit.location} htmlFor="location">
                  <input
                    className="field"
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                </Field>
              </div>
            </div>
          </details>

          {error && (
            <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm text-red-100">
              {t.common.errorPrefix}: {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg border border-flood/30 bg-flood/10 px-3 py-2 text-sm text-flood">
              {message}
            </p>
          )}

          <button className="button-primary w-full" type="submit" disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? t.submit.submitting : t.common.submit}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
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

function sanitizeFileName(fileName: string) {
  const cleanName = fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleanName || "highlight.mp4";
}
