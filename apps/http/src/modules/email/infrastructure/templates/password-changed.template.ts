import { renderBaseTemplate } from "./base.template";

export interface PasswordChangedTemplateProps {
    name?: string;
    email?: string;
    changedAt?: Date;
}

export const renderPasswordChangedEmail = ({
    name,
    email,
    changedAt = new Date(),
}: PasswordChangedTemplateProps): { html: string; text: string; subject: string } => {
    const greeting = name ? `Hi ${name},` : "Hello,";
    const subject = "Security Alert: Your Coursity Password Was Changed";
    const formattedDate = changedAt.toUTCString();

    const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">Password Changed Successfully</h1>
    <p style="margin: 0 0 20px 0; color: #475569;">${greeting}</p>
    <p style="margin: 0 0 20px 0; color: #475569; line-height: 24px;">
      This is a security notification to confirm that the password for your Coursity account <strong>${email || ""}</strong> was successfully changed on <strong>${formattedDate}</strong>.
    </p>

    <!-- Security Information Box -->
    <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Security Notice</h3>
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748b;">
        If you initiated this change, no further action is required. You can now use your new password to sign in to all Coursity services.
      </p>
    </div>

    <!-- Alert Box if not requested -->
    <div style="margin: 24px 0 0 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #991b1b;">
        ⚠️ <strong>Did not make this change?</strong><br>
        If you did not change your password, your account may be compromised. Please reset your password immediately or contact our security and support team at <a href="mailto:support@coursity.io" style="color: #dc2626; font-weight: 600;">support@coursity.io</a>.
      </p>
    </div>
  `;

    const text = `
Security Alert: Your Coursity Password Was Changed

${greeting}

This is a security notification to confirm that the password for your Coursity account (${email || ""}) was successfully changed on ${formattedDate}.

If you made this change, you can safely ignore this email.

If you DID NOT make this change, please reset your password immediately or contact us at support@coursity.io.

- The Coursity Security Team
  `.trim();

    const html = renderBaseTemplate({
        title: "Password Changed - Coursity Security Alert",
        preheader: "Security Notice: Your Coursity account password was updated.",
        content,
    });

    return { html, text, subject };
};
