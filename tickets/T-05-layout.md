# T-05 レイアウト（公開ヘッダー・認証後サイドバー）

## 担当エージェント
@ui-designer @frontend-developer


## 目的
公開ページ用と認証後ページ用の2種類のレイアウトを実装する。
App Routerのルートグループ機能を使い、レイアウトを分離する。

## 前提チケット
- T-01（デザインシステム）完了済みであること
- T-02（UIコンポーネント）完了済みであること
- T-04（認証）完了済みであること

## 完了条件
- [x] 公開ページはシンプルなヘッダーのみ表示される
- [x] 認証後ページはサイドバー＋コンテンツエリアのレイアウトになっている
- [x] サイドバーのナビゲーションリンクがすべて正しく動作する
- [x] モバイル表示でハンバーガーメニューが動作する（ドロワー実装）

## ルートグループ構成

```
app/
  (public)/               ← 公開ページ（ヘッダーのみ）
    layout.tsx
    page.tsx              ← LP
  (auth)/                 ← 認証ページ（レイアウトなし）
    layout.tsx
    login/page.tsx
    register/page.tsx
  (app)/                  ← 認証後ページ（サイドバーあり）
    layout.tsx
    dashboard/page.tsx
    transactions/
      page.tsx
      new/page.tsx
    receipts/
      upload/page.tsx
    tax-report/
      page.tsx
      print/page.tsx
    settings/page.tsx
```

## 実装内容

### 1. 公開レイアウト（`app/(public)/layout.tsx`）

```tsx
// シンプルなヘッダー（ロゴ + ログインボタン）
// bg-[#F5F0E8] ベースの軽量レイアウト
```

ヘッダー内容：
- 左：Kakeruロゴ（テキストロゴでもOK、テラコッタ色）
- 右：「ログイン」ボタン（secondary variant）

### 2. 認証後レイアウト（`app/(app)/layout.tsx`）

```tsx
// 左：固定サイドバー (240px)
// 右：スクロール可能なメインコンテンツエリア
// 全体背景: bg-[#F5F0E8]
```

#### サイドバー構成
```
[K] Kakeru              ← ロゴ（テラコッタ）

ナビゲーション
  ダッシュボード         /dashboard
  収支一覧              /transactions
  領収書OCR             /receipts/upload
  確定申告              /tax-report

────────────────
設定                    /settings
ログアウト
```

#### アクティブリンクのスタイル
- 非アクティブ: `text-[#C4B49A] hover:text-[#2D3B3B] hover:bg-[#FAF7F3]`
- アクティブ: `bg-[#F5E6D8] text-[#E8884A] font-medium`

### 3. 認証なしレイアウト（`app/(auth)/layout.tsx`）

```tsx
// 中央寄せ・シンプル
// ロゴ + フォームカードのみ
// bg-[#F5F0E8]
```

## アイコン
サイドバーのナビゲーションにはlucide-reactを使用する。

```bash
npm install lucide-react
```

| ページ | アイコン |
|--------|---------|
| ダッシュボード | `LayoutDashboard` |
| 収支一覧 | `ArrowLeftRight` |
| 領収書OCR | `ScanLine` |
| 確定申告 | `FileText` |
| 設定 | `Settings` |
| ログアウト | `LogOut` |

## 注意事項
- サイドバーは `'use client'` が必要（usePathnameでアクティブ判定）
- レイアウトは Server Component のままにし、サイドバー部分だけ切り出してClient Componentにする
- モバイル対応は最低限でOK（`md:block hidden` でサイドバー切替）
