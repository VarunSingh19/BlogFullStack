import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to BlogHub!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to BlogHub, ${name}!</h1>
        <p>Thank you for joining our community of writers and readers.</p>
        <p>With BlogHub, you can:</p>
        <ul>
          <li>Read expert articles with AI-powered summaries</li>
          <li>Listen to audio versions of articles</li>
          <li>Access premium PDF resources</li>
          <li>Engage with a community of like-minded individuals</li>
        </ul>
        <p>Get started by exploring our latest articles or creating your first blog post.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Exploring</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
      </div>
    `,
  }),

  passwordReset: (resetLink: string) => ({
    subject: "Reset Your BlogHub Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
      </div>
    `,
  }),

  purchaseConfirmation: (userName: string, blogTitle: string, amount: number, receiptUrl: string) => ({
    subject: `Your Purchase: ${blogTitle} PDF`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Thank You for Your Purchase!</h1>
        <p>Hello ${userName},</p>
        <p>Your purchase of the premium PDF for <strong>${blogTitle}</strong> has been confirmed.</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
          <h3 style="margin-top: 0;">Purchase Details:</h3>
          <p><strong>Item:</strong> ${blogTitle} (PDF)</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${receiptUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">View Receipt</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/purchases" style="background-color: #f1f1f1; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Purchases</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">If you have any questions about your purchase, please contact our support team.</p>
      </div>
    `,
  }),

  newComment: (
    authorName: string,
    blogTitle: string,
    commenterName: string,
    commentText: string,
    blogLink: string,
  ) => ({
    subject: `New Comment on Your Article: ${blogTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Comment on Your Article</h1>
        <p>Hello ${authorName},</p>
        <p><strong>${commenterName}</strong> has commented on your article <strong>${blogTitle}</strong>:</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #333; border-radius: 3px;">
          <p style="margin: 0; font-style: italic;">"${commentText}"</p>
        </div>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${blogLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Comment</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">You're receiving this email because you're the author of this article.</p>
      </div>
    `,
  }),
}

// Send email function
export async function sendEmail({
  to,
  template,
  data,
}: {
  to: string
  template: keyof typeof emailTemplates
  data: any
}) {
  try {
    // Get the template function
    const templateFn = emailTemplates[template]
    if (!templateFn) {
      throw new Error(`Email template "${template}" not found`)
    }

    // Generate email content
    const { subject, html } = templateFn(...Object.values(data))

    // Send email
    const { data: response, error } = await resend.emails.send({
      from: "BlogHub <notifications@bloghub.com>",
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data: response }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}
