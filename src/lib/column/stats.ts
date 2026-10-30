import {
  AGE_INCOME_STATS,
  AGE_GENDER_NET_WORTH_STATS,
  HEIGHT_WEIGHT_STATS,
} from '@/lib/datasets/japan-stats';
import { normalCDF } from '@/lib/score-engine/math-utils';

// コラムの表は診断と同じ統計テーブルから生成し、記事と診断結果の数字を一致させる

export type ColumnGender = 'MALE' | 'FEMALE' | 'OVERALL';

// AGE_INCOME_STATS の累積配列に対応する年収の区切り（万円）
const INCOME_LIMITS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000];
// AGE_GENDER_NET_WORTH_STATS の累積配列に対応する純資産の区切り（万円）
const NET_WORTH_LIMITS = [0, 100, 300, 500, 1000, 2000, 3000, 5000, 10000, 50000];

function pickCumulative(
  group: { maleCumulative: number[]; femaleCumulative: number[]; overallCumulative: number[] },
  gender: ColumnGender,
): number[] {
  if (gender === 'MALE') return group.maleCumulative;
  if (gender === 'FEMALE') return group.femaleCumulative;
  return group.overallCumulative;
}

function roundTop(pct: number): number {
  return Math.max(0.1, Math.round(pct * 10) / 10);
}

/** 年収が limit 万円を超える人の割合（上位何%） */
export function incomeTopPercent(groupLabel: string, gender: ColumnGender, limit: number): number {
  const group = AGE_INCOME_STATS.find((g) => g.label === groupLabel);
  const idx = INCOME_LIMITS.indexOf(limit);
  if (!group || idx < 0) throw new Error(`unknown income cell: ${groupLabel} ${limit}`);
  return roundTop(100 - pickCumulative(group, gender)[idx]);
}

export const INCOME_AGE_LABELS = AGE_INCOME_STATS.map((g) => g.label);

/** 純資産が limit 万円を超える人の割合（上位何%） */
export function netWorthTopPercent(groupLabel: string, gender: ColumnGender, limit: number): number {
  const group = AGE_GENDER_NET_WORTH_STATS.find((g) => g.label === groupLabel);
  const idx = NET_WORTH_LIMITS.indexOf(limit);
  if (!group || idx < 0) throw new Error(`unknown net worth cell: ${groupLabel} ${limit}`);
  return roundTop(100 - pickCumulative(group, gender)[idx]);
}

export const NET_WORTH_AGE_LABELS = AGE_GENDER_NET_WORTH_STATS.map((g) => g.label);

export interface HeightGroup {
  label: string;
  mean: number;
  sd: number;
}

export function heightGroups(gender: 'MALE' | 'FEMALE'): HeightGroup[] {
  return HEIGHT_WEIGHT_STATS[gender].map((g) => ({
    label: `${g.ageMin}代`,
    mean: g.heightMean,
    sd: g.heightSd,
  }));
}

/** 身長が height cm 以上の人の割合（上位何%）。正規分布で近似 */
export function heightTopPercent(group: HeightGroup, height: number): number {
  return roundTop((1 - normalCDF((height - group.mean) / group.sd)) * 100);
}

export function formatTop(pct: number): string {
  return pct < 1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(1).replace(/\.0$/, '')}%`;
}
