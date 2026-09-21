import { renderBaseTemplate } from "./base.template";

export interface ResetPasswordOtpTemplateProps {
    name?: string;
    otp: string;
    expiresInMinutes?: number;
}

export const renderResetPasswordOtpEmail = ({
    name,
    otp,
    expiresInMinutes = 10,
}: ResetPasswordOtpTemplateProps): { html: string; text: string; subject: string } => {
    const greeting = name ? `Hi ${name},` : "Hello,";
    const subject = `Reset Your Coursity Password: ${otp}`;

    const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">Password Reset Request</h1>
    <p style="margin: 0 0 20px 0; color: #475569;">${greeting}</p>
    <p style="margin: 0 0 24px 0; color: #475569;">We received a request to reset the password associated with your Coursity account. Please enter the one-time security code below to proceed:</p>
    
    <!-- OTP Display Box -->
    <div style="margin: 28px 0; padding: 24px; background-color: #f8fafc; border-radius: 10px; border: 1px dashed #cbd5e1; text-align: center;">
      <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; display: block; margin-bottom: 8px;">Password Reset Security Code</span>
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #dc2626; display: inline-block;">${otp}</span>
    </div>

    <!-- Security Information -->
    <div style="margin: 24px 0 0 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #991b1b;">
        ⏱️ <strong>This code is valid for ${expiresInMinutes} minutes.</strong><br>
        ⚠️ If you did not initiate this password reset, please secure your account immediately or contact our support team.
      </p>
    </div>
  `;

    const text = `
Reset Your Coursity Password

${greeting}

We received a request to reset your password. Your one-time verification code is:

${otp}

This code expires in ${expiresInMinutes} minutes.
If you did not request a password reset, please ignore this email.

- The Coursity Team
  `.trim();

    const html = renderBaseTemplate({
        title: "Password Reset Request - Coursity",
        preheader: `Use security code ${otp} to reset your Coursity account password.`,
        content,
    });

    return { html, text, subject };
};
