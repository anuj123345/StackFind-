import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// The email address that will receive lead notifications
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "anuj.stackfind@gmail.com"

export async function sendBillingLeadNotification({
  userEmail,
  toolName,
  notes,
}: {
  userEmail: string
  toolName: string
  notes?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "StackFind <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `🚀 New Billing Lead: ${toolName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #000;">New INR Billing Request</h2>
          <p>A user has requested managed INR billing support for a tool.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Tool:</strong> ${toolName}</p>
          <p><strong>User Email:</strong> ${userEmail}</p>
          <p><strong>Notes:</strong> ${notes || "No additional notes provided."}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666;">View this lead in the <a href="https://stackfind.in/admin">Admin Dashboard</a>.</p>
        </div>
      `,
    })

    if (error) {
      console.error("[email] Resend error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error("[email] Unexpected error:", err)
    return { success: false, error: err }
  }
}

export async function sendUserBillingConfirmation({
  userEmail,
  toolName,
}: {
  userEmail: string
  toolName: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "StackFind <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Request Received: Managed Billing for ${toolName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #000;">We've received your request!</h2>
          <p>Hi there,</p>
          <p>Thanks for requesting managed INR billing for <strong>${toolName}</strong> on StackFind.</p>
          <p>Our team is reviewing your request. We'll get back to you within 24 hours with a custom payment link that supports UPI and generates a valid GST invoice for your business.</p>
          <p>If you have any urgent questions, just reply to this email.</p>
          <br />
          <p>Best,<br />The StackFind Team</p>
        </div>
      `,
    })

    if (error) {
       // We don't want to throw error if user email fails, just log it
      console.error("[email] Resend user confirmation error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error("[email] Unexpected user email error:", err)
    return { success: false, error: err }
  }
}
