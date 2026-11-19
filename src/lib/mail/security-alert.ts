import { isEmailProviderConfigured, sendPlatformEmail } from "@/lib/mail/mailer";
import { formatDeviceLabel } from "@/lib/utils/device";

export { formatDeviceLabel };

export interface SessionReplacedAlertPayload {
  toEmail: string;
  studentName: string;
  newDeviceRaw: string;
  previousDeviceRaw?: string | null;
  loginTimeIso: string;
  siteUrl: string;
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
    payload.siteUrl.replace(/\/$/, "") || "https://qoncepto.com";
  // Use public production logo URL when running on localhost so Gmail can render the image
  const logoBaseUrl = cleanSiteUrl.includes("localhost")
    ? "https://qoncepto.com"
    : cleanSiteUrl;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Device Sign-In Alert | Qoncepto</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 460px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04); overflow: hidden;">
          
          <!-- Subtle Charcoal Accent Bar -->
          <tr>
            <td style="height: 3px; background-color: #0f172a;"></td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 32px 32px;">
              
              <!-- Brand Header -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td valign="middle" style="padding-right: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background-color: #ffffff; border: 1px solid #e2e8f0; overflow: hidden; display: inline-block; line-height: 34px; text-align: center;">
                      <img
                        src="${logoBaseUrl}/logo.png"
                        alt="Q"
                        width="30"
                        height="30"
                        style="display: inline-block; vertical-align: middle; width: 30px; height: 30px; border-radius: 6px; object-fit: contain;"
                      />
                    </div>
                  </td>
                  <td valign="middle">
                    <div style="font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; line-height: 1.1;">
                      Qoncepto
                    </div>
                    <div style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 3px;">
                      Syllabus To Mastery
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Headline & Copy -->
              <h1 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
                New device sign-in detected
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                Your Qoncepto account (<strong style="color: #0f172a;">${safeEmail}</strong>) was just signed in on a new device. Because Qoncepto enforces a strict <strong style="color: #0f172a;">Single-Device Policy</strong>, your previous active session was immediately signed out.
              </p>

              <!-- Hand-Written / Drafted Style Session Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px 18px;">
                    <div style="font-family: 'Courier New', Courier, Monaco, monospace; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 12px; text-align: center;">
                      SESSION ACTIVITY LOG
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12px; color: #475569;">
                      <tr>
                        <td style="padding: 6px 0; font-weight: 500; color: #64748b;">New Active Device:</td>
                        <td align="right" style="padding: 6px 0; font-weight: 700; color: #0f172a;">${newDeviceFriendly}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-weight: 500; color: #64748b;">Previous Session:</td>
                        <td align="right" style="padding: 6px 0; font-weight: 600; color: #64748b;">${prevDeviceFriendly} (Previous Session Expired)</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-weight: 500; color: #64748b;">Time (IST):</td>
                        <td align="right" style="padding: 6px 0; font-weight: 600; color: #334155;">${escapeHtml(formattedTime)} IST</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Unauthorized Activity Warning & Action -->
              <p style="margin: 0 0 20px 0; font-size: 12px; color: #64748b; line-height: 1.6;">
                <strong style="color: #0f172a;">Wasn’t you?</strong> Someone else may know your password. Please <a href="${cleanSiteUrl}/reset-password" style="color: #0f172a; font-weight: 700; text-decoration: underline;">reset your password immediately</a> to terminate any unauthorized session and secure your workspace.
              </p>

              <!-- Courtesy Sign-off (Personal touch) -->
              <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                — <strong style="color: #0f172a; font-weight: 600;">Team Qoncepto</strong>
              </p>

            </td>
          </tr>

          <!-- Minimal Clean Footer -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #f1f5f9; padding: 16px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-weight: 500; color: #94a3b8; line-height: 1.5;">
                © ${currentYear} Qoncepto · Curricular Standard &amp; Academic Workspace<br />
                This is an automated security alert regarding your active session.
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
 * Sends the "New Device Sign-In & Previous Session Expired" security notification email via edge-compatible HTTP API.
 */
export async function sendSessionReplacedEmail(
  payload: SessionReplacedAlertPayload
): Promise<boolean> {
  if (!isEmailProviderConfigured()) {
    console.warn(
      "[Qoncepto Security Alert] Skipping new-device email notification because no HTTP email provider (RESEND_API_KEY, BREVO_API_KEY, or EMAIL_API_URL) is configured."
    );
    return false;
  }

  try {
    const html = buildSessionReplacedEmailHtml(payload);

    const result = await sendPlatformEmail({
      to: payload.toEmail,
      subject:
        "Security Alert: New device sign-in (Previous Qoncepto session expired)",
      html,
    });

    if (!result.sent) {
      console.error(
        "[Qoncepto Security Alert] Failed to send session replaced email:",
        result.error || "Unknown email provider error"
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      "[Qoncepto Security Alert] Failed to send session replaced email:",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}
