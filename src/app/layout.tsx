import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header, Logo } from "@/components/site/Header";
import { SideNav } from "@/components/site/SideNav";
import { SITE } from "@/lib/site";
import { datasetMeta } from "@/lib/data";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-barlow", display: "swap" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-barlow-condensed", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ARC Raiders wiki & guide`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, title: `${SITE.name} — ARC Raiders wiki & guide`, description: SITE.description, url: "/" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#0c0e11", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen antialiased">
        <a href="#main" className="sr-only z-[60] rounded bg-accent px-3 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <div className="lg:grid lg:grid-cols-[16.5rem_1fr]">
          <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-line bg-bg-2/60 px-3 py-5 lg:flex">
            <div className="mb-7 px-2"><Logo /></div>
            <SideNav />
            <p className="mt-auto px-3 pt-8 text-[0.7rem] leading-relaxed text-muted">
              Fan-made. Not affiliated with Embark Studios.
            </p>
          </aside>
          <div className="min-w-0">
            <Header />
            <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
              {children}
            </main>
            <footer className="mt-16 border-t border-line px-4 py-8 text-sm text-muted lg:px-8">
              <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:justify-between">
                <p className="max-w-2xl">
                  ARC Raiders and all related names, images and game content are © Embark Studios AB. This is an unofficial fan
                  resource. Game data from{" "}
                  <a className="link" href="https://github.com/RaidTheory/arcraiders-data" target="_blank" rel="noopener noreferrer">RaidTheory/arcraiders-data</a>{" "}
                  and <a className="link" href="https://arctracker.io" target="_blank" rel="noopener noreferrer">arctracker.io</a> (MIT), snapshot{" "}
                  {datasetMeta.committedAt?.slice(0, 10)}; cheat-sheet content by u/pRoDeeD.
                </p>
                <nav aria-label="Footer" className="flex gap-4">
                  <Link href="/sources" className="hover:text-ink">Sources & methodology</Link>
                  <Link href="/updates" className="hover:text-ink">Updates</Link>
                </nav>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
