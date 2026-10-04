@AGENTS.md
@.agents/AGENTS.md

## Claude Code での運用（AG→CC移行）
- 作業ブランチで変更し、PRで反映する。Vercelへのデプロイは、ユーザーの明確な指示があるときだけ行う（上記ルール）。
- 作業完了前に `npm run build` を通す。
- 顔解析（`src/lib/score-engine/face.ts`）は Claude API を使う。Vercelの環境変数に `ANTHROPIC_API_KEY` を設定する（任意で `ANTHROPIC_MODEL`、既定 `claude-opus-5-5`）。未設定時は簡易スコアにフォールバック。
- 開発アイデア: ユーザーが新機能・改善のアイデアを話したら、`.claude/agents/dev-employee.md` の「ホーム」の節に従い、ホームのダッシュボード（https://claude.ai/artifact/9eu8jRktA8nGCC8HKN7L8A）の `ideas` に保存する（実装は依頼があるまでしない）。
