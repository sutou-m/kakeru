# T-15 PDF出力（window.print() + 印刷CSS）

## 担当エージェント
@frontend-developer


## 目的
確定申告書プレビューをPDFとして出力できるようにする。

## 前提チケット
- T-14完了済みであること

## 完了条件
- [ ] 「PDF出力」ボタンクリックで印刷ダイアログが開く
- [ ] 印刷時にサイドバー・ヘッダーが非表示になる
- [ ] 日本語が文字化けしない

## 実装内容

### 印刷用CSS（`app/(app)/tax-report/print/page.tsx`）
```css
@media print {
  .no-print { display: none !important; }
  body { background: white; color: black; }
  @page { margin: 20mm; }
}
```

### 出力ボタン
```tsx
<Button onClick={() => window.print()}>
  PDFとして保存
</Button>
```

## 注意事項
- jsPDFは日本語フォント埋め込みが必要で複雑なため**使用しない**
- `window.print()` で十分な品質が出る

---