import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ColumnCta from '@/components/column/ColumnCta';
import { COLUMN_ARTICLES, getColumnArticle } from '@/content/column';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spec-check.vercel.app';

export const dynamicParams = false;

export function generateStaticParams() {
  return COLUMN_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<'/column/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const article = getColumnArticle(slug);
  if (!article) return {};
  const url = `${siteUrl}/column/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

export default async function ColumnArticlePage({ params }: PageProps<'/column/[slug]'>) {
  const { slug } = await params;
  const article = getColumnArticle(slug);
  if (!article) notFound();

  const url = `${siteUrl}/column/${article.slug}`;
  const related = article.related
    .map((s) => getColumnArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      inLanguage: 'ja',
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: '人間スペック診断運営チーム', url: siteUrl },
      publisher: { '@type': 'Organization', name: '人間スペック診断', url: siteUrl },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'コラム', item: `${siteUrl}/column` },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  const { Body } = article;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="パンくずリスト" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-300">ホーム</Link>
        <span className="mx-1.5">/</span>
        <Link href="/column" className="hover:text-slate-300">コラム</Link>
      </nav>

      <article className="mt-4">
        <span className="text-[11px] font-extrabold tracking-widest text-pink-300">{article.category}</span>
        <h1 className="mt-1 text-2xl font-black leading-snug md:text-3xl">{article.title}</h1>
        <p className="mt-2 text-xs text-slate-500">
          <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time> 更新
        </p>

        <div className="mt-6 text-[15px] leading-loose text-slate-200 [&>h2]:mt-10 [&>h2]:mb-3 [&>h2]:border-l-4 [&>h2]:border-pink-500 [&>h2]:pl-3 [&>h2]:text-xl [&>h2]:font-extrabold [&>h2]:text-white [&>p]:my-4 [&>ul]:my-4 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6 [&_strong]:text-white">
          <Body />
        </div>

        <section className="mt-10">
          <h2 className="mb-3 border-l-4 border-pink-500 pl-3 text-xl font-extrabold text-white">よくある質問</h2>
          <dl className="space-y-4">
            {article.faq.map((f) => (
              <div key={f.q} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <dt className="font-bold text-white">Q. {f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-300">A. {f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>

      <ColumnCta variant={article.category === '恋愛・婚活' || article.category === '身体' ? 'LOVE' : 'JAPAN'} />

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-extrabold text-white">関連コラム</h2>
          <ul className="grid gap-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/column/${r.slug}`}
                  className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm font-bold text-white transition-colors hover:border-pink-500/60"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
