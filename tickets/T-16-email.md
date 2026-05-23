# T-16 Resendメール通知（申告期限リマインダー）

## 担当エージェント
@backend-architect


## 目的
確定申告期限（3月15日）前にリマインダーメールを送信する機能を実装する。

## 環境変数追加
```
RESEND_API_KEY=re_...
ADMIN_EMAIL=Resendに登録したメールアドレス
```

## 完了条件
- [ ] テストメールが送信できる
- [ ] メール送信ログがnotificationsテーブルに記録される

## 実装内容

```bash
npm install resend
```

### メール送信（`src/lib/email.ts`）
```ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReminderEmail(to: string, daysLeft: number) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,  // 開発環境ではADMIN_EMAILのみ
    subject: `【Kakeru】確定申告期限まで${daysLeft}日です`,
    html: `<p>確定申告期限（3月15日）まで残り${daysLeft}日です。</p>`,
  })
}
```

## 注意事項
- 送信先は開発環境ではResend登録メールのみ（100通/日制限）
- 独自ドメイン不要（`onboarding@resend.dev` を使用）

---