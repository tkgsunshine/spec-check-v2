import { NextResponse } from 'next/server';
import { DiagnosisInputV3 } from '@/types/spec-check';
import { runDiagnosisV3, runDiagnosisV3Async } from '@/lib/score-engine';
import { saveDiagnosis } from '@/lib/storage/diagnosis-store';
import { POSITION_MASTER_BY_EMPLOYMENT } from '@/lib/datasets/japan-stats';

export async function POST(request: Request) {
  try {
    const body: DiagnosisInputV3 = await request.json();

    if (!body.gender || !body.age || !body.height || !body.weight || body.annualIncome === undefined) {
      return NextResponse.json(
        { error: '必須項目（性別、年齢、身長、体重、年収）が不足しています。' },
        { status: 400 }
      );
    }

    if (Number(body.age) < 16) {
      return NextResponse.json(
        { error: '当サービスは16歳以上の方を対象としています。16歳以上の年齢をご入力ください。' },
        { status: 400 }
      );
    }

    if (!body.faceRating) {
      return NextResponse.json({ error: '雰囲気・第一印象の自己評価を選択してください。' }, { status: 400 });
    }
    if (!body.academicDegree) {
      return NextResponse.json({ error: '最終学歴を選択してください。' }, { status: 400 });
    }
    if (!body.employmentType) {
      return NextResponse.json({ error: '雇用形態を選択してください。' }, { status: 400 });
    }

    // 居住地は未指定なら東京都を既定値とする
    if (!body.prefectureId || !body.prefectureName) {
      body.prefectureId = 13;
      body.prefectureName = '東京都';
    }

    if (body.employmentType !== 'UNEMPLOYED') {
      if (!body.industryCode) {
        return NextResponse.json({ error: '業種を選択してください。' }, { status: 400 });
      }
      if (!body.occupationCode) {
        return NextResponse.json({ error: '職種を選択してください。' }, { status: 400 });
      }
      const positions = POSITION_MASTER_BY_EMPLOYMENT[body.employmentType] || [];
      if (positions.length > 0 && !body.positionCode) {
        return NextResponse.json({ error: '役職を選択してください。' }, { status: 400 });
      }
      const hasCompanyName = Boolean(body.companyName && body.companyName.trim() !== '');
      const hasCompanyCategory = Boolean(body.companyCategory && String(body.companyCategory).trim() !== '');
      if (!hasCompanyName && !hasCompanyCategory) {
        return NextResponse.json(
          { error: '「勤務先・企業名」または「勤務先企業規模」のどちらか一方を必ず入力・選択してください。' },
          { status: 400 }
        );
      }
    }

    // 1. スコア計算の実行 (Claude AI非同期試行 ➔ 失敗時は安全な同期エンジンへフォールバック)
    let result;
    try {
      result = await runDiagnosisV3Async(body);
    } catch (calcError) {
      console.error('Async diagnosis engine failed, falling back to sync engine:', calcError);
      result = runDiagnosisV3(body);
    }

    // 2. DB保存処理 (Firestore永続化)
    try {
      await saveDiagnosis(result);
    } catch (saveError) {
      console.error('saveDiagnosis error (non-fatal):', saveError);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Diagnosis calculation error:', error);
    return NextResponse.json(
      { error: error?.message || '診断スコアの計算中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
