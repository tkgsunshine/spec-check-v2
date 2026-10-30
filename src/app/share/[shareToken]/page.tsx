'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShareResult } from '@/types/spec-check';
import { Sparkles, Heart, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { scoreToTopPercent, formatRarityRatio } from '@/lib/score-engine/math-utils';

export default function SharePage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = use(params);
  const [data, setData] = useState<PublicShareResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`/api/share/${shareToken}`);
        const json = await res.json();
        if (json.success) {
          setData(json.shareResult);
        }
      } catch (e) {
        console.error('Failed to load share data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchShare();
  }, [shareToken]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (data) {
      const genderTextJa = data.gender === 'FEMALE' ? '女性' : '男性';
      document.title = `${data.age}歳${genderTextJa}（${data.prefectureName}）の人間スペック＆恋愛偏差値診断結果共有カード | 人間スペック診断`;
    }
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen py-12 px-4 max-w-2xl mx-auto flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">読み込み中...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen py-12 px-4 max-w-2xl mx-auto text-center">
        <div className="glass-surface rounded-3xl p-8 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-200 mb-2">診断結果が見つかりません</h2>
          <p className="text-slate-400 text-xs mb-6">リンクが無効か、有効期限が切れています。</p>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm inline-block">
            トップに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* Header Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-surface text-xs font-bold text-indigo-400 border border-indigo-500/30 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          SPEC CHECK 診断結果カード
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          {data.nickname || 'あなた'} さんのスペック評価
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {data.age}歳 / {data.gender === 'FEMALE' ? '女性' : '男性'} / {data.prefectureName}
        </p>
      </div>

      {/* Epithet Card */}
      {(data.epithet || data.loveEpithet) && (
        <div className="glass-surface rounded-3xl p-6 text-center mb-6 border-indigo-500/30 space-y-3">
          {data.epithet && (
            <div>
              {data.epithet.typeCode && (
                <div className="text-sm font-black text-white">
                  <span className="text-2xl mr-1" aria-hidden>{data.epithet.typeEmoji}</span>
                  <span className="font-mono tracking-widest text-amber-300 mr-1">{data.epithet.typeCode}</span>
                  {data.epithet.typeName}
                </div>
              )}
              <div className={`text-2xl md:text-3xl font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r ${data.epithet.rarityColor} drop-shadow-sm pt-1`}>
                『 {data.epithet.title} 』
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed max-w-lg mx-auto">
                {data.epithet.subtitle}
              </p>
            </div>
          )}
          {data.loveEpithet && (
            <div className={data.epithet ? 'border-t border-slate-800/80 pt-3' : ''}>
              <div className="text-[10px] font-bold text-rose-400 mb-0.5">💖 恋愛二つ名</div>
              {data.loveEpithet.typeCode && (
                <div className="text-sm font-black text-white">
                  <span className="text-2xl mr-1" aria-hidden>{data.loveEpithet.typeEmoji}</span>
                  <span className="font-mono tracking-widest text-rose-300 mr-1">{data.loveEpithet.typeCode}</span>
                  {data.loveEpithet.typeName}
                </div>
              )}
              <div className={`text-xl md:text-2xl font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r ${data.loveEpithet.rarityColor} drop-shadow-sm`}>
                『 {data.loveEpithet.title} 』
              </div>
              <p className="text-[11px] text-rose-200/80 font-medium mt-1 leading-relaxed max-w-lg mx-auto">
                {data.loveEpithet.subtitle}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Scores Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Spec Card */}
        <div className="glass-card rounded-3xl p-6 text-center border-indigo-500/30">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-400 mb-2">
            <Sparkles className="w-4 h-4" /> 総合スペック
          </div>
          <div className="text-5xl md:text-6xl font-black gradient-text-indigo mb-2">
            {data.japanOverallScore} <span className="text-lg text-slate-400 font-normal">/100</span>
          </div>
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black">
              <span>上位 {scoreToTopPercent(data.japanOverallScore)}%</span>
              <span className="text-indigo-200/80 text-[10px]">({formatRarityRatio(scoreToTopPercent(data.japanOverallScore))})</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">同世代公的統計データ比較</p>
        </div>

        {/* Love Spec Card */}
        <div className="glass-card rounded-3xl p-6 text-center border-rose-500/30">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400 mb-2">
            <Heart className="w-4 h-4 fill-rose-400" /> 恋愛スペック
          </div>
          <div className="text-5xl md:text-6xl font-black gradient-text-pink mb-2">
            {data.loveOverallScore} <span className="text-lg text-slate-400 font-normal">/100</span>
          </div>
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black">
              <span>上位 {scoreToTopPercent(data.loveOverallScore)}%</span>
              <span className="text-rose-200/80 text-[10px]">({formatRarityRatio(scoreToTopPercent(data.loveOverallScore))})</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">統計モデルによる推定</p>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">
          比較要素サマリー
        </h3>
        <div className="space-y-3">
          {data.metricSummary.map((m: any) => (
            <div key={m.metricCode} className="flex items-center justify-between py-2 border-b border-slate-800/40 text-xs">
              <span className="font-semibold text-slate-300">{m.metricName}</span>
              <div className="flex items-center gap-3">
                {m.hasOfficialTopPercent && m.topPercent !== null && (
                  <span className="text-indigo-400 font-bold">
                    上位 {m.topPercent}%
                  </span>
                )}
                <span className="font-mono font-bold text-slate-100">{m.score}点</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all"
        >
          あなたも 人間スペック診断 で自分の位置を測定する <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
