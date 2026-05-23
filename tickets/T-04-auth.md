# T-04 NextAuth認証（ログイン・新規登録・セッション管理）

## 担当エージェント
@backend-architect @frontend-developer


## 目的
NextAuth.jsを使いメール＋パスワード認証を実装する。
認証済みユーザーのみダッシュボード以降にアクセスできるよう保護する。

## 前提チケット
- T-03（Supabase）完了済みであること

## 完了条件
- [x] `/auth/login` でログインができる
- [x] `/auth/register` で新規登録ができる
- [x] 未認証ユーザーが `/dashboard` にアクセスすると `/auth/login` にリダイレクトされる
- [x] ログアウトが動作する（`logoutAction` Server Action）
- [x] セッション情報からuser_idが取得できる（`session.user.id`）

## 実装内容

### 1. 必要パッケージ

```bash
npm install next-auth bcryptjs
npm install -D @types/bcryptjs
```

### 2. 環境変数（`.env.local`）

```
NEXTAUTH_SECRET=ランダム文字列（openssl rand -base64 32 で生成）
NEXTAUTH_URL=http://localhost:3000
```

### 3. NextAuth設定（`src/lib/auth.ts`）

CredentialsProviderを使用。
パスワードはbcryptjsでハッシュ化して保存・比較。

```ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        // Supabaseからユーザー取得 → bcrypt比較
        // 成功時: { id, email, name } を返す
        // 失敗時: null を返す
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    }
  }
})
```

### 4. ルートハンドラ（`app/api/auth/[...nextauth]/route.ts`）

```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

### 5. ミドルウェア（`middleware.ts`）

```ts
import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/auth/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 6. ページ構成

#### `/auth/login` （`app/auth/login/page.tsx`）
- メールアドレス・パスワード入力フォーム
- 「新規登録はこちら」リンク
- T-02のInput・Buttonコンポーネントを使用

#### `/auth/register` （`app/auth/register/page.tsx`）
- 名前・メールアドレス・パスワード入力フォーム
- Server Actionでパスワードをbcryptハッシュ化してSupabaseに保存
- 登録後 `/auth/login` にリダイレクト

### 7. Server Actionによる新規登録（`src/actions/auth.ts`）

```ts
'use server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const hashedPassword = await bcrypt.hash(password, 12)

  // usersテーブルにINSERT（auth_passwordカラムも追加が必要）
  const { error } = await supabaseAdmin
    .from('kak_users')
    .insert({ email, name, auth_password: hashedPassword })

  if (error) throw new Error('登録に失敗しました')
}
```

## 注意事項
- `NEXTAUTH_SECRET` は本番・開発で別の値を設定する
- `supabaseAdmin`（service key）はServer Actionのみで使用
- パスワードは平文で保存しない（必ずbcryptハッシュ化）
- usersテーブルに `auth_password text` カラムの追加が必要（T-03の定義に追加）
