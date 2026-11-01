'use client';

import DeviationCurve, { useRevealProgress } from '@/components/DeviationCurve';
import { scoreToDeviation } from '@/lib/score-engine/math-utils';

interface DeviationHeroProps {
  /** 0〜100 の総合スコア */
  score: number;
  topPercent: number;
  /** 例: 総合偏差値 / 恋愛偏差値 */
  label: string;
  /** 例: 同世代（30歳・東京都）の男性の中で */
  populationText: string;
  /** 例: の人間スペック */
  suffixText: string;
  colorTheme?: 'violet' | 'rose';
}

export default function DeviationHero({
  score,
  topPercent,
  label,
  populationText,
  suffixText,
  colorTheme = 'violet',
}: DeviationHeroProps) {
  const deviation = scoreToDeviation(score);
  const { ref, progress } = useRevealProgress<HTMLDivElement>(1400);

  const isRose = colorTheme === 'rose';
  const accent = isRose ? '#fb7185' : '#818cf8';
  const numberClass = isRose ? 'gradient-text-pink' : 'gradient-text-indigo';
  const highlightClass = isRose ? 'text-rose-300' : 'text-indigo-300';

  const shownNumber = deviation * progress;
  const shownMarker = 50 + (deviation - 50) * progress;

  return (
    <div ref={ref} className="w-full max-w-md mx-auto text-center">
      <div className="text-xs sm:text-sm font-black tracking-wider text-slate-300">{label}</div>

      <div
        className={`${numberClass} font-black tracking-tight leading-none mt-1 text-7xl sm:text-8xl tabular-nums`}
        aria-label={`${label} ${deviation.toFixed(1)}`}
      >
        {shownNumber.toFixed(1)}
      </div>

      <p className="mt-3 text-[13px] sm:text-sm font-bold text-slate-200 leading-relaxed">
        {populationText}{' '}
        <span className={`${highlightClass} font-black text-base sm:text-lg whitespace-nowrap`}>上位{topPercent}%</span>{' '}
        {suffixText}
      </p>

      <div className="mt-4 px-1 sm:px-4">
        <DeviationCurve deviation={shownMarker} color={accent} size="lg" />
      </div>

      <p className="mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500">
        平均偏差値50を基準とした正規分布上のあなたの位置
      </p>
      <p className="text-[10px] font-semibold text-slate-600">スコア {score.toFixed(1)} / 100pt</p>
    </div>
  );
}
