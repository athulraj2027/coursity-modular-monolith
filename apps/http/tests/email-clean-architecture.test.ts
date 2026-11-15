import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    // Domain
    EmailPayload,
    EmailJobData,
    IEmailTransport,
    EmailTransport,
    IEmailQueue,
    // Application
    QueueEmailUseCase,
    EmailService,
    // Infrastructure
    NodemailerTransport,
    // Presentation
    renderSignupOtpEmail,
    renderResetPasswordOtpEmail,
    renderTeacherStatusEmail,
    renderWelcomeEmail,
    renderPasswordChangedEmail,
    renderCourseDelistedEmail,
    renderCourseFrozenEmail,
    renderSubscriptionPurchasedEmail,
} from "../src/infrastructure/email";

// Mock IEmailQueue to test the application layer in pure isolation
class MockEmailQueue implements IEmailQueue {
    public enqueuedJobs: EmailJobData[] = [];

    async add(jobData: EmailJobData, priority?: number, delay?: number): Promise<string> {
        this.enqueuedJobs.push(jobData);
        return `mock_job_${this.enqueuedJobs.length}`;
    }

    async close(): Promise<void> {
        this.enqueuedJobs = [];
    }

    get underlyingQueue(): any {
        return null;
    }
}

// Mock IEmailTransport to test the infrastructure transport interface
class MockEmailTransport implements IEmailTransport {
    public sentEmails: EmailPayload[] = [];

    async send(payload: EmailPayload) {
        this.sentEmails.push(payload);
        return {
            success: true,
            messageId: `mock_msg_${this.sentEmails.length}`,
            timestamp: new Date().toISOString(),
        };
    }

    async verifyConnection(): Promise<boolean> {
        return true;
    }
}

describe("📧 Email Clean Architecture & Layer Tests", () => {
    describe("1. Domain Layer Contracts & Invariants", () => {
        it("should allow MockEmailTransport to implement IEmailTransport", async () => {
            const transport = new MockEmailTransport();
            const result = await transport.send({
                to: "student@coursity.com",
                subject: "Welcome",
                html: "<p>Welcome!</p>",
            });

            assert.equal(result.success, true);
            assert.equal(transport.sentEmails.length, 1);
            assert.equal(transport.sentEmails[0].to, "student@coursity.com");
        });

        it("should allow MockEmailQueue to implement IEmailQueue", async () => {
            const queue = new MockEmailQueue();
            const jobId = await queue.add({
                templateType: "WELCOME",
                payload: {
                    to: "test@coursity.com",
                    subject: "Test",
                    html: "<b>Test</b>",
                },
                createdAt: Date.now(),
            });

            assert.ok(jobId.startsWith("mock_job_"));
            assert.equal(queue.enqueuedJobs.length, 1);
        });
    });

    describe("2. Application Layer (QueueEmailUseCase & EmailService)", () => {
        it("should enqueue signup OTP email through EmailService and QueueEmailUseCase", async () => {
            const queue = new MockEmailQueue();
            const useCase = new QueueEmailUseCase(queue);
            const service = new EmailService(useCase);

            await service.sendSignupOtp("user@example.com", "123456", "John Doe");

            assert.equal(queue.enqueuedJobs.length, 1);
            const job = queue.enqueuedJobs[0];
            assert.equal(job.templateType, "SIGNUP_OTP");
            assert.equal(job.payload.to, "user@example.com");
            assert.ok(job.payload.html.includes("123456"));
            assert.ok(job.payload.html.includes("Hi John Doe"));
        });

        it("should enqueue teacher status update (VERIFIED) through EmailService", async () => {
            const queue = new MockEmailQueue();
            const useCase = new QueueEmailUseCase(queue);
            const service = new EmailService(useCase);

            await service.sendTeacherStatusUpdate("teacher@example.com", "Dr. Jane", "VERIFIED");

            assert.equal(queue.enqueuedJobs.length, 1);
            const job = queue.enqueuedJobs[0];
            assert.equal(job.templateType, "TEACHER_STATUS");
            assert.equal(job.payload.to, "teacher@example.com");
            assert.ok(job.payload.html.includes("VERIFIED"));
        });

        it("should enqueue course moderation alert through EmailService", async () => {
            const queue = new MockEmailQueue();
            const useCase = new QueueEmailUseCase(queue);
            const service = new EmailService(useCase);

            await service.sendCourseDelistedNotification(
                "author@example.com",
                "Prof. Alan",
                "Machine Learning 101",
                "Copyright issue"
            );

            assert.equal(queue.enqueuedJobs.length, 1);
            const job = queue.enqueuedJobs[0];
            assert.equal(job.payload.to, "author@example.com");
            assert.ok(job.payload.html.includes("Machine Learning 101"));
            assert.ok(job.payload.html.includes("Copyright issue"));
        });
    });

    describe("3. Presentation Layer (Templates)", () => {
        it("should render welcome email properly", () => {
            const { html, subject } = renderWelcomeEmail({ name: "Alice" });
            assert.ok(subject.includes("Welcome to Coursity"));
            assert.ok(html.includes("Alice"));
        });

        it("should render subscription purchased email properly", () => {
            const { html, subject } = renderSubscriptionPurchasedEmail({
                teacherName: "Bob",
                planName: "Pro Instructor",
                amount: 999,
                currency: "INR",
                billingCycle: "monthly",
                currentPeriodEnd: new Date("2026-12-01"),
                invoiceNumber: "INV-99901",
            });

            assert.ok(subject.includes("Pro Instructor"));
            assert.ok(html.includes("INV-99901"));
            assert.ok(html.includes("Bob"));
        });
    });
});

