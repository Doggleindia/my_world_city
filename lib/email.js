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
