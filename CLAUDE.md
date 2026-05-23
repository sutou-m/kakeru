@AGENTS.md

# CLAUDE.md

## Commands

```bash
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # ビルド（デプロイ前確認）
npm run lint     # ESLintチェック
```

No test runner is configured yet.

## Architecture

This is a Next.js 14 app using the **App Router** (not Pages Router).
Source lives under `app/`.

**Next.js version note:** This version may have breaking changes vs. training data.
Before writing routing, data-fetching, caching, or navigation code, read the
relevant guide in `node_modules/next/dist/docs/01-app/`.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) / TypeScript / Tailwind CSS v4
- **Auth:** NextAuth.js (email + password)
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js` — **Prismaは使用しない**
- **Storage:** Supabase Storage (領収書画像)
- **OCR:** Google Cloud Vision API
- **AI分類:** OpenAI GPT-4o
- **Email:** Resend (`onboarding@resend.dev`)
- **PDF:** `window.print()` + 印刷用CSS (jsPDF不使用)
- **Hosting:** Vercel

## Design Tokens

- Primary (テラコッタ): `#E8884A`
- Background (リネン): `#F5F0E8`
- Dark (ティール): `#2D3B3B`
- Sand: `#C4B49A`
- Font: Noto Sans JP / system-ui
- Tailwind組み込みの `gray-*` は使用禁止
- ボタン色はCSS変数ではなくHEX値直書き

## Database Rules

- Prisma **不使用**（IPv4環境でTCP直接接続不可）
- テーブル作成・RLS設定は Supabase MCP で行う
- RLSは全テーブルに必須設定
  - 公開用INSERT: `anon` ロール許可
  - 管理CRUD: `authenticated` ロール許可

## Known Issues & Fixes

- ボタンテキスト不可視 → CSS変数解決失敗の可能性 → HEX値で直指定
- 404エラー → App Routerフォルダ構成ズレ → ファイルパス確認
- Supabase保存エラー → RLSポリシー未設定 → MCPで追加
- 画像アップロードエラー → Server Action上限1MB → next.config.tsで10MBに拡張
