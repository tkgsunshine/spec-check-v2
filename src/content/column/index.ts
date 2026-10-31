import educationPercentile from './education-percentile';
import heightPercentile from './height-percentile';
import income10Million from './income-10-million';
import incomePercentileByAge from './income-percentile-by-age';
import loveMarketValue from './love-market-value';
import netWorthByAge from './net-worth-by-age';
import type { ColumnArticle } from './types';

export type { ColumnArticle } from './types';

// 一覧の表示順（新しい記事を先頭に追加する）
export const COLUMN_ARTICLES: ColumnArticle[] = [
  incomePercentileByAge,
  income10Million,
  loveMarketValue,
  netWorthByAge,
  heightPercentile,
  educationPercentile,
];

export function getColumnArticle(slug: string): ColumnArticle | undefined {
  return COLUMN_ARTICLES.find((a) => a.slug === slug);
}
