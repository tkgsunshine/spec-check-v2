import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spec-check.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "人間スペック診断 | 年収・学歴・恋愛市場価値を同世代比較",
    template: "%s | 人間スペック診断",
  },
  description: "同世代の中であなたの年収、純資産、身長、学歴、IQ、SNS影響力、恋愛婚活価値が上位何％かを政府公式統計データ（国勢調査・賃金構造基本統計）に基づき精密測定・比較査定する本格診断ツール。",
  keywords: [
    "人間スペック診断",
    "スペック診断",
    "年収順位",
    "同世代比較",
    "婚活スペック",
    "恋愛市場価値",
    "恋愛スペック",
    "資産ランキング",
    "市場価値診断",
  ],
  authors: [{ name: "人間スペック診断運営チーム" }],
  creator: "人間スペック診断",
  publisher: "人間スペック診断",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "人間スペック診断 | 年収・学歴・恋愛市場価値を同世代比較",
    description: "同世代の中であなたの年収、純資産、身長、学歴、IQ、SNS影響力、恋愛婚活価値が上位何％かを政府公式統計データに基づき精密測定する本格診断ツール。",
    url: siteUrl,
    siteName: "人間スペック診断",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "人間スペック診断 | 年収・学歴・恋愛市場価値を同世代比較",
    description: "同世代の中であなたの年収、純資産、身長、学歴、IQ、SNS影響力、恋愛婚活価値が上位何％かを政府公式統計データに基づき精密測定する本格診断ツール。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "人間スペック診断",
    "alternateName": "SPEC CHECK",
    "url": siteUrl,
    "description": "同世代の中であなたの年収、純資産、身長、学歴、IQ、SNS影響力、恋愛婚活価値が上位何％かを政府公式統計データに基づき精密測定・比較査定する本格診断ツール。",
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "All",
    "inLanguage": "ja",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  };

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-white overflow-x-hidden w-full max-w-full">
        {/* Sticky Site Header */}
        <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group transition-all">
              {/* Cyberpunk 3D Neon SPEC Capsule Badge */}
              <div className="relative flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-900 border border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.35)] group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] group-hover:border-pink-400 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-[10px] md:text-[11px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-cyan-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]">
                  SPEC
                </span>
              </div>
              <span className="font-extrabold text-base md:text-lg tracking-tight text-white group-hover:text-pink-100 transition-colors drop-shadow-sm">
                人間スペック診断
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/column" className="text-[11px] md:text-xs font-extrabold text-slate-300 hover:text-white px-2 py-1 transition-colors">
                コラム
              </Link>
              <span className="hidden sm:inline text-[10px] md:text-xs font-extrabold text-slate-300 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner">
                📊 政府公式統計データ連動
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 w-full max-w-full overflow-x-hidden">{children}</div>
        <footer className="w-full border-t border-slate-800/80 bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">人間スペック診断</Link>
            <Link href="/column" className="hover:text-slate-300 transition-colors">コラム</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
