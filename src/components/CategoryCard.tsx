'use client';

import Link from 'next/link';
import DeviationCurve, { animatedDeviation, useRevealProgress } from '@/components/DeviationCurve';
import { scoreToDeviation } from '@/lib/score-engine/math-utils';

interface CategoryCardProps {
  labelJa: string;
  labelEn: string;
  score: number;
  topPercent?: number | null;
  colorTheme?: 'violet' | 'rose';
  isLocked?: boolean;
  diagnosisId?: string;
}

export default function CategoryCard({ labelJa, labelEn, score, topPercent, colorTheme, isLocked = false, diagnosisId }: CategoryCardProps) {
  const { ref: cardRef, progress } = useRevealProgress<HTMLDivElement>(3000);
  const deviation = scoreToDeviation(score);

  // 3-Tier Harmonious Color System:
  // - Elite / Top Tier (>= 85): Emerald Green (#10b981) - 最高峰・エリート達成
  // - High / Strong Tier (60-84): Cyan / Sky Blue (#38bdf8) - 良好・上位
  // - Normal / Growth Tier (< 60): Rose Pink (#fb7185) / Violet (#818cf8) - 標準・伸びしろ
  const isElite = score >= 85;
  const isHigh = score >= 60 && score < 85;

  // Stroke color for ring
  const strokeColor = isElite
    ? '#10b981' // Emerald Green for Elite Score (85+)
    : isHigh
    ? '#38bdf8' // Sky Blue / Cyan for High Score (60-84)
    : colorTheme === 'rose'
    ? '#fb7185' // Rose Pink for Normal (<60)
    : '#818cf8'; // Indigo / Violet for Normal (<60)

  // Text color for score value
  const scoreTextColor = isElite
    ? 'text-emerald-300 font-black'
    : isHigh
    ? 'text-sky-300 font-black'
    : colorTheme === 'rose'
    ? 'text-rose-300 font-black'
    : 'text-indigo-300 font-black';

  // Badge style for TOP %
  const badgeStyle = isElite
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
    : isHigh
    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
    : colorTheme === 'rose'
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

  // Hover border glow & Card shadow
  const borderHoverStyle = isLocked
    ? 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]'
    : isElite
    ? 'hover:border-emerald-500/60 hover:shadow-[0_0_24px_rgba(168,85,247,0.3)] border-emerald-500/30'
    : isHigh
    ? 'hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] border-sky-500/20'
    : colorTheme === 'rose'
    ? 'hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(251,113,133,0.25)]'
    : 'hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(129,140,248,0.25)]';

  const cardContent = (
    <div
      ref={cardRef}
      className={`glass-surface rounded-2xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 ${borderHoverStyle} ${
        isLocked ? 'cursor-pointer hover:border-purple-500/80 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)]' : ''
      }`}
    >
      <div className="flex flex-col items-center mb-1.5 w-full px-0.5">
        <span
          className={`font-black text-slate-100 group-hover:text-white transition-colors whitespace-nowrap tracking-tight ${
            labelJa.length >= 7 ? 'text-[10px] sm:text-[11px]' : 'text-xs'
          }`}
        >
          {labelJa}
        </span>
        <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-slate-500 uppercase mt-0.5 whitespace-nowrap">
          {labelEn}
        </span>
      </div>

      {/* 偏差値 ＋ ミニ正規分布（あなたの位置） */}
      <div className="w-full flex flex-col items-center mb-1">
        <span className="text-[9px] font-extrabold text-slate-400 tracking-wider">偏差値</span>
        <span className={`text-2xl leading-none tracking-tight tabular-nums ${scoreTextColor}`}>
          {animatedDeviation(deviation, progress).toFixed(1)}
        </span>
        <div className="w-full max-w-[112px] mt-2">
          <DeviationCurve deviation={animatedDeviation(deviation, progress)} color={strokeColor} size="sm" />
        </div>
      </div>

      {/* Top Percent Badge (Locked vs Unlocked) */}
      {isLocked ? (
        <div className="w-full mt-1.5 py-1.5 px-2 rounded-xl bg-gradient-to-r from-purple-950/95 via-indigo-950/90 to-pink-950/95 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.35)] flex flex-col items-center justify-center group-hover:border-pink-400/80 group-hover:shadow-[0_0_18px_rgba(236,72,153,0.5)] group-hover:from-purple-900 group-hover:to-pink-900 transition-all">
          <div className="flex items-center justify-center gap-1 leading-none">
            <span className="text-[10px] font-black text-slate-300">上位</span>
            <span className="text-xs sm:text-sm font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-amber-300 tracking-tight">
              ??%
            </span>
            <span className="text-xs text-amber-300 animate-pulse ml-0.5">🔒</span>
          </div>
          <span className="text-[9px] font-extrabold text-purple-300 group-hover:text-amber-300 transition-colors tracking-tight mt-0.5">
            タップでアンロック
          </span>
        </div>
      ) : (
        <div className={`w-full mt-1.5 py-1 px-2 rounded-xl border flex flex-col items-center justify-center ${badgeStyle}`}>
          <span className="text-[8px] font-extrabold uppercase tracking-tight opacity-75">同世代順位</span>
          <span className="text-xs font-black tracking-tight">上位 {topPercent ?? 50}%</span>
        </div>
      )}
    </div>
  );

  if (isLocked && diagnosisId) {
    return (
      <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして同世代順位（上位%）をアンロック">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
