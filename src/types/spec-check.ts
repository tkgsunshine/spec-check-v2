export type DataQuality = 
  | 'OFFICIAL' 
  | 'OFFICIAL_ESTIMATED' 
  | 'PROPRIETARY' 
  | 'AI' 
  | 'MODEL_ESTIMATE' 
  | 'USER_INPUT';

export type CalculationMethod = 
  | 'EXACT_PERCENTILE' 
  | 'NORMAL_APPROXIMATION' 
  | 'SALARY_BRACKET_CUMULATIVE' 
  | 'LOG10_CURVE' 
  | 'WEIGHTED_PROPRIETARY' 
  | 'STATISTICAL_MODEL_ESTIMATE'
  | 'MAX_PLATFORM_ANCHOR_WITH_SYNERGY';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus =
  | 'SINGLE_FREE'        // 未婚（恋人なし・フリー）
  | 'SINGLE_DATING'      // 未婚（恋人あり・交際中）
  | 'ENGAGED_COHABITING' // 婚約中 / 同棲中
  | 'MARRIED'            // 既婚
  | 'SEPARATED'          // 別居中
  | 'DIVORCED'           // 離婚歴あり
  | 'BEREAVED'           // 死別
  | 'SINGLE';            // 旧データ互換用（未婚）
export type LanguageLevel = 'BASIC' | 'DAILY' | 'BUSINESS' | 'NATIVE';

export interface MetricScoreResult {
  metricCode: string;
  metricName: string;
  category: string;
  rawValue: string | number | boolean | null;
  score: number;
  percentile: number | null;
  topPercent: number | null;
  dataQuality: DataQuality;
  datasetName: string;
  sourceUrl: string;
  surveyYear: number;
  calculationMethod: CalculationMethod;
  hasOfficialTopPercent: boolean;
  isOptionalUnentered?: boolean;
  notes?: string;
}

export interface BodyScoreResult {
  heightScore: MetricScoreResult;
  bmiScore: MetricScoreResult;
  bodyFatScore: MetricScoreResult;
  weightScore: MetricScoreResult;
  totalBodyScore: number;
}

export interface IncomeScoreResult {
  incomeScore: MetricScoreResult;
  totalEconomicScore: number;
}

export interface AcademicScoreResult {
  academicDegreeScore: MetricScoreResult;
  universityScore: MetricScoreResult | null;
  iqScore: MetricScoreResult | null;
  totalAcademicScore: number;
}

export interface CareerScoreResult {
  companyScore: MetricScoreResult | null;
  occupationScore: MetricScoreResult;
  totalCareerScore: number;
}

export interface SnsScoreResult {
  snsScore: MetricScoreResult;
  platformsUsed: string[];
}

export interface FaceScoreResult {
  appearanceScore: MetricScoreResult;
}

export interface UserLanguageInput {
  languageCode: string;
  level: LanguageLevel;
}

export type FaceRating = 'MODEL_LEVEL' | 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';

export interface DiagnosisInputV3 {
  nickname?: string | null;
  gender: Gender;
  age: number;
  prefectureId: number;
  prefectureName: string;
  height: number;
  weight: number;
  bodyFat?: number | null;
  faceRating?: FaceRating | null;
  annualIncome: number;
  savingsAssets?: number | null; // 1. 預金 (万円)
  financialAssets?: number | null; // 2. 金融資産(株・証券等) (万円)
  realEstateAssets?: number | null; // 3. 不動産評価額 (万円)
  luxuryAssets?: number | null; // 4. 車、時計・貴金属等 (万円)
  carAssets?: number | null; // 互換用: 車 (万円)
  watchAssets?: number | null; // 互換用: 時計・その他 (万円)
  otherAssets?: number | null;
  mortgageDebt?: number | null;
  carDebt?: number | null;
  scholarshipDebt?: number | null;
  otherDebt?: number | null;
  academicDegree?: ('MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'VOCATIONAL' | 'JUNIOR_COLLEGE' | 'BACHELOR' | 'MASTER' | 'DOCTOR') | null;
  universityName?: string | null;
  customUniversityHensachi?: number | null;
  iqScore?: number | null;
  industryCode?: string | null;
  occupationCode: string;
  employmentType: string;
  positionCode?: string | null;
  companyName?: string | null;
  companyCategory?: 'LARGE_PRIME' | 'LARGE' | 'MEDIUM' | 'SMALL' | 'OTHER' | null;
  languages?: UserLanguageInput[];
  travelCount?: number | null;
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number | null;
  datingPartnerCount?: number | null; // 交際人数（付き合った人数）
  partnerCount?: number | null; // 経験人数
  mbti?: string | null;
  instagramFollowers?: number | null;
  xFollowers?: number | null;
  tikTokFollowers?: number | null;
  youTubeFollowers?: number | null;
  faceImageUrl?: string | null;
}

export type DiagnosisInput = DiagnosisInputV3;

export interface CharacterTypeAxis {
  /** 軸の名前（例: 財力 vs 知力） */
  label: string;
  /** その軸で判定された側（例: 財力） */
  result: string;
  letter: string;
}

export interface CharacterTypeRef {
  code: string;
  name: string;
  emoji: string;
}

export interface EpithetResult {
  title: string;
  subtitle: string;
  rarityBadge: string;
  rarityColor: string;
  /** MBTI風の16タイプ（2026-10 以降の診断のみ。古い結果には無い） */
  typeCode?: string;
  typeName?: string;
  typeEmoji?: string;
  typeAxes?: CharacterTypeAxis[];
  bestMatch?: CharacterTypeRef;
}

export interface OverallDiagnosisResultV3 {
  diagnosisId: string;
  createdAt: string;
  inputSummary: {
    nickname?: string;
    gender: Gender;
    age: number;
    prefectureName: string;
    mbti?: string | null;
  };
  japanOverallScore: number;
  loveOverallScore: number;
  epithet?: EpithetResult;
  loveEpithet?: EpithetResult;
  categoryScores: {
    body: number;
    economic: number;
    career: number;
    academic: number;
    social: number;
    ability: number;
  };
  loveCategoryScores: {
    age: number;
    face: number;
    body: number;
    income: number;
    career: number;
    family: number;
  };
  metrics: MetricScoreResult[];
  missingMetrics: {
    metricCode: string;
    reason: string;
    status: 'DATASET_IMPORT_WAITING' | 'OPTIONAL_NOT_ENTERED';
  }[];
  appliedWeights: Record<string, number>;
  shareToken: string;
  rawInput?: DiagnosisInputV3;
  isPremiumUnlocked?: boolean;
}

export type OverallDiagnosisResult = OverallDiagnosisResultV3;

export interface PublicShareResult {
  shareToken: string;
  createdAt: string;
  nickname?: string;
  gender: Gender;
  age: number;
  prefectureName: string;
  japanOverallScore: number;
  loveOverallScore: number;
  epithet?: EpithetResult;
  loveEpithet?: EpithetResult;
  categoryScores: {
    body: number;
    economic: number;
    career: number;
    academic: number;
    social: number;
    ability: number;
  };
  loveCategoryScores: OverallDiagnosisResultV3['loveCategoryScores'];
  metricSummary: {
    metricCode: string;
    metricName: string;
    score: number;
    topPercent: number | null;
    hasOfficialTopPercent: boolean;
    dataQuality: DataQuality;
    surveyYear: number;
    datasetName: string;
  }[];
}
