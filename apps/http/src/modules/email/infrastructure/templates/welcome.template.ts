import { renderBaseTemplate } from "./base.template";

export interface WelcomeTemplateProps {
    name: string;
}

export const renderWelcomeEmail = ({
    name,
}: WelcomeTemplateProps): { html: string; text: string; subject: string } => {
    const subject = "Welcome to Coursity! Let's start learning";

    const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #0f172a;">Welcome to Coursity, ${name}! 🚀</h1>
    <p style="margin: 0 0 16px 0; color: #475569;">Your account is fully verified and ready. Explore thousands of world-class courses taught by expert instructors across software engineering, AI, design, and more.</p>
    
    <div style="margin: 28px 0; text-align: center;">
      <a href="http://localhost:5173/courses" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 15px;">Explore Courses Now</a>
    </div>

    <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px;">If you ever have questions, our support team is always here to help.</p>
  `;

    const text = `
Welcome to Coursity, ${name}!

Your account is verified and ready. Explore thousands of courses at http://localhost:5173/courses.

- The Coursity Team
  `.trim();

    const html = renderBaseTemplate({
        title: "Welcome to Coursity!",
        preheader: `Welcome to Coursity, ${name}! Your account is verified and ready.`,
        content,
    });

    return { html, text, subject };
};
