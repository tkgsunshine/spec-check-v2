import { DiagnosisInputV3, OverallDiagnosisResultV3, MetricScoreResult } from '@/types/spec-check';
import { calculateBodyScore } from './body';
import { calculateIncomeScore } from './income';
import { calculateNetWorthScore } from './assets';
import { calculateAcademicScore } from './academic';
import { calculateCareerScore } from './career';
import { calculateSnsScore } from './sns';
import { calculateFaceScore, analyzeFaceWithClaude } from './face';
import { calculateLanguageScore } from './language';
import { calculateTravelScore } from './travel';
import { calculateLoveScore } from './love';
import { getMbtiEconomicBonus } from './mbti';
import { generateEpithetTitle, generateLoveEpithetTitle } from './title-generator';
import { renormalizeWeights } from './math-utils';

export function runDiagnosisV3(input: DiagnosisInputV3): OverallDiagnosisResultV3 {
  const diagnosisId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const shareToken = `share_${Math.random().toString(36).substring(2, 11)}${Math.random().toString(36).substring(2, 6)}`;

  // 1. 各カテゴリのスコア計算
  const bodyResult = calculateBodyScore(
    input.gender,
    input.age,
    input.height,
    input.weight,
    input.bodyFat
  );

  const incomeResult = calculateIncomeScore(
    input.gender,
    input.age,
    input.annualIncome,
    input.prefectureName
  );

  const netWorthResult = calculateNetWorthScore({
    gender: input.gender,
    age: input.age,
    savingsAssets: input.savingsAssets,
    financialAssets: input.financialAssets,
    realEstateAssets: input.realEstateAssets,
    luxuryAssets: input.luxuryAssets,
    carAssets: input.carAssets,
    watchAssets: input.watchAssets,
    otherAssets: input.otherAssets,
    mortgageDebt: input.mortgageDebt,
    carDebt: input.carDebt,
    scholarshipDebt: input.scholarshipDebt,
    otherDebt: input.otherDebt,
  });

  // 経済総合Score (最大効用・相乗評価モデル)
  // 単純加重平均ではなく max(年収, 純資産, 加重平均) を採用。
  // 理由: 「年収100万・純資産10億円」の資産家・投資家や「高年収・資産形成期」のユーザーにおいて、
  // 一方の数値が他方の経済力を不当に引き下げるバグを防ぎ、経済的実力を正しく評価する。
  let totalEconomicScore = incomeResult.incomeScore.score;
  if (netWorthResult) {
    const weightedAvg = Math.round((incomeResult.incomeScore.score * 0.6 + netWorthResult.score * 0.4) * 10) / 10;
    totalEconomicScore = Math.max(
      incomeResult.incomeScore.score,
      netWorthResult.score,
      weightedAvg
    );
    // 両方が共に優秀(ともに75pt以上)な場合のシナジーボーナス (+2~5pt)
    if (incomeResult.incomeScore.score >= 75 && netWorthResult.score >= 75) {
      const synergy = Math.min(5, Math.round((incomeResult.incomeScore.score + netWorthResult.score - 150) * 0.1));
      totalEconomicScore = Math.min(100, Math.round((totalEconomicScore + synergy) * 10) / 10);
    }
  }

  // MBTI性格特性による生涯資産形成・キャピタル蓄積ポテンシャル加点 (+0〜2.5pt)
  const mbtiEco = getMbtiEconomicBonus(input.mbti);
  if (mbtiEco.bonus > 0) {
    totalEconomicScore = Math.min(100, Math.round((totalEconomicScore + mbtiEco.bonus) * 10) / 10);
  }

  const academicResult = calculateAcademicScore(
    input.academicDegree,
    input.universityName,
    input.customUniversityHensachi,
    input.prefectureName,
    input.iqScore,
    input.age
  );

  const careerResult = calculateCareerScore(
    input.occupationCode,
    input.employmentType,
    input.positionCode,
    input.companyName,
    input.companyCategory,
    input.prefectureName
  );

  const snsResult = calculateSnsScore({
    instagram: input.instagramFollowers,
    x: input.xFollowers,
    tikTok: input.tikTokFollowers,
    youTube: input.youTubeFollowers,
  }, input.age);

  const languageResult = calculateLanguageScore(input.languages);
  const travelResult = calculateTravelScore(input.travelCount, input.age);

  // グローバル・語学能力総合Score (語学 50% + 海外渡航 50%)
  const totalGlobalScore = Math.round((languageResult.score * 0.5 + travelResult.score * 0.5) * 10) / 10;

  const faceResult = calculateFaceScore({
    faceRating: input.faceRating,
    faceImageUrl: input.faceImageUrl,
  });

  // 2. 日本人スペック総合スコア (6-AXIS カテゴリ重み)
  // Body 15%, Economic 25%, Career 20%, Academic 20%, Social 10%, Global 10%
  const categoryAvailable = [
    { code: 'BODY', score: bodyResult.totalBodyScore, defaultWeight: 0.15 },
    { code: 'ECONOMIC', score: totalEconomicScore, defaultWeight: 0.25 },
    { code: 'CAREER', score: careerResult.totalCareerScore, defaultWeight: 0.20 },
    { code: 'ACADEMIC', score: academicResult.totalAcademicScore, defaultWeight: 0.20 },
    { code: 'SOCIAL', score: snsResult.snsScore.score, defaultWeight: 0.10 },
    { code: 'GLOBAL', score: totalGlobalScore, defaultWeight: 0.10 },
  ];

  const { categoryScore: japanOverallScore, appliedWeights } = renormalizeWeights(categoryAvailable);

  // 3. 恋愛スペック総合スコア
  const loveResult = calculateLoveScore({
    gender: input.gender,
    age: input.age,
    faceScore: faceResult.appearanceScore.score,
    bodyScore: bodyResult.totalBodyScore,
    incomeScore: totalEconomicScore,
    careerScore: careerResult.totalCareerScore,
    snsScore: snsResult.snsScore.score,
    maritalStatus: input.maritalStatus,
    childrenCount: input.childrenCount,
    datingPartnerCount: input.datingPartnerCount,
    partnerCount: input.partnerCount,
    prefectureId: input.prefectureId,
    mbti: input.mbti,
  });

  // 4. メトリクス結果オブジェクトの集約
  const allMetrics: MetricScoreResult[] = [
    bodyResult.heightScore,
    bodyResult.bmiScore,
    bodyResult.weightScore,
    bodyResult.bodyFatScore,
    incomeResult.incomeScore,
    ...(netWorthResult ? [netWorthResult] : []),
    academicResult.academicDegreeScore,
    ...(academicResult.universityScore ? [academicResult.universityScore] : []),
    ...(academicResult.iqScore ? [academicResult.iqScore] : []),
    careerResult.occupationScore,
    ...(careerResult.companyScore ? [careerResult.companyScore] : []),
    languageResult,
    travelResult,
    snsResult.snsScore,
    faceResult.appearanceScore,
    ...loveResult.loveMetrics,
  ];

  // 5. 欠損・未取得項目のステータス記録
  const missingMetrics: OverallDiagnosisResultV3['missingMetrics'] = [];

  if (!netWorthResult) {
    missingMetrics.push({
      metricCode: 'NET_WORTH',
      reason: '資産・負債情報未入力。年収データのみで経済Scoreを算出。',
      status: 'OPTIONAL_NOT_ENTERED',
    });
  }
  if (!input.bodyFat) {
    missingMetrics.push({
      metricCode: 'BODY_FAT',
      reason: '任意項目のため未入力。公的統計データ不十分。',
      status: 'OPTIONAL_NOT_ENTERED',
    });
  }
  if (!input.universityName) {
    missingMetrics.push({
      metricCode: 'UNIVERSITY',
      reason: '大学名未入力。学歴区分で代替計算。',
      status: 'OPTIONAL_NOT_ENTERED',
    });
  }

  const epithet = generateEpithetTitle(japanOverallScore, input, allMetrics);
  const loveEpithet = generateLoveEpithetTitle(loveResult.loveOverallScore, input, allMetrics);

  return {
    diagnosisId,
    createdAt: new Date().toISOString(),
    inputSummary: {
      nickname: input.nickname?.trim() ? input.nickname.trim() : 'あなた',
      gender: input.gender,
      age: input.age,
      prefectureName: input.prefectureName,
      mbti: input.mbti,
    },
    japanOverallScore,
    loveOverallScore: loveResult.loveOverallScore,
    epithet,
    loveEpithet,
    categoryScores: {
      body: bodyResult.totalBodyScore,
      economic: totalEconomicScore,
      career: careerResult.totalCareerScore,
      academic: academicResult.totalAcademicScore,
      social: snsResult.snsScore.score,
      ability: totalGlobalScore,
    },
    loveCategoryScores: loveResult.loveCategoryScores,
    metrics: allMetrics,
    missingMetrics,
    appliedWeights,
    shareToken,
    rawInput: input,
  };
}

/**
 * 非同期版診断実行関数 (Claude AI による顔写真解析を組み込み)
 */
export async function runDiagnosisV3Async(input: DiagnosisInputV3): Promise<OverallDiagnosisResultV3> {
  let faceAnalysis = null;
  if (input.faceImageUrl && input.faceImageUrl.trim() !== '') {
    faceAnalysis = await analyzeFaceWithClaude({
      faceImageUrl: input.faceImageUrl,
      age: input.age,
      gender: input.gender,
    });
  }

  const diagnosisId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const shareToken = `share_${Math.random().toString(36).substring(2, 11)}${Math.random().toString(36).substring(2, 6)}`;

  // 1. 各カテゴリのスコア計算
  const bodyResult = calculateBodyScore(
    input.gender,
    input.age,
    input.height,
    input.weight,
    input.bodyFat
  );

  const incomeResult = calculateIncomeScore(
    input.gender,
    input.age,
    input.annualIncome,
    input.prefectureName
  );

  const netWorthResult = calculateNetWorthScore({
    gender: input.gender,
    age: input.age,
    savingsAssets: input.savingsAssets,
    financialAssets: input.financialAssets,
    realEstateAssets: input.realEstateAssets,
    luxuryAssets: input.luxuryAssets,
    carAssets: input.carAssets,
    watchAssets: input.watchAssets,
    otherAssets: input.otherAssets,
    mortgageDebt: input.mortgageDebt,
    carDebt: input.carDebt,
    scholarshipDebt: input.scholarshipDebt,
    otherDebt: input.otherDebt,
  });

  let totalEconomicScore = incomeResult.incomeScore.score;
  if (netWorthResult) {
    const weightedAvg = Math.round((incomeResult.incomeScore.score * 0.6 + netWorthResult.score * 0.4) * 10) / 10;
    totalEconomicScore = Math.max(
      incomeResult.incomeScore.score,
      netWorthResult.score,
      weightedAvg
    );
    if (incomeResult.incomeScore.score >= 75 && netWorthResult.score >= 75) {
      const synergy = Math.min(5, Math.round((incomeResult.incomeScore.score + netWorthResult.score - 150) * 0.1));
      totalEconomicScore = Math.min(100, Math.round((totalEconomicScore + synergy) * 10) / 10);
    }
  }

  // MBTI性格特性による生涯資産形成・キャピタル蓄積ポテンシャル加点 (+0〜2.5pt)
  const mbtiEco = getMbtiEconomicBonus(input.mbti);
  if (mbtiEco.bonus > 0) {
    totalEconomicScore = Math.min(100, Math.round((totalEconomicScore + mbtiEco.bonus) * 10) / 10);
  }

  const academicResult = calculateAcademicScore(
    input.academicDegree,
    input.universityName,
    input.customUniversityHensachi,
    input.prefectureName,
    input.iqScore,
    input.age
  );

  const careerResult = calculateCareerScore(
    input.occupationCode,
    input.employmentType,
    input.positionCode,
    input.companyName,
    input.companyCategory,
    input.prefectureName
  );

  const snsResult = calculateSnsScore({
    instagram: input.instagramFollowers,
    x: input.xFollowers,
    tikTok: input.tikTokFollowers,
    youTube: input.youTubeFollowers,
  }, input.age);

  const languageResult = calculateLanguageScore(input.languages);
  const travelResult = calculateTravelScore(input.travelCount, input.age);

  const totalGlobalScore = Math.round((languageResult.score * 0.5 + travelResult.score * 0.5) * 10) / 10;

  // AI 解析結果を calculateFaceScore に引き渡し
  const faceResult = calculateFaceScore({
    faceRating: input.faceRating,
    faceImageUrl: input.faceImageUrl,
    faceAnalysis,
  });

  const categoryAvailable = [
    { code: 'BODY', score: bodyResult.totalBodyScore, defaultWeight: 0.15 },
    { code: 'ECONOMIC', score: totalEconomicScore, defaultWeight: 0.25 },
    { code: 'CAREER', score: careerResult.totalCareerScore, defaultWeight: 0.20 },
    { code: 'ACADEMIC', score: academicResult.totalAcademicScore, defaultWeight: 0.20 },
    { code: 'SOCIAL', score: snsResult.snsScore.score, defaultWeight: 0.10 },
    { code: 'GLOBAL', score: totalGlobalScore, defaultWeight: 0.10 },
  ];

  const { categoryScore: japanOverallScore, appliedWeights } = renormalizeWeights(categoryAvailable);

  const loveResult = calculateLoveScore({
    gender: input.gender,
    age: input.age,
    faceScore: faceResult.appearanceScore.score,
    bodyScore: bodyResult.totalBodyScore,
    incomeScore: totalEconomicScore,
    careerScore: careerResult.totalCareerScore,
    snsScore: snsResult.snsScore.score,
    maritalStatus: input.maritalStatus,
    childrenCount: input.childrenCount,
    partnerCount: input.partnerCount,
    prefectureId: input.prefectureId,
    mbti: input.mbti,
  });

  const allMetrics: MetricScoreResult[] = [
    bodyResult.heightScore,
    bodyResult.bmiScore,
    bodyResult.weightScore,
    bodyResult.bodyFatScore,
    incomeResult.incomeScore,
    ...(netWorthResult ? [netWorthResult] : []),
    academicResult.academicDegreeScore,
    ...(academicResult.universityScore ? [academicResult.universityScore] : []),
    ...(academicResult.iqScore ? [academicResult.iqScore] : []),
    careerResult.occupationScore,
    ...(careerResult.companyScore ? [careerResult.companyScore] : []),
    languageResult,
    travelResult,
    snsResult.snsScore,
    faceResult.appearanceScore,
    ...loveResult.loveMetrics,
  ];

  const missingMetrics: OverallDiagnosisResultV3['missingMetrics'] = [];

  if (!netWorthResult) {
    missingMetrics.push({
      metricCode: 'NET_WORTH',
      reason: '資産・負債情報未入力。年収データのみで経済Scoreを算出。',
      status: 'OPTIONAL_NOT_ENTERED',
    });
  }
  if (!input.bodyFat) {
    missingMetrics.push({
      metricCode: 'BODY_FAT',
      reason: '任意項目のため未入力。公的統計データ不十分。',
      status: 'OPTIONAL_NOT_ENTERED',
    });
  }
  if (!input.universityName) {
    missingMetrics.push({
      metricCode: 'UNIVERSITY',
      reason: '大学名未入力。学歴区分で代替計算。',
      status: 'OPTIONAL_NOT_ENTERED',
    });
  }

  const epithet = generateEpithetTitle(japanOverallScore, input, allMetrics);
  const loveEpithet = generateLoveEpithetTitle(loveResult.loveOverallScore, input, allMetrics);

  return {
    diagnosisId,
    createdAt: new Date().toISOString(),
    inputSummary: {
      nickname: input.nickname?.trim() ? input.nickname.trim() : 'あなた',
      gender: input.gender,
      age: input.age,
      prefectureName: input.prefectureName,
      mbti: input.mbti,
    },
    japanOverallScore,
    loveOverallScore: loveResult.loveOverallScore,
    epithet,
    loveEpithet,
    categoryScores: {
      body: bodyResult.totalBodyScore,
      economic: totalEconomicScore,
      career: careerResult.totalCareerScore,
      academic: academicResult.totalAcademicScore,
      social: snsResult.snsScore.score,
      ability: totalGlobalScore,
    },
    loveCategoryScores: loveResult.loveCategoryScores,
    metrics: allMetrics,
    missingMetrics,
    appliedWeights,
    shareToken,
    rawInput: input,
  };
}
