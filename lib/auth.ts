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

        const email = credentials?.email as string
        const password = credentials?.password as string

        console.log('[auth] credentials:', {
          email,
          hasPassword: !!password,
        })

        if (!email || !password) return null

        const { data: user, error } = await supabaseAdmin
          .from('kak_users')
          .select('*')
          .eq('email', email)
          .single()

        console.log('[auth] user query result:', {
          found: !!user,
          error: error?.message,
        })

        if (!user || !user.auth_password) return null

        const isValid = await bcrypt.compare(password, user.auth_password as string)
        console.log('[auth] bcrypt result:', isValid)

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
