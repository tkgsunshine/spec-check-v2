'use client';

import { MetricScoreResult, DiagnosisInputV3 } from '@/types/spec-check';
import { scoreToTopPercent, calcHighPrecisionTopPercent } from '@/lib/score-engine/math-utils';
import { Trophy, AlertCircle, TrendingUp } from 'lucide-react';
import InputDataModal from '@/components/InputDataModal';
import Link from 'next/link';
import { LockIcon } from '@/components/icons/SpecIcons';

interface SpecRankingsProps {
  metrics: MetricScoreResult[];
  isLoveMode?: boolean;
  rawInput?: DiagnosisInputV3 | null;
  isLocked?: boolean;
  diagnosisId?: string;
}

export default function SpecRankings({ metrics, isLoveMode = false, rawInput, isLocked = false, diagnosisId }: SpecRankingsProps) {
  // 恋愛関連項目の判定
  const isRomanceMetric = (m: MetricScoreResult) => {
    if (m.metricCode === 'LOVE_AGE' || m.metricCode === 'FAMILY') return true;
    if (m.category === '恋愛' || m.category === '恋愛市場') return true;
    if (m.metricName.includes('恋愛') || m.metricName.includes('婚姻') || m.metricName.includes('家庭')) return true;
    return false;
  };

  // ユーザーが明示的に自分で入力した確定指標のみを対象に強み・伸びしろをランキング算出
  const validMetrics = metrics.filter(m => {
    // 1. isOptionalUnentered (未入力のオプション項目) フラグのあるものは完全除外
    if (m.isOptionalUnentered) return false;

    // 2. rawValue が null / undefined のもの、単なる素データ項目(WEIGHT等)は除外
    if (m.rawValue === null || m.rawValue === undefined) return false;
    if (m.datasetName === '未入力') return false;
    if (m.metricCode === 'WEIGHT') return false; // 体重単体は「体型(BMI/FFMI)」に内包されるため独立ランキング除外

    const rawStr = String(m.rawValue);
    if (rawStr.startsWith('未入力') || rawStr.startsWith('未選択')) return false;

    // 3. 総合スペック診断モード(isLoveMode = false)の場合、恋愛関連項目を完全除外
    if (!isLoveMode && isRomanceMetric(m)) {
      return false;
    }

    // 4. 念のためのテキスト補完除外
    if (m.metricCode === 'BODY_FAT' && (rawStr.includes('未入力') || rawStr.includes('重み再正規化'))) return false;
    if (m.metricCode === 'IQ' && (rawStr.includes('学歴推計') || rawStr.includes('自動推計'))) return false;
    if (m.metricCode === 'SNS' && (rawStr.includes('未運用') || rawStr.includes('なし'))) return false;
    if (m.metricCode === 'LANGUAGE' && (rawStr.includes('日本語のみ') || rawStr.includes('対象外'))) return false;
    if (m.metricCode === 'TRAVEL' && (rawStr.includes('0か国') || rawStr.includes('渡航歴なし'))) return false;

    return true;
  });

  const sortedByScore = [...validMetrics].sort((a, b) => b.score - a.score);

  const topStrengths = sortedByScore.slice(0, 5);

  // 後から努力や工夫で変更・改善できない項目（身長・学歴・年齢・性別など）は伸びしろ・改善エリアから完全除外
  const UNCHANGEABLE_METRIC_CODES = new Set([
    'HEIGHT',
    'ACADEMIC',
    'ACADEMIC_DEGREE',
    'ACADEMIC_BACKGROUND',
    'UNIVERSITY',
    'AGE',
    'LOVE_AGE',
  ]);

  const improvableMetrics = sortedByScore.filter(m => 
    !UNCHANGEABLE_METRIC_CODES.has(m.metricCode) && 
    !m.metricName.includes('学歴') && 
    !m.metricName.includes('大学') &&
    !m.metricName.includes('身長') &&
    !m.metricName.includes('年齢')
  );
  const weakPoints = (improvableMetrics.length > 0 ? improvableMetrics : sortedByScore.filter(m => !UNCHANGEABLE_METRIC_CODES.has(m.metricCode)))
    .slice(-3)
    .reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      {/* 強みのあるスペック TOP 5 */}
      <div className="glass-surface glass-surface-glow rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-100 flex flex-wrap items-center gap-2">
                <span>強みのあるスペック TOP 5</span>
                {isLocked && diagnosisId ? (
                  <Link href={`/purchase/${diagnosisId}`} className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                    <LockIcon className="w-3 h-3 mr-0.5" />アンロック
                  </Link>
                ) : isLocked ? (
                  <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <LockIcon className="w-3 h-3 mr-0.5" />アンロック
                  </span>
                ) : null}
              </h3>
              <p className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                YOUR STRONGEST SPECS
              </p>
            </div>
          </div>
          {rawInput && !isLocked && (
            <InputDataModal input={rawInput} />
          )}
        </div>

        <div className="space-y-3">
          {topStrengths.map((item, idx) => {
            const isFirst = idx === 0;
            const itemLocked = isLocked && !isFirst;

            const rowContent = (
              <div
                className={`p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 transition-all flex items-center justify-between gap-3 relative overflow-hidden ${
                  itemLocked
                    ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900/90'
                    : 'hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs font-black text-emerald-400 shrink-0 w-4">0{idx + 1}</span>
                  {itemLocked ? (
                    <span className="text-xs sm:text-sm font-bold text-slate-400 filter blur-[7px] select-none whitespace-nowrap">
                      {item.metricName}
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-slate-100 leading-snug break-words">
                      {item.metricName}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5 shrink-0">
                  {isLocked ? (
                    <>
                      <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <span>上位</span>
                        <span className="filter blur-[2px] select-none">??%</span>
                        <LockIcon className="w-2.5 h-2.5 text-amber-400" />
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                        <span className="filter blur-[2px] select-none">??</span>
                        <span>pt</span>
                      </span>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const rawTop = (item.topPercent !== null && item.topPercent !== undefined && item.topPercent > 0)
                          ? item.topPercent
                          : (item.hasOfficialTopPercent ? scoreToTopPercent(item.score) : null);
                        if (rawTop === null || rawTop === undefined) return null;
                        const topPct = calcHighPrecisionTopPercent(rawTop);
                        if (topPct > 50) return null;
                        return (
                          <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 whitespace-nowrap">
                            上位 {topPct}%
                          </span>
                        );
                      })()}
                      <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700/80 whitespace-nowrap">
                        {item.score} pt
                      </span>
                    </>
                  )}
                </div>
              </div>
            );

            if (itemLocked && diagnosisId) {
              return (
                <Link key={item.metricCode} href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして詳細をアンロック">
                  {rowContent}
                </Link>
              );
            }

            return (
              <div key={item.metricCode}>
                {rowContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* 伸びしろ・改善エリア */}
      <div className="glass-surface rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-100 flex flex-wrap items-center gap-2">
                <span>伸びしろ・改善エリア</span>
                {isLocked && diagnosisId ? (
                  <Link href={`/purchase/${diagnosisId}`} className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                    <LockIcon className="w-3 h-3 mr-0.5" />アンロック
                  </Link>
                ) : isLocked ? (
                  <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <LockIcon className="w-3 h-3 mr-0.5" />アンロック
                  </span>
                ) : null}
              </h3>
              <p className="text-[10px] font-bold tracking-wider uppercase text-rose-400">
                YOUR WEAK POINTS
              </p>
            </div>
          </div>
          {rawInput && !isLocked && (
            <InputDataModal input={rawInput} />
          )}
        </div>

        <div className="space-y-3">
          {weakPoints.map((item, idx) => {
            const itemLocked = isLocked && idx > 0;

            const rowContent = (
              <div
                className={`p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 transition-all flex items-center justify-between gap-3 ${
                  itemLocked
                    ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900/90'
                    : 'hover:border-rose-500/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  {itemLocked ? (
                    <span className="text-xs sm:text-sm font-bold text-slate-400 filter blur-[7px] select-none whitespace-nowrap">
                      {item.metricName}
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-slate-200 leading-snug break-words">
                      {item.metricName}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end shrink-0">
                  {isLocked ? (
                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <span className="filter blur-[2px] select-none">??</span> pt <LockIcon className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                      {item.score} pt
                    </span>
                  )}
                </div>
              </div>
            );

            if (itemLocked && diagnosisId) {
              return (
                <Link key={item.metricCode} href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして改善策をアンロック">
                  {rowContent}
                </Link>
              );
            }

            return (
              <div key={item.metricCode}>
                {rowContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
