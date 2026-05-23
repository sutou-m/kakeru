# T-02 共通UIコンポーネント

## 担当エージェント
@ui-designer @frontend-developer


## 目的
アプリ全体で使い回す基本UIパーツを作成する。
T-01のデザイントークンを使い、一貫したKakeruブランドのUIを実現する。

## 前提チケット
- T-01（デザインシステム）完了済みであること

## 完了条件
- [x] `components/ui/` 以下に全コンポーネントが作成されている（`src/` 不在のため root 直下）
- [x] 全コンポーネントがTypeScriptで型定義されている
- [x] ボタンのテキストが正しく表示される（HEX直書き、CSS変数不使用）
- [x] `npm run build` がエラーなく通る

## 実装内容

### ディレクトリ構成
```
src/
  components/
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
      Badge.tsx
      Label.tsx
      Spinner.tsx
      PageHeader.tsx
    layout/
      Header.tsx       ← T-05で実装
      Sidebar.tsx      ← T-05で実装
```

### Button.tsx

variantは `primary` / `secondary` / `danger` / `ghost` の4種。
**背景色はHEX直書き**（CSS変数不使用）。

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

// primary: bg-[#E8884A] text-white hover:bg-[#D4733A]
// secondary: bg-white text-[#2D3B3B] border border-[#E8E0D5] hover:bg-[#FAF7F3]
// danger: bg-[#DC2626] text-white hover:bg-[#B91C1C]
// ghost: bg-transparent text-[#E8884A] hover:bg-[#F5E6D8]
```

### Input.tsx

```tsx
type InputProps = {
  label?: string
  error?: string
  hint?: string
} & React.InputHTMLAttributes<HTMLInputElement>

// border: border-[#E8E0D5]
// focus: focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A]
// error: border-[#DC2626]
```

### Card.tsx

```tsx
type CardProps = {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

// bg-white rounded-[16px] border border-[#E8E0D5]
// shadow-sm
```

### Badge.tsx

```tsx
type BadgeProps = {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  children: React.ReactNode
}

// primary: bg-[#F5E6D8] text-[#E8884A]
// success: bg-green-50 text-green-700
// danger: bg-red-50 text-red-700
// neutral: bg-[#FAF7F3] text-[#C4B49A]
```

### Spinner.tsx

ローディング表示用。OCR処理待ち等で使用。

```tsx
// テラコッタ色のスピナー
// border-[#E8884A]
```

### PageHeader.tsx

各ページ上部の見出しエリア。

```tsx
type PageHeaderProps = {
  title: string
  description?: string
  action?: React.ReactNode  // 右側にボタン配置
}
```

## 注意事項
- `className` に `text-gray-*` `bg-gray-*` を**絶対に使用しない**
- テキスト色のデフォルトは `text-[#2D3B3B]`、ミュートは `text-[#C4B49A]`
- ボタンに `disabled` 状態のスタイルを必ず実装する（`opacity-50 cursor-not-allowed`）
- Server ComponentとClient Componentの使い分けに注意
  - インタラクション（onClick等）がある → `'use client'` 必須
