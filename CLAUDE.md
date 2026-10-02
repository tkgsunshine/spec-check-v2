@AGENTS.md
@.agents/AGENTS.md

## Claude Code での運用（AG→CC移行）
- 作業ブランチで変更し、PRで反映する。Vercelへのデプロイは、ユーザーの明確な指示があるときだけ行う（上記ルール）。
- 作業完了前に `npm run build` を通す。
- `GEMINI_API_KEY` を使う顔解析（`src/lib/score-engine/face.ts`）はGoogle側の課金が別途かかる。
