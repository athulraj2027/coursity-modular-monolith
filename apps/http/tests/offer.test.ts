import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { IOfferRepository } from "../src/modules/offer/domain/repositories/offer.repository";
import { OfferEntity } from "../src/modules/offer/domain/entities/offer.entity";
import { GetPlanOfferUseCase } from "../src/modules/offer/application/use-cases/get-plan-offer.usecase";
import { GetActiveOffersUseCase } from "../src/modules/offer/application/use-cases/get-active-offers.usecase";
import { calculateDiscountedCheckoutPrice } from "../src/modules/subscription/domain/constants/billing.constants";

class MockOfferRepository implements IOfferRepository {
  public offers: OfferEntity[] = [];

  async findById(id: string): Promise<OfferEntity | null> {
    return this.offers.find((o) => o.id === id) || null;
  }

  async findActiveOffers(planId?: string, billingCycle?: string): Promise<OfferEntity[]> {
    const now = new Date();
    return this.offers.filter((o) => {
      if (!o.isActive) return false;
      if (o.validFrom > now) return false;
      if (o.validUntil && o.validUntil < now) return false;
      if (o.maxRedemptions !== null && o.usedRedemptions >= o.maxRedemptions) return false;
      if (planId && o.applicablePlans && o.applicablePlans.length > 0) {
        if (!o.applicablePlans.some((ap) => ap.planId === planId)) return false;
      }
      if (billingCycle && o.applicableCycles && o.applicableCycles.length > 0) {
        if (!o.applicableCycles.some((ac) => ac.billingCycle === billingCycle)) return false;
      }
      return true;
    });
  }

  async create(data: any): Promise<OfferEntity> {
    const offer: OfferEntity = {
      id: `offer_${Math.random().toString(36).substring(2, 9)}`,
      title: data.title,
      description: data.description || null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxDiscountAmount: data.maxDiscountAmount ?? null,
      minOrderAmount: data.minOrderAmount ?? null,
      eligibility: data.eligibility || "ALL_TEACHERS",
      badgeText: data.badgeText || null,
      maxRedemptions: data.maxRedemptions ?? null,
      usedRedemptions: 0,
      maxRedemptionsPerUser: data.maxRedemptionsPerUser || 1,
      validFrom: data.validFrom || new Date(),
      validUntil: data.validUntil || null,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      applicablePlans: data.applicablePlanIds?.map((pid: string) => ({ id: `op_${pid}`, offerId: "", planId: pid, createdAt: new Date() })),
      applicableCycles: data.applicableCycles?.map((cycle: string) => ({ id: `oc_${cycle}`, offerId: "", billingCycle: cycle, createdAt: new Date() })),
    };
    this.offers.push(offer);
    return offer;
  }

  async update(id: string, data: any): Promise<OfferEntity> {
    const offer = await this.findById(id);
    if (!offer) throw new Error("Offer not found");
    Object.assign(offer, data, { updatedAt: new Date() });
    return offer;
  }

  async delete(id: string): Promise<void> {
    this.offers = this.offers.filter((o) => o.id !== id);
  }

  async toggleStatus(id: string): Promise<OfferEntity> {
    const offer = await this.findById(id);
    if (!offer) throw new Error("Offer not found");
    offer.isActive = !offer.isActive;
    return offer;
  }

  async findAllAdmin(query: any): Promise<any> {
    return { offers: this.offers, total: this.offers.length };
  }

  async findRedemptionCountByUser(offerId: string, teacherProfileId: string): Promise<number> {
    return 0;
  }

  async hasUserSubscribedBefore(teacherProfileId: string): Promise<boolean> {
    return false;
  }

  async incrementRedemptions(offerId: string): Promise<void> {
    const offer = await this.findById(offerId);
    if (offer) offer.usedRedemptions += 1;
  }

  async recordRedemption(data: any): Promise<any> {
    const offer = await this.findById(data.offerId);
    if (offer) offer.usedRedemptions += 1;
    return { id: "red_1", ...data, redeemedAt: new Date() };
  }

  async getAnalytics(): Promise<any> {
    return {
      totalOffers: this.offers.length,
      activeOffers: this.offers.filter((o) => o.isActive).length,
      totalRedemptions: 0,
      totalDiscountGiven: 0,
      totalRevenueGenerated: 0,
      recentRedemptions: [],
    };
  }
}

describe("Codeless Default Promotional Offers System", () => {
  let offerRepo: MockOfferRepository;
  let mockPlanRepo: any;
  let getPlanOfferUseCase: GetPlanOfferUseCase;
  let getActiveOffersUseCase: GetActiveOffersUseCase;

  beforeEach(async () => {
    offerRepo = new MockOfferRepository();
    mockPlanRepo = {
      findById: async (id: string) => ({
        id,
        name: "Pro Tier",
        price: 299900, // ₹2999 base price (in paise)
        billingCycle: "MONTHLY",
        isActive: true,
      }),
    };

    getPlanOfferUseCase = new GetPlanOfferUseCase(offerRepo, mockPlanRepo);
    getActiveOffersUseCase = new GetActiveOffersUseCase(offerRepo);

    // Seed test offers
    await offerRepo.create({
      title: "50% Launch Discount",
      discountType: "PERCENTAGE",
      discountValue: 50,
      maxDiscountAmount: 1000,
      minOrderAmount: 1000,
      eligibility: "ALL_TEACHERS",
      badgeText: "50% LAUNCH SPECIAL",
      isActive: true,
    });

    await offerRepo.create({
      title: "Flat ₹500 Welcome Voucher",
      discountType: "FLAT",
      discountValue: 500,
      minOrderAmount: 1500,
      eligibility: "ALL_TEACHERS",
      badgeText: "₹500 OFF",
      isActive: true,
    });
  });

  describe("Billing Discount Calculation Helper", () => {
    it("should calculate 50% discount capped at maxDiscountAmount", () => {
      const res = calculateDiscountedCheckoutPrice(2999, "PERCENTAGE", 50, 1000, 18);
      assert.equal(res.rawBasePrice, 2999);
      assert.equal(res.discountAmount, 1000);
      assert.equal(res.discountedBasePrice, 1999);
      assert.equal(res.taxAmount, 359.82);
      assert.equal(res.totalAmount, 2358.82);
      assert.equal(res.savings, 1000);
    });

    it("should calculate flat discount correctly", () => {
      const res = calculateDiscountedCheckoutPrice(2999, "FLAT", 500, null, 18);
      assert.equal(res.discountAmount, 500);
      assert.equal(res.discountedBasePrice, 2499);
      assert.equal(res.taxAmount, 449.82);
      assert.equal(res.totalAmount, 2948.82);
      assert.equal(res.savings, 500);
    });
  });

  describe("GetPlanOfferUseCase", () => {
    it("should automatically select and apply the best default offer for a plan", async () => {
      const res = await getPlanOfferUseCase.execute({
        planId: "plan_pro",
        billingCycle: "MONTHLY",
      });

      assert.equal(res.hasOffer, true);
      assert.equal(res.title, "50% Launch Discount");
      assert.equal(res.discountAmount, 1000);
      assert.equal(res.discountedBasePrice, 1999);
      assert.equal(res.taxAmount, 359.82);
      assert.equal(res.totalAmount, 2358.82);
      assert.equal(res.savings, 1000);
    });

    it("should return standard pricing when no offers apply", async () => {
      offerRepo.offers = [];
      const res = await getPlanOfferUseCase.execute({
        planId: "plan_pro",
        billingCycle: "MONTHLY",
      });

      assert.equal(res.hasOffer, false);
      assert.equal(res.discountAmount, 0);
      assert.equal(res.discountedBasePrice, 2999);
      assert.equal(res.savings, 0);
    });
  });

  describe("GetActiveOffersUseCase", () => {
    it("should fetch all active promotional offers", async () => {
      const active = await getActiveOffersUseCase.execute("plan_pro", "MONTHLY");
      assert.equal(active.length, 2);
    });
  });

  describe("CreateRazorpayOrderUseCase with Default Offers", () => {
    it("should calculate discounted total amount and embed offer metadata in Razorpay notes", async () => {
      class MockPaymentGateway {
        public lastOrderInput: any = null;
        isConfigured() { return true; }
        async createOrder(input: any) {
          this.lastOrderInput = input;
          return {
            orderId: "order_mock_test_123",
            amount: input.amount,
            currency: input.currency || "INR",
            keyId: "key_mock_123",
            receipt: input.receipt,
            notes: input.notes,
          };
        }
        verifyPaymentSignature() { return true; }
        verifyWebhookSignature() { return true; }
        async fetchPaymentDetails() { return null; }
        async refundPayment() { return {} as any; }
      }

      const { CreateRazorpayOrderUseCase } = await import(
        "../src/modules/subscription/application/use-cases/create-razorpay-order.usecase"
      );

      const paymentGateway = new MockPaymentGateway();
      const createOrderUseCase = new CreateRazorpayOrderUseCase(
        mockPlanRepo,
        paymentGateway as any,
        getPlanOfferUseCase
      );

      const res = await createOrderUseCase.execute({
        planId: "plan_pro",
        teacherProfileId: "tp_teacher_1",
        userEmail: "teacher@example.com",
        userName: "John Doe",
        billingCycle: "MONTHLY",
      });

      // Base price = ₹2999. 50% discount capped at max ₹1000 = ₹1000 discount.
      // Discounted base = ₹1999. GST 18% = 359.82. Total = 2358.82.
      assert.equal(res.amount, 2358.82);
      assert.equal(res.offerApplied?.title, "50% Launch Discount");
      assert.equal(res.offerApplied?.discountAmount, 1000);
      assert.equal(paymentGateway.lastOrderInput.amount, 2358.82);
      assert.equal(paymentGateway.lastOrderInput.notes.offerTitle, "50% Launch Discount");
      assert.equal(paymentGateway.lastOrderInput.notes.discountAmount, "1000");
    });
  });
});
