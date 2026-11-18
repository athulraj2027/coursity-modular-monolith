import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  TeacherSubscription,
  TeacherPlanUsage,
  SubscriptionInvoice,
  QuotaEvaluationResult,
  BillingCycle,
  SubscriptionStatus,
  PaymentStatus,
  SubscriptionRepository,
  ISubscriptionRepository,
  ISubscriptionUsageRepository,
  IQuotaEvaluationRepository,
  IAdminSubscriptionRepository,
  IInvoiceRepository,
  SubscriptionPeriodPolicy,
  SubscriptionPlanPolicy,
  SubscriptionBillingPolicy,
  DEFAULT_GST_PERCENT,
  SubscribePlanUseCase,
  CreateRazorpayOrderUseCase,
  VerifyRazorpayPaymentUseCase,
  CheckQuotaUseCase,
  RecordUsageUseCase,
  CancelSubscriptionUseCase,
  GetTeacherSubscriptionUseCase,
  GetInvoicesUseCase,
  AdminGetSubscriptionsUseCase,
  AdminGetSubscriptionDetailUseCase,
  AdminCancelSubscriptionUseCase,
  AdminChangeSubscriptionPlanUseCase,
  AdminExtendSubscriptionUseCase,
  AdminRefundSubscriptionUseCase,
  createSubscriptionModule,
  subscribePlanSchema,
  recordUsageSchema,
  checkQuotaQuerySchema,
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  adminSubscriptionQuerySchema,
  adminCancelSubscriptionSchema,
  adminRefundSubscriptionSchema,
  adminExtendSubscriptionSchema,
  adminChangeSubscriptionPlanSchema,
  SubscriptionError,
  SubscriptionNotFoundError,
  SubscriptionPlanInactiveError,
  SubscriptionAlreadySubscribedError,
  SubscriptionDowngradeNotAllowedError,
  SubscriptionInvoiceNotFoundError,
  SubscriptionPaymentVerificationError,
  SubscriptionUsageNotAllowedError,
  SubscriptionRefundError,
  SubscriptionValidationError,
  GetMySubscriptionController,
  SubscribePlanController,
} from "../src/modules/subscription";
import { IPlanRepository, Plan, Feature } from "@/modules/plan";
import { IPaymentGateway, CreateOrderOptions, PaymentOrderResult, RefundOptions, RefundResult } from "@/infrastructure/payment";
import { IEmailService } from "@/infrastructure/email";

// ============================================================================
// IN-MEMORY MOCKS
// ============================================================================

class InMemorySubscriptionRepository implements SubscriptionRepository {
  public subscriptions: Map<string, TeacherSubscription> = new Map();
  public usages: Map<string, TeacherPlanUsage> = new Map();
  public invoices: Map<string, any> = new Map();

  async findById(id: string): Promise<TeacherSubscription | null> {
    const sub = this.subscriptions.get(id);
    return sub ? { ...sub } : null;
  }

  async findActiveByTeacherId(teacherProfileId: string): Promise<TeacherSubscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.teacherProfileId === teacherProfileId && (sub.status === "ACTIVE" || sub.status === "PAST_DUE")) {
        return { ...sub };
      }
    }
    return null;
  }

  async create(data: any): Promise<TeacherSubscription> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const sub: TeacherSubscription = {
      id,
      teacherProfileId: data.teacherProfileId,
      planId: data.planId,
      status: data.status || "ACTIVE",
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      trialEndsAt: data.trialEndsAt || null,
      externalCustomerId: data.externalCustomerId || null,
      externalSubscriptionId: data.externalSubscriptionId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, sub);
    return { ...sub };
  }

  async updateStatus(
    id: string,
    status: SubscriptionStatus,
    canceledAt?: Date | null
  ): Promise<TeacherSubscription> {
    const sub = this.subscriptions.get(id);
    if (!sub) throw new Error("Not found");
    sub.status = status;
    if (canceledAt !== undefined) sub.canceledAt = canceledAt;
    sub.updatedAt = new Date();
    return { ...sub };
  }

  async cancelAtPeriodEnd(id: string, cancel: boolean): Promise<TeacherSubscription> {
    const sub = this.subscriptions.get(id);
    if (!sub) throw new Error("Not found");
    sub.cancelAtPeriodEnd = cancel;
    sub.updatedAt = new Date();
    return { ...sub };
  }

  async changePlan(
    id: string,
    newPlanId: string,
    newPeriodStart: Date,
    newPeriodEnd: Date
  ): Promise<TeacherSubscription> {
    const sub = this.subscriptions.get(id);
    if (!sub) throw new Error("Not found");
    sub.planId = newPlanId;
    sub.currentPeriodStart = newPeriodStart;
    sub.currentPeriodEnd = newPeriodEnd;
    sub.status = "ACTIVE";
    sub.updatedAt = new Date();
    return { ...sub };
  }

  async getUsage(subscriptionId: string, featureCode: string, periodStart: Date): Promise<TeacherPlanUsage | null> {
    const key = `${subscriptionId}_${featureCode}`;
    const usage = this.usages.get(key);
    return usage ? { ...usage } : null;
  }

  async recordUsage(
    subscriptionId: string,
    teacherProfileId: string,
    featureCode: string,
    periodStart: Date,
    periodEnd: Date,
    amount: number,
    isAbsolute?: boolean
  ): Promise<TeacherPlanUsage> {
    const key = `${subscriptionId}_${featureCode}`;
    const existing = this.usages.get(key);
    const newUsageVal = isAbsolute ? amount : (existing ? existing.currentUsage + amount : amount);
    const usage: TeacherPlanUsage = {
      id: existing?.id || `use_${Date.now()}`,
      subscriptionId,
      teacherProfileId,
      featureCode,
      currentUsage: newUsageVal,
      periodStart,
      periodEnd,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.usages.set(key, usage);
    return { ...usage };
  }

  async getAllCurrentUsages(subscriptionId: string): Promise<TeacherPlanUsage[]> {
    return Array.from(this.usages.values()).filter((u) => u.subscriptionId === subscriptionId);
  }

  async evaluateQuota(
    teacherProfileId: string,
    featureCode: string,
    requestedAmount = 1
  ): Promise<QuotaEvaluationResult> {
    const active = await this.findActiveByTeacherId(teacherProfileId);
    if (!active) {
      return {
        allowed: false,
        featureCode,
        limit: 0,
        isUnlimited: false,
        currentUsage: 0,
        remaining: 0,
        unit: null,
        reason: "No active subscription",
      };
    }
    const usage = await this.getUsage(active.id, featureCode, active.currentPeriodStart);
    const current = usage?.currentUsage || 0;
    const limit = 10; // default mock limit
    const remaining = Math.max(0, limit - current);
    const allowed = remaining >= requestedAmount;
    return {
      allowed,
      featureCode,
      limit,
      isUnlimited: false,
      currentUsage: current,
      remaining,
      unit: "count",
    };
  }

  async adminFindAll(filter: any): Promise<any> {
    const items = Array.from(this.subscriptions.values()).map((s) => ({
      id: s.id,
      teacherProfileId: s.teacherProfileId,
      instructorName: "Test Instructor",
      instructorEmail: "instructor@test.com",
      planId: s.planId,
      planName: "Pro Plan",
      planSlug: "pro",
      billingCycle: "MONTHLY" as BillingCycle,
      price: 2999,
      currency: "INR",
      status: s.status,
      currentPeriodStart: s.currentPeriodStart,
      currentPeriodEnd: s.currentPeriodEnd,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
      totalInvoicedAmount: 2999,
      invoiceCount: 1,
      createdAt: s.createdAt,
    }));
    return {
      items,
      total: items.length,
      metrics: {
        totalSubscriptions: items.length,
        activeSubscriptions: items.filter((i) => i.status === "ACTIVE").length,
        mrr: 2999,
        totalRevenue: 2999,
        churnedCount: 0,
        pastDueCount: 0,
      },
    };
  }

  async adminFindById(id: string): Promise<any | null> {
    const sub = this.subscriptions.get(id);
    return sub ? { ...sub, teacher: { name: "Instructor" } } : null;
  }

  async adminExtendPeriod(id: string, newPeriodEnd: Date): Promise<TeacherSubscription> {
    const sub = this.subscriptions.get(id);
    if (!sub) throw new Error("Not found");
    sub.currentPeriodEnd = newPeriodEnd;
    sub.updatedAt = new Date();
    return { ...sub };
  }

  async adminUpdateInvoiceStatus(invoiceId: string, status: any): Promise<any> {
    const inv = this.invoices.get(invoiceId);
    if (inv) inv.status = status;
    return inv;
  }

  async createInvoice(data: any): Promise<any> {
    const id = `inv_${Date.now()}`;
    const inv = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
    this.invoices.set(id, inv);
    return inv;
  }

  async findInvoiceById(invoiceId: string): Promise<any | null> {
    return this.invoices.get(invoiceId) || null;
  }

  async findInvoicesByTeacher(teacherProfileId: string): Promise<any[]> {
    return Array.from(this.invoices.values());
  }

  async findTeacherWithUser(teacherProfileId: string): Promise<any | null> {
    return {
      id: teacherProfileId,
      profile: {
        user: { name: "Instructor Dave", email: "dave@example.com" },
        phone: "+919876543210",
        country: "India",
      },
    };
  }
}

class MockPlanRepository implements IPlanRepository {
  public plans: Map<string, Plan> = new Map();

  async findAll(includeInactive = false): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter((p) => includeInactive || p.isActive);
  }

  async findById(id: string): Promise<Plan | null> {
    return this.plans.get(id) || null;
  }

  async findBySlug(slug: string): Promise<Plan | null> {
    for (const p of this.plans.values()) {
      if (p.slug.toLowerCase() === slug.toLowerCase()) return { ...p };
    }
    return null;
  }

  async findAllFeatures(): Promise<Feature[]> {
    return [];
  }

  async findFeatureByCode(code: string): Promise<Feature | null> {
    return null;
  }

  async create(data: any): Promise<Plan> {
    const id = `plan_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const plan: Plan = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
    this.plans.set(id, plan);
    return plan;
  }

  async update(id: string, data: any): Promise<Plan> {
    const plan = this.plans.get(id);
    if (!plan) throw new Error("Plan not found");
    const updated = { ...plan, ...data, updatedAt: new Date() };
    this.plans.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.plans.delete(id);
  }
}

class MockPaymentGateway implements IPaymentGateway {
  public isConfiguredResult = true;
  public createdOrders: CreateOrderOptions[] = [];
  public refunds: RefundOptions[] = [];

  isConfigured(): boolean {
    return this.isConfiguredResult;
  }

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrderResult> {
    this.createdOrders.push(options);
    return {
      orderId: `order_${Date.now()}`,
      amount: options.amount,
      currency: options.currency || "INR",
      receipt: options.receipt,
      keyId: "rzp_test_mock_key",
    };
  }

  verifyPaymentSignature(options: { orderId: string; paymentId: string; signature: string }): boolean {
    return options.signature === "valid_signature";
  }

  async refundPayment(options: RefundOptions): Promise<RefundResult> {
    this.refunds.push(options);
    return {
      refundId: `rfnd_${Date.now()}`,
      paymentId: options.paymentId,
      amount: options.amount,
      currency: options.currency || "INR",
      status: "processed",
    };
  }
}

class MockEmailService implements Partial<IEmailService> {
  public sentPurchaseNotifications: any[] = [];
  public sentCustomEmails: any[] = [];

  async sendSubscriptionPurchasedNotification(params: any): Promise<any> {
    this.sentPurchaseNotifications.push(params);
  }

  async sendCustomEmail(params: any): Promise<any> {
    this.sentCustomEmails.push(params);
  }
}

class MockTeacherProfileResolver {
  async getOrCreateTeacherProfileId(userId: string): Promise<string> {
    return `tp_${userId}`;
  }
}

// ============================================================================
// TESTS SUITE
// ============================================================================

describe("Subscription Module - Clean Architecture & SOLID Principles Suite", () => {
  let subRepo: InMemorySubscriptionRepository;
  let planRepo: MockPlanRepository;
  let paymentGateway: MockPaymentGateway;
  let emailService: MockEmailService;
  let profileResolver: MockTeacherProfileResolver;

  let freePlan: Plan;
  let starterPlan: Plan;
  let proPlan: Plan;

  beforeEach(async () => {
    subRepo = new InMemorySubscriptionRepository();
    planRepo = new MockPlanRepository();
    paymentGateway = new MockPaymentGateway();
    emailService = new MockEmailService();
    profileResolver = new MockTeacherProfileResolver();

    freePlan = await planRepo.create({
      name: "Starter Free Tier",
      slug: "starter",
      price: 0,
      currency: "INR",
      billingCycle: "MONTHLY",
      trialDays: 0,
      isActive: true,
      features: [],
    });

    starterPlan = await planRepo.create({
      name: "Basic Plan",
      slug: "basic",
      price: 99900, // ₹999
      currency: "INR",
      billingCycle: "MONTHLY",
      trialDays: 7,
      isActive: true,
      features: [],
    });

    proPlan = await planRepo.create({
      name: "Pro Master Tier",
      slug: "pro",
      price: 299900, // ₹2999
      currency: "INR",
      billingCycle: "MONTHLY",
      trialDays: 0,
      isActive: true,
      features: [],
    });
  });

  // --------------------------------------------------------------------------
  // 1. DOMAIN POLICIES
  // --------------------------------------------------------------------------
  describe("1. Domain Policies", () => {
    describe("SubscriptionPeriodPolicy", () => {
      it("calculates accurate period end dates for all billing cycles", () => {
        const start = new Date("2026-01-01T00:00:00Z");

        const monthlyEnd = SubscriptionPeriodPolicy.calculatePeriodEnd(start, "MONTHLY");
        assert.equal(monthlyEnd.getUTCMonth(), 1); // Feb

        const quarterlyEnd = SubscriptionPeriodPolicy.calculatePeriodEnd(start, "QUARTERLY");
        assert.equal(quarterlyEnd.getUTCMonth(), 3); // April

        const yearlyEnd = SubscriptionPeriodPolicy.calculatePeriodEnd(start, "YEARLY");
        assert.equal(yearlyEnd.getUTCFullYear(), 2027);

        const lifetimeEnd = SubscriptionPeriodPolicy.calculatePeriodEnd(start, "LIFETIME");
        assert.equal(lifetimeEnd.getUTCFullYear(), 2126);
      });

      it("calculates trial end date or returns null for non-trial plans", () => {
        const start = new Date("2026-01-01T00:00:00Z");
        assert.equal(SubscriptionPeriodPolicy.calculateTrialEnd(start, 0), null);
        assert.equal(SubscriptionPeriodPolicy.calculateTrialEnd(start, -5), null);

        const trialEnd = SubscriptionPeriodPolicy.calculateTrialEnd(start, 14);
        assert.ok(trialEnd);
        assert.equal(trialEnd?.getUTCDate(), 15);
      });

      it("calculates period extensions cleanly", () => {
        const currentEnd = new Date("2026-06-01T00:00:00Z");
        const explicitEnd = new Date("2026-08-01T00:00:00Z");

        const extendedByDate = SubscriptionPeriodPolicy.calculateExtension(currentEnd, undefined, explicitEnd);
        assert.equal(extendedByDate.getTime(), explicitEnd.getTime());

        const extendedByDays = SubscriptionPeriodPolicy.calculateExtension(currentEnd, 30);
        assert.ok(extendedByDays.getTime() > currentEnd.getTime());
      });
    });

    describe("SubscriptionPlanPolicy", () => {
      it("throws SubscriptionPlanInactiveError if target plan is inactive", () => {
        assert.throws(
          () =>
            SubscriptionPlanPolicy.assertCanSubscribe(
              { id: "p1", name: "Archived Plan", isActive: false, price: 100 },
              null,
              null
            ),
          SubscriptionPlanInactiveError
        );
      });

      it("throws SubscriptionAlreadySubscribedError if user already has identical active plan", () => {
        assert.throws(
          () =>
            SubscriptionPlanPolicy.assertCanSubscribe(
              { id: "p1", name: "Pro Plan", isActive: true, price: 100 },
              { id: "p1", name: "Pro Plan", isActive: true, price: 100 },
              "ACTIVE"
            ),
          SubscriptionAlreadySubscribedError
        );
      });

      it("throws SubscriptionDowngradeNotAllowedError on active plan downgrade to lower price tier", () => {
        assert.throws(
          () =>
            SubscriptionPlanPolicy.assertCanSubscribe(
              { id: "p_low", name: "Starter", isActive: true, price: 50 },
              { id: "p_high", name: "Enterprise", isActive: true, price: 200 },
              "ACTIVE"
            ),
          SubscriptionDowngradeNotAllowedError
        );
      });

      it("permits upgrading from lower to higher tier, or subscribing after expiration", () => {
        assert.doesNotThrow(() => {
          SubscriptionPlanPolicy.assertCanSubscribe(
            { id: "p_high", name: "Enterprise", isActive: true, price: 200 },
            { id: "p_low", name: "Starter", isActive: true, price: 50 },
            "ACTIVE"
          );
        });

        assert.doesNotThrow(() => {
          SubscriptionPlanPolicy.assertCanSubscribe(
            { id: "p_low", name: "Starter", isActive: true, price: 50 },
            { id: "p_high", name: "Enterprise", isActive: true, price: 200 },
            "EXPIRED"
          );
        });
      });
    });

    describe("SubscriptionBillingPolicy", () => {
      it("calculates checkout price with 18% GST and billing cycle discounts", () => {
        // Free plan
        const freeBreakdown = SubscriptionBillingPolicy.calculatePlanCheckoutPrice(0);
        assert.equal(freeBreakdown.basePrice, 0);
        assert.equal(freeBreakdown.taxAmount, 0);
        assert.equal(freeBreakdown.totalAmount, 0);

        // Monthly ₹1,000 (100,000 paise) + 18% GST = ₹1,180
        const monthly = SubscriptionBillingPolicy.calculatePlanCheckoutPrice(100000);
        assert.equal(monthly.basePrice, 1000);
        assert.equal(monthly.gstPercent, 18);
        assert.equal(monthly.taxAmount, 180);
        assert.equal(monthly.totalAmount, 1180);

        // Yearly: 20% discount on monthly (800) * 12 = 9600 + 18% GST (1728) = 11328
        const yearly = SubscriptionBillingPolicy.calculatePlanCheckoutPrice(100000, "YEARLY");
        assert.equal(yearly.monthlyCalculated, 800);
        assert.equal(yearly.basePrice, 9600);
        assert.equal(yearly.taxAmount, 1728);
        assert.equal(yearly.totalAmount, 11328);
      });

      it("calculates discounted checkout price with percentage and flat caps", () => {
        const discounted = SubscriptionBillingPolicy.calculateDiscountedCheckoutPrice(
          1000,
          "PERCENTAGE",
          50, // 50% off
          300 // max cap ₹300
        );
        assert.equal(discounted.discountAmount, 300);
        assert.equal(discounted.discountedBasePrice, 700);
        assert.equal(discounted.taxAmount, 126); // 18% of 700
        assert.equal(discounted.totalAmount, 826);
      });
    });
  });

  // --------------------------------------------------------------------------
  // 2. PRESENTATION SCHEMAS
  // --------------------------------------------------------------------------
  describe("2. Presentation Schemas", () => {
    it("validates subscribePlanSchema", () => {
      const valid = subscribePlanSchema.parse({ planId: "p123" });
      assert.equal(valid.planId, "p123");
      assert.throws(() => subscribePlanSchema.parse({ planId: "" }));
    });

    it("validates createRazorpayOrderSchema and verifyRazorpayPaymentSchema", () => {
      const order = createRazorpayOrderSchema.parse({ planId: "plan_1", billingCycle: "YEARLY" });
      assert.equal(order.billingCycle, "YEARLY");

      const verify = verifyRazorpayPaymentSchema.parse({
        orderId: "ord_1",
        paymentId: "pay_1",
        signature: "sig_1",
        planId: "plan_1",
      });
      assert.equal(verify.orderId, "ord_1");
    });

    it("validates admin subscription schemas", () => {
      const cancel = adminCancelSubscriptionSchema.parse({ immediate: true, reason: "Abuse" });
      assert.equal(cancel.immediate, true);

      const refund = adminRefundSubscriptionSchema.parse({
        invoiceId: "inv_1",
        amount: "500",
        reason: "Double charged",
      });
      assert.equal(refund.amount, 500);
    });
  });

  // --------------------------------------------------------------------------
  // 3. APPLICATION USE CASES
  // --------------------------------------------------------------------------
  describe("3. Application Use Cases", () => {
    describe("SubscribePlanUseCase", () => {
      it("subscribes teacher to active plan and activates subscription", async () => {
        const useCase = new SubscribePlanUseCase(subRepo, planRepo);
        const sub = await useCase.execute({
          planId: starterPlan.id,
          teacherProfileId: "tp_1",
        });

        assert.equal(sub.teacherProfileId, "tp_1");
        assert.equal(sub.planId, starterPlan.id);
        assert.equal(sub.status, "ACTIVE");
      });

      it("creates ₹0 activation invoice for free plan", async () => {
        const useCase = new SubscribePlanUseCase(subRepo, planRepo);
        const sub = await useCase.execute({
          planId: freePlan.id,
          teacherProfileId: "tp_free",
        });

        assert.equal(sub.status, "ACTIVE");
        const invoices = await subRepo.findInvoicesByTeacher("tp_free");
        assert.ok(invoices.length > 0);
        assert.equal(invoices[0].amount, 0);
        assert.equal(invoices[0].paymentMethod, "FREE_ACTIVATION");
      });

      it("rejects subscribing to lower tier when already on active higher tier", async () => {
        const useCase = new SubscribePlanUseCase(subRepo, planRepo);
        await useCase.execute({
          planId: proPlan.id,
          teacherProfileId: "tp_active",
        });

        await assert.rejects(
          async () =>
            useCase.execute({
              planId: starterPlan.id,
              teacherProfileId: "tp_active",
            }),
          SubscriptionDowngradeNotAllowedError
        );
      });
    });

    describe("CreateRazorpayOrderUseCase", () => {
      it("creates order with dynamic GST breakdown", async () => {
        const useCase = new CreateRazorpayOrderUseCase(planRepo, paymentGateway, undefined, subRepo);
        const order = await useCase.execute({
          planId: starterPlan.id,
          teacherProfileId: "tp_order",
          userEmail: "test@teacher.com",
          userName: "Instructor",
          billingCycle: "MONTHLY",
        });

        assert.ok(order.orderId);
        assert.equal(order.currency, "INR");
        assert.ok(order.amount > 0);
        assert.equal(paymentGateway.createdOrders.length, 1);
      });
    });

    describe("VerifyRazorpayPaymentUseCase", () => {
      it("verifies payment, activates subscription, creates invoice, and sends email", async () => {
        const useCase = new VerifyRazorpayPaymentUseCase(
          subRepo,
          planRepo,
          paymentGateway,
          emailService as any
        );

        const result = await useCase.execute({
          orderId: "ord_123",
          paymentId: "pay_123",
          signature: "valid_signature",
          planId: proPlan.id,
          teacherProfileId: "tp_verify",
          userEmail: "pro@teacher.com",
          userName: "Pro Teacher",
          billingCycle: "MONTHLY",
        });

        assert.equal(result.subscription.status, "ACTIVE");
        assert.equal(result.invoice.status, "PAID");
        assert.equal(emailService.sentPurchaseNotifications.length, 1);
      });

      it("rejects invalid signature with SubscriptionPaymentVerificationError", async () => {
        const useCase = new VerifyRazorpayPaymentUseCase(
          subRepo,
          planRepo,
          paymentGateway,
          emailService as any
        );

        await assert.rejects(
          async () =>
            useCase.execute({
              orderId: "ord_123",
              paymentId: "pay_123",
              signature: "invalid_tampered_signature",
              planId: proPlan.id,
              teacherProfileId: "tp_fail",
              userEmail: "pro@teacher.com",
              userName: "Pro Teacher",
            }),
          SubscriptionPaymentVerificationError
        );
      });
    });

    describe("CheckQuotaUseCase & RecordUsageUseCase", () => {
      it("evaluates quota and records usage for active subscription", async () => {
        const subUseCase = new SubscribePlanUseCase(subRepo, planRepo);
        await subUseCase.execute({
          planId: proPlan.id,
          teacherProfileId: "tp_quota",
        });

        const checkQuotaUC = new CheckQuotaUseCase(subRepo);
        const evalResult = await checkQuotaUC.execute("tp_quota", "COURSES_LIMIT", 1);
        assert.equal(evalResult.allowed, true);

        const recordUsageUC = new RecordUsageUseCase(subRepo);
        const recorded = await recordUsageUC.execute("tp_quota", "COURSES_LIMIT", 2);
        assert.equal(recorded.currentUsage, 2);
      });

      it("throws SubscriptionUsageNotAllowedError if recording usage with no active subscription", async () => {
        const recordUsageUC = new RecordUsageUseCase(subRepo);
        await assert.rejects(
          async () => recordUsageUC.execute("tp_no_sub", "COURSES_LIMIT", 1),
          SubscriptionUsageNotAllowedError
        );
      });
    });

    describe("CancelSubscriptionUseCase", () => {
      it("cancels immediately or flags cancel at period end", async () => {
        const subUseCase = new SubscribePlanUseCase(subRepo, planRepo);
        await subUseCase.execute({
          planId: proPlan.id,
          teacherProfileId: "tp_cancel",
        });

        const cancelUC = new CancelSubscriptionUseCase(subRepo);

        // Cancel at period end
        const flagged = await cancelUC.execute("tp_cancel", false);
        assert.equal(flagged.cancelAtPeriodEnd, true);

        // Cancel immediately
        const canceled = await cancelUC.execute("tp_cancel", true);
        assert.equal(canceled.status, "CANCELED");
        assert.ok(canceled.canceledAt);
      });

      it("throws SubscriptionNotFoundError when canceling nonexistent subscription", async () => {
        const cancelUC = new CancelSubscriptionUseCase(subRepo);
        await assert.rejects(
          async () => cancelUC.execute("tp_none"),
          SubscriptionNotFoundError
        );
      });
    });

    describe("GetTeacherSubscriptionUseCase", () => {
      it("auto-assigns starter plan if teacher has no existing subscription", async () => {
        const getSubUC = new GetTeacherSubscriptionUseCase(subRepo, planRepo);
        const details = await getSubUC.execute("tp_newbie");

        assert.ok(details.subscription);
        assert.equal(details.subscription?.planId, freePlan.id);
        assert.equal(details.subscription?.status, "ACTIVE");
      });
    });

    describe("GetInvoicesUseCase", () => {
      it("returns mapped invoices with tax and base amount calculation", async () => {
        await subRepo.createInvoice({
          subscriptionId: "sub_1",
          invoiceNumber: "INV-100",
          amount: 1180,
          currency: "INR",
          status: "PAID",
          paymentMethod: "RAZORPAY",
          paidAt: new Date(),
        });

        const getInvoicesUC = new GetInvoicesUseCase(subRepo);
        const invoices = await getInvoicesUC.execute("tp_1");

        assert.equal(invoices.length, 1);
        assert.equal(invoices[0].amount, 1180);
        assert.equal(invoices[0].taxPercent, 18);
      });
    });

    describe("Admin Use Cases", () => {
      it("adminFindAll returns paginated subscriptions and metrics", async () => {
        const useCase = new AdminGetSubscriptionsUseCase(subRepo);
        const result = await useCase.execute({});
        assert.ok(result.items);
        assert.ok(result.metrics);
      });

      it("adminExtendSubscription updates period end date", async () => {
        const sub = await subRepo.create({
          teacherProfileId: "tp_ext",
          planId: proPlan.id,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date("2026-06-01"),
        });

        const extendUC = new AdminExtendSubscriptionUseCase(subRepo);
        const extended = await extendUC.execute({
          subscriptionId: sub.id,
          daysToAdd: 30,
        });

        assert.ok(extended.currentPeriodEnd > new Date("2026-06-01"));
      });

      it("adminRefundSubscription processes refund through gateway and updates invoice", async () => {
        const sub = await subRepo.create({
          teacherProfileId: "tp_ref",
          planId: proPlan.id,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date("2026-06-01"),
        });

        const inv = await subRepo.createInvoice({
          subscriptionId: sub.id,
          invoiceNumber: "INV-REF-1",
          amount: 1000,
          currency: "INR",
          status: "PAID",
          gatewayPaymentId: "pay_xyz",
        });

        const refundUC = new AdminRefundSubscriptionUseCase(subRepo, paymentGateway, emailService as any);
        const refundResult = await refundUC.execute({
          subscriptionId: sub.id,
          invoiceId: inv.id,
          amount: 1000,
          reason: "Customer request",
          cancelSubscriptionImmediately: true,
        });

        assert.ok(refundResult.refundId);
        assert.equal(paymentGateway.refunds.length, 1);
        assert.equal(refundResult.subscriptionStatus, "CANCELED");
      });
    });
  });

  // --------------------------------------------------------------------------
  // 4. PRESENTATION CONTROLLERS & MODULE FACTORY
  // --------------------------------------------------------------------------
  describe("4. Presentation Controllers & DI Factory", () => {
    it("createSubscriptionModule instantiates all use cases, repository, and router", () => {
      const module = createSubscriptionModule({
        subscriptionRepo: subRepo,
        planRepo,
        paymentGateway,
        emailService: emailService as any,
        profileRepo: profileResolver,
      });

      assert.ok(module.subscriptionRepo);
      assert.ok(module.subscriptionController);
      assert.ok(module.subscriptionRouter);
      assert.ok(module.useCases.subscribePlanUseCase);
      assert.ok(module.useCases.createRazorpayOrderUseCase);
    });

    it("GetMySubscriptionController requires authenticated user", async () => {
      const getSubUC = new GetTeacherSubscriptionUseCase(subRepo, planRepo);
      const controller = new GetMySubscriptionController(getSubUC, profileResolver);

      const req = { user: undefined } as any;
      const res = {} as any;
      let errorThrown: any;
      const next = (err: any) => {
        errorThrown = err;
      };

      await controller.execute(req, res, next);
      assert.ok(errorThrown);
      assert.equal(errorThrown.statusCode, 401);
    });

    it("GetMySubscriptionController returns 200 with subscription details for authenticated user", async () => {
      const getSubUC = new GetTeacherSubscriptionUseCase(subRepo, planRepo);
      const controller = new GetMySubscriptionController(getSubUC, profileResolver);

      const req = { user: { userId: "user_123" } } as any;
      let responsePayload: any;
      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            responsePayload = { code, ...data };
            return responsePayload;
          },
        }),
      } as any;
      const next = () => {};

      await controller.execute(req, res, next);
      assert.equal(responsePayload.code, 200);
      assert.ok(responsePayload.data);
    });

    it("SubscribePlanController validates body and returns success response", async () => {
      const subUC = new SubscribePlanUseCase(subRepo, planRepo);
      const controller = new SubscribePlanController(subUC, profileResolver);

      const req = {
        user: { userId: "user_sub" },
        body: { planId: starterPlan.id },
      } as any;

      let responsePayload: any;
      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            responsePayload = { code, ...data };
            return responsePayload;
          },
        }),
      } as any;
      const next = () => {};

      await controller.execute(req, res, next);
      assert.equal(responsePayload.code, 200);
      assert.equal(responsePayload.data.planId, starterPlan.id);
    });
  });
});
