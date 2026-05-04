import Link from "next/link";
import {
  CheckCircle2,
  Database,
  FileVideo,
  Gauge,
  ShieldCheck,
  Trash2,
  Upload,
  UsersRound,
  XCircle
} from "lucide-react";
import { t } from "@/lib/i18n/translations";

const pipelineSteps = [
  {
    title: "1. Leikmaður eða lið sendir inn",
    body: "Samþykktur aðili setur inn titil, tegund, flokk, keppni og annaðhvort video-hlekk eða video-skrá.",
    tone: "blue",
    icon: Upload
  },
  {
    title: "2. Allt fer fyrst í bið",
    body: "Ný innsending fær status = pending. Ekkert birtist opinberlega fyrr en stjórnandi hefur farið yfir.",
    tone: "blue",
    icon: ShieldCheck
  },
  {
    title: "3. Stjórnandi flokkar rétt",
    body: "Titill, leikmaður, lið, keppni, highlight-tegund og flokkur eru yfirfarin áður en klippan fer á forsíðu.",
    tone: "blue",
    icon: Gauge
  },
  {
    title: "4. Samþykkt eða hafnað",
    body: "Samþykkt efni fer á réttan stað í feedinu. Hafnað efni hverfur úr public kerfinu og video-skráin er hreinsuð úr geymslu.",
    tone: "red",
    icon: CheckCircle2
  }
];

const builtFeatures = [
  "Supabase Auth fyrir aðgangsstýringu og hlutverk.",
  "Postgres schema fyrir profiles, umsóknir, flokka og highlights.",
  "Private Supabase Storage bucket fyrir video-skrár.",
  "Row Level Security reglur svo aðeins rétt hlutverk geti sent inn eða samþykkt.",
  "Status flæði: pending, approved, rejected.",
  "Ytri video-hlekkir fyrir YouTube, Vimeo og TikTok.",
  "Public forsíða sýnir aðeins samþykkt og spilanlegt efni."
];

const roleCards = [
  {
    title: "Áhorfandi",
    body: "Getur skoðað samþykkt mörk og deilt klippum."
  },
  {
    title: "Leikmaður",
    body: "Getur sótt um að senda inn mörk fyrir sitt lið."
  },
  {
    title: "Stjórnandi",
    body: "Yfirfer umsóknir, flokkar video, samþykkir eða hafnar."
  }
];

export default function BackendDemoPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <div className="space-y-5">
          <p className="label">{t.backend.eyebrow}</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] text-white sm:text-6xl">
            {t.backend.title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/62">
            {t.backend.intro}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            icon={FileVideo}
            label="Upload limit"
            value="500 MB"
            body="Video-skrár fara í private Supabase Storage áður en þær eru samþykktar."
          />
          <StatCard
            icon={Database}
            label="Gagnalíkan"
            value="Ready"
            body="Highlights, flokkar, hlutverk, umsóknir og moderation status eru þegar til."
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pipelineSteps.map((step) => (
          <InfoCard
            body={step.body}
            icon={step.icon}
            key={step.title}
            title={step.title}
            tone={step.tone}
          />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label">Það sem er þegar til</p>
              <h2 className="mt-2 text-3xl font-black text-white">Öflugur grunnur undir húddinu</h2>
            </div>
            <ShieldCheck className="h-7 w-7 text-flood" />
          </div>

          <div className="mt-5 grid gap-3">
            {builtFeatures.map((feature) => (
              <div
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3"
                key={feature}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-flood" />
                <p className="text-sm leading-6 text-white/66">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Trash2 className="h-6 w-6 text-ember" />
              <h2 className="text-2xl font-black text-white">Höfnun hreinsar út</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/62">
              Þegar klippa er hafnað á hún ekki að birtast opinberlega. Fyrir uploaduð video er
              storage-skráin hreinsuð úr bucketinu svo kerfið safni ekki óþarfa gögnum.
            </p>
          </div>

          <div className="panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <UsersRound className="h-6 w-6 text-signal" />
              <h2 className="text-2xl font-black text-white">Hlutverk í demo</h2>
            </div>
            <div className="mt-4 space-y-3">
              {roleCards.map((role) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={role.title}>
                  <p className="font-black text-white">{role.title}</p>
                  <p className="mt-1 text-sm leading-6 text-white/58">{role.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <BackendLink
          body="Sýnir hvernig leikmaður myndi senda inn mark, velja flokk og setja inn video."
          href="/submit"
          title="Innsending"
        />
        <BackendLink
          body="Sýnir biðröðina þar sem stjórnandi flokkar, samþykkir eða hafnar video."
          href="/admin/highlights"
          title="Yfirferð myndbanda"
        />
        <BackendLink
          body="Sýnir hvernig nýir leikmenn eða lið fá samþykki áður en þau mega senda inn."
          href="/admin/applications"
          title="Umsóknir leikmanna"
        />
      </section>

      <div className="rounded-lg border border-signal/30 bg-signal/10 p-4 text-sm leading-7 text-signal">
        Demo-athugasemd: takkarnir hér fyrir neðan geta enn beðið um innskráningu í alvöru kerfinu.
        Þessi síða er pitch-yfirlit sem sýnir hvernig bakendinn er hugsaður og hvað er þegar komið.
      </div>
    </div>
  );
}

function StatCard({
  body,
  icon: Icon,
  label,
  value
}: {
  body: string;
  icon: typeof FileVideo;
  label: string;
  value: string;
}) {
  return (
    <div className="panel p-5">
      <Icon className="h-6 w-6 text-flood" />
      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-white/42">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/56">{body}</p>
    </div>
  );
}

function InfoCard({
  body,
  icon: Icon,
  title,
  tone
}: {
  body: string;
  icon: typeof Upload;
  title: string;
  tone: string;
}) {
  const toneClass =
    tone === "red"
      ? "border-ember/30 bg-ember/10 text-red-100"
      : "border-signal/25 bg-signal/10 text-signal";

  return (
    <article className={`rounded-lg border p-5 ${toneClass}`}>
      <Icon className="h-6 w-6" />
      <h2 className="mt-4 text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 opacity-80">{body}</p>
    </article>
  );
}

function BackendLink({ body, href, title }: { body: string; href: string; title: string }) {
  return (
    <Link className="panel group block p-5 transition hover:border-flood/35" href={href}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-white group-hover:text-flood">{title}</h2>
        <XCircle className="h-5 w-5 rotate-45 text-flood" />
      </div>
      <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
    </Link>
  );
}
