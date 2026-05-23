# T-01 デザインシステム（CSS変数・トークン定義）

## 担当エージェント
@ui-designer


## 目的
Kakeruのブランドカラー「テラコッタ × リネン」をTailwind CSS v4のCSS変数として定義し、
全コンポーネントで一貫したデザインを実現する基盤を構築する。

## 完了条件
- [x] `app/globals.css` にKakeruデザイントークンが定義されている
- [x] `tailwind.config.ts` でカスタムカラーが使用可能になっている（Tailwind v4のため `@theme inline` でCSS内に定義）
- [x] Tailwind組み込みの `gray-*` を使用していない
- [x] ダークモード対応のCSS変数構造になっている（将来対応のため）
- [x] 開発サーバーで `npm run dev` が正常起動する

## 実装内容

### 1. デザイントークン定義（`app/globals.css`）

以下のCSS変数を定義する。

```css
:root {
  /* ── Brand Colors ── */
  --color-primary: #E8884A;        /* テラコッタ：CTAボタン・アクセント */
  --color-primary-hover: #D4733A;  /* ホバー時（10%暗く） */
  --color-primary-light: #F5E6D8;  /* 薄いテラコッタ：背景・バッジ */

  --color-bg: #F5F0E8;             /* リネン：ページ背景 */
  --color-surface: #FFFFFF;        /* カード・モーダル背景 */
  --color-surface-secondary: #FAF7F3; /* サブカード背景 */

  --color-dark: #2D3B3B;           /* ディープティール：メインテキスト */
  --color-sand: #C4B49A;           /* サンド：ミュートテキスト・ボーダー */
  --color-border: #E8E0D5;         /* ボーダー */

  /* ── Semantic Colors ── */
  --color-success: #16A34A;
  --color-danger: #DC2626;
  --color-warning: #D97706;
  --color-info: #2563EB;

  /* ── Typography ── */
  --font-sans: 'Noto Sans JP', system-ui, sans-serif;

  /* ── Spacing / Radius ── */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

### 2. Tailwindカスタムカラー設定（`tailwind.config.ts`）

```ts
colors: {
  primary: {
    DEFAULT: '#E8884A',
    hover: '#D4733A',
    light: '#F5E6D8',
  },
  bg: '#F5F0E8',
  surface: '#FFFFFF',
  'surface-secondary': '#FAF7F3',
  dark: '#2D3B3B',
  sand: '#C4B49A',
  border: '#E8E0D5',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',
}
```

### 3. フォント設定（`app/layout.tsx`）

Google FontsからNoto Sans JPを読み込む。

```tsx
import { Noto_Sans_JP } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
})
```

### 4. ベーススタイル（`app/globals.css` に追記）

```css
body {
  background-color: var(--color-bg);
  color: var(--color-dark);
  font-family: var(--font-sans);
}
```

## 注意事項
- `gray-50` `gray-100` 等Tailwind組み込みのgray系は**絶対に使用しない**
- ボタンの `background-color` はCSS変数ではなく**HEX値直書き**（デグレ防止）
  - 例: `className="bg-[#E8884A] hover:bg-[#D4733A]"`
- CSS変数はあくまでリファレンス用途。ボタン等の重要UIはHEX直書きを優先

## 参考カラーイメージ
| 用途 | トークン | HEX |
|------|---------|-----|
| CTAボタン | primary | #E8884A |
| ページ背景 | bg | #F5F0E8 |
| テキスト | dark | #2D3B3B |
| ミュート | sand | #C4B49A |
| カード | surface | #FFFFFF |
