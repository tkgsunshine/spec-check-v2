import { describe, it, expect } from 'vitest';
import { generateEpithetTitle, generateLoveEpithetTitle, OVERALL_TYPES, LOVE_TYPES } from '../src/lib/score-engine/title-generator';
import { DiagnosisInputV3 } from '../src/types/spec-check';

const baseInput: DiagnosisInputV3 = {
  gender: 'MALE',
  age: 27,
  prefectureId: 13,
  prefectureName: '東京都',
  height: 172,
  weight: 65,
  annualIncome: 500,
  occupationCode: '03',
  employmentType: 'REGULAR',
};

const baseScores = { body: 70, economic: 90, career: 70, academic: 60, social: 50, ability: 50 };
const baseLoveScores = { age: 95, face: 70, body: 70, income: 60, career: 60, family: 90 };

describe('MBTI風キャラタイプ', () => {
  it('総合・恋愛ともに16タイプがそろっていて、コードとキーが一致する', () => {
    expect(Object.keys(OVERALL_TYPES)).toHaveLength(16);
    expect(Object.keys(LOVE_TYPES)).toHaveLength(16);
    for (const [k, v] of Object.entries({ ...OVERALL_TYPES, ...LOVE_TYPES })) expect(v.code).toBe(k);
  });

  it('総合: 稼ぐ会社員でSNSなし・体型良好なら MCQF', () => {
    const r = generateEpithetTitle(78, baseInput, baseScores);
    expect(r.typeCode).toBe('MCQF');
    expect(r.rarityBadge).toBe('S TIER');
    expect(r.typeAxes?.map(a => a.result)).toEqual(['財力', '組織', '潜伏', '見た目']);
    // 相性は 財力/知力 と 発信/潜伏 が逆
    expect(r.bestMatch?.code).toBe('BCLF');
  });

  it('総合: フリーランスで MBTI が E なら越境・発信になる', () => {
    const r = generateEpithetTitle(60, { ...baseInput, employmentType: 'FREELANCE', mbti: 'ENFP' }, { ...baseScores, academic: 90, body: 50 });
    expect(r.typeCode).toBe('BGLD');
    expect(r.rarityBadge).toBe('B TIER');
  });

  it('恋愛: 交際人数が多い若い独身でステータス低めなら VHYR', () => {
    const r = generateLoveEpithetTitle(80, { ...baseInput, datingPartnerCount: 6 }, baseLoveScores, 50);
    expect(r.typeCode).toBe('VHYR');
    expect(r.bestMatch?.code).toBe('SPYR');
  });

  it('恋愛: 既婚なら結婚軸になる', () => {
    const r = generateLoveEpithetTitle(70, { ...baseInput, age: 35, maritalStatus: 'MARRIED', datingPartnerCount: 1 }, { ...baseLoveScores, income: 95, career: 90 }, 50);
    expect(r.typeCode).toBe('SPMK');
  });
});
