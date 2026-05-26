import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        console.log('[auth] ENV CHECK', {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
        })

        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        console.log('[auth] authorize called', {
          email,
          passwordLength: password?.length ?? 0,
          passwordBytes: password ? Buffer.from(password).length : 0,
        })

        if (!email || !password) {
          console.log('[auth] missing credentials')
          return null
        }

        const query = supabaseAdmin
          .from('kak_users')
          .select('id, email, name, auth_password')
          .eq('email', email)
          .single()

        console.log('[auth] querying kak_users for email:', email)

        const { data: user, error: dbError } = await query

        console.log('[auth] db result', {
          found: !!user,
          hasPassword: !!user?.auth_password,
          dbError: dbError?.message ?? null,
        })

        if (!user?.auth_password) return null

        const isValid = await bcrypt.compare(password, user.auth_password)

        console.log('[auth] bcrypt.compare result:', isValid)

        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name ?? undefined }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
})
