'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Database, RefreshCw, ArrowLeft, BarChart3,
  Users, Calendar, Search, Eye, Download, FileText, Globe,
  User, Landmark, GraduationCap, Heart, Sparkles, X, Briefcase, Award, ArrowUpRight
} from 'lucide-react';
import { OverallDiagnosisResultV3, DiagnosisInputV3 } from '@/types/spec-check';
import { scoreToTopPercent, formatRarityRatio } from '@/lib/score-engine/math-utils';
import {
  INDUSTRY_MASTER,
  COMMON_OCCUPATION_MASTER,
  MBTI_MASTER,
  SNS_FOLLOWER_BRACKETS,
  LANGUAGE_MASTER,
} from '@/lib/datasets/japan-stats';
import { CardIcon, GemIcon, StatusDot } from '@/components/icons/SpecIcons';

interface AdminStatsSummary {
  totalCount: number;
  todayCount: number;
  avgJapanScore: number;
  avgLoveScore: number;
  genderRatio: { MALE: number; FEMALE: number; OTHER: number };
  ageDistribution: Record<string, number>;
  topPrefectures: { pref: string; count: number }[];
}

// ヘルパー: 表示用ラベル変換
const getFaceRatingLabel = (val?: string | null): string => {
  switch (val) {
    case 'MODEL_LEVEL': return 'モデル・インフルエンサー級 (美形・圧倒的)';
    case 'ABOVE_AVERAGE': return '上位クラス (整った容姿・清潔感)';
    case 'AVERAGE': return '平均的 (一般的・親しみやすい印象)';
    case 'BELOW_AVERAGE': return '改善の余地あり';
    default: return val ? String(val) : '未入力';
  }
};

const getAcademicDegreeLabel = (val?: string | null): string => {
  switch (val) {
    case 'DOCTOR': return '大学院博士課程修了';
    case 'MASTER': return '大学院修士課程修了';
    case 'BACHELOR': return '大学卒 (学士)';
    case 'JUNIOR_COLLEGE': return '短期大学卒';
    case 'VOCATIONAL': return '専門学校卒';
    case 'HIGH_SCHOOL': return '高等学校卒';
    case 'MIDDLE_SCHOOL': return '中学校卒';
    default: return val ? String(val) : '未入力';
  }
};

const getEmploymentTypeLabel = (val?: string | null): string => {
  switch (val) {
    case 'EXECUTIVE': return '役員・経営者';
    case 'REGULAR': return '正社員・常勤';
    case 'CONTRACT': return '契約社員・派遣・パート';
    case 'FREELANCE': return 'フリーランス・個人事業';
    case 'UNEMPLOYED': return '無職・求職中・学生';
    default: return val ? String(val) : '未入力';
  }
};

const getCompanyCategoryLabel = (val?: string | null): string => {
  switch (val) {
    case 'LARGE_PRIME': return 'プライム上場・外資トップ';
    case 'LARGE': return '大手企業・上場企業';
    case 'MEDIUM': return '中堅企業・メガベンチャー';
    case 'SMALL': return '中小企業・スタートアップ';
    case 'OTHER': return 'その他・個人事業所';
    default: return val ? String(val) : '未選択';
  }
};

const getMaritalStatusLabel = (val?: string | null): string => {
  switch (val) {
    case 'SINGLE_FREE': return '未婚（恋人なし・フリー）';
    case 'SINGLE_DATING': return '未婚（恋人あり・交際中）';
    case 'ENGAGED_COHABITING': return '婚約中 / 同棲中';
    case 'MARRIED': return '既婚';
    case 'SEPARATED': return '別居中';
    case 'DIVORCED': return '離婚歴あり';
    case 'BEREAVED': return '死別';
    case 'SINGLE': return '未婚';
    default: return val ? String(val) : '未入力';
  }
};

const getIndustryLabel = (code?: string | null): string => {
  if (!code) return '未選択';
  const found = INDUSTRY_MASTER.find(i => i.id === code);
  return found ? found.name : code;
};

const getOccupationLabel = (code?: string | null): string => {
  if (!code) return '未選択';
  const found = COMMON_OCCUPATION_MASTER.find(o => o.id === code);
  return found ? found.name : code;
};

const getMbtiLabel = (code?: string | null): string => {
  if (!code) return '未入力 / 不明';
  const found = MBTI_MASTER.find(m => m.code.toUpperCase() === code.toUpperCase());
  return found ? `${found.code} (${found.nameJa})` : code;
};

const getSnsFollowerLabel = (num?: number | null): string => {
  if (num === null || num === undefined) return '0人';
  const found = SNS_FOLLOWER_BRACKETS.find(b => b.value === num);
  if (found) return found.label;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万人`;
  return `${num.toLocaleString()}人`;
};

const getLanguageName = (code: string): string => {
  const found = LANGUAGE_MASTER.find(l => l.code === code);
  return found ? found.nameJa : code;
};

const getLanguageLevelLabel = (level: string): string => {
  switch (level) {
    case 'NATIVE': return 'ネイティブ';
    case 'BUSINESS': return 'ビジネス';
    case 'DAILY': return '日常会話';
    case 'BASIC': return '基礎';
    default: return level;
  }
};

const getEpithetStr = (ep: any): string => {
  if (!ep) return '';
  if (typeof ep === 'string') return ep;
  if (typeof ep === 'object') {
    if (ep.title) return ep.title;
    if (ep.fullTitle) return ep.fullTitle;
  }
  return '';
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStatsSummary | null>(null);
  const [records, setRecords] = useState<OverallDiagnosisResultV3[]>([]);
  const [adminEnv, setAdminEnv] = useState<{ environment: string; collectionName: string }>({
    environment: 'development',
    collectionName: 'dev_diagnoses',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<OverallDiagnosisResultV3 | null>(null);

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.summary);
        setRecords(data.records || []);
        if (data.environment) {
          setAdminEnv({
            environment: data.environment,
            collectionName: data.collectionName || (data.environment === 'production' ? 'diagnoses' : 'dev_diagnoses'),
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      '診断ID', '日時', 'ニックネーム', '性別', '年齢', '都道府県',
      '最終学歴', '大学名', '職種コード', '企業名', '年収(万円)', '金融資産(万円)',
      '日本人総合Score', '恋愛総合Score', '獲得称号'
    ];

    const rows = records.map(r => [
      r.diagnosisId,
      r.createdAt || '',
      `"${r.inputSummary?.nickname || ''}"`,
      r.inputSummary?.gender || '',
      r.inputSummary?.age || '',
      r.inputSummary?.prefectureName || '',
      r.rawInput?.academicDegree || '',
      `"${r.rawInput?.universityName || ''}"`,
      r.rawInput?.occupationCode || '',
      `"${r.rawInput?.companyName || ''}"`,
      r.rawInput?.annualIncome ?? '',
      r.rawInput?.financialAssets ?? '',
      r.japanOverallScore,
      r.loveOverallScore,
      `"${getEpithetStr(r.epithet)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spec_check_diagnoses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // フィルタリング処理
  const filteredRecords = records.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const epStr = getEpithetStr(r.epithet).toLowerCase();
    const loveEpStr = getEpithetStr(r.loveEpithet).toLowerCase();
    return (
      (r.inputSummary?.nickname || '').toLowerCase().includes(q) ||
      (r.inputSummary?.prefectureName || '').toLowerCase().includes(q) ||
      (r.rawInput?.companyName || '').toLowerCase().includes(q) ||
      (r.rawInput?.universityName || '').toLowerCase().includes(q) ||
      epStr.includes(q) ||
      loveEpStr.includes(q)
    );
  });

  // 選択レコードの入力情報（安全な参照用）
  const inp: Partial<DiagnosisInputV3> = selectedRecord?.rawInput || {};
  const luxuryVal = inp.luxuryAssets !== undefined && inp.luxuryAssets !== null
    ? inp.luxuryAssets
    : ((inp.carAssets || 0) + (inp.watchAssets || 0));
  const totalAssets = (inp.savingsAssets || 0) + (inp.financialAssets || 0) + (inp.realEstateAssets || 0) + luxuryVal;
  const totalDebts = (inp.mortgageDebt || 0) + (inp.carDebt || 0) + (inp.scholarshipDebt || 0) + (inp.otherDebt || 0);
  const netWorth = totalAssets - totalDebts;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-2">
            <ArrowLeft className="w-4 h-4" /> サイトトップへ
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
              SPEC CHECK データ管理ダッシュボード
            </h1>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
              adminEnv.environment === 'production'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            }`}>
              {adminEnv.environment === 'production' ? <><StatusDot color="#22c55e" className="mr-1.5" />本番環境 (diagnoses)</> : <><StatusDot color="#eab308" className="mr-1.5" />ローカル開発環境 (dev_diagnoses)</>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            最新データに更新
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            全ログCSV出力
          </button>
        </div>
      </div>

      {/* Realtime KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">本日の診断数</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {loading ? '...' : (stats?.todayCount ?? 0)} <span className="text-xs font-normal text-slate-400">件</span>
          </div>
          <p className="text-[11px] text-slate-400">本日アクセス・診断実行</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">累積診断レコード数</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {loading ? '...' : (stats?.totalCount ?? 0)} <span className="text-xs font-normal text-slate-400">件</span>
          </div>
          <p className="text-[11px] text-slate-400">個別全入力ログ保持数</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">平均日本人スペック</span>
            <BarChart3 className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1 flex items-baseline gap-2">
            <span>{loading ? '...' : (stats?.avgJapanScore ?? 0)}</span>
            <span className="text-xs font-normal text-slate-400">Pt</span>
            {!loading && stats && stats.avgJapanScore > 0 && (
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                上位 {scoreToTopPercent(stats.avgJapanScore)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">全診断の総合平均得点</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">平均恋愛スペック</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">LOVE</span>
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1 flex items-baseline gap-2">
            <span>{loading ? '...' : (stats?.avgLoveScore ?? 0)}</span>
            <span className="text-xs font-normal text-slate-400">Pt</span>
            {!loading && stats && stats.avgLoveScore > 0 && (
              <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                上位 {scoreToTopPercent(stats.avgLoveScore)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">恋愛市場における平均評価</p>
        </div>
      </div>

      {/* Aggregate Statistics Overview */}
      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 性別比率 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> 性別比率
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">男性 (MALE)</span>
                <span className="font-bold text-white">{stats.genderRatio.MALE || 0} 件</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">女性 (FEMALE)</span>
                <span className="font-bold text-white">{stats.genderRatio.FEMALE || 0} 件</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">その他 (OTHER)</span>
                <span className="font-bold text-white">{stats.genderRatio.OTHER || 0} 件</span>
              </div>
            </div>
          </div>

          {/* 年代分布 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-violet-400" /> 年代別割合
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.ageDistribution).map(([ageGroup, count]) => (
                <div key={ageGroup} className="flex justify-between text-xs">
                  <span className="text-slate-300">{ageGroup}</span>
                  <span className="font-bold text-white">{count} 件</span>
                </div>
              ))}
            </div>
          </div>

          {/* 人気都道府県 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" /> 地域上位
            </h3>
            <div className="space-y-2">
              {stats.topPrefectures.map(({ pref, count }) => (
                <div key={pref} className="flex justify-between text-xs">
                  <span className="text-slate-300">{pref}</span>
                  <span className="font-bold text-white">{count} 件</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Individual Diagnosis Record Viewer Table */}
      <section className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              個別の全診断入力データ一覧 ({filteredRecords.length}件)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ユーザーが入力した全項目（生データ・スコア・称号）を個別に閲覧・検証できます。
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="名前、大学、企業、都道府県、称号で検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Record Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-3 px-3">日時</th>
                <th className="py-3 px-3">ニックネーム / 属性</th>
                <th className="py-3 px-3">地域</th>
                <th className="py-3 px-3">学歴 / 大学名</th>
                <th className="py-3 px-3">勤務先 / 年収</th>
                <th className="py-3 px-3 text-right">日本人Score</th>
                <th className="py-3 px-3 text-right">恋愛Score</th>
                <th className="py-3 px-3 text-center">全データ詳細</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    該当する診断データが見つかりませんでした。
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r.diagnosisId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{r.inputSummary?.nickname || 'あなた'}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.inputSummary?.gender === 'MALE' ? '男性' : r.inputSummary?.gender === 'FEMALE' ? '女性' : 'その他'} / {r.inputSummary?.age}歳
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{r.inputSummary?.prefectureName || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{getAcademicDegreeLabel(r.rawInput?.academicDegree)}</div>
                      {r.rawInput?.universityName && (
                        <div className="text-[10px] text-indigo-400">{r.rawInput.universityName}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{r.rawInput?.companyName || getCompanyCategoryLabel(r.rawInput?.companyCategory) || '-'}</div>
                      <div className="text-[10px] text-emerald-400">年収 {r.rawInput?.annualIncome ?? '-'} 万円</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-black text-indigo-300 text-sm">
                        {r.japanOverallScore} <span className="text-[10px] text-slate-500 font-normal">Pt</span>
                      </div>
                      <div className="text-[10px] text-indigo-400 font-medium">
                        上位 {scoreToTopPercent(r.japanOverallScore)}%
                      </div>
                      <div className="text-[9px] text-indigo-300/70 font-semibold">
                        {formatRarityRatio(scoreToTopPercent(r.japanOverallScore))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-black text-rose-300 text-sm">
                        {r.loveOverallScore} <span className="text-[10px] text-slate-500 font-normal">Pt</span>
                      </div>
                      <div className="text-[10px] text-rose-400 font-medium">
                        上位 {scoreToTopPercent(r.loveOverallScore)}%
                      </div>
                      <div className="text-[9px] text-rose-300/70 font-semibold">
                        {formatRarityRatio(scoreToTopPercent(r.loveOverallScore))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        詳細確認
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Individual Raw Input & Score Detail Modal */}
      {selectedRecord && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRecord(null);
          }}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                    ID: {selectedRecord.diagnosisId}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString('ja-JP') : ''}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{inp.nickname || selectedRecord.inputSummary?.nickname || 'あなた'} 様の全入力データ & 診断結果</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer border border-slate-700"
                title="閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6 text-xs bg-slate-900/90 custom-scrollbar">
              
              {/* 1. 基本プロフィール & 身体ステータス */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-3">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  1. 基本プロフィール & 身体・容姿データ
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">ニックネーム</span>
                    <span className="font-bold text-white text-sm">{inp.nickname || '-'}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">性別 / 年齢</span>
                    <span className="font-bold text-white text-sm">
                      {inp.gender === 'MALE' ? '男性' : inp.gender === 'FEMALE' ? '女性' : 'その他'} / {inp.age}歳
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">居住地 (都道府県)</span>
                    <span className="font-bold text-white text-sm">{inp.prefectureName || '-'}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">身長 / 体重</span>
                    <span className="font-bold text-white text-sm">
                      {inp.height} cm / {inp.weight} kg
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">体脂肪率</span>
                    <span className="font-bold text-white text-sm">
                      {inp.bodyFat !== null && inp.bodyFat !== undefined && inp.bodyFat !== ('' as any) ? `${inp.bodyFat}%` : '未入力'}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-3">
                    <span className="text-slate-400 text-[10px] block">容姿・第一印象の自己評価</span>
                    <span className="font-bold text-indigo-300 text-sm">{getFaceRatingLabel(inp.faceRating)}</span>
                  </div>
                </div>
              </div>

              {/* 2. 経済・年収・純資産 */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    2. 年収・資産・負債の内訳データ
                  </h4>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 mr-1.5">純資産 (資産-負債):</span>
                    <span className={`font-black text-sm ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netWorth.toLocaleString()} 万円
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-900/40 sm:col-span-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block">額面年収 (年間総収入)</span>
                      <span className="text-xl font-black text-emerald-300">{inp.annualIncome?.toLocaleString() || 0} 万円</span>
                    </div>
                    <div className="flex gap-4 text-xs font-bold">
                      <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">総資産額</span>
                        <span className="text-emerald-400 font-bold">{totalAssets.toLocaleString()} 万円</span>
                      </div>
                      <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">総負債額</span>
                        <span className="text-rose-400 font-bold">{totalDebts.toLocaleString()} 万円</span>
                      </div>
                    </div>
                  </div>

                  {/* 資産内訳 4項目 */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-extrabold text-emerald-400 block border-b border-slate-800 pb-1">
                      <GemIcon className="w-4 h-4 mr-1" />保有資産 内訳
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">1. 預金:</span>
                      <span className="font-bold text-white">{inp.savingsAssets?.toLocaleString() ?? 0} 万円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">2. 金融資産(株・証券等):</span>
                      <span className="font-bold text-white">{inp.financialAssets?.toLocaleString() ?? 0} 万円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">3. 不動産評価額:</span>
                      <span className="font-bold text-white">{inp.realEstateAssets?.toLocaleString() ?? 0} 万円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">4. 車、時計・貴金属等:</span>
                      <span className="font-bold text-white">
                        {(inp.luxuryAssets !== undefined && inp.luxuryAssets !== null
                          ? inp.luxuryAssets
                          : ((inp.carAssets || 0) + (inp.watchAssets || 0))
                        ).toLocaleString()} 万円
                      </span>
                    </div>
                  </div>

                  {/* 負債内訳 4項目 */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5 sm:col-span-2">
                    <span className="text-[11px] font-extrabold text-rose-400 block border-b border-slate-800 pb-1">
                      <CardIcon className="w-4 h-4 mr-1" />負債・借入 内訳
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">住宅ローン:</span>
                        <span className="font-bold text-rose-300">{inp.mortgageDebt?.toLocaleString() || 0} 万円</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">マイカーローン:</span>
                        <span className="font-bold text-rose-300">{inp.carDebt?.toLocaleString() || 0} 万円</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">奨学金・教育:</span>
                        <span className="font-bold text-rose-300">{inp.scholarshipDebt?.toLocaleString() || 0} 万円</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">その他借入:</span>
                        <span className="font-bold text-rose-300">{inp.otherDebt?.toLocaleString() || 0} 万円</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 学歴 & キャリア & 知能指数 */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-3">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  3. 学歴・知的指標・キャリア
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">最終学歴</span>
                    <span className="font-bold text-white text-sm">{getAcademicDegreeLabel(inp.academicDegree)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">出身大学・大学院名</span>
                    <span className="font-bold text-amber-300 text-sm">{inp.universityName || '未入力 / なし'}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">大学偏差値 (マスタ判定/カスタム)</span>
                    <span className="font-bold text-white text-sm">
                      {inp.customUniversityHensachi ? `偏差値 ${inp.customUniversityHensachi}` : '標準推計'}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">知能指数 (推定IQ)</span>
                    <span className="font-bold text-white text-sm">{inp.iqScore ? `IQ ${inp.iqScore}` : '自動推計'}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">雇用形態</span>
                    <span className="font-bold text-white text-sm">{getEmploymentTypeLabel(inp.employmentType)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">業種</span>
                    <span className="font-bold text-white text-sm">{getIndustryLabel(inp.industryCode)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">職種 / 役職</span>
                    <span className="font-bold text-white text-sm">
                      {getOccupationLabel(inp.occupationCode)} {inp.positionCode ? `(${inp.positionCode})` : ''}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">勤務先企業名 / 企業規模</span>
                    <span className="font-bold text-amber-300 text-sm">
                      {inp.companyName || '-'} <span className="text-xs text-slate-400 font-normal">({getCompanyCategoryLabel(inp.companyCategory)})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. 語学・海外渡航歴・SNS */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-3">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  4. 語学・海外渡航歴・SNSフォロワー
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">海外渡航歴</span>
                    <span className="font-bold text-purple-300 text-sm">{inp.travelCount || 0} か国</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Instagram</span>
                    <span className="font-bold text-white text-sm">{getSnsFollowerLabel(inp.instagramFollowers)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">X (Twitter)</span>
                    <span className="font-bold text-white text-sm">{getSnsFollowerLabel(inp.xFollowers)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">TikTok</span>
                    <span className="font-bold text-white text-sm">{getSnsFollowerLabel(inp.tikTokFollowers)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">YouTube</span>
                    <span className="font-bold text-white text-sm">{getSnsFollowerLabel(inp.youTubeFollowers)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">習得言語数</span>
                    <span className="font-bold text-white text-sm">{inp.languages?.length || 1} 言語</span>
                  </div>
                </div>
                {inp.languages && inp.languages.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-slate-400 font-bold">習得言語内訳:</span>
                    {inp.languages.map((l, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-[11px] font-bold">
                        {getLanguageName(l.languageCode)} ({getLanguageLevelLabel(l.level)})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. 恋愛・パートナーシップ・MBTI */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-3">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  5. パートナーシップ・交際/経験人数・MBTI
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">配偶・恋愛ステータス</span>
                    <span className="font-bold text-white text-sm">{getMaritalStatusLabel(inp.maritalStatus)}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">子どもの有無</span>
                    <span className="font-bold text-white text-sm">{inp.childrenCount || 0} 人</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">交際人数</span>
                    <span className="font-bold text-pink-300 text-sm">
                      {inp.datingPartnerCount !== null && inp.datingPartnerCount !== undefined && inp.datingPartnerCount !== ('' as any)
                        ? `${inp.datingPartnerCount} 人`
                        : '未回答'}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">これまでの経験人数</span>
                    <span className="font-bold text-rose-300 text-sm">
                      {inp.partnerCount !== null && inp.partnerCount !== undefined && inp.partnerCount !== ('' as any)
                        ? `${inp.partnerCount} 人`
                        : '未回答'}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">MBTI性格タイプ</span>
                    <span className="font-bold text-indigo-300 text-sm">{getMbtiLabel(inp.mbti)}</span>
                  </div>
                </div>
              </div>

              {/* 6. 算出スコア・2大カテゴリ詳細得点・獲得称号 */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-4">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  6. 算出スコア・2大カテゴリ詳細得点・獲得称号
                </h4>
                
                {/* 総合スコア 2大軸 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 日本人スペック */}
                  <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-300 block">日本人総合スペック</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl font-black text-white">{selectedRecord.japanOverallScore}</span>
                          <span className="text-xs text-indigo-400 font-normal">Pt</span>
                          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                            上位 {scoreToTopPercent(selectedRecord.japanOverallScore)}% ({formatRarityRatio(scoreToTopPercent(selectedRecord.japanOverallScore))})
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/40">
                        JAPAN
                      </span>
                    </div>

                    {/* 日本人 獲得称号 */}
                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-indigo-500/20 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-400">【日本人称号】</span>
                        {selectedRecord.epithet?.rarityBadge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {selectedRecord.epithet.rarityBadge}
                          </span>
                        )}
                      </div>
                      <div className="font-black text-amber-300 text-sm">
                        {selectedRecord.epithet?.title || (typeof selectedRecord.epithet === 'string' ? selectedRecord.epithet : '称号なし')}
                      </div>
                      {selectedRecord.epithet?.subtitle && (
                        <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">{selectedRecord.epithet.subtitle}</p>
                      )}
                    </div>

                    {/* 日本人 6カテゴリ得点 */}
                    <div>
                      <span className="text-[10px] font-bold text-indigo-300 block mb-1.5">カテゴリ別得点 (日本人総合)</span>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">身体 (BODY)</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.categoryScores?.body ?? '-'} Pt</div>
                          {selectedRecord.categoryScores?.body !== undefined && selectedRecord.categoryScores?.body !== null && (
                            <span className="text-[9px] text-indigo-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.categoryScores.body)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">経済 (ECON)</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.categoryScores?.economic ?? '-'} Pt</div>
                          {selectedRecord.categoryScores?.economic !== undefined && selectedRecord.categoryScores?.economic !== null && (
                            <span className="text-[9px] text-indigo-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.categoryScores.economic)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">キャリア (CAR)</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.categoryScores?.career ?? '-'} Pt</div>
                          {selectedRecord.categoryScores?.career !== undefined && selectedRecord.categoryScores?.career !== null && (
                            <span className="text-[9px] text-indigo-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.categoryScores.career)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">学歴 (ACAD)</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.categoryScores?.academic ?? '-'} Pt</div>
                          {selectedRecord.categoryScores?.academic !== undefined && selectedRecord.categoryScores?.academic !== null && (
                            <span className="text-[9px] text-indigo-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.categoryScores.academic)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">SNS (SOC)</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.categoryScores?.social ?? '-'} Pt</div>
                          {selectedRecord.categoryScores?.social !== undefined && selectedRecord.categoryScores?.social !== null && (
                            <span className="text-[9px] text-indigo-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.categoryScores.social)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">能力 (GLOB)</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.categoryScores?.ability ?? '-'} Pt</div>
                          {selectedRecord.categoryScores?.ability !== undefined && selectedRecord.categoryScores?.ability !== null && (
                            <span className="text-[9px] text-indigo-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.categoryScores.ability)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 恋愛スペック */}
                  <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-rose-900/50 pb-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-rose-300 block">恋愛総合スペック</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl font-black text-white">{selectedRecord.loveOverallScore}</span>
                          <span className="text-xs text-rose-400 font-normal">Pt</span>
                          <span className="text-xs font-bold text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/40">
                            上位 {scoreToTopPercent(selectedRecord.loveOverallScore)}% ({formatRarityRatio(scoreToTopPercent(selectedRecord.loveOverallScore))})
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-300 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/40">
                        LOVE
                      </span>
                    </div>

                    {/* 恋愛 獲得称号 */}
                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-rose-500/20 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-rose-400">【恋愛称号】</span>
                        {selectedRecord.loveEpithet?.rarityBadge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {selectedRecord.loveEpithet.rarityBadge}
                          </span>
                        )}
                      </div>
                      <div className="font-black text-pink-300 text-sm">
                        {selectedRecord.loveEpithet?.title || (typeof selectedRecord.loveEpithet === 'string' ? selectedRecord.loveEpithet : '称号なし')}
                      </div>
                      {selectedRecord.loveEpithet?.subtitle && (
                        <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">{selectedRecord.loveEpithet.subtitle}</p>
                      )}
                    </div>

                    {/* 恋愛 6カテゴリ得点 */}
                    <div>
                      <span className="text-[10px] font-bold text-rose-300 block mb-1.5">カテゴリ別得点 (恋愛スペック)</span>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">年齢 (AGE)</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.loveCategoryScores?.age ?? '-'} Pt</div>
                          {selectedRecord.loveCategoryScores?.age !== undefined && selectedRecord.loveCategoryScores?.age !== null && (
                            <span className="text-[9px] text-rose-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.loveCategoryScores.age)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">容姿・印象</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.loveCategoryScores?.face ?? '-'} Pt</div>
                          {selectedRecord.loveCategoryScores?.face !== undefined && selectedRecord.loveCategoryScores?.face !== null && (
                            <span className="text-[9px] text-rose-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.loveCategoryScores.face)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">身体 (BODY)</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.loveCategoryScores?.body ?? '-'} Pt</div>
                          {selectedRecord.loveCategoryScores?.body !== undefined && selectedRecord.loveCategoryScores?.body !== null && (
                            <span className="text-[9px] text-rose-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.loveCategoryScores.body)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">年収・経済</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.loveCategoryScores?.income ?? '-'} Pt</div>
                          {selectedRecord.loveCategoryScores?.income !== undefined && selectedRecord.loveCategoryScores?.income !== null && (
                            <span className="text-[9px] text-rose-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.loveCategoryScores.income)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">キャリア</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.loveCategoryScores?.career ?? '-'} Pt</div>
                          {selectedRecord.loveCategoryScores?.career !== undefined && selectedRecord.loveCategoryScores?.career !== null && (
                            <span className="text-[9px] text-rose-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.loveCategoryScores.career)}%</span>
                          )}
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[9px] block">家族・関係</span>
                          <div className="text-xs font-bold text-white">{selectedRecord.loveCategoryScores?.family ?? '-'} Pt</div>
                          {selectedRecord.loveCategoryScores?.family !== undefined && selectedRecord.loveCategoryScores?.family !== null && (
                            <span className="text-[9px] text-rose-400 block font-medium mt-0.5">上位 {scoreToTopPercent(selectedRecord.loveCategoryScores.family)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <Link
                href={`/result/${selectedRecord.diagnosisId}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                実際の診断結果ページを開く
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


