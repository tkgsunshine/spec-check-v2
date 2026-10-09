@AGENTS.md
@.agents/AGENTS.md

## Claude Code での運用（AG→CC移行）
- 作業ブランチで変更し、PRで反映する。Vercelへのデプロイは、ユーザーの明確な指示があるときだけ行う（上記ルール）。
- 作業完了前に `npm run build` を通す。
- 顔解析（`src/lib/score-engine/face.ts`）は Claude API を使う。Vercelの環境変数に `ANTHROPIC_API_KEY` を設定する（任意で `ANTHROPIC_MODEL`、既定 `claude-opus-5-5`）。未設定時は簡易スコアにフォールバック。
- 開発アイデア: ユーザーが新機能・改善のアイデアを話したら、`.claude/agents/dev-employee.md` の「ホーム」の節に従い、ホームのダッシュボード（https://claude.ai/artifact/9eu8jRktA8nGCC8HKN7L8A）の `ideas` に保存する（実装は依頼があるまでしない）。

## 診断入力の仕様メモ
- 必須項目は、フォーム（`src/app/page.tsx`）と API（`src/app/api/diagnosis/calculate/route.ts`）で同じ範囲に揃える。片方だけ変えない。
  - 必須: 性別、年齢（16歳以上）、身長、体重、雰囲気・第一印象の自己評価、額面年収、最終学歴、雇用形態。
  - 雇用形態が無職（`UNEMPLOYED`）以外の場合は、業種、職種、役職（選択肢がある雇用形態のみ）、企業名または企業規模のどちらか一方も必須。
- 居住地は未指定なら東京都（`prefectureId` 13）を既定値とする。未選択でも弾かない。
- 上記以外（体脂肪率、顔写真、IQ、資産・負債、語学、婚姻状況、MBTI、SNS フォロワー数など）は任意。
