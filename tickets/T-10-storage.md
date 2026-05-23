# T-10 Supabase Storage設定・画像アップロード基盤

## 担当エージェント
@backend-architect


## 目的
領収書画像のアップロード基盤を構築する。

## 前提チケット
- T-03完了済みであること

## 完了条件
- [ ] Supabase Storageに `kak-receipts` バケットが作成されている（非公開）← 管理画面から手動で作成
- [x] 画像アップロードのServer Actionが動作する
- [x] アップロード上限が10MBに設定されている

## 実装内容

### next.config.tsの設定
```ts
export default {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}
```

### アップロードServer Action（`src/actions/receipts.ts`）
```ts
'use server'
export async function uploadReceipt(formData: FormData) {
  const file = formData.get('file') as File
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const filename = `${userId}/${Date.now()}-${file.name}`

  const { data, error } = await supabaseAdmin.storage
    .from('kak_receipts')
    .upload(filename, buffer, { contentType: file.type })

  // receiptsテーブルにメタデータを保存
}
```

### Storage RLSポリシー
```sql
-- 自分のフォルダのみアクセス可
create policy "自分のファイルのみ"
  on storage.objects for all
  using (auth.uid()::text = (storage.foldername(name))[1]);
```

---