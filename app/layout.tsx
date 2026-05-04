import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { t } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "Goalzone",
  description: "Íslenskur vettvangur fyrir fótboltamyndbönd."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is">
      <body className="min-h-screen antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-flood text-lg font-black text-pitch-950 shadow-glow">
                GZ
              </span>
              <span>
                <span className="block text-base font-black leading-none text-white">
                  Goalzone
                </span>
                <span className="text-xs font-medium text-white/45">
                  {t.layout.description}
                </span>
              </span>
            </Link>
            <SiteNav />
          </header>
          <main className="flex-1 py-8 sm:py-10">{children}</main>
          <footer className="border-t border-white/10 py-5 text-sm text-white/45">
            {t.layout.footer}
          </footer>
        </div>
      </body>
    </html>
  );
}
