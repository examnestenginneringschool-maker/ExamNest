export interface SendPlatformEmailParams {
  from?: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}

export interface SendPlatformEmailResult {
  sent: boolean;
  provider?: "resend" | "brevo" | "custom";
  error?: string;
}

const EMAIL_TIMEOUT_MS = 4000;

function getDefaultFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    (process.env.SMTP_USER
      ? `Qoncepto <${process.env.SMTP_USER}>`
      : "Qoncepto <qoncepto.edutech@gmail.com>")
  );
}

function parseNameAndEmail(raw: string): { name?: string; email: string } {
  const match = raw.trim().match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].replace(/^["']|["']$/g, "").trim(),
      email: match[2].trim(),
    };
  }
  return { email: raw.trim() };
}

/**
 * Checks whether an edge-compatible HTTP email provider is configured in environment variables.
 */
export function isEmailProviderConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY ||
      process.env.BREVO_API_KEY ||
      process.env.EMAIL_API_URL
  );
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Dispatches transactional or feedback emails using edge-compatible HTTP APIs
 * (Resend, Brevo, or a custom HTTP webhook), avoiding Node-only TCP/SMTP sockets.
 */
export async function sendPlatformEmail(
  params: SendPlatformEmailParams
): Promise<SendPlatformEmailResult> {
  const from = params.from || getDefaultFromAddress();

  // 1. Resend HTTP API
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const response = await fetchWithTimeout("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [params.to],
          ...(params.replyTo ? { reply_to: params.replyTo } : {}),
          subject: params.subject,
          html: params.html,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        return {
          sent: false,
          provider: "resend",
          error: `Resend API error (${response.status}): ${errText}`,
        };
      }

      return { sent: true, provider: "resend" };
    } catch (err) {
      return {
        sent: false,
        provider: "resend",
        error: err instanceof Error ? err.message : "Resend request failed.",
      };
    }
  }

  // 2. Brevo (Sendinblue) HTTP API
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    try {
      const sender = parseNameAndEmail(from);
      const response = await fetchWithTimeout(
        "https://api.brevo.com/v3/smtp/email",
        {
          method: "POST",
          headers: {
            "api-key": brevoKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            sender,
            to: [{ email: params.to }],
            ...(params.replyTo ? { replyTo: { email: params.replyTo } } : {}),
            subject: params.subject,
            htmlContent: params.html,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        return {
          sent: false,
          provider: "brevo",
          error: `Brevo API error (${response.status}): ${errText}`,
        };
      }

      return { sent: true, provider: "brevo" };
    } catch (err) {
      return {
        sent: false,
        provider: "brevo",
        error: err instanceof Error ? err.message : "Brevo request failed.",
      };
    }
  }

  // 3. Custom HTTP Email Webhook Endpoint
  const customUrl = process.env.EMAIL_API_URL;
  if (customUrl) {
    try {
      const customKey = process.env.EMAIL_API_KEY;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (customKey) {
        headers.Authorization = `Bearer ${customKey}`;
      }

      const response = await fetchWithTimeout(customUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          from,
          to: params.to,
          ...(params.replyTo ? { replyTo: params.replyTo } : {}),
          subject: params.subject,
          html: params.html,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        return {
          sent: false,
          provider: "custom",
          error: `Custom email API error (${response.status}): ${errText}`,
        };
      }

      return { sent: true, provider: "custom" };
    } catch (err) {
      return {
        sent: false,
        provider: "custom",
        error:
          err instanceof Error ? err.message : "Custom email request failed.",
      };
    }
  }

  return {
    sent: false,
    error: "No HTTP email provider configured.",
  };
}
