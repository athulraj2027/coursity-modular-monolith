import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  WalletEntity,
  WalletTransactionEntity,
  PayoutRequestEntity,
  WalletTopUpPolicy,
  WalletPayoutPolicy,
  WalletAdjustmentPolicy,
  ALLOWED_PAYOUT_TRANSITIONS,
  WalletError,
  WalletNotFoundError,
  InsufficientWalletBalanceError,
  InvalidTopUpAmountError,
  InvalidPayoutAmountError,
  PayoutRequestNotFoundError,
  InvalidPayoutStatusTransitionError,
  PaymentSignatureVerificationError,
  MissingBankDetailError,
  WalletAdjustmentReasonRequiredError,
  createTopUpOrderSchema,
  verifyTopUpPaymentSchema,
  requestPayoutSchema,
  adminProcessPayoutSchema,
  adminWalletAdjustmentSchema,
  GetOrCreateWalletUseCase,
  CreateTopUpOrderUseCase,
  VerifyTopUpPaymentUseCase,
  GetWalletTransactionsUseCase,
  RequestPayoutUseCase,
  GetUserPayoutsUseCase,
  AdminGetAllWalletsUseCase,
  AdminGetAllPayoutsUseCase,
  AdminProcessPayoutUseCase,
  AdminWalletAdjustmentUseCase,
  createWalletModule,
  IWalletRepository,
  IPayoutRequestRepository,
} from "../src/modules/wallet";
import {
  IPaymentGateway,
  CreateOrderOptions,
  PaymentOrderResult,
  RefundOptions,
  RefundResult,
} from "@/infrastructure/payment";

// In-memory test double for IWalletRepository
class InMemoryWalletRepository implements IWalletRepository {
  public wallets: Map<string, WalletEntity> = new Map();
  public transactions: WalletTransactionEntity[] = [];

  async findById(id: string): Promise<WalletEntity | null> {
    for (const w of this.wallets.values()) {
      if (w.id === id) return w;
    }
    return null;
  }

  async findByUserId(userId: string): Promise<WalletEntity | null> {
    return this.wallets.get(userId) || null;
  }

  async getOrCreateByUserId(userId: string): Promise<WalletEntity> {
    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = {
        id: `wallet-${userId}`,
        userId,
        balance: 0,
        lockedBalance: 0,
        availableBalance: 0,
        currency: "INR",
        status: "ACTIVE",
        totalEarned: 0,
        totalSpent: 0,
        totalWithdrawn: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.wallets.set(userId, wallet);
    }
    return wallet;
  }

  async credit(params: any): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    let wallet = await this.getOrCreateByUserId(params.userId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + params.amount;
    const totalEarned = params.type === "EARNING" ? wallet.totalEarned + params.amount : wallet.totalEarned;

    wallet = {
      ...wallet,
      balance: balanceAfter,
      availableBalance: WalletPayoutPolicy.calculateAvailableBalance(balanceAfter, wallet.lockedBalance),
      totalEarned,
      updatedAt: new Date(),
    };
    this.wallets.set(params.userId, wallet);

    const transaction: WalletTransactionEntity = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      walletId: wallet.id,
      type: params.type,
      direction: "CREDIT",
      amount: params.amount,
      balanceBefore,
      balanceAfter,
      currency: wallet.currency,
      status: "COMPLETED",
      description: params.description,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      performedByUserId: params.performedByUserId,
      notes: params.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(transaction);

    return { wallet, transaction };
  }

  async debit(params: any): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    let wallet = this.wallets.get(params.userId);
    if (!wallet) {
      throw new WalletNotFoundError();
    }

    const available = WalletPayoutPolicy.calculateAvailableBalance(wallet.balance, wallet.lockedBalance);
    WalletPayoutPolicy.validateSufficientBalance(available, params.amount);

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - params.amount;
    const totalSpent = params.type === "ENROLLMENT_PAYMENT" ? wallet.totalSpent + params.amount : wallet.totalSpent;

    wallet = {
      ...wallet,
      balance: balanceAfter,
      availableBalance: WalletPayoutPolicy.calculateAvailableBalance(balanceAfter, wallet.lockedBalance),
      totalSpent,
      updatedAt: new Date(),
    };
    this.wallets.set(params.userId, wallet);

    const transaction: WalletTransactionEntity = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      walletId: wallet.id,
      type: params.type,
      direction: "DEBIT",
      amount: params.amount,
      balanceBefore,
      balanceAfter,
      currency: wallet.currency,
      status: "COMPLETED",
      description: params.description,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      performedByUserId: params.performedByUserId,
      notes: params.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(transaction);

    return { wallet, transaction };
  }

  async getTransactions(query: any): Promise<{ items: WalletTransactionEntity[]; total: number }> {
    let list = this.transactions;
    if (query.walletId) {
      list = list.filter((t) => t.walletId === query.walletId);
    }
    return {
      items: list,
      total: list.length,
    };
  }

  async adminListWallets(query: any): Promise<any> {
    const items = Array.from(this.wallets.values()).map((w) => ({
      ...w,
      user: {
        id: w.userId,
        name: `User ${w.userId}`,
        email: `${w.userId}@example.com`,
        role: "STUDENT",
      },
    }));

    return {
      items,
      total: items.length,
      stats: {
        totalPlatformBalance: items.reduce((sum, w) => sum + w.balance, 0),
        totalLockedBalance: items.reduce((sum, w) => sum + w.lockedBalance, 0),
        totalLifetimeEarned: items.reduce((sum, w) => sum + w.totalEarned, 0),
        totalLifetimeWithdrawn: items.reduce((sum, w) => sum + w.totalWithdrawn, 0),
      },
    };
  }
}

// In-memory test double for IPayoutRequestRepository
class InMemoryPayoutRequestRepository implements IPayoutRequestRepository {
  public payouts: Map<string, PayoutRequestEntity> = new Map();

  constructor(private readonly walletRepo: InMemoryWalletRepository) {}

  async findById(id: string): Promise<PayoutRequestEntity | null> {
    return this.payouts.get(id) || null;
  }

  async findByUserId(query: any): Promise<{ items: PayoutRequestEntity[]; total: number }> {
    let list = Array.from(this.payouts.values());
    if (query.userId) {
      list = list.filter((p) => p.userId === query.userId);
    }
    return {
      items: list,
      total: list.length,
    };
  }

  async createRequest(params: any): Promise<PayoutRequestEntity> {
    WalletPayoutPolicy.validatePayoutAmount(params.amount);

    const wallet = await this.walletRepo.getOrCreateByUserId(params.userId);
    const available = WalletPayoutPolicy.calculateAvailableBalance(wallet.balance, wallet.lockedBalance);
    WalletPayoutPolicy.validateSufficientBalance(available, params.amount);

    // Lock funds in wallet
    wallet.lockedBalance += params.amount;
    wallet.availableBalance = WalletPayoutPolicy.calculateAvailableBalance(wallet.balance, wallet.lockedBalance);
    this.walletRepo.wallets.set(params.userId, wallet);

    const id = `payout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const payout: PayoutRequestEntity = {
      id,
      walletId: wallet.id,
      userId: params.userId,
      bankDetailId: params.bankDetailId,
      amount: params.amount,
      currency: "INR",
      status: "PENDING",
      payoutMethod: "BANK_ACCOUNT",
      accountSummary: "HDFC Bank (A/C: ••••1234)",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payouts.set(id, payout);
    return payout;
  }

  async adminListPayouts(query: any): Promise<any> {
    const items = Array.from(this.payouts.values());
    const pending = items.filter((p) => p.status === "PENDING");
    const completed = items.filter((p) => p.status === "COMPLETED");

    return {
      items,
      total: items.length,
      stats: {
        pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
        pendingCount: pending.length,
        completedAmount: completed.reduce((sum, p) => sum + p.amount, 0),
        completedCount: completed.length,
      },
    };
  }

  async processPayout(dto: any): Promise<PayoutRequestEntity> {
    const payout = this.payouts.get(dto.id);
    if (!payout) {
      throw new PayoutRequestNotFoundError();
    }

    WalletPayoutPolicy.validateStatusTransition(payout.status, dto.status);

    const wallet = this.walletRepo.wallets.get(payout.userId);
    if (!wallet) throw new WalletNotFoundError();

    if (dto.status === "COMPLETED") {
      wallet.balance -= payout.amount;
      wallet.lockedBalance -= payout.amount;
      wallet.totalWithdrawn += payout.amount;
      wallet.availableBalance = WalletPayoutPolicy.calculateAvailableBalance(wallet.balance, wallet.lockedBalance);
      this.walletRepo.wallets.set(payout.userId, wallet);

      payout.status = "COMPLETED";
      payout.processedAt = new Date();
      payout.transactionRef = dto.transactionRef;
    } else if (dto.status === "REJECTED") {
      wallet.lockedBalance -= payout.amount;
      wallet.availableBalance = WalletPayoutPolicy.calculateAvailableBalance(wallet.balance, wallet.lockedBalance);
      this.walletRepo.wallets.set(payout.userId, wallet);

      payout.status = "REJECTED";
      payout.rejectionReason = dto.rejectionReason || "Rejected by admin";
      payout.processedAt = new Date();
    } else {
      payout.status = "PROCESSING";
    }

    payout.updatedAt = new Date();
    this.payouts.set(dto.id, payout);
    return payout;
  }
}

// In-memory test double for IPaymentGateway
class MockPaymentGateway implements IPaymentGateway {
  public ordersCreated: any[] = [];
  public shouldSignaturePass = true;
  public mockPaymentAmount = 1500;

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrderResult> {
    this.ordersCreated.push(options);
    return {
      orderId: `order_${Date.now()}`,
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt || "",
      keyId: "rzp_test_mock_key",
    };
  }

  verifyPaymentSignature(_params: { orderId: string; paymentId: string; signature: string }): boolean {
    return this.shouldSignaturePass;
  }

  async fetchPaymentDetails(_paymentId: string): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    orderId: string;
    method: string;
  }> {
    return {
      id: _paymentId,
      amount: this.mockPaymentAmount,
      currency: "INR",
      status: "captured",
      orderId: "order_mock",
      method: "upi",
    };
  }

  async refundPayment(_options: RefundOptions): Promise<RefundResult> {
    return {
      refundId: `rfnd_${Date.now()}`,
      paymentId: _options.paymentId,
      amount: _options.amount || 100,
      status: "processed",
    };
  }
}

describe("Wallet Module Clean Architecture & SOLID Tests", () => {
  let walletRepo: InMemoryWalletRepository;
  let payoutRepo: InMemoryPayoutRequestRepository;
  let paymentGateway: MockPaymentGateway;

  beforeEach(() => {
    walletRepo = new InMemoryWalletRepository();
    payoutRepo = new InMemoryPayoutRequestRepository(walletRepo);
    paymentGateway = new MockPaymentGateway();
  });

  describe("1. Pure Domain Policies", () => {
    describe("WalletTopUpPolicy", () => {
      it("should validate min and max top-up bounds", () => {
        assert.throws(
          () => WalletTopUpPolicy.validateTopUpAmount(5),
          (err: any) => err instanceof InvalidTopUpAmountError && err.message.includes("Minimum")
        );
        assert.throws(
          () => WalletTopUpPolicy.validateTopUpAmount(150000),
          (err: any) => err instanceof InvalidTopUpAmountError && err.message.includes("Maximum")
        );
        assert.doesNotThrow(() => WalletTopUpPolicy.validateTopUpAmount(10));
        assert.doesNotThrow(() => WalletTopUpPolicy.validateTopUpAmount(5000));
        assert.doesNotThrow(() => WalletTopUpPolicy.validateTopUpAmount(100000));
      });

      it("should format top-up receipt consistently", () => {
        const receipt = WalletTopUpPolicy.generateTopUpReceipt("user12345678extra", 1234567890);
        assert.strictEqual(receipt, "topup_user1234_1234567890");
      });
    });

    describe("WalletPayoutPolicy", () => {
      it("should validate min and max payout withdrawal limits", () => {
        assert.throws(
          () => WalletPayoutPolicy.validatePayoutAmount(200),
          (err: any) => err instanceof InvalidPayoutAmountError && err.message.includes("Minimum")
        );
        assert.throws(
          () => WalletPayoutPolicy.validatePayoutAmount(2000000),
          (err: any) => err instanceof InvalidPayoutAmountError && err.message.includes("Maximum")
        );
        assert.doesNotThrow(() => WalletPayoutPolicy.validatePayoutAmount(500));
        assert.doesNotThrow(() => WalletPayoutPolicy.validatePayoutAmount(1000000));
      });

      it("should calculate available balance correctly and guard against negative", () => {
        assert.strictEqual(WalletPayoutPolicy.calculateAvailableBalance(1000, 200), 800);
        assert.strictEqual(WalletPayoutPolicy.calculateAvailableBalance(500, 500), 0);
        assert.strictEqual(WalletPayoutPolicy.calculateAvailableBalance(200, 500), 0);
      });

      it("should validate sufficient available balance", () => {
        assert.throws(
          () => WalletPayoutPolicy.validateSufficientBalance(500, 1000),
          (err: any) => err instanceof InsufficientWalletBalanceError && err.statusCode === 400
        );
        assert.doesNotThrow(() => WalletPayoutPolicy.validateSufficientBalance(1000, 500));
        assert.doesNotThrow(() => WalletPayoutPolicy.validateSufficientBalance(1000, 1000));
      });

      it("should format account summary properly for UPI and bank accounts", () => {
        const upiSummary = WalletPayoutPolicy.formatAccountSummary({
          methodType: "UPI",
          upiId: "instructor@okhdfcbank",
        });
        assert.strictEqual(upiSummary, "UPI: instructor@okhdfcbank");

        const bankSummary = WalletPayoutPolicy.formatAccountSummary({
          methodType: "BANK_ACCOUNT",
          bankName: "State Bank of India",
          accountNumber: "987654321012",
        });
        assert.strictEqual(bankSummary, "State Bank of India (A/C: ••••1012)");
      });

      it("should enforce payout status state machine transitions", () => {
        assert.doesNotThrow(() => WalletPayoutPolicy.validateStatusTransition("PENDING", "PROCESSING"));
        assert.doesNotThrow(() => WalletPayoutPolicy.validateStatusTransition("PENDING", "COMPLETED"));
        assert.doesNotThrow(() => WalletPayoutPolicy.validateStatusTransition("PENDING", "REJECTED"));
        assert.doesNotThrow(() => WalletPayoutPolicy.validateStatusTransition("PROCESSING", "COMPLETED"));
        assert.doesNotThrow(() => WalletPayoutPolicy.validateStatusTransition("PROCESSING", "REJECTED"));

        // Terminal states cannot be transitioned
        assert.throws(
          () => WalletPayoutPolicy.validateStatusTransition("COMPLETED", "REJECTED"),
          (err: any) => err instanceof InvalidPayoutStatusTransitionError && err.message.includes("already completed")
        );
        assert.throws(
          () => WalletPayoutPolicy.validateStatusTransition("REJECTED", "COMPLETED"),
          (err: any) => err instanceof InvalidPayoutStatusTransitionError && err.message.includes("already rejected")
        );
      });
    });

    describe("WalletAdjustmentPolicy", () => {
      it("should enforce minimum reason length on admin adjustments", () => {
        assert.throws(
          () => WalletAdjustmentPolicy.validateReason(""),
          (err: any) => err instanceof WalletAdjustmentReasonRequiredError
        );
        assert.throws(
          () => WalletAdjustmentPolicy.validateReason("fix"),
          (err: any) => err instanceof WalletAdjustmentReasonRequiredError
        );
        assert.doesNotThrow(() => WalletAdjustmentPolicy.validateReason("Bonus credit awarded"));
      });

      it("should format adjustment description correctly", () => {
        const creditDesc = WalletAdjustmentPolicy.formatAdjustmentDescription("CREDIT", "Instructor prize");
        assert.strictEqual(creditDesc, "Admin balance adjustment: Instructor prize");

        const debitDesc = WalletAdjustmentPolicy.formatAdjustmentDescription("DEBIT", "Chargeback penalty");
        assert.strictEqual(debitDesc, "Admin balance deduction: Chargeback penalty");
      });
    });
  });

  describe("2. Domain Errors", () => {
    it("should instantiate domain errors with appropriate status codes and messages", () => {
      const notFound = new WalletNotFoundError();
      assert.strictEqual(notFound.statusCode, 404);

      const insufficient = new InsufficientWalletBalanceError(200, 500);
      assert.strictEqual(insufficient.statusCode, 400);
      assert.ok(insufficient.message.includes("200.00"));

      const invalidTopUp = new InvalidTopUpAmountError();
      assert.strictEqual(invalidTopUp.statusCode, 400);

      const invalidPayout = new InvalidPayoutAmountError();
      assert.strictEqual(invalidPayout.statusCode, 400);

      const payoutNotFound = new PayoutRequestNotFoundError();
      assert.strictEqual(payoutNotFound.statusCode, 404);

      const signatureErr = new PaymentSignatureVerificationError();
      assert.strictEqual(signatureErr.statusCode, 400);

      const missingBank = new MissingBankDetailError();
      assert.strictEqual(missingBank.statusCode, 400);

      const adjErr = new WalletAdjustmentReasonRequiredError();
      assert.strictEqual(adjErr.statusCode, 400);

      const baseErr = new WalletError("base");
      assert.strictEqual(baseErr.name, "WalletError");
    });
  });

  describe("3. Presentation Validation Schemas", () => {
    it("should validate createTopUpOrderSchema", () => {
      assert.strictEqual(createTopUpOrderSchema.safeParse({ amount: 500 }).success, true);
      assert.strictEqual(createTopUpOrderSchema.safeParse({ amount: 5 }).success, false);
      assert.strictEqual(createTopUpOrderSchema.safeParse({ amount: 150000 }).success, false);
    });

    it("should validate verifyTopUpPaymentSchema", () => {
      assert.strictEqual(
        verifyTopUpPaymentSchema.safeParse({
          razorpayOrderId: "order_123",
          razorpayPaymentId: "pay_123",
          razorpaySignature: "sig_123",
        }).success,
        true
      );
      assert.strictEqual(verifyTopUpPaymentSchema.safeParse({ razorpayOrderId: "" }).success, false);
    });

    it("should validate requestPayoutSchema", () => {
      assert.strictEqual(requestPayoutSchema.safeParse({ amount: 1500 }).success, true);
      assert.strictEqual(requestPayoutSchema.safeParse({ amount: 100 }).success, false);
    });

    it("should validate adminProcessPayoutSchema", () => {
      assert.strictEqual(adminProcessPayoutSchema.safeParse({ status: "COMPLETED" }).success, true);
      assert.strictEqual(adminProcessPayoutSchema.safeParse({ status: "INVALID" }).success, false);
    });

    it("should validate adminWalletAdjustmentSchema", () => {
      assert.strictEqual(
        adminWalletAdjustmentSchema.safeParse({
          userId: "123e4567-e89b-12d3-a456-426614174000",
          amount: 500,
          direction: "CREDIT",
          reason: "Loyalty reward",
        }).success,
        true
      );
      assert.strictEqual(
        adminWalletAdjustmentSchema.safeParse({
          userId: "invalid-uuid",
          amount: 500,
          direction: "CREDIT",
          reason: "ok",
        }).success,
        false
      );
    });
  });

  describe("4. Application Use Cases (DIP & ISP)", () => {
    it("GetOrCreateWalletUseCase should initialize a new wallet with zero balance", async () => {
      const useCase = new GetOrCreateWalletUseCase(walletRepo);
      const wallet = await useCase.execute("u-101");

      assert.strictEqual(wallet.userId, "u-101");
      assert.strictEqual(wallet.balance, 0);
      assert.strictEqual(wallet.availableBalance, 0);
      assert.strictEqual(wallet.currency, "INR");
    });

    it("CreateTopUpOrderUseCase should validate limits and generate order", async () => {
      const useCase = new CreateTopUpOrderUseCase(paymentGateway);

      await assert.rejects(
        () => useCase.execute({ userId: "u-101", amount: 5 }),
        (err: any) => err instanceof InvalidTopUpAmountError
      );

      const order = await useCase.execute({ userId: "u-101", amount: 1500 });
      assert.ok(order.orderId);
      assert.strictEqual(order.amount, 1500);
      assert.strictEqual(paymentGateway.ordersCreated.length, 1);
    });

    it("VerifyTopUpPaymentUseCase should verify signature and credit funds", async () => {
      const useCase = new VerifyTopUpPaymentUseCase(walletRepo, paymentGateway);

      // Rejects invalid signature
      paymentGateway.shouldSignaturePass = false;
      await assert.rejects(
        () =>
          useCase.execute({
            userId: "u-101",
            razorpayOrderId: "ord_1",
            razorpayPaymentId: "pay_1",
            razorpaySignature: "bad_sig",
          }),
        (err: any) => err instanceof PaymentSignatureVerificationError
      );

      // Valid signature credits wallet
      paymentGateway.shouldSignaturePass = true;
      paymentGateway.mockPaymentAmount = 2000;
      const res = await useCase.execute({
        userId: "u-101",
        razorpayOrderId: "ord_1",
        razorpayPaymentId: "pay_1",
        razorpaySignature: "valid_sig",
      });

      assert.strictEqual(res.wallet.balance, 2000);
      assert.strictEqual(res.transaction.amount, 2000);
      assert.strictEqual(res.transaction.direction, "CREDIT");
    });

    it("RequestPayoutUseCase should lock funds and reject insufficient balance", async () => {
      const useCase = new RequestPayoutUseCase(payoutRepo);

      // Fails when wallet has insufficient balance (balance is 0)
      await assert.rejects(
        () => useCase.execute({ userId: "u-102", amount: 1000 }),
        (err: any) => err instanceof InsufficientWalletBalanceError
      );

      // Credit wallet first
      await walletRepo.credit({
        userId: "u-102",
        amount: 3000,
        type: "EARNING",
        description: "Course sales royalty",
      });

      // Request payout of 1000
      const payout = await useCase.execute({ userId: "u-102", amount: 1000, bankDetailId: "bank-1" });
      assert.strictEqual(payout.amount, 1000);
      assert.strictEqual(payout.status, "PENDING");

      const wallet = await walletRepo.findByUserId("u-102");
      assert.strictEqual(wallet?.balance, 3000);
      assert.strictEqual(wallet?.lockedBalance, 1000);
      assert.strictEqual(wallet?.availableBalance, 2000);
    });

    it("AdminProcessPayoutUseCase should disburse or refund locked balance", async () => {
      await walletRepo.credit({
        userId: "u-103",
        amount: 5000,
        type: "EARNING",
        description: "Royalty",
      });

      const requestUseCase = new RequestPayoutUseCase(payoutRepo);
      const payout1 = await requestUseCase.execute({ userId: "u-103", amount: 2000 });
      const payout2 = await requestUseCase.execute({ userId: "u-103", amount: 1000 });

      const processUseCase = new AdminProcessPayoutUseCase(payoutRepo);

      // Complete payout 1
      const completed = await processUseCase.execute({
        id: payout1.id,
        status: "COMPLETED",
        transactionRef: "UTR987654321",
      });
      assert.strictEqual(completed.status, "COMPLETED");

      // Wallet should have deducted balance and locked balance
      let wallet = await walletRepo.findByUserId("u-103");
      assert.strictEqual(wallet?.balance, 3000);
      assert.strictEqual(wallet?.lockedBalance, 1000); // from payout2
      assert.strictEqual(wallet?.totalWithdrawn, 2000);

      // Reject payout 2
      const rejected = await processUseCase.execute({
        id: payout2.id,
        status: "REJECTED",
        rejectionReason: "Invalid IFSC code provided",
      });
      assert.strictEqual(rejected.status, "REJECTED");

      // Locked funds should be released back to available
      wallet = await walletRepo.findByUserId("u-103");
      assert.strictEqual(wallet?.balance, 3000);
      assert.strictEqual(wallet?.lockedBalance, 0);
      assert.strictEqual(wallet?.availableBalance, 3000);
    });

    it("AdminWalletAdjustmentUseCase should credit or debit balance with reason", async () => {
      const useCase = new AdminWalletAdjustmentUseCase(walletRepo);

      await assert.rejects(
        () =>
          useCase.execute({
            userId: "u-104",
            amount: 500,
            direction: "CREDIT",
            reason: "bad",
          }),
        (err: any) => err instanceof WalletAdjustmentReasonRequiredError
      );

      const creditRes = await useCase.execute({
        userId: "u-104",
        amount: 1500,
        direction: "CREDIT",
        reason: "Administrative bonus compensation",
      });
      assert.strictEqual(creditRes.wallet.balance, 1500);

      const debitRes = await useCase.execute({
        userId: "u-104",
        amount: 500,
        direction: "DEBIT",
        reason: "Administrative fee recovery",
      });
      assert.strictEqual(debitRes.wallet.balance, 1000);
    });

    it("GetWalletTransactionsUseCase and GetUserPayoutsUseCase should return paginated data", async () => {
      const txUseCase = new GetWalletTransactionsUseCase(walletRepo);
      const txs = await txUseCase.execute({});
      assert.ok(Array.isArray(txs.items));

      const payoutsUseCase = new GetUserPayoutsUseCase(payoutRepo);
      const payouts = await payoutsUseCase.execute({});
      assert.ok(Array.isArray(payouts.items));
    });

    it("AdminGetAllWalletsUseCase and AdminGetAllPayoutsUseCase should aggregate platform stats", async () => {
      const walletsUseCase = new AdminGetAllWalletsUseCase(walletRepo);
      const wallets = await walletsUseCase.execute({});
      assert.ok(wallets.stats);
      assert.ok(wallets.stats.totalPlatformBalance >= 0);

      const payoutsUseCase = new AdminGetAllPayoutsUseCase(payoutRepo);
      const payouts = await payoutsUseCase.execute({});
      assert.ok(payouts.stats);
      assert.ok(typeof payouts.stats.pendingCount === "number");
    });
  });

  describe("5. Module Factory (createWalletModule)", () => {
    it("should construct decoupled module with in-memory dependencies", () => {
      const module = createWalletModule({
        walletRepo,
        payoutRepo,
        paymentGateway,
      });

      assert.ok(module.walletRepo);
      assert.ok(module.payoutRepo);
      assert.ok(module.getOrCreateWalletUseCase);
      assert.ok(module.createTopUpOrderUseCase);
      assert.ok(module.verifyTopUpPaymentUseCase);
      assert.ok(module.requestPayoutUseCase);
      assert.ok(module.adminGetAllWalletsUseCase);
      assert.ok(module.walletController);
      assert.ok(module.walletRouter);
    });
  });
});
