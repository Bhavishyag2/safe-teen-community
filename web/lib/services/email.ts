// Email service using Resend

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "noreply@teenportal.in";
const appName = "Teen Portal";

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Email verification
export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<EmailResult> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to,
      subject: "Verify your email - Teen Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #FF6B9D; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #FF6B9D;
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Teen Portal! ✨</h1>
            </div>
            <p>Hey there!</p>
            <p>Thanks for joining Teen Portal - your safe space to connect, learn, and grow!</p>
            <p>Please click the button below to verify your email address:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify My Email</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link expires in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>© ${new Date().getFullYear()} Teen Portal</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Parental consent email
export async function sendParentConsentEmail(
  to: string,
  childPseudoName: string,
  consentToken: string,
  consentCode: string
): Promise<EmailResult> {
  const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/parent-consent?token=${consentToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to,
      subject: "Parental Consent Required - Teen Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #FF6B9D; }
            .code-box {
              background: #f5f5f5;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              color: #FF6B9D;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #FF6B9D;
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            }
            .info-box {
              background: #FFF5F8;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Parental Consent Request</h1>
            </div>
            <p>Dear Parent/Guardian,</p>
            <p>Your child (username: <strong>${childPseudoName}</strong>) has requested to join Teen Portal, a safe online community for teenage girls.</p>

            <div class="info-box">
              <h3>About Teen Portal</h3>
              <p>Teen Portal is a moderated platform offering advice, forums, and resources on relationships, health, school, and more. We prioritize safety with:</p>
              <ul>
                <li>Anonymous usernames (no real names)</li>
                <li>Pre-approval content moderation</li>
                <li>No personal information shared</li>
                <li>Trained moderators monitoring all activity</li>
              </ul>
            </div>

            <p>To provide consent, please use this verification code:</p>

            <div class="code-box">
              <div class="code">${consentCode}</div>
            </div>

            <p>Or click the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${consentUrl}" class="button">Review & Provide Consent</a>
            </p>

            <p><strong>This request expires in 7 days.</strong></p>

            <p>If you have questions or concerns, please contact us at support@teenportal.in</p>

            <div class="footer">
              <p>If you did not expect this email, please ignore it.</p>
              <p>This consent is required under the Digital Personal Data Protection Act (DPDP) 2023.</p>
              <p>© ${new Date().getFullYear()} Teen Portal</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Content moderation notification
export async function sendModerationEmail(
  to: string,
  pseudoName: string,
  contentTitle: string,
  status: "approved" | "rejected",
  reason?: string
): Promise<EmailResult> {
  const subject =
    status === "approved"
      ? "Your post is now live! - Teen Portal"
      : "Your post needs some changes - Teen Portal";

  const statusMessage =
    status === "approved"
      ? `Great news! Your post "${contentTitle}" has been approved and is now live on Teen Portal.`
      : `We've reviewed your post "${contentTitle}" and it needs some changes before it can be published.`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .status-approved { color: #2ECC71; }
            .status-rejected { color: #E74C3C; }
            .reason-box {
              background: #FFF5F8;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="${status === "approved" ? "status-approved" : "status-rejected"}">
                ${status === "approved" ? "Post Approved! ✨" : "Post Needs Changes"}
              </h1>
            </div>
            <p>Hey ${pseudoName}!</p>
            <p>${statusMessage}</p>
            ${
              status === "rejected" && reason
                ? `
            <div class="reason-box">
              <strong>Feedback:</strong>
              <p>${reason}</p>
            </div>
            <p>You can edit your post and resubmit it for review.</p>
            `
                : ""
            }
            <div class="footer">
              <p>© ${new Date().getFullYear()} Teen Portal</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Password reset email
export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<EmailResult> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to,
      subject: "Reset your password - Teen Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #FF6B9D;
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Teen Portal</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
