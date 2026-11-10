'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { DiagnosisInputV3, Gender, MaritalStatus, FaceRating, UserLanguageInput } from '@/types/spec-check';
import {
  PREFECTURES,
  COMMON_OCCUPATION_MASTER,
  INDUSTRY_MASTER,
  POSITION_MASTER_BY_EMPLOYMENT,
  MBTI_MASTER,
  SNS_FOLLOWER_BRACKETS,
  LANGUAGE_MASTER,
  getOccupationsByIndustryId,
} from '@/lib/datasets/japan-stats';
import { sanitizeNumericInput } from '@/lib/score-engine/math-utils';
import { X, FileText, User, Landmark, GraduationCap, Globe, Sparkles, ChevronRight, Plus, Trash2 } from 'lucide-react';
import UniversityAutocomplete from '@/components/UniversityAutocomplete';
import CompanyAutocomplete from '@/components/CompanyAutocomplete';
import { WarningIcon } from '@/components/icons/SpecIcons';

interface InputDataModalProps {
  input: DiagnosisInputV3;
  activeTab?: 'JAPAN' | 'LOVE';
}

export default function InputDataModal({ input, activeTab }: InputDataModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // 編集用ローカルステート (全項目を診断フォーム画面 src/app/page.tsx と100%一致化)
  const [nickname, setNickname] = useState<string>(input.nickname || 'あなた');
  const [gender, setGender] = useState<Gender>(input.gender || 'MALE');
  const [age, setAge] = useState<string>(input.age ? String(input.age) : '25');
  const [prefectureId, setPrefectureId] = useState<number>(input.prefectureId || 13);
  const [height, setHeight] = useState<string>(input.height ? String(input.height) : '170');
  const [weight, setWeight] = useState<string>(input.weight ? String(input.weight) : '60');
  const [bodyFat, setBodyFat] = useState<string>(input.bodyFat !== null && input.bodyFat !== undefined ? String(input.bodyFat) : '');
  const [faceRating, setFaceRating] = useState<FaceRating | ''>(input.faceRating || '');
  
  // 年収・資産 (個別4項目)
  const [annualIncome, setAnnualIncome] = useState<string>(input.annualIncome ? String(input.annualIncome) : '400');
  const [savingsAssets, setSavingsAssets] = useState<string>(input.savingsAssets !== null && input.savingsAssets !== undefined ? String(input.savingsAssets) : '0');
  const [financialAssets, setFinancialAssets] = useState<string>(input.financialAssets !== null && input.financialAssets !== undefined ? String(input.financialAssets) : '0');
  const [realEstateAssets, setRealEstateAssets] = useState<string>(input.realEstateAssets !== null && input.realEstateAssets !== undefined ? String(input.realEstateAssets) : '0');
  const [luxuryAssets, setLuxuryAssets] = useState<string>(() => {
    if (input.luxuryAssets !== null && input.luxuryAssets !== undefined) return String(input.luxuryAssets);
    const legacy = (input.carAssets || 0) + (input.watchAssets || 0);
    return String(legacy);
  });
  const [carAssets, setCarAssets] = useState<string>(input.carAssets !== null && input.carAssets !== undefined ? String(input.carAssets) : '0');
  const [watchAssets, setWatchAssets] = useState<string>(input.watchAssets !== null && input.watchAssets !== undefined ? String(input.watchAssets) : '0');

  // 負債 (個別4項目)
  const [mortgageDebt, setMortgageDebt] = useState<string>(input.mortgageDebt !== null && input.mortgageDebt !== undefined ? String(input.mortgageDebt) : '0');
  const [carDebt, setCarDebt] = useState<string>(input.carDebt !== null && input.carDebt !== undefined ? String(input.carDebt) : '0');
  const [scholarshipDebt, setScholarshipDebt] = useState<string>(input.scholarshipDebt !== null && input.scholarshipDebt !== undefined ? String(input.scholarshipDebt) : '0');
  const [otherDebt, setOtherDebt] = useState<string>(input.otherDebt !== null && input.otherDebt !== undefined ? String(input.otherDebt) : '0');

  // 学歴・キャリア
  const [academicDegree, setAcademicDegree] = useState<string>(input.academicDegree || '');
  const [universityName, setUniversityName] = useState<string>(input.universityName || '');
  const [customUniversityHensachi, setCustomUniversityHensachi] = useState<number | null>(input.customUniversityHensachi || null);
  const [iqScore, setIqScore] = useState<string>(input.iqScore ? String(input.iqScore) : '');
  const [industryCode, setIndustryCode] = useState<string>(input.industryCode || '');
  const [occupationCode, setOccupationCode] = useState<string>(input.occupationCode || '');
  const [employmentType, setEmploymentType] = useState<string>(input.employmentType || '');
  const [positionCode, setPositionCode] = useState<string>(input.positionCode || '');
  const [companyName, setCompanyName] = useState<string>(input.companyName || '');
  const [companyCategory, setCompanyCategory] = useState<DiagnosisInputV3['companyCategory'] | ''>(input.companyCategory || '');

  // SNSフォロワー (個別4プラットフォーム)
  const [instagramFollowers, setInstagramFollowers] = useState<number>(input.instagramFollowers || 0);
  const [xFollowers, setXFollowers] = useState<number>(input.xFollowers || 0);
  const [tikTokFollowers, setTikTokFollowers] = useState<number>(input.tikTokFollowers || 0);
  const [youTubeFollowers, setYouTubeFollowers] = useState<number>(input.youTubeFollowers || 0);

  // 恋愛・ライフスタイル
  const [travelCount, setTravelCount] = useState<string>(input.travelCount ? String(input.travelCount) : '0');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | ''>(input.maritalStatus || '');
  const [childrenCount, setChildrenCount] = useState<string>(input.childrenCount ? String(input.childrenCount) : '0');
  const [datingPartnerCount, setDatingPartnerCount] = useState<string>(input.datingPartnerCount !== null && input.datingPartnerCount !== undefined ? String(input.datingPartnerCount) : '');
  const [partnerCount, setPartnerCount] = useState<string>(input.partnerCount !== null && input.partnerCount !== undefined ? String(input.partnerCount) : '');
  const [mbti, setMbti] = useState<string>(input.mbti || '');

  // 語学力 (複数言語)
  const [userLanguages, setUserLanguages] = useState<UserLanguageInput[]>(() => {
    if (input.languages && Array.isArray(input.languages) && input.languages.length > 0) {
      return input.languages;
    }
    return [{ languageCode: 'JA', level: 'NATIVE' }];
  });

  const addLanguage = () => {
    const existingCodes = new Set(userLanguages.map(l => l.languageCode));
    const nextLang = LANGUAGE_MASTER.find(l => !existingCodes.has(l.code)) || LANGUAGE_MASTER[0];
    setUserLanguages([
      ...userLanguages,
      { languageCode: nextLang.code, level: nextLang.code === 'EN' ? 'BUSINESS' : 'DAILY' },
    ]);
  };

  const removeLanguage = (idx: number) => {
    setUserLanguages(userLanguages.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const availableOccupations = industryCode ? getOccupationsByIndustryId(industryCode) : COMMON_OCCUPATION_MASTER;
  const availablePositions = employmentType ? (POSITION_MASTER_BY_EMPLOYMENT[employmentType] || []) : [];

  const handleRecalculate = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const selectedPref = PREFECTURES[prefectureId - 1] || '東京都';

      if (!age || Number(age) <= 0) {
        setErrorMsg('年齢を入力してください。');
        setLoading(false);
        return;
      }
      if (Number(age) < 16) {
        setErrorMsg('当サービスは16歳以上の方を対象としています。16歳以上の年齢を入力してください。');
        setLoading(false);
        return;
      }

      if (!employmentType) {
        setErrorMsg('雇用形態を選択してください。');
        setLoading(false);
        return;
      }
      if (employmentType !== 'UNEMPLOYED') {
        if (!industryCode) {
          setErrorMsg('業種を選択してください。');
          setLoading(false);
          return;
        }
        if (!occupationCode) {
          setErrorMsg('職種を選択してください。');
          setLoading(false);
          return;
        }
        if (availablePositions.length > 0 && !positionCode) {
          setErrorMsg('役職を選択してください。');
          setLoading(false);
          return;
        }
      }

      const payload: DiagnosisInputV3 = {
        ...input,
        nickname: nickname.trim() || 'あなた',
        gender,
        age: Number(age),
        prefectureId: Number(prefectureId),
        prefectureName: selectedPref,
        height: Number(height),
        weight: Number(weight),
        bodyFat: bodyFat !== '' ? Number(bodyFat) : null,
        faceRating: faceRating ? (faceRating as FaceRating) : null,
        annualIncome: Number(annualIncome),
        savingsAssets: savingsAssets !== '' ? Number(savingsAssets) : 0,
        financialAssets: financialAssets !== '' ? Number(financialAssets) : 0,
        realEstateAssets: realEstateAssets !== '' ? Number(realEstateAssets) : 0,
        luxuryAssets: luxuryAssets !== '' ? Number(luxuryAssets) : 0,
        carAssets: carAssets !== '' ? Number(carAssets) : 0,
        watchAssets: watchAssets !== '' ? Number(watchAssets) : 0,
        mortgageDebt: mortgageDebt !== '' ? Number(mortgageDebt) : 0,
        carDebt: carDebt !== '' ? Number(carDebt) : 0,
        scholarshipDebt: scholarshipDebt !== '' ? Number(scholarshipDebt) : 0,
        otherDebt: otherDebt !== '' ? Number(otherDebt) : 0,
        academicDegree: academicDegree ? (academicDegree as DiagnosisInputV3['academicDegree']) : null,
        universityName: universityName.trim() || null,
        customUniversityHensachi,
        iqScore: iqScore !== '' ? Number(iqScore) : null,
        industryCode,
        occupationCode,
        employmentType: employmentType ? (employmentType as DiagnosisInputV3['employmentType']) : 'REGULAR',
        positionCode: employmentType === 'UNEMPLOYED' ? null : positionCode,
        companyName: employmentType === 'UNEMPLOYED' ? null : (companyName.trim() || null),
        companyCategory: employmentType === 'UNEMPLOYED' ? null : (companyCategory !== '' ? (companyCategory as any) : null),
        instagramFollowers: Number(instagramFollowers) || 0,
        xFollowers: Number(xFollowers) || 0,
        tikTokFollowers: Number(tikTokFollowers) || 0,
        youTubeFollowers: Number(youTubeFollowers) || 0,
        travelCount: travelCount !== '' ? Number(travelCount) : 0,
        maritalStatus: maritalStatus ? (maritalStatus as MaritalStatus) : null,
        childrenCount: childrenCount !== '' ? Number(childrenCount) : 0,
        datingPartnerCount: datingPartnerCount !== '' ? Number(datingPartnerCount) : null,
        partnerCount: partnerCount !== '' ? Number(partnerCount) : null,
        mbti: mbti !== '' ? mbti : null,
        languages: userLanguages,
      };

      const res = await fetch('/api/diagnosis/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '再計算に失敗しました');
      }

      // キャッシュ更新＆ドラフト同期＆遷移
      try {
        localStorage.setItem(`spec_check_result_${data.result.diagnosisId}`, JSON.stringify(data.result));
        localStorage.setItem('spec_check_latest_result', JSON.stringify(data.result));

        const draft = {
          nickname, gender, age, prefectureId, height, weight, bodyFat, faceRating,
          annualIncome, savingsAssets, financialAssets, realEstateAssets, luxuryAssets, carAssets, watchAssets,
          mortgageDebt, carDebt, scholarshipDebt, otherDebt,
          academicDegree, universityName, customUniversityHensachi, iqScore,
          industryCode, occupationCode, employmentType, positionCode, companyName, companyCategory,
          instagramFollowers, xFollowers, tikTokFollowers, youTubeFollowers,
          travelCount, maritalStatus, childrenCount, datingPartnerCount, partnerCount, mbti,
          userLanguages,
        };
        localStorage.setItem('spec_check_draft_v3', JSON.stringify(draft));
      } catch {}

      setIsOpen(false);
      setLoading(false);

      // 現在のURLパラメータ(?tab=love 等)またはアクティブタブを維持して更新遷移
      const tabFromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
      const currentTab = activeTab ? activeTab.toLowerCase() : (tabFromUrl || 'japan');
      router.push(`/result/${data.result.diagnosisId}?tab=${currentTab}`);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setErrorMsg(err.message || '再計算中にエラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/40 hover:decoration-indigo-400 transition-all bg-indigo-950/40 hover:bg-indigo-900/60 px-3.5 py-1.5 rounded-full border border-indigo-800/50 shadow-sm cursor-pointer"
      >
        <FileText className="w-4 h-4 text-indigo-400" />
        <span>入力データを見る・修正する</span>
        <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
      </button>

      {/* モーダルオーバーレイ (React Portalでdocument.body直下に着脱レンダリングし、Safariのbackdrop-filter/transformトラップを完全回避) */}
      {isOpen && mounted && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/95 animate-fadeIn overflow-hidden touch-manipulation"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-[100dvh] sm:h-auto max-w-5xl md:max-w-6xl max-h-[100dvh] sm:max-h-[90vh] bg-slate-900 border-0 sm:border sm:border-slate-700 rounded-none sm:rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col z-[100000]"
          >
            {/* モーダルヘッダー */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                    診断データの修正・再計算
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] border border-indigo-500/30">
                      EDIT PARAMETERS
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400">
                    設定データを変更して「この内容で再計算する」を押すとスコアが更新されます
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-all cursor-pointer border border-slate-700"
                title="閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* エラーメッセージ */}
            {errorMsg && (
              <div className="px-5 py-3 bg-rose-500/20 border-b border-rose-500/30 text-rose-300 text-xs font-bold shrink-0 flex items-center gap-2">
                <WarningIcon className="w-4 h-4 mr-1" />{errorMsg}
              </div>
            )}

            {/* モーダルコンテンツ (大型グリッド表示) */}
            <div className="p-4 sm:p-7 flex-1 min-h-0 overflow-y-auto touch-pan-y overscroll-contain space-y-5 sm:space-y-7 custom-scrollbar text-xs bg-slate-900">
              {/* 基本情報・身体データ */}
              <div className="space-y-3 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-black text-indigo-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                  <User className="w-4 h-4 text-indigo-400" /> 基本情報・身体データ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">ニックネーム</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">性別</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="MALE">男性</option>
                      <option value="FEMALE">女性</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">
                      年齢 (歳) <span className="text-[9px] text-slate-500 font-normal">※16歳以上</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="例: 25"
                      value={age}
                      onChange={(e) => setAge(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">居住都道府県</label>
                    <select
                      value={prefectureId}
                      onChange={(e) => setPrefectureId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      {PREFECTURES.map((pref, idx) => (
                        <option key={idx + 1} value={idx + 1}>{pref}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">身長 (cm) / 体重 (kg)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={height}
                        onChange={(e) => setHeight(sanitizeNumericInput(e.target.value))}
                        className="w-1/2 px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                        placeholder="身長"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={weight}
                        onChange={(e) => setWeight(sanitizeNumericInput(e.target.value))}
                        className="w-1/2 px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                        placeholder="体重"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">体脂肪率 (%)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9.]*"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                      placeholder="任意 (例: 15.5)"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">雰囲気・第一印象の自己評価</label>
                    <select
                      value={faceRating || ''}
                      onChange={(e) => setFaceRating(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">選択してください ※必須</option>
                      <option value="MODEL_LEVEL">モデル・インフルエンサー級 (美形・圧倒的ルックス)</option>
                      <option value="ABOVE_AVERAGE">上位クラス (整った容姿・清潔感があり良く褒められる)</option>
                      <option value="AVERAGE">平均的 (一般的ルックス・親しみやすい印象)</option>
                      <option value="BELOW_AVERAGE">改善の余地あり (あまり自信がない)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 年収・純資産データ (内訳完全展開) */}
              <div className="space-y-3 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                  <Landmark className="w-4 h-4 text-emerald-400" /> 年収・純資産データ (資産・負債の内訳)
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">額面年収 (万円)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(sanitizeNumericInput(e.target.value))}
                      className="w-full max-w-sm px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-black text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* 資産内訳 4項目 */}
                  <div className="border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] font-extrabold text-emerald-300 block mb-2">総資産 内訳 (万円)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">1. 預金</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={savingsAssets}
                          onChange={(e) => setSavingsAssets(sanitizeNumericInput(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">2. 金融資産(株・証券等)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={financialAssets}
                          onChange={(e) => setFinancialAssets(sanitizeNumericInput(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">3. 不動産評価額</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={realEstateAssets}
                          onChange={(e) => setRealEstateAssets(sanitizeNumericInput(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">4. 車、時計・貴金属等</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={luxuryAssets}
                          onChange={(e) => setLuxuryAssets(sanitizeNumericInput(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 負債内訳 4項目 */}
                  <div className="border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] font-extrabold text-rose-300 block mb-2">負債 内訳 (万円)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">住宅ローン</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={mortgageDebt}
                          onChange={(e) => setMortgageDebt(sanitizeNumericInput(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-300 font-bold focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">自動車ローン</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={carDebt}
                          onChange={(e) => setCarDebt(sanitizeNumericInput(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-300 font-bold focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">奨学金・教育ローン</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={scholarshipDebt}
                          onChange={(e) => setScholarshipDebt(sanitizeNumericInput(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-300 font-bold focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">その他借入・カード等</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={otherDebt}
                          onChange={(e) => setOtherDebt(sanitizeNumericInput(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-300 font-bold focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 学歴・キャリア */}
              <div className="space-y-3 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-black text-amber-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                  <GraduationCap className="w-4 h-4 text-amber-400" /> 学歴・知的指標・キャリア
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">最終学歴</label>
                    <select
                      value={academicDegree || ''}
                      onChange={(e) => setAcademicDegree(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">選択してください ※必須</option>
                      <option value="BACHELOR">大学卒 (学士)</option>
                      <option value="MASTER">大学院修士課程修了</option>
                      <option value="DOCTOR">大学院博士課程修了</option>
                      <option value="JUNIOR_COLLEGE">短期大学卒</option>
                      <option value="VOCATIONAL">専門学校卒</option>
                      <option value="HIGH_SCHOOL">高等学校卒</option>
                      <option value="MIDDLE_SCHOOL">中学校卒</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">出身大学・大学院名 (マスタ自動判定)</label>
                    <UniversityAutocomplete
                      value={universityName}
                      customHensachi={customUniversityHensachi}
                      onChange={(val, _isMatched, customH) => {
                        setUniversityName(val);
                        setCustomUniversityHensachi(customH || null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">推定IQ・知能指数</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={iqScore}
                      onChange={(e) => setIqScore(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                      placeholder="空欄で自動推計"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">
                      雇用形態 <span className="text-rose-400 ml-1 font-bold">※必須</span>
                    </label>
                    <select
                      value={employmentType || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmploymentType(val);
                        setPositionCode('');
                        if (val === 'UNEMPLOYED') {
                          setIndustryCode('');
                          setOccupationCode('');
                          setCompanyName('');
                          setCompanyCategory('');
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">選択してください ※必須</option>
                      <option value="EXECUTIVE">役員・経営者</option>
                      <option value="REGULAR">正社員・常勤</option>
                      <option value="CONTRACT">契約社員・派遣・パート</option>
                      <option value="FREELANCE">フリーランス・個人事業</option>
                      <option value="UNEMPLOYED">無職・家事手伝い・求職中・学生</option>
                    </select>
                  </div>
                  {employmentType !== 'UNEMPLOYED' && (
                    <>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">
                          業種分類 <span className="text-rose-400 ml-1 font-bold">※必須</span>
                        </label>
                        <select
                          value={industryCode}
                          onChange={(e) => {
                            setIndustryCode(e.target.value);
                            setOccupationCode('');
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                        >
                          <option value="">選択してください ※必須</option>
                          {INDUSTRY_MASTER.map((ind) => (
                            <option key={ind.id} value={ind.id}>{ind.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">
                          職種分類 <span className="text-rose-400 ml-1 font-bold">※必須</span>
                        </label>
                        <select
                          value={occupationCode}
                          onChange={(e) => setOccupationCode(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                        >
                          <option value="">{industryCode ? '選択してください ※必須' : '業種を先に選択してください ※必須'}</option>
                          {availableOccupations.map((occ) => (
                            <option key={occ.id} value={occ.id}>{occ.name}</option>
                          ))}
                        </select>
                      </div>
                      {availablePositions.length > 0 && (
                        <div>
                          <label className="text-slate-400 text-[10px] font-bold block mb-1">
                            役職 <span className="text-rose-400 ml-1 font-bold">※必須</span>
                          </label>
                          <select
                            value={positionCode}
                            onChange={(e) => setPositionCode(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                          >
                            <option value="">{employmentType ? '選択してください ※必須' : '雇用形態を先に選択してください ※必須'}</option>
                            {availablePositions.map((p) => (
                              <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">勤務先・企業名 (上場・外資マスタ自動判定)</label>
                        <CompanyAutocomplete
                          value={companyName}
                          companyCategory={companyCategory}
                          onChange={(name, category) => {
                            setCompanyName(name);
                            if (category) {
                              setCompanyCategory(category as any);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[10px] font-bold block mb-1">勤務先企業規模 (任意区分)</label>
                        <select
                          value={companyCategory || ''}
                          onChange={(e) => setCompanyCategory(e.target.value as any)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                        >
                          <option value="">選択してください (未選択/指定なし)</option>
                          <option value="LARGE_PRIME">プライム上場・外資トップ・大手グローバル企業</option>
                          <option value="LARGE">大手企業・上場企業・有名子会社</option>
                          <option value="MEDIUM">中堅企業・メガベンチャー</option>
                          <option value="SMALL">中小企業・スタートアップ</option>
                          <option value="OTHER">その他・個人事業所</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SNS・語学・恋愛観・MBTI */}
              <div className="space-y-4 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-black text-purple-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                  <Globe className="w-4 h-4 text-purple-400" /> SNS・グローバル・パートナーシップ・MBTI
                </h4>

                {/* 習得言語 (複数選択) */}
                <div className="space-y-2">
                  <label className="text-slate-300 text-xs font-bold block">
                    習得言語 (複数選択)
                  </label>
                  <div className="space-y-2">
                    {userLanguages.map((lang, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="flex-1 min-w-0">
                          <select
                            value={lang.languageCode}
                            onChange={(e) => {
                              const updated = [...userLanguages];
                              updated[idx].languageCode = e.target.value;
                              setUserLanguages(updated);
                            }}
                            className="w-full bg-slate-900 text-xs text-slate-100 font-bold rounded-lg px-2.5 py-2 border border-slate-800 focus:border-purple-500 focus:outline-none truncate"
                          >
                            {LANGUAGE_MASTER.map((l) => (
                              <option key={l.code} value={l.code}>{l.nameJa}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 min-w-0">
                          <select
                            value={lang.level}
                            onChange={(e) => {
                              const updated = [...userLanguages];
                              updated[idx].level = e.target.value as any;
                              setUserLanguages(updated);
                            }}
                            className="w-full bg-slate-900 text-xs text-slate-100 font-bold rounded-lg px-2.5 py-2 border border-slate-800 focus:border-purple-500 focus:outline-none truncate"
                          >
                            <option value="BASIC">基礎レベル・挨拶程度</option>
                            <option value="DAILY">日常会話</option>
                            <option value="BUSINESS">ビジネスレベル</option>
                            <option value="NATIVE">ネイティブ</option>
                          </select>
                        </div>
                        {userLanguages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLanguage(idx)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-950/40 border border-dashed border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" /> 言語を追加 ＋
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2 border-t border-slate-800/60">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">Instagram フォロワー</label>
                    <select
                      value={instagramFollowers}
                      onChange={(e) => setInstagramFollowers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    >
                      {SNS_FOLLOWER_BRACKETS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">X (Twitter) フォロワー</label>
                    <select
                      value={xFollowers}
                      onChange={(e) => setXFollowers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    >
                      {SNS_FOLLOWER_BRACKETS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">TikTok フォロワー</label>
                    <select
                      value={tikTokFollowers}
                      onChange={(e) => setTikTokFollowers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    >
                      {SNS_FOLLOWER_BRACKETS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">YouTube 登録者</label>
                    <select
                      value={youTubeFollowers}
                      onChange={(e) => setYouTubeFollowers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    >
                      {SNS_FOLLOWER_BRACKETS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">海外渡航歴 (か国)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={travelCount}
                      onChange={(e) => setTravelCount(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">配偶・恋愛ステータス</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">選択してください</option>
                      <option value="SINGLE_FREE">未婚（恋人なし・フリー）</option>
                      <option value="SINGLE_DATING">未婚（恋人あり・交際中）</option>
                      <option value="ENGAGED_COHABITING">婚約中 / 同棲中</option>
                      <option value="MARRIED">既婚</option>
                      <option value="SEPARATED">別居中</option>
                      <option value="DIVORCED">離婚歴あり</option>
                      <option value="BEREAVED">死別</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">子どもの有無 (人)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">交際人数 (人)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="例: 2"
                      value={datingPartnerCount}
                      onChange={(e) => setDatingPartnerCount(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">これまでの経験人数 (人)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="例: 3"
                      value={partnerCount}
                      onChange={(e) => setPartnerCount(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">MBTI</label>
                    <select
                      value={mbti}
                      onChange={(e) => setMbti(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">選択してください (未測定)</option>
                      {MBTI_MASTER.map((m) => (
                        <option key={m.code} value={m.code}>{m.nameJa}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="px-5 sm:px-7 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4 shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={handleRecalculate}
                disabled={loading}
                className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-sm inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>再計算・AI解析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>修正した内容で即時再診断</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
