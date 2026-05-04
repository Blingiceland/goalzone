"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Check, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { t } from "@/lib/i18n/translations";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Application = Database["public"]["Tables"]["uploader_applications"]["Row"] & {
  profiles?: Pick<Profile, "email" | "display_name" | "role"> | null;
};

export default function AdminApplicationsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    if (!supabase) return;

    const { data, error: queryError } = await supabase
      .from("uploader_applications")
      .select("*, profiles!uploader_applications_user_id_fkey(email, display_name, role)")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      return;
    }

    setApplications((data ?? []) as Application[]);
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
        await loadApplications();
      }

      setLoading(false);
    }

    void load();
  }, [loadApplications, supabase]);

  async function reviewApplication(id: string, status: "approved" | "rejected") {
    if (!supabase || !user) return;

    setBusyId(id);
    setError(null);
    const { error: updateError } = await supabase
      .from("uploader_applications")
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id);
    setBusyId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadApplications();
  }

  if (!supabase) {
    return (
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="label">{t.common.configuredMissing}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{t.common.configuredMissing}</h1>
        <p className="mt-3 text-sm leading-6 text-white/62">
          {t.adminApplications.introMissingSupabase}
        </p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-white/62">{t.adminApplications.loading}</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="label">{t.common.admin}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{t.adminApplications.signInRequired}</h1>
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
        <h1 className="mt-2 text-3xl font-black text-white">{t.adminApplications.requiresAdmin}</h1>
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
          <p className="label">{t.adminApplications.queue}</p>
          <h1 className="mt-2 text-4xl font-black text-white">{t.adminApplications.title}</h1>
        </div>
        <p className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-white/58">
          {applications.filter((application) => application.status === "pending").length}{" "}
          {t.adminApplications.countSuffix}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-lg border border-white/10">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
          <span>{t.adminApplications.applicant}</span>
          <span>{t.common.status}</span>
          <span>{t.common.review}</span>
        </div>
        <div className="divide-y divide-white/10">
          {applications.map((application) => (
            <article
              key={application.id}
              className="grid gap-4 bg-pitch-950/35 px-4 py-4 lg:grid-cols-[1fr_8rem_10rem] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-black text-white">
                    {application.profiles?.display_name ||
                      application.profiles?.email ||
                      application.contact_email}
                  </h2>
                  <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-xs font-semibold text-white/50">
                    {t.roleLabels[application.profiles?.role ?? "viewer"]}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-flood">{application.club_name}</p>
                {application.team_name && (
                  <p className="text-sm text-white/52">{application.team_name}</p>
                )}
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
                  {application.reason}
                </p>
              </div>
              <p className="w-fit rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-bold capitalize text-white">
                {t.statusLabels[application.status]}
              </p>
              <div className="flex gap-2">
                <button
                  className="button-primary h-10 w-10 px-0"
                  type="button"
                  title={t.common.approve}
                  disabled={busyId === application.id || application.status === "approved"}
                  onClick={() => reviewApplication(application.id, "approved")}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  className="button-secondary h-10 w-10 px-0"
                  type="button"
                  title={t.common.reject}
                  disabled={busyId === application.id || application.status === "rejected"}
                  onClick={() => reviewApplication(application.id, "rejected")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
          {applications.length === 0 && (
            <p className="bg-pitch-950/35 px-4 py-8 text-sm text-white/52">
              {t.adminApplications.empty}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
