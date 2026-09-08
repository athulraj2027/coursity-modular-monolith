import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { renderSignupOtpEmail } from "../src/modules/email/infrastructure/templates/signup-otp.template";
import { renderResetPasswordOtpEmail } from "../src/modules/email/infrastructure/templates/reset-password-otp.template";
import { renderTeacherStatusEmail } from "../src/modules/email/infrastructure/templates/teacher-status.template";
import { renderWelcomeEmail } from "../src/modules/email/infrastructure/templates/welcome.template";
import { NodemailerTransport } from "../src/modules/email/infrastructure/transport/nodemailer.transport";
import { EmailQueue } from "../src/modules/email/infrastructure/queue/email.queue";
import { EmailWorker } from "../src/modules/email/infrastructure/queue/email.worker";
import { QueueEmailUseCase } from "../src/modules/email/application/use-cases/queue-email.usecase";
import { EmailService } from "../src/modules/email/infrastructure/services/email.service.impl";
describe("📧 Email Module & Worker Queue Tests", () => {

    describe("1. Template Rendering", () => {
        it("should render signup OTP template with code and name", () => {
            const { html, text, subject } = renderSignupOtpEmail({
                name: "Alex",
                otp: "847291",
                expiresInMinutes: 10,
            });

            assert.ok(subject.includes("847291"));
            assert.ok(html.includes("847291"));
            assert.ok(html.includes("Hi Alex"));
            assert.ok(html.includes("10 minutes"));
            assert.ok(text.includes("847291"));
        });

        it("should render password reset OTP template with security notice", () => {
            const { html, text, subject } = renderResetPasswordOtpEmail({
                name: "Sarah",
                otp: "123456",
                expiresInMinutes: 15,
            });

            assert.ok(subject.includes("123456"));
            assert.ok(html.includes("123456"));
            assert.ok(html.includes("Hi Sarah"));
            assert.ok(html.includes("Password Reset Request"));
            assert.ok(text.includes("123456"));
        });

        it("should render instructor approved (VERIFIED) status email", () => {
            const { html, subject } = renderTeacherStatusEmail({
                name: "Dr. John",
                status: "VERIFIED",
            });

            assert.ok(subject.includes("Approved") || subject.includes("Congratulations"));
            assert.ok(html.includes("VERIFIED &amp; APPROVED") || html.includes("VERIFIED & APPROVED"));
            assert.ok(html.includes("Dr. John"));
        });

        it("should render instructor revision requested (REDO) email with reviewer feedback", () => {
            const feedback = "Please add your LinkedIn profile and at least 3 years experience.";
            const { html, text, subject } = renderTeacherStatusEmail({
                name: "Jane",
                status: "REDO",
                feedback,
            });

            assert.ok(subject.includes("Revisions Needed"));
            assert.ok(html.includes("REVISION REQUESTED"));
            assert.ok(html.includes(feedback));
            assert.ok(text.includes(feedback));
        });

        it("should render instructor revoked (REVOKED) email with explanation", () => {
            const feedback = "Incomplete accreditation documentation.";
            const { html, text } = renderTeacherStatusEmail({
                name: "Sam",
                status: "REVOKED",
                feedback,
            });

            assert.ok(html.includes("VERIFICATION REVOKED"));
            assert.ok(html.includes(feedback));
            assert.ok(text.includes(feedback));
        });

        it("should render welcome onboarding email", () => {
            const { html, subject } = renderWelcomeEmail({
                name: "Alice",
            });

            assert.ok(subject.includes("Welcome to Coursity"));
            assert.ok(html.includes("Alice"));
        });
    });

    describe("2. Transport Layer", () => {
        it("should simulate email dispatch in dev mode without throwing errors", async () => {
            const transport = new NodemailerTransport();
            const result = await transport.send({
                to: "test@example.com",
                subject: "Test Subject",
                html: "<p>Hello World</p>",
                text: "Hello World",
            });

            assert.equal(result.success, true);
            assert.ok(result.messageId);
            assert.ok(result.timestamp);
        });
    });

    describe("3. Email Queue & Service", () => {
        let queue: EmailQueue;
        let worker: EmailWorker;
        let emailService: EmailService;

        before(() => {
            queue = new EmailQueue();
            const transport = new NodemailerTransport();
            worker = new EmailWorker(transport);
            const useCase = new QueueEmailUseCase(queue);
            emailService = new EmailService(useCase);
            worker.start();
        });

        after(async () => {
            await new Promise((resolve) => setTimeout(resolve, 600));
            await worker.close();
            await queue.close();
        });

        it("should enqueue signup OTP email job without throwing", async () => {
            await assert.doesNotReject(async () => {
                await emailService.sendSignupOtp("user@test.com", "654321", "Test User");
            });
        });

        it("should enqueue password reset OTP email job without throwing", async () => {
            await assert.doesNotReject(async () => {
                await emailService.sendPasswordResetOtp("reset@test.com", "998877", "Reset User");
            });
        });

        it("should enqueue teacher status update email job without throwing", async () => {
            await assert.doesNotReject(async () => {
                await emailService.sendTeacherStatusUpdate(
                    "instructor@test.com",
                    "Prof. Smith",
                    "VERIFIED"
                );
            });
        });
    });
});
