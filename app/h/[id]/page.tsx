import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, MessageCircle, Tag, Trophy, User } from "lucide-react";
import { getDemoHighlight } from "@/lib/demo-data";
import { getMockHighlight, getMockComments } from "@/lib/mock-highlights";
import { HighlightVideo } from "@/components/highlight-video";
import { ShareButton } from "@/components/share-button";
import { HighlightDetailEngagement } from "@/components/highlight-detail-engagement";
import { t } from "@/lib/i18n/translations";

const dateFormatter = new Intl.DateTimeFormat("is-IS", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const commentDateFormatter = new Intl.DateTimeFormat("is-IS", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const demo = getDemoHighlight(id);
  const mock = getMockHighlight(id);
  const highlight = demo ?? mock;

  if (!highlight) {
    return { title: "Klippa finnst ekki — Goalzone" };
  }

  return {
    title: `${highlight.title} — Goalzone`,
    description: highlight.description,
    openGraph: {
      title: highlight.title,
      description: highlight.discussion_prompt ?? highlight.description,
      siteName: "Goalzone",
    },
  };
}

export default async function HighlightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Prefer JSON demo data; fall back to legacy mock data
  const demoH = getDemoHighlight(id);
  const mockH = getMockHighlight(id);

  if (!demoH && !mockH) {
    notFound();
  }

  // Normalise into a flat shape both sources share
  const highlight = demoH
    ? {
        ...demoH,
        external_video_url: demoH.external_url,
        video_url: null as string | null,
      }
    : {
        ...mockH!,
        external_url: null as string | null,
        external_video_url: mockH?.external_video_url ?? null,
        video_url: mockH?.video_url ?? null,
      };

  const comments = getMockComments(id);
  const shareUrl = `/h/${id}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Video player ─────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-flood/20 bg-black shadow-glow">
        <div className="relative aspect-video bg-black">
          <HighlightVideo
            embedStatus={demoH?.embed_status}
            signedUrl={null}
            unavailableLabel={t.home.videoUnavailable}
            videoUrl={highlight.external_video_url ?? highlight.video_url}
            title={highlight.title}
          />
        </div>
      </div>

      {/* ── Title + type badges ───────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-flood px-3 py-1 text-xs font-black text-pitch-950">
            {t.highlightTypes[highlight.type]}
          </span>
          {highlight.competition && (
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/65">
              {highlight.competition}
            </span>
          )}
          {highlight.season && (
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/65">
              {highlight.season}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
          {highlight.title}
        </h1>

        {highlight.description && (
          <p className="text-base leading-7 text-white/62">{highlight.description}</p>
        )}
      </div>

      {/* ── Engagement row (client island) ───────────── */}
      <HighlightDetailEngagement
        commentsCount={highlight.comments_count}
        highlightId={id}
        initialLikes={highlight.likes}
        shareTitle={highlight.title}
        shareUrl={shareUrl}
        views={highlight.views}
      />

      {/* ── Discussion prompt ─────────────────────────── */}
      {highlight.discussion_prompt && (
        <div className="rounded-xl border border-flood/25 bg-flood/8 px-5 py-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-flood">
            Umræðuspurning
          </p>
          <p className="mt-2 text-lg font-black leading-snug text-white">
            {highlight.discussion_prompt}
          </p>
        </div>
      )}

      {/* ── Metadata grid ─────────────────────────────── */}
      <div className="panel grid gap-4 p-5 sm:grid-cols-2">
        {highlight.player_name && (
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-flood" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Leikmaður
              </p>
              <p className="mt-0.5 font-bold text-white">{highlight.player_name}</p>
            </div>
          </div>
        )}

        {highlight.team_name && highlight.opponent_team_name && (
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-flood" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Leikur</p>
              <p className="mt-0.5 font-bold text-white">
                {highlight.team_name}{" "}
                <span className="font-normal text-white/55">gegn</span>{" "}
                {highlight.opponent_team_name}
              </p>
            </div>
          </div>
        )}

        {highlight.match_date && (
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-flood" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Leikdagur
              </p>
              <p className="mt-0.5 font-bold text-white">
                {dateFormatter.format(new Date(highlight.match_date))}
              </p>
            </div>
          </div>
        )}

        {highlight.location && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Staðsetning
              </p>
              <p className="mt-0.5 font-bold text-white">{highlight.location}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Sent inn af
            </p>
            <p className="mt-0.5 font-bold text-white">
              {highlight.submitted_by}
              {highlight.submitted_by_club && (
                <span className="ml-1.5 text-sm font-normal text-white/55">
                  · {highlight.submitted_by_club}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tags ──────────────────────────────────────── */}
      {highlight.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-white/35" />
          {highlight.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/58 transition hover:border-flood/30 hover:text-flood"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Comments section ──────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-t border-white/8 pt-6">
          <MessageCircle className="h-5 w-5 text-flood" />
          <h2 className="text-lg font-black text-white">
            Athugasemdir{" "}
            <span className="text-base font-semibold text-white/45">
              ({comments.length})
            </span>
          </h2>
        </div>

        {comments.length === 0 && (
          <p className="text-sm text-white/45">Engar athugasemdir enn. Vertu fyrstur!</p>
        )}

        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="panel flex gap-3 p-4">
              {/* Avatar */}
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-black text-pitch-950"
                style={{ backgroundColor: comment.avatar_color }}
              >
                {comment.avatar_initials}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-bold text-white">{comment.author}</span>
                  <span className="text-xs text-white/35">
                    {commentDateFormatter.format(new Date(comment.created_at))}
                  </span>
                </div>
                <p className="text-sm leading-6 text-white/75">{comment.body}</p>
                <p className="text-xs font-semibold text-white/35">
                  ♥ {comment.likes}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mock comment input */}
        <div className="panel flex items-start gap-3 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white/45">
            ?
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              className="field min-h-[80px] resize-none"
              placeholder="Skrifaðu athugasemd… (innskráning þarf)"
              disabled
            />
            <button className="button-primary" disabled>
              <MessageCircle className="h-4 w-4" />
              Senda
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
