import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");
// Must be a Single Sender verified in SendGrid (no custom domain needed —
// just a confirmation-link click on an email address you own), or an
// authenticated domain if one's ever added later.
const FROM = process.env.EMAIL_FROM ?? "";

async function send(opts: { to: string; subject: string; text: string; html: string }): Promise<void> {
  if (!FROM) throw new Error("EMAIL_FROM is not configured.");
  try {
    // @sendgrid/mail rejects its promise on API-level failures (bad key,
    // unverified sender, etc.), so callers' existing try/catch blocks work
    // correctly without extra handling.
    await sgMail.send({ from: FROM, ...opts });
  } catch (err) {
    const sgError = err as { response?: { body?: unknown } };
    console.error("[SENDGRID]", sgError.response?.body ?? err);
    throw err;
  }
}

function codeEmailHtml(opts: { title: string; greeting: string; code: string; footerNote: string }): string {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">

                  <!-- Header -->
                  <tr>
                    <td style="background:#0f172a;padding:28px 40px;text-align:center;">
                      <span style="font-size:28px;">⚡</span>
                      <span style="color:#ffffff;font-size:20px;font-weight:700;margin-left:8px;vertical-align:middle;">
                        ReadLite
                      </span>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
                        ${opts.title}
                      </p>
                      <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                        ${opts.greeting}
                      </p>

                      <!-- Code box -->
                      <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                        <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#0f172a;font-family:monospace;">
                          ${opts.code}
                        </span>
                      </div>

                      <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
                        ${opts.footerNote}
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="margin:0;font-size:12px;color:#94a3b8;">
                        © ${new Date().getFullYear()} ReadLite. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  firstName: string
): Promise<void> {
  await send({
    to: email,
    subject: "Your ReadLite verification code",
    text: `Hi ${firstName},\n\nYour verification code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you didn't request this, you can ignore this email.\n\n— The ReadLite Team`,
    html: codeEmailHtml({
      title: "Verify your email",
      greeting: `Hi ${firstName}, thanks for joining ReadLite! Enter the code below to confirm your email address.`,
      code,
      footerNote: `This code expires in <strong>15 minutes</strong>. If you didn't sign up for ReadLite, you can safely ignore this email.`,
    }),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  code: string,
  firstName: string
): Promise<void> {
  await send({
    to: email,
    subject: "Reset your ReadLite password",
    text: `Hi ${firstName},\n\nYour password reset code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email — your password won't be changed.\n\n— The ReadLite Team`,
    html: codeEmailHtml({
      title: "Reset your password",
      greeting: `Hi ${firstName}, we received a request to reset your ReadLite password. Enter the code below to continue.`,
      code,
      footerNote: `This code expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email — your password won't be changed.`,
    }),
  });
}

export async function sendGoogleAccountNotice(
  email: string,
  firstName: string
): Promise<void> {
  await send({
    to: email,
    subject: "About your ReadLite password reset request",
    text: `Hi ${firstName},\n\nSomeone requested a password reset for this ReadLite account, but it was created with "Sign in with Google" and doesn't have a password. Please use the "Continue with Google" button on the sign-in page instead.\n\nIf this wasn't you, you can safely ignore this email.\n\n— The ReadLite Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
                  <tr>
                    <td style="background:#0f172a;padding:28px 40px;text-align:center;">
                      <span style="font-size:28px;">⚡</span>
                      <span style="color:#ffffff;font-size:20px;font-weight:700;margin-left:8px;vertical-align:middle;">
                        ReadLite
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
                        This account uses Google Sign-In
                      </p>
                      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
                        Hi ${firstName}, someone requested a password reset for this ReadLite account,
                        but it was created with "Sign in with Google" and doesn't have a separate
                        password. Use the <strong>Continue with Google</strong> button on the sign-in
                        page instead.
                      </p>
                      <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
                        If this wasn't you, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="margin:0;font-size:12px;color:#94a3b8;">
                        © ${new Date().getFullYear()} ReadLite. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}
