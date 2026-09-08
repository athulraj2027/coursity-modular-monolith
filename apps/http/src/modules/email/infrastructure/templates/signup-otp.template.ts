import { renderBaseTemplate } from "./base.template";

export interface SignupOtpTemplateProps {
    name?: string;
    otp: string;
    expiresInMinutes?: number;
}

export const renderSignupOtpEmail = ({
    name,
    otp,
    expiresInMinutes = 10,
}: SignupOtpTemplateProps): { html: string; text: string; subject: string } => {
    const greeting = name ? `Hi ${name},` : "Hello,";
    const subject = `Your Coursity Verification Code: ${otp}`;

    const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">Verify your email address</h1>
    <p style="margin: 0 0 20px 0; color: #475569;">${greeting}</p>
    <p style="margin: 0 0 24px 0; color: #475569;">Thank you for starting your journey with Coursity! Use the verification code below to confirm your account registration.</p>
    
    <!-- OTP Display Box -->
    <div style="margin: 28px 0; padding: 24px; background-color: #f1f5f9; border-radius: 10px; border: 1px dashed #cbd5e1; text-align: center;">
      <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; display: block; margin-bottom: 8px;">Your 6-Digit Verification Code</span>
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; display: inline-block;">${otp}</span>
    </div>

    <!-- Security Information -->
    <div style="margin: 24px 0 0 0; padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #1e40af;">
        ⏱️ <strong>This code will expire in ${expiresInMinutes} minutes.</strong><br>
        🔒 If you did not request this registration, you can safely ignore this email.
      </p>
    </div>
  `;

    const text = `
Verify your Coursity Account

${greeting}

Thank you for starting your journey with Coursity! Your verification code is:

${otp}

This code expires in ${expiresInMinutes} minutes.
If you did not request this code, you can safely ignore this email.

- The Coursity Team
  `.trim();

    const html = renderBaseTemplate({
        title: "Verify your email address - Coursity",
        preheader: `Your Coursity verification code is ${otp}. Valid for ${expiresInMinutes} minutes.`,
        content,
    });

    return { html, text, subject };
};
