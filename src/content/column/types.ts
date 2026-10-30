import type { ComponentType } from 'react';

export interface ColumnFaq {
  q: string;
  a: string;
}

export interface ColumnArticle {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: '年収' | '資産' | '身体' | '恋愛・婚活' | '学歴';
  publishedAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
  faq: ColumnFaq[];
  related: string[];
  Body: ComponentType;
}
