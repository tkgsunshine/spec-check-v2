/**
 * サイト共通のオリジナル線画アイコン（絵文字の代わりに使う）。
 * 24×24 グリッド・線幅 2・角丸で統一し、色は currentColor（文字色）に合わせる。
 * 大きさは既定で 1em（周りの文字と同じ高さ）。
 */

interface IconProps {
  className?: string;
  /** px。省略時は 1em */
  size?: number;
  title?: string;
}

function Svg({ className = '', size, title, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size ?? '1em'}
      height={size ?? '1em'}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 align-[-0.125em] ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {children}
    </svg>
  );
}

/** プレミアム限定の鍵 */
export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2.5" />
    </Svg>
  );
}

/** きらめき（総合モード・プレミアム） */
export function SparkleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 3c.7 4.6 2.4 6.3 7 7-4.6.7-6.3 2.4-7 7-.7-4.6-2.4-6.3-7-7 4.6-.7 6.3-2.4 7-7z" />
      <path d="M18.5 14.5c.3 1.8.9 2.4 2.7 2.7-1.8.3-2.4.9-2.7 2.7-.3-1.8-.9-2.4-2.7-2.7 1.8-.3 2.4-.9 2.7-2.7z" />
    </Svg>
  );
}

/** 稲妻（即時・テスト操作） */
export function BoltIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.5 2.5 4.5 14h7l-1 7.5 9-11.5h-7z" />
    </Svg>
  );
}

/** ハート（恋愛モード） */
export function HeartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20s-8-4.6-8-10.3A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.4C20 15.4 12 20 12 20z" />
    </Svg>
  );
}

/** 右向きの矢印（「こちら」の誘導） */
export function PointRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12h14M13 6.5 18.5 12 13 17.5" />
    </Svg>
  );
}

/** 日本（国旗をモチーフにした丸） */
export function JapanIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <circle cx="12" cy="12" r="3.2" fill="#ef4444" stroke="none" />
    </Svg>
  );
}

/** 注意 */
export function WarningIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </Svg>
  );
}

/** 順位メダル（中に順位の数字を入れる） */
export function MedalIcon({ rank, ...props }: IconProps & { rank: number }) {
  return (
    <Svg {...props}>
      <path d="M8 2.5 10.5 8M16 2.5 13.5 8" />
      <circle cx="12" cy="14.5" r="6.5" />
      <text
        x="12"
        y="17.6"
        textAnchor="middle"
        fontSize="9"
        fontWeight="900"
        fill="currentColor"
        stroke="none"
        fontFamily="system-ui, sans-serif"
      >
        {rank}
      </text>
    </Svg>
  );
}

/** グラフ（統計データ） */
export function ChartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 20.5h17M6.5 20.5v-6M11 20.5V9.5M15.5 20.5v-8M20 20.5V5" />
    </Svg>
  );
}

/** 宝石（資産） */
export function GemIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 4h11l3.5 5-9 11.5L3 9z" />
      <path d="M3 9h18M9.2 4 7.6 9 12 20.5 16.4 9l-1.6-5" />
    </Svg>
  );
}

/** カード（負債・借入） */
export function CardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M6.5 15h4" />
    </Svg>
  );
}

/** 状態を表す丸（本番/開発など） */
export function StatusDot({ color, className = '' }: { color: string; className?: string }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full align-middle ${className}`}
      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      aria-hidden
    />
  );
}
