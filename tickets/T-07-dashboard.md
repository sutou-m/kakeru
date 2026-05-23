# T-07 ダッシュボード（収支サマリ・グラフ）

## 担当エージェント
@frontend-developer @ui-designer


## 目的
ログイン後に最初に表示される画面。今年の収支状況を一目で把握できるダッシュボードを実装する。

## 前提チケット
- T-03（Supabase）・T-04（認証）・T-05（レイアウト）完了済みであること

## 完了条件
- [x] `/dashboard` に収支サマリが表示される
- [x] 月次推移グラフが表示される
- [x] カテゴリ別支出グラフが表示される
- [x] データが0件の場合の空状態（Empty State）が表示される

## 実装内容

### サマリカード（4枚）
| カード | 内容 |
|--------|------|
| 今年の収入 | income合計（円） |
| 今年の支出 | expense合計（円） |
| 差引利益 | 収入 - 支出（円） |
| 申告期限まで | 翌年3/15までの残り日数 |

### グラフ
- 月次収支推移：棒グラフ（recharts使用）
- カテゴリ別支出：円グラフ（recharts使用）

```bash
npm install recharts
```

### データ取得
Server ComponentからSupabaseで直接取得する。

```ts
const { data } = await supabase
  .from('kak_transactions')
  .select('*, categories(name, type)')
  .eq('user_id', userId)
  .eq('tax_year_id', activeYearId)
```

## 注意事項
- rechartsはClient Component内でのみ使用可能（`'use client'`必須）
- グラフコンポーネントだけ切り出してClient Componentにする
- 金額表示は `toLocaleString('ja-JP')` で3桁カンマ区切り

---