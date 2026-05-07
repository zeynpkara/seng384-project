import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'noreply@healthai.edu',
    to,
    subject: 'HEALTH AI - Verify Your Email',
    text: [
      'Welcome to HEALTH AI.',
      '',
      'Please verify your institutional email by opening the link below:',
      link,
      '',
      'If you did not create this account, you can ignore this email.',
    ].join('\n'),
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0E0E0E;font-family:'Space Grotesk',sans-serif;color:#e6e0e9;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#141218;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:32px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;">
                <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.05em;">HEALTH AI</span>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 32px;">
                <h1 style="margin:0 0 16px;font-size:24px;color:#fff;font-weight:700;">Verify Your Email</h1>
                <p style="margin:0 0 32px;color:rgba(255,255,255,0.6);line-height:1.6;">
                  Welcome to the HEALTH AI platform. Click the button below to verify your institutional email and activate your account.
                </p>
                <a href="${link}" style="display:inline-block;background:#cfbcff;color:#381e72;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">
                  Verify Email
                </a>
                <p style="margin:32px 0 0;color:rgba(255,255,255,0.3);font-size:12px;">
                  Or copy this link: <a href="${link}" style="color:#cfbcff;">${link}</a>
                </p>
                <p style="margin:16px 0 0;color:rgba(255,255,255,0.2);font-size:11px;">
                  If you did not register, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
                <span style="color:rgba(255,255,255,0.2);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">HEALTH AI</span>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}
