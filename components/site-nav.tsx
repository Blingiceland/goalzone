"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { ClipboardList, Clapperboard, LogOut, Upload, UserRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { t } from "@/lib/i18n/translations";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export function SiteNav() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let mounted = true;

    async function loadSession(activeClient: SupabaseBrowserClient) {
      const { data } = await activeClient.auth.getUser();
      if (!mounted) return;

      setUser(data.user);
      setProfileError(null);

      if (data.user) {
        const { data: profileData, error } = await activeClient
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();
        if (error) {
          console.error("Goalzone profile lookup failed", error);
          if (mounted) {
            setProfile(null);
            setProfileError(error.message);
          }
          return;
        }
        if (mounted) setProfile(profileData);
      } else {
        setProfile(null);
      }
    }

    void loadSession(client);

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange(() => {
      void loadSession(client);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    if (!supabase) return;

    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const canSubmit = profile?.role === "uploader" || profile?.role === "admin";

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2">
      {user && (
        <span className="hidden rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/55 md:inline-flex">
          {user.email ?? "Innskráður"} ·{" "}
          {profileError
            ? "Villa í hlutverki"
            : profile
              ? t.roleLabels[profile.role]
              : "Enginn prófíll"}
        </span>
      )}
      <Link
        href="/apply"
        className="hidden rounded-lg px-3 py-2 text-sm font-bold text-white/68 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
      >
        {t.nav.apply}
      </Link>
      {canSubmit && (
        <Link
          href="/submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-flood/30 bg-flood/10 px-3 text-sm font-bold text-flood transition hover:bg-flood hover:text-pitch-950"
          title={t.nav.submit}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">{t.nav.submit}</span>
        </Link>
      )}
      {profile?.role === "admin" && (
        <>
          <Link
            href="/admin/applications"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white/72 transition hover:text-flood"
            title={t.nav.adminApplications}
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden lg:inline">{t.nav.adminApplications}</span>
          </Link>
          <Link
            href="/admin/highlights"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white/72 transition hover:text-flood"
            title={t.nav.adminHighlights}
          >
            <Clapperboard className="h-4 w-4" />
            <span className="hidden lg:inline">{t.nav.adminHighlights}</span>
          </Link>
        </>
      )}
      {user ? (
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white/72 transition hover:text-flood"
          type="button"
          title={t.common.signOut}
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t.common.signOut}</span>
        </button>
      ) : (
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white/72 transition hover:text-flood"
          title={t.common.signIn}
        >
          <UserRound className="h-4 w-4" />
          <span className="hidden sm:inline">{t.common.signIn}</span>
        </Link>
      )}
    </nav>
  );
}
