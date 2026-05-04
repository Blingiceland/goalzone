"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Send } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { t } from "@/lib/i18n/translations";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Application = Database["public"]["Tables"]["uploader_applications"]["Row"];

export default function ApplyPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [clubName, setClubName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

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

      setContactEmail(currentUser.email ?? "");

      const [
        { data: profileData, error: profileLoadError },
        { data: applicationData }
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle(),
        supabase
          .from("uploader_applications")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
      ]);

      if (profileLoadError) {
        console.error("Goalzone profile lookup failed", profileLoadError);
        setProfileError(profileLoadError.message);
      }

      setProfile(profileData);
      setApplications(applicationData ?? []);
      setLoading(false);
    }

    void load();
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase || !user) {
      setError(t.apply.signInTitle);
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("uploader_applications").insert({
      user_id: user.id,
      club_name: clubName,
      team_name: null,
      contact_email: contactEmail,
      reason
    });
    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    const { data } = await supabase
      .from("uploader_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setApplications(data ?? []);
    setMessage(t.apply.success);
    setClubName("");
    setReason("");
  }

  if (!supabase) {
    return <SetupNotice />;
  }

  if (loading) {
    return <p className="text-white/62">{t.apply.loading}</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="label">{t.apply.uploaderAccess}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{t.apply.signInTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-white/62">
          {t.apply.signInCopy}
        </p>
        <Link href="/login?mode=signup" className="button-primary mt-5">
          {t.apply.createOrSignIn}
        </Link>
      </div>
    );
  }

  const latestApplication = applications[0];
  const hasOpenApplication = latestApplication?.status === "pending";
  const canApply = !hasOpenApplication && profile?.role !== "uploader" && profile?.role !== "admin";

  return (
    <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="space-y-4">
        <p className="label">{t.apply.uploaderAccess}</p>
        <h1 className="text-4xl font-black leading-tight text-white">{t.apply.title}</h1>
        <p className="text-base leading-7 text-white/62">
          {t.apply.intro}
        </p>
        <div className="panel p-4">
          <p className="text-sm text-white/52">{t.apply.currentRole}</p>
          <p className="mt-1 text-2xl font-black capitalize text-flood">
            {profile ? t.roleLabels[profile.role] : profileError ? "Villa í hlutverki" : "Enginn prófíll"}
          </p>
          {user.email && <p className="mt-2 text-sm text-white/45">{user.email}</p>}
          {profileError && <p className="mt-2 text-sm text-red-100">{profileError}</p>}
        </div>
        {latestApplication && (
          <div className="panel p-4">
            <p className="text-sm text-white/52">{t.apply.latestApplication}</p>
            <p className="mt-1 text-lg font-black capitalize text-white">
              {t.statusLabels[latestApplication.status]}
            </p>
            <p className="mt-2 text-sm text-white/50">{latestApplication.club_name}</p>
          </div>
        )}
      </section>

      <section className="panel p-5 sm:p-6">
        {canApply ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="label" htmlFor="club_name">
                {t.apply.clubOrTeamName}
              </label>
              <input
                className="field"
                id="club_name"
                value={clubName}
                onChange={(event) => setClubName(event.target.value)}
                placeholder={t.apply.clubOrTeamPlaceholder}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="label" htmlFor="contact_email">
                {t.apply.contactEmail}
              </label>
              <input
                className="field"
                id="contact_email"
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="label" htmlFor="reason">
                {t.apply.note}
              </label>
              <textarea
                className="field min-h-36 resize-y"
                id="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg border border-flood/30 bg-flood/10 px-3 py-2 text-sm text-flood">
                {message}
              </p>
            )}
            <button className="button-primary w-full" type="submit" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? t.apply.submitting : t.apply.submit}
            </button>
          </form>
        ) : (
          <div>
            <h2 className="text-2xl font-black text-white">{t.apply.closedTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/62">
              {profile?.role === "uploader" || profile?.role === "admin"
                ? t.apply.alreadyUploader
                : t.apply.pending}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl panel p-6">
      <p className="label">{t.common.configuredMissing}</p>
      <h1 className="mt-2 text-3xl font-black text-white">{t.apply.missingSupabaseTitle}</h1>
      <p className="mt-3 text-sm leading-6 text-white/62">
        {t.apply.missingSupabaseCopy}
      </p>
    </div>
  );
}
