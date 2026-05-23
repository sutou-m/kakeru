# T-03 Supabaseセットアップ・全テーブル作成・RLS設定

## 担当エージェント
@backend-architect


## 目的
Supabase上にKakeruのデータベースを構築する。
全テーブルにRLSを設定し、セキュアなデータアクセスを実現する。

## 前提条件
- Supabaseプロジェクト作成済み（Region: Northeast Asia Tokyo）
- `.env.local` に接続情報が設定済み

```.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

## 完了条件
- [x] `lib/supabase.ts` にクライアントが作成されている（src/ 不在のため root 直下）
- [x] 全6テーブルがSupabase上に作成されている
- [x] 全テーブルにRLSポリシーが設定されている
- [x] `types/database.ts` に型定義が生成されている

## 実装内容

### 1. Supabaseクライアント（`src/lib/supabase.ts`）

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// クライアントサイド用（anon key）
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// サーバーサイド用（service key）※ Server Actionのみで使用
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
```

### 2. テーブル作成（Supabase MCPで実行）

#### users（NextAuth連携用）
```sql
create table kak_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);
```

#### tax_years（申告年度）
```sql
create table kak_tax_years (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references kak_users(id) on delete cascade not null,
  year integer not null,
  declaration_type text check (declaration_type in ('blue', 'white')) default 'white',
  is_active boolean default false,
  created_at timestamptz default now(),
  unique(user_id, year)
);
```

#### categories（勘定科目マスタ）
```sql
create table kak_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  icon text,
  sort_order integer default 0,
  is_default boolean default true
);
```

#### receipts（領収書画像）
```sql
create table kak_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references kak_users(id) on delete cascade not null,
  storage_path text not null,
  original_filename text,
  ocr_raw_text text,
  ocr_status text check (ocr_status in ('pending', 'processing', 'done', 'error')) default 'pending',
  created_at timestamptz default now()
);
```

#### transactions（収支データ）
```sql
create table kak_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references kak_users(id) on delete cascade not null,
  tax_year_id uuid references kak_tax_years(id) on delete cascade not null,
  type text check (type in ('income', 'expense')) not null,
  amount integer not null,
  date date not null,
  description text,
  category_id uuid references kak_categories(id),
  receipt_id uuid references kak_receipts(id),
  ai_suggested boolean default false,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### notifications（メール通知ログ）
```sql
create table kak_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references kak_users(id) on delete cascade not null,
  type text not null,
  sent_at timestamptz default now(),
  status text check (status in ('sent', 'failed')) default 'sent'
);
```

### 3. RLSポリシー設定（Supabase MCPで実行）

#### users
```sql
alter table users enable row level security;
create policy "自分のデータのみ参照・更新"
  on kak_users for all
  using (auth.uid() = id);
```

#### tax_years
```sql
alter table tax_years enable row level security;
create policy "自分の年度のみCRUD"
  on kak_tax_years for all
  using (auth.uid() = user_id);
```

#### categories（全員参照可・更新不可）
```sql
alter table categories enable row level security;
create policy "全員参照可"
  on kak_categories for select
  using (true);
```

#### receipts
```sql
alter table receipts enable row level security;
create policy "自分の領収書のみCRUD"
  on kak_receipts for all
  using (auth.uid() = user_id);
```

#### transactions
```sql
alter table transactions enable row level security;
create policy "自分の収支のみCRUD"
  on kak_transactions for all
  using (auth.uid() = user_id);
```

#### notifications
```sql
alter table notifications enable row level security;
create policy "自分の通知のみ参照"
  on kak_notifications for select
  using (auth.uid() = user_id);
```

### 4. カテゴリ初期データ投入
```sql
insert into kak_categories (name, type, sort_order) values
  ('売上・報酬', 'income', 1),
  ('その他収入', 'income', 2),
  ('交通費', 'expense', 1),
  ('通信費', 'expense', 2),
  ('消耗品費', 'expense', 3),
  ('接待交際費', 'expense', 4),
  ('外注費', 'expense', 5),
  ('広告宣伝費', 'expense', 6),
  ('地代家賃', 'expense', 7),
  ('水道光熱費', 'expense', 8),
  ('新聞図書費', 'expense', 9),
  ('その他経費', 'expense', 10);
```

### 5. 型定義ファイル（`src/types/database.ts`）

Supabaseの型をプロジェクトで使えるよう定義する。
SupabaseCLIで自動生成するか、手動で作成する。

## 注意事項
- Prismaは**絶対に使用しない**
- テーブル作成後は必ずRLSを有効化してからポリシーを追加する
- `supabaseAdmin`（service key）はServer Actionのみで使用。クライアントに露出させない
- Supabase Storage バケット `kak-receipts` も作成し、非公開設定にする
