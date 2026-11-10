import { useId } from 'react';
import { LOVE_TYPES, OVERALL_TYPES } from '@/lib/score-engine/title-generator';

/**
 * 16キャラタイプ（総合16＋恋愛16）のオリジナルアイコン。
 * 六角形のエンブレム（レーダーチャートと同じ形）に、タイプごとの線画を重ねる。
 * 色は title-generator.ts の各タイプの color（Tailwind のグラデーション）の from / to に合わせている。
 */

// 24×24 グリッドの線画（stroke で描く）。点や塗りが必要なものは fill 付きの要素を混ぜる。
const GLYPHS: Record<string, React.ReactNode> = {
  // ── 総合モード ──
  // 覇王: 王冠
  MCLF: (
    <>
      <path d="M5 18.5h14M5 18.5 3.6 8.6l4.6 3.5L12 5.5l3.8 6.6 4.6-3.5L19 18.5" />
      <circle cx="12" cy="5" r="0.6" fill="currentColor" />
    </>
  ),
  // 人たらし: 重なる2つの吹き出し
  MCLD: (
    <>
      <path d="M3.5 5.5h9a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H8l-3 2.5v-2.5H3.5A1.5 1.5 0 0 1 2 12V7a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M17 9.5h3a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-1v2.5l-3-2.5h-4.5A1.5 1.5 0 0 1 10 16v-.5" />
    </>
  ),
  // ガーディアン: 盾とチェック
  MCQF: (
    <>
      <path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.8-7 9.8-4.1-2-7-5.4-7-9.8V5.8z" />
      <path d="M9 12l2.2 2.2L15.2 10" />
    </>
  ),
  // 金庫番: 金庫
  MCQD: (
    <>
      <rect x="4" y="4.5" width="16" height="14" rx="2" />
      <circle cx="12" cy="11.5" r="3.2" />
      <path d="M12 8.3v1.4M15.2 11.5h-1.4M7 18.5v2M17 18.5v2" />
    </>
  ),
  // 成り上がり: 駆け上がる階段と矢印
  MGLF: (
    <>
      <path d="M3.5 20h4.5v-4.5h4.5V11h4.5V6.5h3.5" />
      <path d="M16.5 3.5h4v4" />
    </>
  ),
  // 革命児: 炎
  MGLD: (
    <path d="M12 3c.8 3 5.5 5.3 5.5 10.2A5.5 5.5 0 0 1 12 18.7a5.5 5.5 0 0 1-5.5-5.5c0-2.6 1.5-4.4 2.6-5.3.2 1.6.9 2.7 2.1 3.3-.3-3.4.3-6 .8-8.2zM12 20.5v.5" />
  ),
  // 一匹狼: 狼の顔
  MGQF: (
    <>
      <path d="M5 3.5l3.4 5h7.2l3.4-5 1.3 9.3-3.8 3.9L12 20.5l-4.5-3.8-3.8-3.9z" />
      <path d="M10.5 16.2h3L12 17.6z" fill="currentColor" />
      <circle cx="9.2" cy="12.2" r="0.9" fill="currentColor" />
      <circle cx="14.8" cy="12.2" r="0.9" fill="currentColor" />
    </>
  ),
  // フィクサー: フクロウ
  MGQD: (
    <>
      <path d="M5.5 4.5l2.3 2h8.4l2.3-2V14a6.5 6.5 0 0 1-13 0z" />
      <circle cx="9.4" cy="11" r="2.1" />
      <circle cx="14.6" cy="11" r="2.1" />
      <path d="M12 13.4l-.9 1.5h1.8z" fill="currentColor" />
    </>
  ),
  // 生徒会長: 星
  BCLF: <path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />,
  // 伝道師: メガホン
  BCLD: (
    <>
      <path d="M3.5 10v4h3.5l8.5 4.5v-13L7 10z" />
      <path d="M18.5 9a4 4 0 0 1 0 6M7.5 14l1.3 5.5h2.5L10.3 15" />
    </>
  ),
  // 参謀: チェスのナイト
  BCQF: (
    <>
      <path d="M7 20.5h11M8.5 20.5c0-3.2 1.3-5.3 3.6-7.1l-3.5-.6-2 1.9-1.9-1.8 4-6.4 3-1.5.9 1c3.5 1.2 4.9 4.4 4.9 8.6v5.9" />
      <circle cx="11" cy="8.3" r="0.6" fill="currentColor" />
    </>
  ),
  // 生き字引: 開いた本
  BCQD: (
    <>
      <path d="M3 5.5c3-1 6-.8 9 1.2 3-2 6-2.2 9-1.2v13c-3-1-6-.8-9 1.2-3-2-6-2.2-9-1.2z" />
      <path d="M12 6.7v13.2M6 9.5h3M6 12.5h3M15 9.5h3M15 12.5h3" />
    </>
  ),
  // 越境者: 地球
  BGLF: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M3.2 12h17.6M12 3.2c2.8 2.6 3.8 6 3.8 8.8s-1 6.2-3.8 8.8M12 3.2C9.2 5.8 8.2 9.2 8.2 12s1 6.2 3.8 8.8" />
    </>
  ),
  // マッドサイエンティスト: フラスコ
  BGLD: (
    <>
      <path d="M9 3.5h6M10 3.5v5.8l-5 8.6a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8.6V3.5M7.2 14.5h9.6" />
      <circle cx="10.5" cy="17.5" r="0.8" fill="currentColor" />
      <circle cx="13.8" cy="16.6" r="0.6" fill="currentColor" />
    </>
  ),
  // 忍者: 手裏剣
  BGQF: (
    <>
      <path d="M12 2.5l2 7.5 7.5 2-7.5 2-2 7.5-2-7.5-7.5-2 7.5-2z" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  // 仙人: 山と雲
  BGQD: (
    <>
      <path d="M2.5 19.5l6.5-11 4.3 6.6 2.9-4 5.3 8.4z" />
      <path d="M13.5 5.5h5.5M15.5 8h4.5M3.5 5h4" />
    </>
  ),

  // ── 恋愛モード ──
  // 恋愛ジャンキー: 矢の刺さったハート
  VHYR: (
    <>
      <path d="M12 19.5s-7.5-4.3-7.5-9.6A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7.5 2.2c0 5.3-7.5 9.6-7.5 9.6z" />
      <path d="M3 21l18-18M17.5 3H21v3.5" />
    </>
  ),
  // モテエース: 的と矢
  VHYK: (
    <>
      <circle cx="11" cy="13" r="7.5" />
      <circle cx="11" cy="13" r="3.8" />
      <circle cx="11" cy="13" r="0.8" fill="currentColor" />
      <path d="M11 13l9-9M17 4h3v3" />
    </>
  ),
  // 罪な人: バラ
  VHMR: (
    <>
      <path d="M12 3c-3 0-5 2-5 4.8 0 2.6 2.2 4.2 5 4.2s5-1.6 5-4.2C17 5 15 3 12 3z" />
      <path d="M9.8 6.2c1.2 1 3.2 1 4.4 0M12 12v9M12 16.5c-1.8 0-3.2-.9-4.2-2.5M12 18.5c1.8 0 3.2-1 4-2.8" />
    </>
  ),
  // 選ばれし本命: 宝石
  VHMK: (
    <>
      <path d="M6.5 4h11l3.5 5-9 11.5L3 9z" />
      <path d="M3 9h18M9.2 4L7.6 9 12 20.5 16.4 9l-1.6-5" />
    </>
  ),
  // 妖精: きらめき
  VPYR: (
    <>
      <path d="M11 3c.6 4.2 2.2 5.8 6.4 6.4-4.2.6-5.8 2.2-6.4 6.4-.6-4.2-2.2-5.8-6.4-6.4C8.8 8.8 10.4 7.2 11 3z" />
      <path d="M18 14.5c.3 1.7.9 2.3 2.6 2.6-1.7.3-2.3.9-2.6 2.6-.3-1.7-.9-2.3-2.6-2.6 1.7-.3 2.3-.9 2.6-2.6z" />
    </>
  ),
  // 一途の化身: 手紙とハート
  VPYK: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.8" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
      <path d="M12 18.2s-2.6-1.4-2.6-3.1a1.3 1.3 0 0 1 2.6-.4 1.3 1.3 0 0 1 2.6.4c0 1.7-2.6 3.1-2.6 3.1z" fill="currentColor" stroke="none" />
    </>
  ),
  // 高嶺の花: 三日月と星
  VPMR: (
    <>
      <path d="M14.5 3.5a8.5 8.5 0 1 0 6 13.2 7 7 0 0 1-6-13.2z" />
      <path d="M18.5 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor" />
    </>
  ),
  // マイナスイオン: 葉
  VPMK: (
    <>
      <path d="M4.5 19.5C4.5 10.5 10.5 4.5 20 4.5c0 9.5-6 15-15.5 15z" />
      <path d="M4.5 19.5l9-9M9.5 14.5h3.5M12 12V9" />
    </>
  ),
  // 肉食ハイスペ: 稲妻
  SHYR: <path d="M13.5 2.5L4.5 14h7l-1 7.5 9-11.5h-7z" />,
  // 婚活エリート: 指輪
  SHYK: (
    <>
      <circle cx="12" cy="15" r="6" />
      <path d="M9 6.5l3-3 3 3-3 3z" />
      <path d="M10.2 8.7L9 10.2M13.8 8.7l1.2 1.5" />
    </>
  ),
  // 港区の住人: シャンパングラス
  SHMR: (
    <>
      <path d="M8 3h8l-.9 6.5a3.1 3.1 0 0 1-6.2 0z" />
      <path d="M12 12.6v7.9M8.5 20.5h7M8.4 6.5h7.2" />
      <circle cx="18.5" cy="4.5" r="0.7" fill="currentColor" />
      <circle cx="19.5" cy="8" r="0.5" fill="currentColor" />
    </>
  ),
  // 大黒柱: 城
  SHMK: (
    <>
      <path d="M4 20.5V8.5h3v2h2.5v-2h5v2H17v-2h3v12z" />
      <path d="M10 20.5v-3.8a2 2 0 0 1 4 0v3.8M12 8.5V3.5l3 1.2-3 1.2" />
    </>
  ),
  // 隠れ優良物件: 家ときらめき
  SPYR: (
    <>
      <path d="M3 11.5l9-7.5 9 7.5M5.5 9.5v11h13v-11M10 20.5v-5h4v5" />
      <path d="M19 2.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="currentColor" />
    </>
  ),
  // 安定株: 芽
  SPYK: (
    <>
      <path d="M12 20.5v-9.5M12 11c0-3.2-2.2-5.5-6.5-5.5 0 3.3 2.3 5.5 6.5 5.5zM12 13.5c0-3.5 2.2-6.5 6.5-6.5 0 3.8-2.3 6.5-6.5 6.5z" />
      <path d="M7 20.5h10" />
    </>
  ),
  // 沼系インテリ: うずまき（ハマる沼）
  SPMR: (
    <path d="M12 12.2a1.4 1.4 0 0 1 1.4 1.4 2.8 2.8 0 0 1-2.8 2.8 4.2 4.2 0 0 1-4.2-4.2 5.6 5.6 0 0 1 5.6-5.6 7 7 0 0 1 7 7 8.4 8.4 0 0 1-8.4 8.4" />
  ),
  // 不動の本命: 錨
  SPMK: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v13.5M4.5 13a7.5 7.5 0 0 0 15 0M8 10.5h8M4.5 13l-1.5 1.5M19.5 13l1.5 1.5" />
    </>
  ),
};

// タイプの color（Tailwind クラス）から取り出す色。使われている色だけ定義する
const TW: Record<string, string> = {
  'amber-200': '#fde68a', 'amber-300': '#fcd34d', 'amber-400': '#fbbf24', 'amber-500': '#f59e0b',
  'blue-300': '#93c5fd', 'blue-400': '#60a5fa',
  'cyan-200': '#a5f3fc', 'cyan-300': '#67e8f9', 'cyan-400': '#22d3ee',
  'emerald-200': '#a7f3d0', 'emerald-300': '#6ee7b7',
  'fuchsia-400': '#e879f9',
  'indigo-300': '#a5b4fc', 'indigo-400': '#818cf8', 'indigo-500': '#6366f1',
  'lime-200': '#d9f99d', 'lime-300': '#bef264',
  'orange-300': '#fdba74',
  'pink-200': '#fbcfe8', 'pink-300': '#f9a8d4',
  'purple-300': '#d8b4fe', 'purple-400': '#c084fc',
  'red-300': '#fca5a5', 'red-400': '#f87171',
  'rose-200': '#fecdd3', 'rose-300': '#fda4af', 'rose-400': '#fb7185', 'rose-500': '#f43f5e',
  'sky-200': '#bae6fd', 'sky-300': '#7dd3fc', 'sky-400': '#38bdf8',
  'slate-200': '#e2e8f0', 'slate-300': '#cbd5e1', 'slate-400': '#94a3b8',
  'teal-200': '#99f6e4', 'teal-300': '#5eead4',
  'violet-300': '#c4b5fd', 'violet-400': '#a78bfa', 'violet-500': '#8b5cf6',
  'yellow-200': '#fef08a', 'yellow-300': '#fde047',
};

function gradientStops(colorClass?: string): [string, string] {
  const from = colorClass?.match(/from-([a-z]+-\d+)/)?.[1];
  const to = colorClass?.match(/to-([a-z]+-\d+)/)?.[1];
  return [TW[from ?? ''] ?? '#a5b4fc', TW[to ?? ''] ?? '#c084fc'];
}

// 角を少し丸めた六角形（48×48）
const HEX_OUTER = 'M24 2.5 42.6 13.25v21.5L24 45.5 5.4 34.75v-21.5z';
const HEX_INNER = 'M24 6 39.6 15v18L24 42 8.4 33V15z';

interface TypeIconProps {
  /** 4文字のタイプコード（例: MCLF） */
  code?: string;
  /** タイプの color（例: from-amber-300 via-yellow-200 to-amber-500）。省略時は紫系 */
  color?: string;
  /** 表示サイズ(px) */
  size?: number;
  className?: string;
  title?: string;
}

export default function TypeIcon({ code, color, size = 48, className = '', title }: TypeIconProps) {
  const id = useId().replace(/:/g, '');
  const [c1, c2] = gradientStops(color ?? (code ? (OVERALL_TYPES[code] ?? LOVE_TYPES[code])?.color : undefined));
  const glyph = (code && GLYPHS[code]) ?? GLYPHS.VPYR;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`inline-block shrink-0 ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`ti-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <path d={HEX_OUTER} fill={`url(#ti-${id})`} stroke={`url(#ti-${id})`} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={HEX_INNER} fill="#0b1020" fillOpacity={0.86} strokeLinejoin="round" />
      <path d="M24 6 39.6 15" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={1} strokeLinecap="round" />
      <g
        transform="translate(12 12)"
        fill="none"
        stroke={`url(#ti-${id})`}
        color={c1}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyph}
      </g>
    </svg>
  );
}
