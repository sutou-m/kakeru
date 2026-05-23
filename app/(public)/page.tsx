import Link from 'next/link'
import { ScanLine, Brain, FileText, CheckCircle2 } from 'lucide-react'

/* ── 特徴セクション データ ── */
const features = [
  {
    icon: ScanLine,
    title: 'レシートをスキャンするだけ',
    description:
      '撮影するだけでAIが金額・日付・勘定科目を自動入力。手入力の手間をゼロにします。',
  },
  {
    icon: Brain,
    title: 'AIが科目を自動分類',
    description:
      '摘要から最適な勘定科目を提案。確認してタップするだけで帳簿が完成します。',
  },
  {
    icon: FileText,
    title: '申告書をそのまま出力',
    description:
      '入力したデータから確定申告書をプレビュー・印刷。税務署への提出もスムーズです。',
  },
]

/* ── 対象ユーザー データ ── */
const targetUsers = [
  'はじめて確定申告をする方',
  '毎年申告が面倒だと感じているフリーランス',
  '領収書の管理が煩雑になっている個人事業主',
]

/* ── コンポーネント ── */
export default function LandingPage() {
  return (
    <>
      {/* ─────────────────────────────────────
          Hero
      ───────────────────────────────────── */}
      <section className="px-6 py-20 md:py-32 text-center">
        <p className="inline-block text-xs font-medium tracking-widest text-[#E8884A] bg-[#F5E6D8] px-3 py-1 rounded-full mb-6 uppercase">
          For Freelancers
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#2D3B3B] leading-tight mb-6">
          確定申告を、
          <br className="hidden sm:block" />
          もっとシンプルに。
        </h1>
        <p className="text-base md:text-lg text-[#C4B49A] max-w-xl mx-auto mb-10 leading-relaxed">
          AIとスワイプ操作で、フリーランスの確定申告が完結するアプリ。
          <br className="hidden sm:block" />
          領収書を撮るだけで帳簿が自動完成します。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-[#E8884A] text-white hover:bg-[#D4733A] px-7 py-3.5 rounded-[10px] font-medium transition-colors text-sm md:text-base"
          >
            無料ではじめる
          </Link>
          <Link
            href="/login"
            className="bg-white text-[#2D3B3B] border border-[#E8E0D5] hover:bg-[#FAF7F3] px-7 py-3.5 rounded-[10px] font-medium transition-colors text-sm md:text-base"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────
          Features（3カラム）
      ───────────────────────────────────── */}
      <section className="bg-white border-y border-[#E8E0D5] px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2D3B3B] text-center mb-12">
            Kakeruでできること
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-[#FAF7F3] rounded-[16px] p-6 border border-[#E8E0D5]"
              >
                <div className="w-10 h-10 bg-[#F5E6D8] rounded-[10px] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#E8884A]" />
                </div>
                <h3 className="font-semibold text-[#2D3B3B] mb-2 text-sm md:text-base">
                  {title}
                </h3>
                <p className="text-sm text-[#C4B49A] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────
          対象ユーザー
      ───────────────────────────────────── */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2D3B3B] mb-10">
            こんな方におすすめ
          </h2>
          <ul className="space-y-4 text-left inline-block">
            {targetUsers.map((user) => (
              <li key={user} className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="text-[#E8884A] mt-0.5 shrink-0"
                />
                <span className="text-[#2D3B3B] text-sm md:text-base">{user}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────────────────────────────────
          CTA（最終）
      ───────────────────────────────────── */}
      <section className="bg-[#2D3B3B] px-6 py-16 md:py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          今すぐKakeruをはじめる
        </h2>
        <p className="text-[#C4B49A] mb-8 text-sm md:text-base">
          無料で始められます。クレジットカード不要。
        </p>
        <Link
          href="/register"
          className="inline-block bg-[#E8884A] text-white hover:bg-[#D4733A] px-8 py-3.5 rounded-[10px] font-medium transition-colors text-sm md:text-base"
        >
          無料で登録する
        </Link>
      </section>

      {/* ─────────────────────────────────────
          Footer
      ───────────────────────────────────── */}
      <footer className="border-t border-[#E8E0D5] bg-white px-6 py-6 text-center">
        <p className="text-xs text-[#C4B49A]">© 2025 Kakeru. All rights reserved.</p>
      </footer>
    </>
  )
}
