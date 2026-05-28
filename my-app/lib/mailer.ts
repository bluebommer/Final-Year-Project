import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true", // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  code: string,
  firstName: string
): Promise<void> {
  await transporter.sendMail({
    from: `"ReadLite" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: email,
    subject: "Your ReadLite verification code",
    text: `Hi ${firstName},\n\nYour verification code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you didn't request this, you can ignore this email.\n\n— The ReadLite Team`,
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
                        Verify your email
                      </p>
                      <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                        Hi ${firstName}, thanks for joining ReadLite! Enter the code below
                        to confirm your email address.
                      </p>

                      <!-- Code box -->
                      <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                        <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#0f172a;font-family:monospace;">
                          ${code}
                        </span>
                      </div>

                      <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
                        This code expires in <strong>15 minutes</strong>.
                        If you didn't sign up for ReadLite, you can safely ignore this email.
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
    `,
  });
}