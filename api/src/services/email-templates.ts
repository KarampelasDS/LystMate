const BASE_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

const layout = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LystMate</title>
</head>
<body style="margin:0;padding:0;background:#f5ede3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:26px;font-weight:700;color:#2c1810;font-family:Georgia,serif;letter-spacing:-0.5px;">LystMate</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;border:1px solid #e8d5c0;padding:40px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;font-size:12px;color:#9b7d6a;">
              © ${new Date().getFullYear()} LystMate &nbsp;·&nbsp; your shared lists, simplified
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#2c1810;color:#fff8f0;text-decoration:none;font-size:14px;font-weight:500;padding:12px 28px;border-radius:12px;margin-top:8px;">${label}</a>`;

const heading = (text: string) =>
  `<h1 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif;color:#2c1810;font-weight:normal;">${text}</h1>`;

const para = (text: string) =>
  `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4a2c1a;">${text}</p>`;

const muted = (text: string) =>
  `<p style="margin:24px 0 0;font-size:12px;color:#9b7d6a;line-height:1.5;">${text}</p>`;

export const welcomeEmail = (name: string, token: string) =>
  layout(`
    ${heading(`Welcome, ${name}!`)}
    ${para("Thanks for signing up. Verify your email address to get started. The link expires in 24 hours.")}
    <div style="text-align:center;margin:8px 0 28px;">
      ${button(`${BASE_URL}/verify-email?token=${token}`, "Verify email address")}
    </div>
    ${muted("If you didn't create a LystMate account, you can safely ignore this email.")}
  `);

export const verifyEmailEmail = (token: string) =>
  layout(`
    ${heading("Verify your email address")}
    ${para("Click the button below to verify your new email address. This link expires in 24 hours.")}
    <div style="text-align:center;margin:8px 0 28px;">
      ${button(`${BASE_URL}/verify-email?token=${token}`, "Verify email address")}
    </div>
    ${muted("If you didn't request this, you can safely ignore this email.")}
  `);

export const emailChangeAlertEmail = (newEmail: string) =>
  layout(`
    ${heading("Security alert")}
    ${para(`A request was made to change the email address on your account to <strong>${newEmail}</strong>.`)}
    ${para("If this was you, no action is needed — the change will take effect once the new address is verified.")}
    ${muted("If you did not make this request, please contact support immediately.")}
  `);

export const resetPasswordEmail = (token: string) =>
  layout(`
    ${heading("Reset your password")}
    ${para("We received a request to reset your password. Click the button below to choose a new one. The link expires in 1 hour.")}
    <div style="text-align:center;margin:8px 0 28px;">
      ${button(`${BASE_URL}/reset-password?token=${token}`, "Reset password")}
    </div>
    ${muted("If you didn't request a password reset, you can safely ignore this email. Your password will not change.")}
  `);
