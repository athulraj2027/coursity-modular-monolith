import { renderBaseTemplate } from "./base.template";

export interface SubscriptionPurchasedTemplateProps {
    teacherName: string;
    planName: string;
    amount: number;
    currency: string;
    billingCycle: string;
    currentPeriodEnd: Date;
    invoiceNumber: string;
}

export const renderSubscriptionPurchasedEmail = ({
    teacherName,
    planName,
    amount,
    currency,
    billingCycle,
    currentPeriodEnd,
    invoiceNumber,
}: SubscriptionPurchasedTemplateProps): { html: string; text: string; subject: string } => {
    const subject = `🎉 Subscription Confirmed: Welcome to ${planName}!`;
    const formattedEnd = currentPeriodEnd.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #0f172a;">Subscription Activated! 🚀</h1>
    <p style="margin: 0 0 20px 0; color: #475569;">Hi ${teacherName},</p>
    <p style="margin: 0 0 24px 0; color: #475569; line-height: 24px;">
      Thank you for upgrading your teaching studio. Your subscription to <strong>${planName}</strong> is now fully active! All expanded course capacity, streaming minutes, and studio features are immediately unlocked.
    </p>

    <!-- Receipt / Plan Overview Card -->
    <div style="margin: 28px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Subscription Summary</h3>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Plan Tier:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Billing Cycle:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-align: right;">${billingCycle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Amount Paid:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #16a34a; text-align: right;">${currency} ${amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Invoice Reference:</td>
          <td style="padding: 6px 0; font-family: monospace; color: #475569; text-align: right;">#${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Next Renewal / Access Until:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-align: right;">${formattedEnd}</td>
        </tr>
      </table>
    </div>

    <div style="margin: 28px 0; text-align: center;">
      <a href="http://localhost:5173/teachers/plans" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block;">
        View Usage & Invoices
      </a>
    </div>

    <p style="margin: 24px 0 0 0; color: #64748b; font-size: 13px; line-height: 20px;">
      Need assistance or have questions about your plan features? Our priority instructor support team is always here for you.
    </p>
  `;

    const text = `
Subscription Activated: ${planName}

Hi ${teacherName},

Thank you for subscribing to ${planName}!
Amount Paid: ${currency} ${amount.toFixed(2)} (${billingCycle})
Invoice Number: #${invoiceNumber}
Active Until / Next Renewal: ${formattedEnd}

Manage your subscription and monitor quotas at http://localhost:5173/teachers/plans.

- The Coursity Team
  `.trim();

    const html = renderBaseTemplate({
        title: `Subscription Activated - ${planName}`,
        preheader: `Your subscription to ${planName} has been activated. Receipt #${invoiceNumber}.`,
        content,
    });

    return { html, text, subject };
};
