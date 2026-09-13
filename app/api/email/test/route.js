import { sendTestEmail, getEmailStatus } from '@/lib/email'
import { z } from 'zod'

// Validation schema for test email request
const testEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
})

/**
 * POST /api/email/test
 * Send a test email to verify SMTP configuration
 *
 * Request body: { "to": "test@gmail.com" }
 * Response: { "success": true, "message": "Email sent successfully" }
 */
export async function POST(req) {
  try {
    // Check if email service is configured
    const emailStatus = getEmailStatus()
    if (!emailStatus.configured) {
      return Response.json(
        {
          success: false,
          message: emailStatus.note,
        },
        { status: 503 } // Service Unavailable
      )
    }

    // Parse and validate request body
    let data
    try {
      data = await req.json()
    } catch {
      return Response.json(
        {
          success: false,
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      )
    }

    // Validate request schema
    const validation = testEmailSchema.safeParse(data)
    if (!validation.success) {
      return Response.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { to } = validation.data

    // Send the test email
    const result = await sendTestEmail(to)

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: result.message,
        },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Email sent successfully',
    })
  } catch (error) {
    console.error('Test email endpoint error:', error)
    return Response.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email/test
 * Check email service configuration status
 * Response: { "configured": true/false, "message": "...", "missing": [...] }
 */
export async function GET() {
  const status = getEmailStatus()
  return Response.json({
    configured: status.configured,
    message: status.note,
    missing: status.missing,
  })
}
