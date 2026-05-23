import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'onboarding@resend.dev'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/* ── HTML メールテンプレート ── */
function buildHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Hiragino Sans','Yu Gothic',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #E8E0D5;">
    <!-- ヘッダー -->
    <div style="background:#2D3B3B;padding:24px 32px;">
      <p style="margin:0;color:#C4B49A;font-size:11px;letter-spacing:2px;text-transform:uppercase;">KAKERU</p>
      <h1 style="margin:8px 0 0;color:white;font-size:20px;font-weight:700;">${title}</h1>
    </div>
    <!-- 本文 -->
    <div style="padding:32px;">
      ${body}
      <div style="margin-top:32px;text-align:center;">
        <a href="${APP_URL}/dashboard"
           style="display:inline-block;background:#E8884A;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">
          Kakeruを開く
        </a>
      </div>
    </div>
    <!-- フッター -->
    <div style="background:#FAF7F3;padding:16px 32px;border-top:1px solid #E8E0D5;">
      <p style="margin:0;font-size:11px;color:#C4B49A;text-align:center;">
        © 2025 Kakeru — このメールはシステムから自動送信されています
      </p>
    </div>
  </div>
</body>
</html>`
}

/* ── 申告期限リマインダー ── */
export async function sendReminderEmail(to: string, daysLeft: number): Promise<void> {
  const title = `確定申告期限まで${daysLeft}日です`
  const body = `
    <p style="color:#2D3B3B;font-size:15px;line-height:1.7;">
      確定申告の期限（3月15日）まで残り <strong style="color:#E8884A;">${daysLeft}日</strong> となりました。
    </p>
    <p style="color:#666;font-size:14px;line-height:1.7;">
      Kakeruで収支データを確認し、申告書の準備を進めましょう。<br>
      領収書のOCR読み取りや収支の一括入力もアプリから行えます。
    </p>
    <div style="background:#F5E6D8;border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;color:#2D3B3B;font-size:14px;">
        📅 申告期限：翌年3月15日（日曜日の場合は翌月曜日）
      </p>
    </div>`

  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `【Kakeru】${title}`,
    html: buildHtml(title, body),
  })

  if (error) throw new Error(`Resend エラー: ${error.message}`)
}

/* ── テストメール ── */
export async function sendTestEmail(to: string): Promise<void> {
  const title = 'テスト送信が成功しました'
  const body = `
    <p style="color:#2D3B3B;font-size:15px;line-height:1.7;">
      Kakeruからのメール送信が正常に動作しています。
    </p>
    <p style="color:#666;font-size:14px;line-height:1.7;">
      このメールは設定画面からのテスト送信です。<br>
      実際のリマインダーメールは申告期限前に自動送信されます。
    </p>`

  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: '【Kakeru】テストメール',
    html: buildHtml(title, body),
  })

  if (error) throw new Error(`Resend エラー: ${error.message}`)
}
