'use client';

import { useState } from 'react';
import { Check, Copy, X, Download, Heart, Sparkles } from 'lucide-react';
import { EpithetResult } from '@/types/spec-check';
import DeviationCurve from '@/components/DeviationCurve';
import { formatRarityRatio, normalPDF, scoreToDeviation } from '@/lib/score-engine/math-utils';
import TypeIcon from '@/components/icons/TypeIcon';

interface RadarAxis {
  labelJa: string;
  labelEn: string;
  score: number;
}

interface SnsShareCardProps {
  shareToken: string;
  score: number;
  topPercent?: number | null;
  gender: string;
  age: number;
  nickname?: string;
  prefectureName?: string;
  isLoveMode?: boolean;
  categoryScores: {
    body: number;
    economic: number;
    career: number;
    social: number;
    ability?: number;
  };
  radarAxes?: RadarAxis[];
  epithet?: EpithetResult | null;
  epithetTitle?: string;
}

export default function SnsShareCard({
  shareToken,
  score,
  topPercent,
  gender,
  age,
  nickname,
  prefectureName,
  isLoveMode = false,
  epithet,
  epithetTitle,
}: SnsShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${shareToken}` : '';
  const genderTextJa = gender === 'MALE' ? '男性' : '女性';
  const displayNickname = nickname || 'あなた';
  const prefStr = prefectureName ? ` / ${prefectureName}` : '';
  const modeTitle = isLoveMode ? '恋愛スペック診断' : '人間スペック診断';
  const deviationLabel = isLoveMode ? '恋愛偏差値' : '人間スペック偏差値';
  const deviation = scoreToDeviation(score);
  // 結果画面の偏差値ブロックと同じ文言
  const populationText = prefectureName
    ? `同世代（${age}歳・${prefectureName}）の${genderTextJa}の中で`
    : `同世代（${age}歳）の${genderTextJa}の中で`;
  const suffixText = isLoveMode ? 'の恋愛市場価値' : 'の総合スペック';
  const profileHeaderStr = `${displayNickname} / ${age}歳 / ${genderTextJa}${prefStr} の${modeTitle}結果`;

  const rankShareStr = (topPercent !== undefined && topPercent !== null && topPercent <= 50)
    ? `【上位 ${topPercent}% (${formatRarityRatio(topPercent)})】`
    : '';

  const displayEpithetTitle = epithet?.title || epithetTitle;
  const displayEpithetSubtitle = epithet?.subtitle;

  const getTierText = () => {
    if (epithet && epithet.rarityBadge) {
      const b = epithet.rarityBadge;
      if (b.startsWith('SS')) return 'SS TIER';
      if (b.startsWith('S ')) return 'S TIER';
      if (b.startsWith('A ')) return 'A TIER';
    }
    if (score >= 85) return 'SS TIER';
    if (score >= 75) return 'S TIER';
    if (score >= 65) return 'A TIER';
    if (score >= 50) return 'B TIER';
    return 'C TIER';
  };

  const typeShareStr = epithet?.typeCode
    ? `\n${isLoveMode ? '恋愛タイプ' : 'タイプ'}：${epithet.typeName}（${epithet.typeCode}）`
    : '';
  const epithetShareStr = displayEpithetTitle ? `${typeShareStr}\n二つ名：『${displayEpithetTitle}』` : '';

  const shareText = `【${modeTitle} 結果】
${profileHeaderStr} ${epithetShareStr}
${rankShareStr} ${deviationLabel} ${deviation.toFixed(1)}
あなたの同世代${isLoveMode ? '恋愛偏差値＆市場価値' : '順位＆市場価値'}は？
#${modeTitle} #${isLoveMode ? '恋愛市場価値' : '人間スペック'} #スペック診断 #同世代比較`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareX = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineUrl, '_blank');
  };

  // High-Res Canvas Card Image Generation & Download
  const downloadCardImage = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const width = 640;
      const height = 820;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Gradient (総合 vs 恋愛)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isLoveMode) {
        bgGrad.addColorStop(0, '#0d0612');
        bgGrad.addColorStop(0.5, '#1e0f24');
        bgGrad.addColorStop(1, '#3b0a2a');
      } else {
        bgGrad.addColorStop(0, '#070a14');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#1e1b4b');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Decorative Glow Circles
      const glowGrad = ctx.createRadialGradient(width / 2, 200, 20, width / 2, 200, 260);
      if (isLoveMode) {
        glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
        glowGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Card Header Text
      ctx.textAlign = 'center';
      ctx.fillStyle = isLoveMode ? '#f472b6' : '#818cf8';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${isLoveMode ? '恋愛スペック診断' : '人間スペック診断'} 公式カード`, width / 2, 50);

      // User Profile Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(profileHeaderStr, width / 2, 78);

      // Epithet Block (結果画面と同デザイン)
      let currentY = 118;
      if (displayEpithetTitle) {
        const tierStr = getTierText();
        if (tierStr) {
          ctx.fillStyle = isLoveMode ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)';
          ctx.strokeStyle = isLoveMode ? 'rgba(244, 63, 94, 0.5)' : 'rgba(245, 158, 11, 0.5)';
          ctx.lineWidth = 1.5;
          const tPillW = 84;
          const tPillH = 22;
          ctx.beginPath();
          ctx.roundRect(width / 2 - tPillW / 2, currentY - 14, tPillW, tPillH, 11);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isLoveMode ? '#fda4af' : '#fde047';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(tierStr, width / 2, currentY + 1);
          currentY += 28;
        }

        ctx.fillStyle = isLoveMode ? '#fb7185' : '#f472b6';
        ctx.font = '900 19px sans-serif';
        ctx.fillText(`『 ${displayEpithetTitle} 』`, width / 2, currentY);
        currentY += 24;

        if (displayEpithetSubtitle) {
          ctx.fillStyle = isLoveMode ? '#fed7aa' : '#cbd5e1';
          ctx.font = '500 12px sans-serif';
          ctx.fillText(displayEpithetSubtitle, width / 2, currentY);
          currentY += 28;
        }
      }

      // 偏差値ブロック（結果画面の DeviationHero と同じ構成）
      const accent = isLoveMode ? '#fb7185' : '#818cf8';
      let y = displayEpithetTitle ? currentY + 26 : 130;

      ctx.textAlign = 'center';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '900 18px sans-serif';
      ctx.fillText(deviationLabel, width / 2, y);

      // 大きな偏差値（グラデーション）＋小さな「pt」
      y += 108;
      const deviationText = deviation.toFixed(1);
      ctx.font = '900 120px sans-serif';
      const numberWidth = ctx.measureText(deviationText).width;
      ctx.font = '900 34px sans-serif';
      const unitWidth = ctx.measureText('pt').width;
      const unitGap = 8;
      const numberLeft = width / 2 - (numberWidth + unitGap + unitWidth) / 2;
      const numberGrad = ctx.createLinearGradient(numberLeft, y - 100, numberLeft + numberWidth + unitGap + unitWidth, y);
      if (isLoveMode) {
        numberGrad.addColorStop(0, '#f43f5e');
        numberGrad.addColorStop(1, '#fb7185');
      } else {
        numberGrad.addColorStop(0, '#818cf8');
        numberGrad.addColorStop(1, '#c084fc');
      }
      ctx.fillStyle = numberGrad;
      ctx.textAlign = 'left';
      ctx.font = '900 120px sans-serif';
      ctx.fillText(deviationText, numberLeft, y);
      ctx.font = '900 34px sans-serif';
      ctx.fillText('pt', numberLeft + numberWidth + unitGap, y);

      // 同世代（◯歳・◯◯）の◯性の中で 上位X% / の総合スペック
      y += 52;
      const topText = topPercent !== undefined && topPercent !== null ? `上位${topPercent}%` : '';
      ctx.font = 'bold 21px sans-serif';
      const popWidth = ctx.measureText(`${populationText} `).width;
      ctx.font = '900 27px sans-serif';
      const topWidth = ctx.measureText(topText).width;
      let lineX = width / 2 - (popWidth + topWidth) / 2;
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 21px sans-serif';
      ctx.fillText(`${populationText} `, lineX, y);
      lineX += popWidth;
      ctx.fillStyle = isLoveMode ? '#fda4af' : '#a5b4fc';
      ctx.font = '900 27px sans-serif';
      ctx.fillText(topText, lineX, y);

      y += 34;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 21px sans-serif';
      ctx.fillText(suffixText, width / 2, y);

      // 正規分布図と「あなた」の位置
      const curveLeft = 50;
      const curveRight = width - 50;
      const curveTop = y + 40;
      const curveBase = curveTop + 190;
      const MIN_DEV = 20;
      const MAX_DEV = 80;
      const xOf = (dev: number) => curveLeft + ((dev - MIN_DEV) / (MAX_DEV - MIN_DEV)) * (curveRight - curveLeft);
      const peak = normalPDF(0);
      const yOf = (dev: number) => curveBase - (normalPDF((dev - 50) / 10) / peak) * (curveBase - curveTop);
      const curvePoints: [number, number][] = [];
      for (let i = 0; i <= 120; i++) {
        const dev = MIN_DEV + ((MAX_DEV - MIN_DEV) * i) / 120;
        curvePoints.push([xOf(dev), yOf(dev)]);
      }
      const traceCurve = () => {
        curvePoints.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      };

      // 全体の塗り
      const areaGrad = ctx.createLinearGradient(0, curveTop, 0, curveBase);
      areaGrad.addColorStop(0, isLoveMode ? 'rgba(251, 113, 133, 0.22)' : 'rgba(129, 140, 248, 0.22)');
      areaGrad.addColorStop(1, isLoveMode ? 'rgba(251, 113, 133, 0.02)' : 'rgba(129, 140, 248, 0.02)');
      ctx.beginPath();
      traceCurve();
      ctx.lineTo(xOf(MAX_DEV), curveBase);
      ctx.lineTo(xOf(MIN_DEV), curveBase);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // あなたより上位の人たちの面積
      const markerDev = Math.max(MIN_DEV + 1, Math.min(MAX_DEV - 1, deviation));
      const markerX = xOf(markerDev);
      const markerY = yOf(markerDev);
      const tailGrad = ctx.createLinearGradient(0, curveTop, 0, curveBase);
      tailGrad.addColorStop(0, isLoveMode ? 'rgba(251, 113, 133, 0.55)' : 'rgba(129, 140, 248, 0.55)');
      tailGrad.addColorStop(1, isLoveMode ? 'rgba(251, 113, 133, 0.15)' : 'rgba(129, 140, 248, 0.15)');
      ctx.beginPath();
      ctx.moveTo(markerX, curveBase);
      ctx.lineTo(markerX, markerY);
      curvePoints.filter(([px]) => px > markerX).forEach(([px, py]) => ctx.lineTo(px, py));
      ctx.lineTo(xOf(MAX_DEV), curveBase);
      ctx.closePath();
      ctx.fillStyle = tailGrad;
      ctx.fill();

      // 基準線と曲線
      ctx.beginPath();
      ctx.moveTo(curveLeft, curveBase);
      ctx.lineTo(curveRight, curveBase);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      traceCurve();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // 平均(50) と あなた の点線
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xOf(50), curveBase);
      ctx.lineTo(xOf(50), curveTop);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(markerX, curveBase);
      ctx.lineTo(markerX, markerY);
      ctx.strokeStyle = accent;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(markerX, markerY, 16, 0, Math.PI * 2);
      ctx.fillStyle = isLoveMode ? 'rgba(251, 113, 133, 0.2)' : 'rgba(129, 140, 248, 0.2)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(markerX, markerY, 9, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.strokeStyle = '#0b1020';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      const labelsCollide = Math.abs(markerX - xOf(50)) < 80;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText('平均(50)', xOf(50), curveBase + 30);
      ctx.fillStyle = accent;
      ctx.font = '900 20px sans-serif';
      ctx.fillText('あなた', Math.min(Math.max(markerX, curveLeft + 30), curveRight - 30), labelsCollide ? markerY - 26 : curveBase + 30);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 15px sans-serif';
      ctx.fillText('平均偏差値50を基準とした正規分布上のあなたの位置', width / 2, curveBase + 66);

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = isLoveMode ? '#9f1239' : '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText(`${modeTitle} 公式カード`, width / 2, height - 30);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${isLoveMode ? 'love' : 'human'}-spec-result-${shareToken.substring(0, 8)}.png`;
      a.click();
    } catch (e) {
      console.error('Failed to download card image', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full py-4 rounded-2xl text-white font-black text-base shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
          isLoveMode
            ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 shadow-rose-600/30'
            : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 shadow-indigo-600/30'
        }`}
      >
        {isLoveMode ? (
          <Heart className="w-5 h-5 fill-rose-300 text-rose-200" />
        ) : (
          <Sparkles className="w-5 h-5 text-indigo-200" />
        )}
        <span>{isLoveMode ? '恋愛スペック診断結果をSNSで共有する' : '総合スペック診断結果をSNSで共有する'}</span>
      </button>

      {isOpen && (
        // 外側だけをスクロールさせる。中身が画面より高いときも上端が切れないよう、
        // 中央寄せは min-h-full のラッパーで行う（items-center を直接スクロール領域に付けると上がはみ出す）
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 overflow-y-auto overscroll-contain">
          <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-slate-950/95 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-sm sm:max-w-md w-full relative text-center my-6 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Card Graphic Container (総合 vs 恋愛でテーマを完全連動) */}
            <div
              className={`rounded-2xl pt-6 pb-5 px-3 border shadow-2xl mb-4 text-center relative overflow-hidden shrink-0 ${
                isLoveMode
                  ? 'bg-gradient-to-b from-slate-950 via-rose-950/40 to-pink-950/70 border-rose-500/40 shadow-rose-950/40'
                  : 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-slate-800 shadow-indigo-950/40'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-center gap-1 mb-1">
                {isLoveMode ? (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-black tracking-widest uppercase">
                    <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                    恋愛スペック診断 公式カード
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-black tracking-widest uppercase">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    人間スペック診断 公式カード
                  </span>
                )}
              </div>

              {/* ユーザープロフィール & ニックネーム */}
              <div className="text-xs sm:text-sm font-black text-slate-200 mb-2">
                {profileHeaderStr}
              </div>

              {/* 獲得二つ名 (結果画面と同デザインの豪華バナー) */}
              {displayEpithetTitle && (
                <div
                  className={`my-2.5 p-3 rounded-2xl bg-slate-950/80 border backdrop-blur-md shadow-lg text-center relative overflow-hidden ${
                    isLoveMode ? 'border-rose-500/40' : 'border-amber-500/40'
                  }`}
                >
                  {/* Tier Badge */}
                  <div
                    className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase mb-1 shadow-sm border ${
                      isLoveMode
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    <span>{getTierText()}</span>
                  </div>

                  {epithet?.typeCode && (
                    <div className="text-[11px] font-black text-white leading-tight">
                      <TypeIcon code={epithet.typeCode} color={epithet.rarityColor} size={22} className="mr-1 align-middle" />
                      <span className={`font-mono tracking-widest mr-1 ${isLoveMode ? 'text-rose-300' : 'text-amber-300'}`}>{epithet.typeCode}</span>
                      {epithet.typeName}
                    </div>
                  )}

                  {/* Title with Gradient Text */}
                  <div
                    className={`text-xs sm:text-sm font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r ${
                      epithet?.rarityColor ||
                      (isLoveMode
                        ? 'from-pink-300 via-rose-300 to-amber-200'
                        : 'from-pink-300 via-rose-300 to-purple-300')
                    } drop-shadow-md py-0.5`}
                  >
                    『 {displayEpithetTitle} 』
                  </div>

                  {/* Subtitle */}
                  {displayEpithetSubtitle && (
                    <p
                      className={`text-[10px] font-medium mt-0.5 leading-snug max-w-xs mx-auto ${
                        isLoveMode ? 'text-rose-200/90' : 'text-slate-300'
                      }`}
                    >
                      {displayEpithetSubtitle}
                    </p>
                  )}
                </div>
              )}

              {/* 偏差値ブロック（結果画面の DeviationHero と同じ構成） */}
              <div className="mt-3 text-[11px] font-black tracking-wider text-slate-300">{deviationLabel}</div>
              <div
                className={`${isLoveMode ? 'gradient-text-pink' : 'gradient-text-indigo'} font-black tracking-tight leading-none mt-1 text-6xl tabular-nums`}
              >
                {deviation.toFixed(1)}
                <span className="ml-1 text-xl tracking-normal">pt</span>
              </div>
              <p className="mt-2.5 text-[12px] font-bold text-slate-200 leading-relaxed">
                {populationText}{' '}
                {topPercent !== undefined && topPercent !== null && (
                  <span className={`${isLoveMode ? 'text-rose-300' : 'text-indigo-300'} font-black text-sm whitespace-nowrap`}>
                    上位{topPercent}%
                  </span>
                )}
                <br />
                {suffixText}
              </p>
              <div className="mt-3 px-2">
                <DeviationCurve deviation={deviation} color={isLoveMode ? '#fb7185' : '#818cf8'} size="lg" />
              </div>
              <p className="mt-1 text-[9px] font-semibold text-slate-500">平均偏差値50を基準とした正規分布上のあなたの位置</p>

              <div
                className={`text-[10px] font-bold tracking-widest mt-3 ${
                  isLoveMode ? 'text-rose-400/70' : 'text-slate-500'
                }`}
              >
                {modeTitle} 公式カード
              </div>
            </div>

            {/* Action & Share Buttons (2x2 Layout with Official Icons) */}
            <div className="space-y-2.5 shrink-0">
              {/* 上段: 画像で保存 & リンクをコピー */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={downloadCardImage}
                  disabled={downloading}
                  className="py-3 px-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span>{downloading ? '保存中...' : '画像で保存'}</span>
                </button>

                <button
                  onClick={copyLink}
                  className="py-3 px-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                  <span>{copied ? 'コピー完了' : 'リンクをコピー'}</span>
                </button>
              </div>

              {/* 下段: Xでシェア & LINEでシェア (公式ロゴSVG) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={shareX}
                  className="py-3 px-2 rounded-full bg-black hover:bg-slate-900 border border-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X でシェア</span>
                </button>

                <button
                  onClick={shareLine}
                  className="py-3 px-2 rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#06C755]/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.412-.105-.531-.283l-2.003-2.909v2.532c0 .344-.282.629-.628.629-.346 0-.628-.285-.628-.629V8.108c0-.345.282-.63.628-.63.208 0 .408.104.529.281l2.004 2.91V8.108c0-.345.282-.63.628-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.628.629-.346 0-.628-.285-.628-.629V8.108c0-.345.282-.63.628-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  <span>LINE でシェア</span>
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
}
