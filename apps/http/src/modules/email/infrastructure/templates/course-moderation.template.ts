import { renderBaseTemplate } from "./base.template";

export interface CourseDelistedTemplateProps {
  teacherName: string;
  courseTitle: string;
  delistReason: string;
  courseSlug?: string;
}

export interface CourseFrozenTemplateProps {
  teacherName: string;
  courseTitle: string;
  freezeReason: string;
  courseSlug?: string;
}

export const renderCourseDelistedEmail = ({
  teacherName,
  courseTitle,
  delistReason,
}: CourseDelistedTemplateProps): { html: string; text: string; subject: string } => {
  const subject = `Notice: Course Delisted - "${courseTitle}"`;
  const title = "Course Delisted by Administration";
  const badgeColor = "#dc2626"; // Red
  const statusLabel = "DELISTED";

  const messageBody = `
    <p style="margin: 0 0 16px 0; color: #334155;">
      We are writing to inform you that your course <strong>"${courseTitle}"</strong> has been delisted from the Coursity public catalog by platform administration prior to its scheduled start date.
    </p>

    <div style="margin: 20px 0; padding: 18px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #991b1b; font-size: 13px; text-transform: uppercase;">
        Administrative Reason / Message:
      </p>
      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 22px;">
        "${delistReason}"
      </p>
    </div>

    <p style="margin: 0 0 20px 0; color: #334155;">
      The course is no longer discoverable by learners. If you have questions or believe this action was taken in error, please contact support or review your course content in your Instructor Studio.
    </p>
    
    <div style="margin: 24px 0; text-align: center;">
      <a href="http://localhost:5173/teachers/courses" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Go to My Courses
      </a>
    </div>
  `;

  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">${title}</h1>
    <p style="margin: 0 0 20px 0; color: #475569;">Hi ${teacherName},</p>
    
    <div style="margin-bottom: 24px;">
      <span style="background-color: ${badgeColor}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        ${statusLabel}
      </span>
    </div>

    ${messageBody}

    <p style="margin: 28px 0 0 0; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
      Best regards,<br />
      <strong>The Coursity Moderation Team</strong>
    </p>
  `;

  const html = renderBaseTemplate({
    title,
    preheader: `Your course "${courseTitle}" has been delisted.`,
    content,
  });

  const text = `
Notice: Course Delisted - "${courseTitle}"

Hi ${teacherName},

Your course "${courseTitle}" has been delisted from the Coursity public catalog by administration.

Reason / Message:
"${delistReason}"

The course is no longer discoverable by learners. You can manage your courses at http://localhost:5173/teachers/courses.

Best regards,
The Coursity Moderation Team
  `.trim();

  return { html, text, subject };
};

export const renderCourseFrozenEmail = ({
  teacherName,
  courseTitle,
  freezeReason,
}: CourseFrozenTemplateProps): { html: string; text: string; subject: string } => {
  const subject = `Important: Course Frozen - "${courseTitle}"`;
  const title = "Course Frozen by Administration";
  const badgeColor = "#0284c7"; // Sky / Ice Blue
  const statusLabel = "FROZEN";

  const messageBody = `
    <p style="margin: 0 0 16px 0; color: #334155;">
      This notice is to inform you that your active cohort <strong>"${courseTitle}"</strong> has been frozen by platform administration.
    </p>

    <div style="margin: 20px 0; padding: 18px; background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 6px;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #0369a1; font-size: 13px; text-transform: uppercase;">
        Administrative Freeze Reason / Message:
      </p>
      <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 22px;">
        "${freezeReason}"
      </p>
    </div>

    <div style="margin: 20px 0; padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155; font-size: 13px;">What does this mean?</p>
      <ul style="margin: 0; padding-left: 18px; color: #475569; font-size: 13px; line-height: 20px;">
        <li>You can still access and view all curriculum materials and syllabus structure in read-only mode.</li>
        <li>Modifications to course details, modules, lessons, and pricing are locked.</li>
        <li>Existing enrolled students retain their record, but new public enrollments are halted.</li>
      </ul>
    </div>

    <p style="margin: 0 0 20px 0; color: #334155;">
      You can inspect the frozen course anytime in your Instructor Studio.
    </p>
    
    <div style="margin: 24px 0; text-align: center;">
      <a href="http://localhost:5173/teachers/courses" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        View Course in Studio
      </a>
    </div>
  `;

  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">${title}</h1>
    <p style="margin: 0 0 20px 0; color: #475569;">Hi ${teacherName},</p>
    
    <div style="margin-bottom: 24px;">
      <span style="background-color: ${badgeColor}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        ${statusLabel}
      </span>
    </div>

    ${messageBody}

    <p style="margin: 28px 0 0 0; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
      Best regards,<br />
      <strong>The Coursity Administration Team</strong>
    </p>
  `;

  const html = renderBaseTemplate({
    title,
    preheader: `Your course "${courseTitle}" has been frozen by administration.`,
    content,
  });

  const text = `
Important: Course Frozen - "${courseTitle}"

Hi ${teacherName},

Your course "${courseTitle}" has been frozen by administration.

Reason / Message:
"${freezeReason}"

The course content is preserved in read-only mode in your Instructor Studio at http://localhost:5173/teachers/courses.

Best regards,
The Coursity Administration Team
  `.trim();

  return { html, text, subject };
};
