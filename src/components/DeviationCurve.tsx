'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { normalPDF } from '@/lib/score-engine/math-utils';

/**
 * 画面に入ったら 0→1 へ easeOutQuart で進む進捗値を返す。
 * 偏差値の数字のカウントアップと、分布図上の「あなた」マーカーの移動を同期させるために使う。
 */
export function useRevealProgress<T extends Element>(duration = 1400) {
  const ref = useRef<T>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || started) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) setStarted(true);
      },
      { threshold: 0.3, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const t = Math.min((ts - startTs) / duration, 1);
      setProgress(1 - Math.pow(1 - t, 4));
      if (t < 1) raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [started, duration]);

  return { ref, progress };
}

interface DeviationCurveProps {
  /** 表示する偏差値（アニメーション中の値を渡してよい） */
  deviation: number;
  /** 線・塗り・マーカーの色 */
  color: string;
  /** lg: 結果のメイン表示（ラベル付き） / sm: カテゴリカード用の小さな図 */
  size?: 'lg' | 'sm';
  className?: string;
}

// 横軸は偏差値 20〜80（±3σ）を表示する
const MIN_DEV = 20;
const MAX_DEV = 80;

export default function DeviationCurve({ deviation, color, size = 'lg', className = '' }: DeviationCurveProps) {
  const gradientId = useId().replace(/:/g, '');
  const isLarge = size === 'lg';

  const width = isLarge ? 320 : 120;
  const height = isLarge ? 128 : 40;
  const padX = isLarge ? 10 : 3;
  const top = isLarge ? 14 : 5;
  const baseline = isLarge ? height - 26 : height - 3;

  const xOf = (dev: number) => padX + ((dev - MIN_DEV) / (MAX_DEV - MIN_DEV)) * (width - padX * 2);
  const peak = normalPDF(0);
  const yOf = (dev: number) => baseline - (normalPDF((dev - 50) / 10) / peak) * (baseline - top);

  const samples = 60;
  const points: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const dev = MIN_DEV + ((MAX_DEV - MIN_DEV) * i) / samples;
    points.push([xOf(dev), yOf(dev)]);
  }
  const curvePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const areaPath = `${curvePath} L${xOf(MAX_DEV).toFixed(2)},${baseline} L${xOf(MIN_DEV).toFixed(2)},${baseline} Z`;

  // 「あなた」より右側（＝あなたより上位の人たち）を塗り分けて、上位X%の面積を見せる
  const markerDev = Math.max(MIN_DEV + 1, Math.min(MAX_DEV - 1, deviation));
  const tailPoints = points.filter(([x]) => x > xOf(markerDev));
  const tailPath = [
    `M${xOf(markerDev).toFixed(2)},${baseline}`,
    `L${xOf(markerDev).toFixed(2)},${yOf(markerDev).toFixed(2)}`,
    ...tailPoints.map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`),
    `L${xOf(MAX_DEV).toFixed(2)},${baseline}`,
    'Z',
  ].join(' ');

  const meanX = xOf(50);
  const markerX = xOf(markerDev);
  const markerY = yOf(markerDev);
  // 平均ラベルと重なるときは「あなた」をマーカーの上に出す
  const labelsCollide = Math.abs(markerX - meanX) < 44;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto overflow-visible ${className}`}
      role="img"
      aria-label={`偏差値${deviation.toFixed(1)}。平均50を基準とした正規分布上の位置`}
    >
      <defs>
        <linearGradient id={`fill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id={`tail-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.55} />
          <stop offset="100%" stopColor={color} stopOpacity={0.15} />
        </linearGradient>
      </defs>

      <path d={areaPath} fill={`url(#fill-${gradientId})`} />
      <path d={tailPath} fill={`url(#tail-${gradientId})`} />
      <line x1={padX} x2={width - padX} y1={baseline} y2={baseline} stroke="rgba(148,163,184,0.35)" strokeWidth={isLarge ? 1 : 0.75} />
      <path d={curvePath} fill="none" stroke={color} strokeWidth={isLarge ? 2.25 : 1.5} strokeLinejoin="round" />

      {/* 平均(50) */}
      <line
        x1={meanX}
        x2={meanX}
        y1={baseline}
        y2={top}
        stroke="rgba(148,163,184,0.6)"
        strokeWidth={isLarge ? 1 : 0.75}
        strokeDasharray={isLarge ? '3 3' : '2 2'}
      />

      {/* あなた */}
      <line
        x1={markerX}
        x2={markerX}
        y1={baseline}
        y2={markerY}
        stroke={color}
        strokeWidth={isLarge ? 1.25 : 0.9}
        strokeDasharray={isLarge ? '3 3' : '2 2'}
      />
      {isLarge && <circle cx={markerX} cy={markerY} r={9} fill={color} opacity={0.2} />}
      <circle
        cx={markerX}
        cy={markerY}
        r={isLarge ? 5 : 2.6}
        fill={color}
        stroke="#0b1020"
        strokeWidth={isLarge ? 2 : 1}
      />

      {isLarge && (
        <>
          <text x={meanX} y={baseline + 17} textAnchor="middle" fontSize={11} fontWeight={700} fill="#94a3b8">
            平均(50)
          </text>
          <text
            x={markerX}
            y={labelsCollide ? markerY - 14 : baseline + 17}
            textAnchor="middle"
            fontSize={11.5}
            fontWeight={900}
            fill={color}
          >
            あなた
          </text>
        </>
      )}
    </svg>
  );
}
