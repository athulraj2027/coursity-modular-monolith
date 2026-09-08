import { renderBaseTemplate } from "./base.template";

export type TeacherApprovalStatus = "VERIFIED" | "IN_PROGRESS" | "REVOKED" | "REDO" | "PENDING";

export interface TeacherStatusTemplateProps {
    name: string;
    status: TeacherApprovalStatus;
    feedback?: string | null;
}

export const renderTeacherStatusEmail = ({
    name,
    status,
    feedback,
}: TeacherStatusTemplateProps): { html: string; text: string; subject: string } => {
    let subject = "Coursity Instructor Application Update";
    let title = "Instructor Application Update";
    let badgeColor = "#3b82f6";
    let statusLabel = "Under Review";
    let messageBody = "";

    switch (status) {
        case "VERIFIED":
            subject = "🎉 Congratulations! Your Coursity Instructor Account is Approved";
            title = "Welcome to the Coursity Instructor Network";
            statusLabel = "VERIFIED & APPROVED";
            badgeColor = "#16a34a"; // Green
            messageBody = `
        <p style="margin: 0 0 16px 0; color: #334155;">Great news! Our administrative review team has verified your credentials and approved your instructor application.</p>
        <p style="margin: 0 0 20px 0; color: #334155;">You can now create, publish, and manage courses directly from your instructor dashboard.</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="http://localhost:5173/teacher" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Instructor Dashboard</a>
        </div>
      `;
            break;

        case "REDO":
            subject = "Action Required: Revisions Needed for Your Instructor Application";
            title = "Revision Requested on Your Application";
            statusLabel = "REVISION REQUESTED";
            badgeColor = "#d97706"; // Amber
            messageBody = `
        <p style="margin: 0 0 16px 0; color: #334155;">Thank you for your application to become an instructor on Coursity. Before we can finalize approval, our review team has requested some revisions.</p>
        
        ${feedback
                    ? `
          <div style="margin: 20px 0; padding: 18px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #92400e; font-size: 13px; text-transform: uppercase;">Reviewer Feedback & Suggestions:</p>
            <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 22px;">"${feedback}"</p>
          </div>
        `
                    : ""
                }

        <p style="margin: 0 0 20px 0; color: #334155;">Please review the suggestions above, update your profile details, and re-submit your verification.</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="http://localhost:5173/teacher/profile" style="background-color: #d97706; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Update Profile & Resubmit</a>
        </div>
      `;
            break;

        case "REVOKED":
            subject = "Important Notice: Instructor Verification Status Revoked";
            title = "Verification Status Update";
            statusLabel = "VERIFICATION REVOKED";
            badgeColor = "#dc2626"; // Red
            messageBody = `
        <p style="margin: 0 0 16px 0; color: #334155;">This notice is to inform you that your Coursity instructor verification status has been revoked by our administration.</p>
        
        ${feedback
                    ? `
          <div style="margin: 20px 0; padding: 18px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #991b1b; font-size: 13px; text-transform: uppercase;">Reason / Feedback:</p>
            <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 22px;">"${feedback}"</p>
          </div>
        `
                    : ""
                }

        <p style="margin: 0 0 20px 0; color: #334155;">If you have any questions or believe this was done in error, please feel free to reach out to our support team.</p>
      `;
            break;

        case "IN_PROGRESS":
        default:
            subject = "Your Instructor Verification Application is Under Review";
            title = "Application Under Review";
            statusLabel = "IN PROGRESS";
            badgeColor = "#2563eb"; // Blue
            messageBody = `
        <p style="margin: 0 0 16px 0; color: #334155;">We have received your instructor verification application and our administrative team is actively reviewing your qualifications and profile.</p>
        <p style="margin: 0 0 16px 0; color: #334155;">You will receive an email confirmation as soon as your evaluation is completed.</p>
      `;
            break;
    }

    const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">${title}</h1>
    <p style="margin: 0 0 20px 0; color: #475569;">Hi ${name},</p>
    
    <!-- Status Badge -->
    <div style="margin: 16px 0 24px 0;">
      <span style="display: inline-block; background-color: ${badgeColor}; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">
        STATUS: ${statusLabel}
      </span>
    </div>

    ${messageBody}
  `;

    const text = `
${title}

Hi ${name},

Status: ${statusLabel}

${feedback ? `Feedback: ${feedback}\n` : ""}
- The Coursity Team
  `.trim();

    const html = renderBaseTemplate({
        title: `${subject} - Coursity`,
        preheader: `Status update for your Coursity instructor profile: ${statusLabel}`,
        content,
    });

    return { html, text, subject };
};
