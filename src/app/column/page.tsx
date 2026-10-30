import type { Metadata } from 'next';
import Link from 'next/link';
import ColumnCta from '@/components/column/ColumnCta';
import { COLUMN_ARTICLES } from '@/content/column';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spec-check.vercel.app';

export const metadata: Metadata = {
  title: 'コラム｜年収・資産・身長・学歴は同世代で上位何%？',
  description:
    '年収・貯金・身長・学歴が同世代の上位何%にあたるかを、政府統計をもとにした早見表で解説するコラムです。恋愛・婚活での市場価値の考え方も紹介します。',
  alternates: { canonical: `${siteUrl}/column` },
  openGraph: {
    title: 'コラム｜人間スペック診断',
    description: '年収・貯金・身長・学歴が同世代の上位何%にあたるかを早見表で解説します。',
    url: `${siteUrl}/column`,
    type: 'website',
  },
};

export default function ColumnIndexPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'コラム', item: `${siteUrl}/column` },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <h1 className="text-2xl font-black md:text-3xl">コラム</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        年収・資産・身長・学歴が同世代の中で上位何%なのか。統計データをもとにした早見表で解説します。
      </p>

      <ul className="mt-6 grid gap-4">
        {COLUMN_ARTICLES.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/column/${a.slug}`}
              className="block rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-pink-500/60"
            >
              <span className="text-[11px] font-extrabold tracking-widest text-pink-300">{a.category}</span>
              <h2 className="mt-1 text-base font-extrabold leading-snug text-white md:text-lg">{a.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{a.description}</p>
            </Link>
          </li>
        ))}
      </ul>

      <ColumnCta />
    </main>
  );
}
