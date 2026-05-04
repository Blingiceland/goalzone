import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Upload } from "lucide-react";
import { DemoHighlightFeed } from "@/components/demo-highlight-feed";
import { DemoFeaturedHighlight } from "@/components/demo-featured-highlight";
import { t } from "@/lib/i18n/translations";

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="grid gap-8 py-5 lg:min-h-[calc(100vh-11rem)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-flood/25 bg-flood/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-flood">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t.home.badge}
          </div>

          <div className="space-y-5">
            <h1 className="text-6xl font-black leading-[0.82] tracking-normal text-white sm:text-8xl lg:text-[8rem]">
              {t.home.heroTitle}
            </h1>
            <p className="max-w-2xl text-2xl font-black leading-tight text-white sm:text-3xl">
              {t.home.heroSubtitle}
            </p>
            <p className="max-w-2xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              {t.home.heroCopy}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="#latest" className="button-primary">
              {t.home.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/submit" className="button-secondary">
              <Upload className="h-4 w-4" />
              {t.home.secondaryCta}
            </Link>
          </div>

          <div className="grid gap-3 pt-2 text-sm font-semibold text-white/52 sm:grid-cols-3">
            {t.home.heroPoints.map((point) => (
              <div className="flex items-center gap-2" key={point}>
                <ShieldCheck className="h-4 w-4 shrink-0 text-flood" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <DemoFeaturedHighlight />
      </section>

      <DemoHighlightFeed />
    </div>
  );
}
