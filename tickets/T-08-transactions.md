# T-08 収支一覧・手動登録フォーム

## 担当エージェント
@frontend-developer @backend-architect


## 目的
収支データの一覧表示と手動入力フォームを実装する。
OCRなしでも使えるコア機能。

## 前提チケット
- T-03・T-04・T-05完了済みであること

## 完了条件
- [ ] `/transactions` に収支一覧が表示される
- [ ] 収入・支出のフィルタが動作する
- [ ] `/transactions/new` から新規登録できる
- [ ] 編集・削除ができる
- [ ] 登録後に一覧画面にリダイレクトされる

## 実装内容

### 一覧ページ（`app/(app)/transactions/page.tsx`）
- フィルタ：全件 / 収入のみ / 支出のみ
- ソート：日付降順
- 各行：日付・摘要・カテゴリ・金額・操作（編集・削除）
- 右上：「+ 新規登録」ボタン

### 登録フォーム（`app/(app)/transactions/new/page.tsx`）

| フィールド | 入力方式 |
|-----------|---------|
| 種別 | ラジオ（収入/支出） |
| 日付 | date input |
| 金額 | number input（円） |
| 摘要 | text input |
| 勘定科目 | select（categoriesから取得） |
| メモ | textarea（任意） |

### Server Action（`src/actions/transactions.ts`）
```ts
'use server'
export async function createTransaction(formData: FormData) { ... }
export async function updateTransaction(id: string, formData: FormData) { ... }
export async function deleteTransaction(id: string) { ... }
```

---