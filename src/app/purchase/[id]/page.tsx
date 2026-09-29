"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OverallDiagnosisResultV3 } from "@/types/spec-check";
import { scoreToTopPercent, formatRarityRatio } from "@/lib/score-engine/math-utils";
import {
  Sparkles,
  Unlock,
  Users,
  Target,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Zap,
  HelpCircle,
  Clock,
  Award,
  ShieldAlert,
  Copy,
  Compass,
  Heart,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function PurchaseLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<OverallDiagnosisResultV3 | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    // 画面遷移時に必ず最上部にスクロール
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [loading]);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/diagnosis/${id}`);
        const json = await res.json();
        if (json.success && json.result && json.result.diagnosisId && json.result.inputSummary) {
          setData(json.result);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to load result from API", e);
      }

      try {
        const cached = localStorage.getItem(`spec_check_result_${id}`) || localStorage.getItem("spec_check_latest_result");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.diagnosisId && parsed.inputSummary) {
            setData(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load result from localStorage", e);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosisId: id,
          returnUrl: typeof window !== "undefined" ? window.location.origin : "",
        }),
      });

      const json = await res.json();
      if (json.mode === "stripe" && json.url) {
        window.location.href = json.url;
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(`spec_check_unlocked_${id}`, "true");
      }
      setTimeout(() => {
        router.push(`/result/${id}?unlocked=true`);
      }, 600);
    } catch (err) {
      console.error("Checkout error:", err);
      if (typeof window !== "undefined") {
        localStorage.setItem(`spec_check_unlocked_${id}`, "true");
      }
      router.push(`/result/${id}?unlocked=true`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">プランデータを準備中...</p>
        </div>
      </div>
    );
  }

  const {
    inputSummary,
    loveOverallScore = 70,
    epithet,
    loveEpithet,
  } = data || {
    inputSummary: { nickname: "あなた", age: 26, gender: "MALE" as const, prefectureName: "東京都" },
    loveOverallScore: 70,
    epithet: { title: "洗練されたポテンシャルホルダー", subtitle: "", rarityBadge: "A Tier", rarityColor: "from-indigo-400 to-purple-400" },
    loveEpithet: { title: "魅力溢れるパートナー候補", subtitle: "", rarityBadge: "A Tier", rarityColor: "from-pink-400 to-rose-400" },
  };

  const currentEpithet = loveEpithet || epithet;
  const topPercent = scoreToTopPercent(loveOverallScore);
  const genderJa = inputSummary?.gender === "FEMALE" ? "女性" : "男性";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* ナビゲーション */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={`/result/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> 診断結果に戻る
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-black text-amber-300">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>診断完了者 限定特別オファー</span>
        </div>
      </div>

      {/* ① HERO / FV */}
      <section className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-purple-950/70 via-slate-900/90 to-slate-950 border border-purple-500/40 shadow-2xl overflow-hidden text-center space-y-6">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-xs font-black text-purple-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>PREMIUM DEEP ANALYTICS REPORT</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            <span>{inputSummary?.nickname || "あなた"}（{inputSummary?.age}歳・{inputSummary?.prefectureName}）の</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              隠された深層スペック ＆ 恋愛市場価値
            </span>
            <span>を完全アンロック</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            政府公式統計データと精密分析モデルにより、あなたの隠れた強み・具体的な改善アクション・同世代におけるリアルな市場ポジションを網羅した完全解析レポートをお届けします。
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-lg mx-auto flex items-center justify-around gap-2 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">獲得した二つ名</span>
            <span className="text-xs sm:text-sm font-black text-amber-300">『{currentEpithet?.title || "ハイスペック候補"}』</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">同世代ポジション</span>
            <span className="text-xs sm:text-sm font-black text-purple-300">上位 {topPercent}% ({formatRarityRatio(topPercent)})</span>
          </div>
        </div>

        <div className="pt-2 max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-slate-400 line-through">通常 ¥2,980</span>
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-xs font-bold text-pink-400">特別価格</span>
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300">¥500</span>
              <span className="text-xs text-slate-400 font-bold">（税込・買い切り）</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-purple-600/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {checkoutLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>決済画面へ接続中...</span>
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                <span>¥500 でプレミアム深層レポートをアンロック</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Apple Pay / Google Pay / カード対応
            </span>
            <span>•</span>
            <span>買い切り（追加費用なし）</span>
          </div>
        </div>
      </section>

      {/* ② アンロックされる6大コンテンツ */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            アンロックされる 6つのプレミアム深層データ
          </h2>
          <p className="text-xs text-slate-400">
            無料版では隠されている詳細数値・改善ロードマップ・マッチングシミュレーションをすべてアンロック
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BENEFIT 01 */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">BENEFIT 01</span>
                <h3 className="text-base font-black text-white">主戦場・マッチング戦力シミュレーション</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ペアーズ・with・東カレ・タップル・結婚相談所など、主要プラットフォームごとの適合度と有利度を算出。
            </p>
          </div>

          {/* BENEFIT 02 */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">BENEFIT 02</span>
                <h3 className="text-base font-black text-white">惹かれやすい異性の特徴 (全7項目)</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              あなたのスペックに強く惹かれる異性の「年齢層」「職業傾向」「外見タイプ」「相性最良の性格」を徹底分析。
            </p>
          </div>

          {/* BENEFIT 03 */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">BENEFIT 03</span>
                <h3 className="text-base font-black text-white">相性最悪な地雷異性タイプ ワースト3</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              時間を無駄にしないための防衛策。あなたの性格・ステータスと衝突しやすい異性の特徴を事前に把握。
            </p>
          </div>

          {/* BENEFIT 04 */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">BENEFIT 04</span>
                <h3 className="text-base font-black text-white">6カテゴリ別 改善ロードマップ ＆ スコア向上具体策</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              何を改善すれば何ポイント向上するか、費用対効果の高い具体的アクションを6カテゴリすべてで明示。
            </p>
          </div>

          {/* BENEFIT 05 */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">BENEFIT 05</span>
                <h3 className="text-base font-black text-white">即コピペで使える 最強プロフィール文章</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              あなたの強みと誠実さを最大化する「マッチングアプリ用」＆「真剣婚活・相談所用」の2パターンを生成。
            </p>
          </div>

          {/* BENEFIT 06 */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">BENEFIT 06</span>
                <h3 className="text-base font-black text-white">全6カテゴリ精密比較 ＆ 詳細総評 全文</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              全6軸の数値・上位%の完全アンロックに加え、統計的ポジション・強み相乗効果・MBTI特性・地域市場環境・中長期戦略の詳細総評（約2,000文字）をフルアンロック。
            </p>
          </div>
        </div>
      </section>

      {/* ③ 中段CTAバナー */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-indigo-950/80 border border-purple-500/40 text-center space-y-4 shadow-xl">
        <h3 className="text-lg sm:text-xl font-black text-white">
          限定データを解放して、あなたの可能性を最大化しよう
        </h3>
        <p className="text-xs text-slate-300">
          追加費用なしのワンコイン ¥500。決済完了後、即時（0秒）で結果画面のすべての制限が解除されます。
        </p>
        <div className="max-w-xs mx-auto">
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Unlock className="w-4 h-4" />
            <span>¥500 で今すぐアンロック</span>
          </button>
        </div>
      </section>

      {/* ④ 安心・信頼のポイント */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>安心・安全にご利用いただくための保証</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1回買い切り
            </span>
            <p className="text-slate-400">月額課金・自動更新・追加料金は一切発生しません。</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 個人情報入力不要
            </span>
            <p className="text-slate-400">住所や電話番号の入力は不要。診断データは安全に処理されます。</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 即時アンロック
            </span>
            <p className="text-slate-400">決済完了後、自動的に結果画面に戻り即座に閲覧可能です。</p>
          </div>
        </div>
      </section>

      {/* ⑤ よくある質問（FAQ） */}
      <section className="space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          <span>よくあるご質問（FAQ）</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">Q. 月額料金や定期購読（サブスク）ですか？</span>
            <p className="text-slate-400 leading-relaxed">
              いいえ、完全な1回限りの買い切り（500円税込）です。勝手に翌月以降引き落とされるようなことは一切ありません。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">Q. 支払い方法はどのようなものがありますか？</span>
            <p className="text-slate-400 leading-relaxed">
              Apple Pay、Google Pay、各種クレジットカード（Visa、Mastercard、JCB、American Express等）に対応しています。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">Q. 購入後、別の端末やブラウザでも見られますか？</span>
            <p className="text-slate-400 leading-relaxed">
              診断結果の専用URL（`/result/${id}?unlocked=true`）を保存・ブックマークいただくことで、いつでもアンロック後の完全版レポートを再確認いただけます。
            </p>
          </div>
        </div>
      </section>

      {/* ⑥ 最下部ラストCTA */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-tr from-purple-900/90 via-slate-900 to-pink-900/80 border-2 border-purple-500/50 shadow-2xl text-center space-y-5">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            プレミアム深層レポートで、あなたの可能性をすべて解き放つ
          </h2>
          <p className="text-xs text-slate-300">
            診断完了者限定 ¥500（買い切り）• Apple Pay / Google Pay / カード対応
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-purple-600/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {checkoutLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>決済画面へ接続中...</span>
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                <span>¥500 でプレミアム深層レポートをアンロック</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          <Link
            href={`/result/${id}`}
            className="inline-block text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors py-1"
          >
            購入せずに結果画面に戻る
          </Link>
        </div>
      </section>
    </div>
  );
}
