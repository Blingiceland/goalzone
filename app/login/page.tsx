"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n/translations";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError(t.auth.missingSupabase);
      return;
    }

    setLoading(true);
    const authAction =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error: authError } = await authAction;
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "signin") {
      window.location.href = "/apply";
      return;
    }

    setMessage(t.auth.createSuccess);
    setMode("signin");
    setPassword("");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <section className="space-y-5">
        <p className="label">{t.auth.access}</p>
        <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
          {t.auth.title}
        </h1>
        <p className="text-base leading-7 text-white/62">
          {t.auth.intro}
        </p>
        <Link href="/apply" className="inline-flex text-sm font-bold text-flood hover:text-white">
          {t.auth.uploaderApplication}
        </Link>
      </section>

      <section className="panel p-5 sm:p-6">
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-white/[0.05] p-1">
          <button
            className={`rounded-md px-3 py-2 text-sm font-bold transition ${
              mode === "signin" ? "bg-flood text-pitch-950" : "text-white/62 hover:text-white"
            }`}
            type="button"
            onClick={() => setMode("signin")}
          >
            {t.common.signIn}
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm font-bold transition ${
              mode === "signup" ? "bg-flood text-pitch-950" : "text-white/62 hover:text-white"
            }`}
            type="button"
            onClick={() => setMode("signup")}
          >
            {t.auth.createAccount}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="label" htmlFor="email">
              {t.common.email}
            </label>
            <input
              className="field"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="label" htmlFor="password">
              {t.common.password}
            </label>
            <input
              className="field"
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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

          <button className="button-primary w-full" type="submit" disabled={loading}>
            {mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {loading
              ? t.auth.submitWorking
              : mode === "signin"
                ? t.common.signIn
                : t.auth.createAccount}
          </button>
        </form>
      </section>
    </div>
  );
}
