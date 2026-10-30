import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const COPY = {
  JAPAN: {
    eyebrow: '無料・約3分',
    title: 'あなたのスペックは同世代で上位何%？',
    body: '年収・学歴・資産・身長などを入力すると、同世代の中での順位を統計データから一括で算出します。',
    button: '無料でスペック診断する',
  },
  LOVE: {
    eyebrow: '無料・約3分',
    title: 'あなたの恋愛市場価値を測ってみる',
    body: '見た目・年齢・経済力などを年代別の重みで掛け合わせ、恋愛・婚活市場での立ち位置を数値化します。',
    button: '恋愛市場価値を診断する',
  },
} as const;

export default function ColumnCta({ variant = 'JAPAN' }: { variant?: keyof typeof COPY }) {
  const copy = COPY[variant];
  return (
    <aside className="my-8 rounded-2xl border border-pink-500/40 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 p-5 shadow-[0_0_24px_rgba(236,72,153,0.15)]">
      <p className="text-[11px] font-extrabold tracking-widest text-pink-300">{copy.eyebrow}</p>
      <p className="mt-1 text-lg font-black text-white">{copy.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{copy.body}</p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02]"
      >
        {copy.button}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}
