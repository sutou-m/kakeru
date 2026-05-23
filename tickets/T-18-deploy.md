# T-18 Vercelデプロイ

## 担当エージェント
@devops-automator


## 目的
全機能の結合テストを行い、本番デプロイ可能な状態にする。

## 完了条件
- [x] `npm run build` がエラーなく通る（Next.js 16.2.6 / 13ページ生成）
- [ ] Vercelにデプロイされ本番URLでアクセスできる
- [ ] 環境変数がVercelに設定されている

---

## npm run build 結果（確認済み）

```
✓ Compiled successfully in 3.7s
✓ TypeScript passed
✓ 13 pages generated (0 errors)
```

---

## Vercel 環境変数一覧

Vercel Dashboard → Settings → Environment Variables に以下をすべて設定すること。

### Supabase
| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonキー（公開可） | ✅ |
| `SUPABASE_SERVICE_KEY` | Supabase service_roleキー（サーバー側のみ） | ✅ |

### NextAuth
| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEXTAUTH_URL` | 本番URL（例: `https://kakeru.vercel.app`） | ✅ |
| `NEXTAUTH_SECRET` | ランダムな秘密鍵（ローカルと同じ値でOK） | ✅ |

### アプリURL
| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_APP_URL` | 本番URL（メール内リンクに使用。`NEXTAUTH_URL`と同じ値） | ✅ |

### メール（Resend）
| 変数名 | 説明 | 必須 |
|--------|------|------|
| `RESEND_API_KEY` | Resend APIキー | ✅ |
| `ADMIN_EMAIL` | テスト・リマインダーの送信先（Resend登録メール） | ✅ |

### AI・OCR
| 変数名 | 説明 | 必須 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI APIキー（AI分類） | ✅ |
| `GOOGLE_CLOUD_VISION_API_KEY` | Google Vision APIキー（OCR） | ✅ |

### Vercelに設定不要な変数（ローカル専用）
| 変数名 | 理由 |
|--------|------|
| `SUPABASE_ACCESS_TOKEN` | Supabase MCPクライアント用。アプリコードでは未使用 |
| `RESEND_FROM_EMAIL` | コードには未参照（`onboarding@resend.dev`を直接使用） |
| `ADMIN_NOTIFY_EMAIL` | コードには未参照（`ADMIN_EMAIL`を使用） |

---

## デプロイ手順

1. **GitHubにプッシュ**
   ```bash
   git add -A
   git commit -m "T-18: deploy prep"
   git push origin main
   ```

2. **Vercelプロジェクト作成**
   - vercel.com → Add New Project → GitHubリポジトリ選択
   - Framework: Next.js（自動検出）

3. **環境変数を設定**
   - 上記テーブルの「必須」変数をすべて入力
   - `NEXTAUTH_URL` と `NEXT_PUBLIC_APP_URL` はVercelが払い出すURL（`https://kakeru.vercel.app` 等）に変更

4. **Deploy**

5. **Supabase RLSの確認**
   - 本番環境で認証ユーザーのCRUDが通るか確認
   - `kak_receipts` Storageバケットのポリシーも確認

---

## 動作確認チェックリスト

- [ ] ログイン・ログアウト
- [ ] 新規登録
- [ ] 手動収支登録・編集・削除
- [ ] 画像アップロード（kak-receiptsバケット）
- [ ] OCR処理（Google Vision API）
- [ ] AI分類→確認フォーム（OpenAI）
- [ ] 確定申告プレビュー
- [ ] PDF出力（印刷ダイアログ表示）
- [ ] メール送信テスト（Resend）
- [ ] 年度設定・プロフィール編集（/settings）
- [ ] モバイル表示確認

---
