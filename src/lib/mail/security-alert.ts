import nodemailer from "nodemailer";

export interface SessionReplacedAlertPayload {
  toEmail: string;
  studentName: string;
  newDeviceRaw: string;
  previousDeviceRaw?: string | null;
  loginTimeIso: string;
  siteUrl: string;
}

/**
 * Converts a raw HTTP User-Agent string into a clean, human-readable "Browser on OS" label.
 */
export function formatDeviceLabel(rawUserAgent?: string | null): string {
  if (!rawUserAgent) return "Web Browser";
  const ua = rawUserAgent.toLowerCase();

  let browser = "Web Browser";
  if (ua.includes("edg/")) {
    browser = "Microsoft Edge";
  } else if (ua.includes("opr/") || ua.includes("opera")) {
    browser = "Opera";
  } else if (ua.includes("chrome/") && !ua.includes("edg/")) {
    browser = "Google Chrome";
  } else if (ua.includes("firefox/")) {
    browser = "Mozilla Firefox";
  } else if (ua.includes("safari/") && !ua.includes("chrome/")) {
    browser = "Apple Safari";
  }

  let os = "Device";
  if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
  } else if (ua.includes("mac os x") || ua.includes("macintosh")) {
    os = "macOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return `${browser} on ${os}`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildSessionReplacedEmailHtml(
  payload: SessionReplacedAlertPayload
): string {
  const currentYear = new Date().getFullYear();
  const newDeviceFriendly = escapeHtml(formatDeviceLabel(payload.newDeviceRaw));
  const prevDeviceFriendly = escapeHtml(
    formatDeviceLabel(payload.previousDeviceRaw)
  );
  const safeEmail = escapeHtml(payload.toEmail);
  const formattedTime = new Date(payload.loginTimeIso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const cleanSiteUrl =
    payload.siteUrl.replace(/\/$/, "") || "https://examnestcollege.vercel.app";
  // Use public production logo URL when running on localhost so Gmail can render the image
  const logoBaseUrl = cleanSiteUrl.includes("localhost")
    ? "https://examnestcollege.vercel.app"
    : cleanSiteUrl;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Device Sign-In Alert | ExamNest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f5fb; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 460px; background-color: #ffffff; border-radius: 28px; border: 1px solid #e6e8f4; box-shadow: 0 20px 50px rgba(23, 27, 42, 0.06); overflow: hidden;">
          
          <!-- Top Accent Gradient Strip -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #5B4DFF 0%, #0088FF 50%, #F6C844 100%);"></td>
          </tr>

          <!-- Inner Content Padding -->
          <tr>
            <td style="padding: 36px 36px 32px 36px;">
              
              <!-- Brand Header (ExamNest Logo + Name) -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td valign="middle" style="padding-right: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background-color: #0052cc; overflow: hidden; display: inline-block; line-height: 40px; text-align: center;">
                      <img
                        src="${logoBaseUrl}/logo.png"
                        alt="N"
                        width="40"
                        height="40"
                        style="display: block; width: 40px; height: 40px; border-radius: 12px; object-fit: cover; color: #ffffff; font-weight: 900; font-size: 20px;"
                      />
                    </div>
                  </td>
                  <td valign="middle">
                    <div style="font-size: 19px; font-weight: 800; color: #171b2a; letter-spacing: -0.4px; line-height: 1.1;">
                      ExamNest
                    </div>
                    <div style="font-size: 10px; font-weight: 700; color: #8c90a4; text-transform: uppercase; letter-spacing: 1.4px; margin-top: 2px;">
                      The Engineering School
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Headline & Minimal Copy -->
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #171b2a; letter-spacing: -0.3px;">
                New device sign-in detected
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #5d5c73; line-height: 1.6;">
                Your ExamNest account (<strong style="color: #171b2a;">${safeEmail}</strong>) was just signed in on a new device or browser. Because ExamNest enforces a strict <strong style="color: #171b2a;">Single-Device Policy</strong>, your previous active session was immediately expired.
              </p>

              <!-- Sleek Security Status Vault Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 26px;">
                <tr>
                  <td style="background-color: #faf8ff; border: 1.5px solid #dee1f7; border-radius: 20px; padding: 22px 20px;">
                    <div style="text-align: center; margin-bottom: 14px;">
                      <span style="display: inline-block; padding: 5px 12px; border-radius: 999px; background-color: #fffbeb; border: 1px solid #fde68a; font-size: 10px; font-weight: 800; color: #d97706; text-transform: uppercase; letter-spacing: 1.3px;">
                        ⚡ Previous Session Expired
                      </span>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12px; color: #5d5c73;">
                      <tr>
                        <td style="padding: 5px 0; font-weight: 600; color: #8c90a4;">New Active Device:</td>
                        <td align="right" style="padding: 5px 0; font-weight: 800; color: #171b2a;">${newDeviceFriendly}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-weight: 600; color: #8c90a4;">Expired Device:</td>
                        <td align="right" style="padding: 5px 0; font-weight: 700; color: #5d5c73;">${prevDeviceFriendly}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-weight: 600; color: #8c90a4;">Time (IST):</td>
                        <td align="right" style="padding: 5px 0; font-weight: 700; color: #171b2a;">${escapeHtml(formattedTime)} IST</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Unauthorized Activity Warning & Action -->
              <p style="margin: 0; font-size: 12px; color: #8c90a4; line-height: 1.6;">
                <strong style="color: #e11d48;">Wasn’t you?</strong> Someone else may have your password. Please <a href="${cleanSiteUrl}/sign-in" style="color: #5B4DFF; font-weight: 700; text-decoration: none;">reset your password immediately</a> to terminate their session and secure your account.
              </p>

            </td>
          </tr>

          <!-- Subtle Bottom Footer (Dynamic Year) -->
          <tr>
            <td style="background-color: #faf8ff; border-top: 1px solid #f0f2f8; padding: 18px 36px; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #8c90a4;">
                © ${currentYear} ExamNest · Curricular Standard &amp; Academic Workspace
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends the "New Device Sign-In & Previous Session Expired" security notification email via SMTP.
 */
export async function sendSessionReplacedEmail(
  payload: SessionReplacedAlertPayload
): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom =
    process.env.SMTP_FROM ||
    (smtpUser ? `ExamNest <${smtpUser}>` : "ExamNest <noreply@examnest.org>");

  if (!smtpUser || !smtpPass) {
    console.warn(
      "[ExamNest Security Alert] Skipping new-device email notification because SMTP_USER or SMTP_PASS is not configured in .env."
    );
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const html = buildSessionReplacedEmailHtml(payload);

    await transporter.sendMail({
      from: smtpFrom,
      to: payload.toEmail,
      subject:
        "Security Alert: New device sign-in (Previous ExamNest session expired)",
      html,
    });

    return true;
  } catch (err) {
    console.error(
      "[ExamNest Security Alert] Failed to send session replaced email:",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}
