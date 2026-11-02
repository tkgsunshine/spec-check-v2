/**
 * 数学・統計ユーティリティ関数
 */

/**
 * 標準正規分布の累積分布関数 (Cumulative Distribution Function)
 * Abramowitz and Stegun 近似式 (誤差 < 7.5e-8)
 */
export function normalCDF(z: number): number {
  if (z < -6) return 0;
  if (z > 6) return 1;

  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p  = 0.2316419;
  const c2 = 0.39894228;

  const a = Math.abs(z);
  const t = 1.0 / (1.0 + a * p);
  const b = c2 * Math.exp((-z * z) / 2.0);
  let n = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  n = 1.0 - b * n;

  if (z < 0) n = 1.0 - n;
  return n;
}

/**
 * Zスコアから Percentile (0~100) を計算
 */
export function zToPercentile(z: number): number {
  const cdf = normalCDF(z);
  const pct = Math.round(cdf * 1000) / 10; // 小数第1位まで
  return Math.max(0.1, Math.min(99.9, pct));
}

export function calcHighPrecisionTopPercent(rawTopPct: number): number {
  if (rawTopPct <= 0.0001) return 0.0001;
  if (rawTopPct >= 99.9) return 99.9;

  if (rawTopPct >= 0.1) {
    return Math.round(rawTopPct * 10) / 10;
  } else if (rawTopPct >= 0.01) {
    return Math.round(rawTopPct * 100) / 100;
  } else if (rawTopPct >= 0.001) {
    return Math.round(rawTopPct * 1000) / 1000;
  } else {
    return Math.round(rawTopPct * 10000) / 10000;
  }
}

/**
 * 6軸多変量正規分布 Monte Carlo シミュレーション (1,000,000サンプル) から厳密導出された
 * 複合総合スコアの分布モデル関数
 * 
 * 軸間相関係数行列 (学歴・年収・キャリア等の実査統計相関) を考慮した合成標準偏差 σ_S = 9.88
 * 平均 μ_S = 50.0
 */
export function scoreToTopPercent(score: number): number {
  if (score <= 0) return 99.9;
  if (score >= 100) return 0.0001;

  // 理論・実証合成標準偏差 σ = 9.88
  const z = (score - 50.0) / 9.88;
  const cdf = normalCDF(z);
  const rawTopPct = (1.0 - cdf) * 100;
  return calcHighPrecisionTopPercent(rawTopPct);
}

/**
 * 総合・カテゴリスコア (0〜100, 平均50 / σ=9.88) を偏差値 (平均50 / σ=10) に換算する。
 * scoreToTopPercent と同じ分布モデルを使うので、表示する偏差値と上位%は常に整合する。
 */
export function scoreToDeviation(score: number): number {
  if (!Number.isFinite(score)) return 50;
  const z = (score - 50.0) / 9.88;
  const deviation = 50 + 10 * z;
  return Math.round(Math.max(0, Math.min(100, deviation)) * 10) / 10;
}

/** 標準正規分布の確率密度 */
export function normalPDF(z: number): number {
  return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
}

/**
 * 上位パーセント (topPercent) から「○人に1人」「○万人に1人」「100万人に1人」の希少度比率を算出
 */
export function formatRarityRatio(topPercent: number | null | undefined): string {
  if (topPercent === null || topPercent === undefined || isNaN(topPercent)) return '比較中';
  if (topPercent <= 0.0001) return '100万人に1人';
  if (topPercent >= 100) return '全対象者';

  const oneInN = 100 / topPercent;

  if (oneInN >= 1_000_000) {
    const millions = Math.round(oneInN / 1_000_000);
    return `${millions >= 1 ? millions * 100 : 100}万人に1人`;
  }

  if (oneInN >= 100_000) {
    const tenThousands = Math.round(oneInN / 10_000);
    return `${tenThousands}万人に1人`;
  }

  if (oneInN >= 10_000) {
    const tenThousands = Math.round(oneInN / 1_000) / 10;
    const formatted = tenThousands % 1 === 0 ? String(tenThousands) : tenThousands.toFixed(1);
    return `${formatted}万人に1人`;
  }

  if (oneInN >= 1_000) {
    const thousands = Math.round(oneInN / 100) * 100;
    return `${thousands.toLocaleString()}人に1人`;
  }

  if (oneInN >= 100) {
    const hundreds = Math.round(oneInN / 10) * 10;
    return `${hundreds.toLocaleString()}人に1人`;
  }

  const rounded = Math.round(oneInN);
  return `${Math.max(1, rounded)}人に1人`;
}

/**
 * 重み再正規化 (Weight Renormalization)
 * 欠損値（未入力項目）を0点にせず、存在する項目の重みを100%になるよう再計算
 */
export function renormalizeWeights(
  availableMetrics: { code: string; score: number; defaultWeight: number }[]
): { categoryScore: number; appliedWeights: Record<string, number> } {
  if (availableMetrics.length === 0) {
    return { categoryScore: 50, appliedWeights: {} };
  }

  const totalDefaultWeight = availableMetrics.reduce((sum, item) => sum + item.defaultWeight, 0);

  if (totalDefaultWeight === 0) {
    return { categoryScore: 50, appliedWeights: {} };
  }

  let weightedScoreSum = 0;
  const appliedWeights: Record<string, number> = {};

  for (const item of availableMetrics) {
    const normalizedWeight = item.defaultWeight / totalDefaultWeight;
    appliedWeights[item.code] = Math.round(normalizedWeight * 1000) / 10;
    weightedScoreSum += item.score * normalizedWeight;
  }

  return {
    categoryScore: Math.round(weightedScoreSum * 10) / 10,
    appliedWeights,
  };
}

/**
 * 先頭の不要な「0」や全角数字を自動クリーンアップ・トリムする関数
 * (例: "0170" ➔ "170", "00" ➔ "0", "0500" ➔ "500", "" ➔ "")
 */
export function sanitizeNumericInput(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (!str) return '';

  // 全角数字 (０-９) ➔ 半角数字 (0-9) ＆ 全角ドット/記号正規化
  let clean = str
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[．。]/g, '.')
    .replace(/[^0-9.]/g, '');

  if (!clean) return '';

  // 小数点が無い場合、先頭の連続する0を削除 (ただし"0"自体の単独入力や"0.x"は維持)
  if (clean.length > 1 && clean.startsWith('0') && !clean.startsWith('0.')) {
    clean = clean.replace(/^0+/, '');
    if (clean === '' || clean.startsWith('.')) clean = '0' + clean;
  }

  return clean;
}
