import { describe, it, expect } from 'vitest';
import { runDiagnosisV3, calculateNetWorthScore, calculateLanguageScore, calculateTravelScore, calculateSnsScore, calculateBodyScore } from '../src/lib/score-engine';
import { DiagnosisInputV3 } from '../src/types/spec-check';

describe('Score Engine V3.0 Unit Tests', () => {
  it('calculateBodyScore accurately estimates FFMI muscle mass for male muscular build', () => {
    // Muscular male build: Height 175cm, Weight 80kg (BMI 26.1), BodyFat 12%
    const res = calculateBodyScore('MALE', 28, 175, 80, 12);

    expect(res.bmiScore.score).toBeGreaterThan(88); // Should get top tier score for muscle mass!
    expect(res.bmiScore.notes).toContain('FFMI');
    expect(res.bmiScore.notes).toContain('最高峰のアスリート');
  });

  it('calculateBodyScore accurately scores female fit model build with female-specific thresholds', () => {
    // Fit female model build: Height 165cm, Weight 48kg (BMI 17.6), BodyFat 19%
    const res = calculateBodyScore('FEMALE', 26, 165, 48, 19);

    expect(res.bmiScore.score).toBeGreaterThan(85);
    expect(res.bodyFatScore.score).toBeGreaterThan(90);
  });

  it('calculateNetWorthScore accurately calculates (Total Assets - Total Debt)', () => {
    const res = calculateNetWorthScore({
      financialAssets: 2000,
      realEstateAssets: 3000,
      mortgageDebt: 3000,
    });

    expect(res).not.toBeNull();
    expect(res?.score).toBeGreaterThan(75);
    expect(res?.hasOfficialTopPercent).toBe(true);
    expect(res?.rawValue).toContain('2,000 万円');
  });

  it('calculateSnsScore gives top-tier score for single platform influencer and ignores 0-follower unoperated SNS', () => {
    const res = calculateSnsScore({
      instagram: 300000,
      x: 0,
      tikTok: 0,
      youTube: 0,
    });

    expect(res.snsScore.score).toBeGreaterThan(90);
    expect(res.platformsUsed.length).toBe(1);
    expect(res.platformsUsed[0]).toContain('Instagram');
  });

  it('calculateLanguageScore rewards multiple foreign languages and ignores Japanese native (0 points)', () => {
    const res = calculateLanguageScore([
      { languageCode: 'JA', level: 'NATIVE' },
      { languageCode: 'EN', level: 'BUSINESS' },
    ]);

    expect(res.score).toBe(72);
    expect(res.rawValue).toContain('英語 (English)');
    expect(res.rawValue).not.toContain('日本語 (ネイティブ)');
  });

  it('calculateTravelScore uses travelCount number directly', () => {
    const res = calculateTravelScore(3);
    expect(res.rawValue).toBe('3 か国訪問');
    expect(res.score).toBeGreaterThan(65);
  });

  it('runDiagnosisV3 executes full V3.0 pipeline cleanly', () => {
    const input: DiagnosisInputV3 = {
      gender: 'MALE',
      age: 32,
      prefectureId: 13,
      prefectureName: '東京都',
      height: 176,
      weight: 70,
      annualIncome: 850,
      financialAssets: 1500,
      realEstateAssets: 4000,
      mortgageDebt: 3500,
      academicDegree: 'BACHELOR',
      universityName: '東京大学',
      industryCode: '01',
      occupationCode: '18',
      employmentType: 'REGULAR',
      positionCode: 'MANAGER',
      companyCategory: 'LARGE_PRIME',
      languages: [
        { languageCode: 'EN', level: 'BUSINESS' },
        { languageCode: 'ZH', level: 'DAILY' },
      ],
      travelCount: 3,
      maritalStatus: 'SINGLE',
      instagramFollowers: 300000,
    };

    const result = runDiagnosisV3(input);

    expect(result.japanOverallScore).toBeGreaterThan(70);
    expect(result.loveOverallScore).toBeGreaterThan(70);
    expect(result.categoryScores.social).toBeGreaterThan(90);
    expect(result.metrics.some(m => m.metricCode === 'NET_WORTH')).toBe(true);
    expect(result.metrics.some(m => m.metricCode === 'LANGUAGE')).toBe(true);
    expect(result.metrics.some(m => m.metricCode === 'TRAVEL')).toBe(true);
  });
});

describe('scoreToDeviation', () => {
  it('平均スコア50は偏差値50', async () => {
    const { scoreToDeviation } = await import('../src/lib/score-engine/math-utils');
    expect(scoreToDeviation(50)).toBe(50);
  });

  it('上位%と同じ分布モデルで換算する（偏差値60 ≒ 上位15.9%）', async () => {
    const { scoreToDeviation, scoreToTopPercent } = await import('../src/lib/score-engine/math-utils');
    const score = 50 + 9.88; // +1σ
    expect(scoreToDeviation(score)).toBe(60);
    expect(scoreToTopPercent(score)).toBeCloseTo(15.9, 1);
  });

  it('0〜100に収め、小数1桁に丸める', async () => {
    const { scoreToDeviation } = await import('../src/lib/score-engine/math-utils');
    expect(scoreToDeviation(0)).toBeGreaterThanOrEqual(0);
    expect(scoreToDeviation(100)).toBeLessThanOrEqual(100);
    expect(scoreToDeviation(63.37)).toBe(Math.round(scoreToDeviation(63.37) * 10) / 10);
  });
});
