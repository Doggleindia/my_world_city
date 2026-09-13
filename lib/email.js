import nodemailer from 'nodemailer'

// SMTP configuration - reads from environment variables
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // Use STARTTLS (false = use STARTTLS, true = use SSL/TLS)
  auth: {
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASSWORD?.trim(),
  },
  tls: {
    rejectUnauthorized: false, // Some servers require this
  },
  logger: true, // Enable logging for debugging
  debug: false, // Set to true for verbose output
}

// Reuse transporter instance (connection pooling)
let transporter = null

/**
 * Get or create the email transporter
 * Validates configuration before returning
 */
function getTransporter() {
  if (!transporter) {
    // Validate required environment variables
    const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM']
    const missing = required.filter((key) => !process.env[key])

    if (missing.length > 0) {
      throw new Error(
        `Missing SMTP configuration: ${missing.join(', ')}. Add these variables to .env and restart.`
      )
    }

    transporter = nodemailer.createTransport(smtpConfig)
  }

  return transporter
}

/**
 * Verify SMTP connection
 * Use this to test connectivity before sending emails
 */
export async function verifySMTPConnection() {
  try {
    const t = getTransporter()
    await t.verify()
    return { success: true, message: 'SMTP connection verified' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

/**
 * Send email using Nodemailer and Mailercloud SMTP
 *
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @param {string} [options.from] - Sender email (uses MAIL_FROM from env if not specified)
 * @returns {Promise<Object>} - Result object with success status and message
 */
export async function sendEmail(options) {
  try {
    const transporter = getTransporter()

    // Ensure from email is properly set
    // Use MAIL_FROM (verified domain) as the sender, fall back to SMTP_USER if not set
    const fromEmail = options.from || process.env.MAIL_FROM || process.env.SMTP_USER
    if (!fromEmail) {
      throw new Error('No sender email configured (MAIL_FROM or SMTP_USER environment variable is missing)')
    }

    const mailOptions = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      ...(options.html && { html: options.html }),
    }

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    })

    // Send the email
    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return {
      success: false,
      message: error.message || 'Failed to send email',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
    }
  }
}

/**
 * Send a one-time login code.
 *
 * Used by the OTP sign-in / sign-up flow (lib/auth/otp.js). Throws on failure so
 * the caller can tell the visitor the code could not be sent, instead of leaving
 * them staring at an empty inbox.
 *
 * @param {string} to - Recipient email address
 * @param {string} code - The 6-digit code
 * @param {number} [minutes=5] - How long the code stays valid
 * @returns {Promise<{messageId: string}>}
 */
export async function sendOtpEmail(to, code, minutes = 5) {
  const result = await sendEmail({
    to,
    subject: `${code} is your My World City verification code`,
    text:
      `${code} is your My World City verification code.` +
      `\n\nIt expires in ${minutes} minutes. Do not share this code with anyone.` +
      `\n\nIf you did not request it, you can safely ignore this email.`,
    html: otpEmailHtml(code, minutes),
  })

  if (!result.success) throw new Error(result.message || 'Could not send the email')
  return { messageId: result.messageId }
}

// Plain, table-based markup — the only layout every mail client agrees on.
function otpEmailHtml(code, minutes) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:#0b3f80;padding:22px 28px;">
                <span style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:-0.2px;">My World City</span>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 8px;">
                <h1 style="margin:0;font-size:20px;font-weight:800;color:#0f1d33;">Verify your email</h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:22px;color:#64748b;">
                  Use the code below to finish signing in. It is valid for ${minutes} minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 28px;">
                <div style="display:inline-block;background:#f1f6fd;border:1px solid #cfe0f7;border-radius:12px;padding:16px 28px;">
                  <span style="font-size:32px;font-weight:800;letter-spacing:10px;color:#0b3f80;">${code}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <p style="margin:0;font-size:13px;line-height:21px;color:#94a3b8;">
                  Never share this code with anyone — our team will never ask you for it.
                  If you did not request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} My World City, Jaipur</p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/**
 * Send a test email
 * Useful for testing SMTP configuration
 */
export async function sendTestEmail(toEmail) {
  return sendEmail({
    to: toEmail,
    subject: 'Test Email',
    text: 'This is a test email from My World City.',
  })
}

// Export configuration status check (similar to SMS provider pattern)
export function getEmailStatus() {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM']
  const missing = required.filter((key) => !process.env[key])

  return {
    configured: missing.length === 0,
    missing,
    note: missing.length
      ? `Missing SMTP configuration: ${missing.join(', ')}. Add these to .env and restart.`
      : 'Email service is configured and ready.',
  }
}
