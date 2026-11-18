import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BankDetailEntity,
  BankDetailValidationPolicy,
  CreateBankDetailUseCase,
  GetUserBankDetailsUseCase,
  GetBankDetailByIdUseCase,
  SetPrimaryBankDetailUseCase,
  DeleteBankDetailUseCase,
  AdminGetAllBankDetailsUseCase,
  AdminGetBankDetailByIdUseCase,
  AdminUpdateBankVerificationUseCase,
  IUserBankDetailRepository,
  IAdminBankDetailRepository,
  AdminBankDetailsQueryDto,
  UpdateBankVerificationDto,
  PaginatedBankDetailsResult,
} from "../src/modules/bank-detail";
import { BadRequestError, NotFoundError } from "../src/app/errors";

class MockBankDetailRepository implements IUserBankDetailRepository, IAdminBankDetailRepository {
  public records: Map<string, BankDetailEntity> = new Map();

  async create(data: any): Promise<BankDetailEntity> {
    const id = data.id || `bank_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const entity = new BankDetailEntity({
      id,
      userId: data.userId!,
      accountHolderName: data.accountHolderName!,
      accountNumber: data.accountNumber!,
      ifscCode: data.ifscCode!,
      bankName: data.bankName!,
      branchName: data.branchName ?? null,
      accountType: data.accountType || "SAVINGS",
      upiId: data.upiId ?? null,
      isPrimary: data.isPrimary ?? false,
      isVerified: data.isVerified ?? false,
      verificationStatus: data.verificationStatus || "PENDING",
      rejectionReason: data.rejectionReason ?? null,
      payoutAccountId: data.payoutAccountId ?? null,
      payoutContactId: data.payoutContactId ?? null,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    this.records.set(id, entity);
    return entity;
  }

  async findById(id: string): Promise<BankDetailEntity | null> {
    return this.records.get(id) || null;
  }

  async findByUserId(userId: string): Promise<BankDetailEntity[]> {
    return Array.from(this.records.values()).filter((r) => r.userId === userId);
  }

  async countByUserId(userId: string): Promise<number> {
    return Array.from(this.records.values()).filter((r) => r.userId === userId).length;
  }

  async findPrimaryByUserId(userId: string): Promise<BankDetailEntity | null> {
    const list = await this.findByUserId(userId);
    return list.find((r) => r.isPrimary) || null;
  }

  async setPrimary(id: string, userId: string): Promise<BankDetailEntity> {
    const target = this.records.get(id);
    if (!target || target.userId !== userId) {
      throw new NotFoundError("Bank detail not found");
    }

    for (const [key, item] of this.records.entries()) {
      if (item.userId === userId) {
        this.records.set(
          key,
          new BankDetailEntity({
            ...item,
            isPrimary: item.id === id,
          })
        );
      }
    }

    return this.records.get(id)!;
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const record = this.records.get(id);
    if (!record || record.userId !== userId) {
      return false;
    }
    return this.records.delete(id);
  }

  async adminFindAll(query: AdminBankDetailsQueryDto): Promise<PaginatedBankDetailsResult> {
    let list = Array.from(this.records.values());

    if (query?.userId) {
      list = list.filter((r) => r.userId === query.userId);
    }
    if (query?.isVerified !== undefined) {
      list = list.filter((r) => r.isVerified === query.isVerified);
    }
    if (query?.status || query?.verificationStatus) {
      const status = query.status || query.verificationStatus;
      list = list.filter((r) => r.verificationStatus === status);
    }

    const total = list.length;
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = query?.skip ?? (page - 1) * limit;
    const take = query?.take ?? limit;

    return {
      items: list.slice(skip, skip + take),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async adminUpdateVerification(dto: UpdateBankVerificationDto): Promise<BankDetailEntity> {
    const record = this.records.get(dto.id);
    if (!record) {
      throw new NotFoundError("Bank detail not found");
    }

    const verificationStatus = dto.verificationStatus || dto.status || "VERIFIED";
    const isVerified = dto.isVerified ?? (verificationStatus === "VERIFIED");

    const updated = new BankDetailEntity({
      ...record,
      isVerified,
      verificationStatus,
      rejectionReason: dto.rejectionReason ?? dto.notes ?? null,
      verificationNotes: dto.notes ?? dto.rejectionReason ?? null,
      updatedAt: new Date(),
    });
    this.records.set(dto.id, updated);
    return updated;
  }
}

describe("Bank Detail Clean Architecture & SOLID Principles Suite", () => {
  describe("1. BankDetailValidationPolicy (SRP & Domain Logic)", () => {
    it("should accept valid Indian IFSC codes and normalize to uppercase", () => {
      assert.equal(BankDetailValidationPolicy.normalizeIfsc(" sbin0001234 "), "SBIN0001234");
      assert.equal(BankDetailValidationPolicy.isValidIfsc("SBIN0001234"), true);
      assert.equal(BankDetailValidationPolicy.isValidIfsc("HDFC0000001"), true);
      assert.equal(BankDetailValidationPolicy.isValidIfsc("ICIC0000104"), true);
    });

    it("should reject invalid IFSC codes", () => {
      assert.equal(BankDetailValidationPolicy.isValidIfsc("SBIN12345"), false); // too short
      assert.equal(BankDetailValidationPolicy.isValidIfsc("SBIN00012345"), false); // too long
      assert.equal(BankDetailValidationPolicy.isValidIfsc("12340001234"), false); // numeric prefix
      assert.equal(BankDetailValidationPolicy.isValidIfsc("SBINA001234"), false); // 5th char not zero
    });

    it("should normalize and validate account numbers between 9 and 18 digits", () => {
      assert.equal(BankDetailValidationPolicy.normalizeAccountNumber(" 1234-5678-9012 "), "123456789012");
      assert.equal(BankDetailValidationPolicy.isValidAccountNumber("123456789"), true);
      assert.equal(BankDetailValidationPolicy.isValidAccountNumber("123456789012345678"), true);
      assert.equal(BankDetailValidationPolicy.isValidAccountNumber("12345678"), false); // 8 digits
      assert.equal(BankDetailValidationPolicy.isValidAccountNumber("1234567890123456789"), false); // 19 digits
      assert.equal(BankDetailValidationPolicy.isValidAccountNumber("12345678A90"), false); // non-numeric
    });

    it("should validate and normalize UPI IDs", () => {
      assert.equal(BankDetailValidationPolicy.normalizeUpi(" User.Name@OKAXIS "), "user.name@okaxis");
      assert.equal(BankDetailValidationPolicy.isValidUpi("user@okhdfcbank"), true);
      assert.equal(BankDetailValidationPolicy.isValidUpi("teacher.99@upi"), true);
      assert.equal(BankDetailValidationPolicy.isValidUpi("invalid-upi"), false);
      assert.equal(BankDetailValidationPolicy.isValidUpi("@upi"), false);
      assert.equal(BankDetailValidationPolicy.isValidUpi("test@"), false);
    });

    it("should throw BadRequestError on invalid inputs via validateCreation", () => {
      assert.throws(() => {
        BankDetailValidationPolicy.validateCreation({
          accountHolderName: "John Doe",
          accountNumber: "123", // invalid
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India",
        });
      }, (err: unknown) => err instanceof BadRequestError && err.message.includes("Account number"));

      assert.throws(() => {
        BankDetailValidationPolicy.validateCreation({
          accountHolderName: "John Doe",
          accountNumber: "123456789012",
          ifscCode: "INVALID_IFSC",
          bankName: "State Bank of India",
        });
      }, (err: unknown) => err instanceof BadRequestError && err.message.includes("IFSC"));
    });
  });

  describe("2. Domain Entity & Vendor Decoupling (OCP & Dip)", () => {
    it("should map payout credentials and maintain backward compatible razorpay aliases", () => {
      const entity = new BankDetailEntity({
        id: "bank_1",
        userId: "user_1",
        accountHolderName: "Alice Teacher",
        accountNumber: "987654321012",
        ifscCode: "HDFC0000001",
        bankName: "HDFC Bank",
        payoutAccountId: "fa_vendor_123",
        payoutContactId: "cont_vendor_456",
      });

      // Decoupled properties
      assert.equal(entity.payoutAccountId, "fa_vendor_123");
      assert.equal(entity.payoutContactId, "cont_vendor_456");

      // Backward compatible aliases
      assert.equal(entity.razorpayFundAccountId, "fa_vendor_123");
      assert.equal(entity.razorpayContactId, "cont_vendor_456");
    });
  });

  describe("3. CreateBankDetailUseCase (Single Responsibility & Auto-Primary Election)", () => {
    it("should automatically set first bank account as primary", async () => {
      const repo = new MockBankDetailRepository();
      const useCase = new CreateBankDetailUseCase(repo);

      const created = await useCase.execute("user_101", {
        accountHolderName: "John Doe",
        accountNumber: "112233445566",
        ifscCode: "sbin0001234",
        bankName: "SBI",
        isPrimary: false, // passed false, but first account must become primary
      });

      assert.equal(created.userId, "user_101");
      assert.equal(created.isPrimary, true);
      assert.equal(created.ifscCode, "SBIN0001234");
      assert.equal(created.verificationStatus, "PENDING");
    });

    it("should respect isPrimary flag when user already has existing accounts", async () => {
      const repo = new MockBankDetailRepository();
      const useCase = new CreateBankDetailUseCase(repo);

      const first = await useCase.execute("user_101", {
        accountHolderName: "John Doe",
        accountNumber: "112233445566",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
      });
      assert.equal(first.isPrimary, true);

      const second = await useCase.execute("user_101", {
        accountHolderName: "John Doe",
        accountNumber: "998877665544",
        ifscCode: "HDFC0000001",
        bankName: "HDFC Bank",
        isPrimary: false,
      });

      assert.equal(second.isPrimary, false);
      const primary = await repo.findPrimaryByUserId("user_101");
      assert.equal(primary?.id, first.id);
    });
  });

  describe("4. GetBankDetailByIdUseCase (Critical IDOR Security Guard)", () => {
    it("should allow user to retrieve their own bank account detail", async () => {
      const repo = new MockBankDetailRepository();
      const bank = await repo.create({
        userId: "user_owner",
        accountHolderName: "Owner User",
        accountNumber: "112233445566",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
      });

      const useCase = new GetBankDetailByIdUseCase(repo);
      const result = await useCase.execute(bank.id, "user_owner");

      assert.equal(result.id, bank.id);
      assert.equal(result.userId, "user_owner");
    });

    it("should throw NotFoundError when another user attempts to retrieve detail (Preventing IDOR)", async () => {
      const repo = new MockBankDetailRepository();
      const bank = await repo.create({
        userId: "user_victim",
        accountHolderName: "Victim User",
        accountNumber: "112233445566",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
      });

      const useCase = new GetBankDetailByIdUseCase(repo);

      await assert.rejects(
        async () => {
          await useCase.execute(bank.id, "user_attacker");
        },
        (err: unknown) => {
          assert.ok(err instanceof NotFoundError, "Must throw NotFoundError to conceal record existence");
          return true;
        }
      );
    });
  });

  describe("5. SetPrimaryBankDetailUseCase & DeleteBankDetailUseCase Ownership", () => {
    it("should toggle primary account safely for owner", async () => {
      const repo = new MockBankDetailRepository();
      const bank1 = await repo.create({
        userId: "user_A",
        accountHolderName: "User A",
        accountNumber: "111111111111",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
        isPrimary: true,
      });
      const bank2 = await repo.create({
        userId: "user_A",
        accountHolderName: "User A",
        accountNumber: "222222222222",
        ifscCode: "HDFC0000001",
        bankName: "HDFC",
        isPrimary: false,
      });

      const setPrimaryUseCase = new SetPrimaryBankDetailUseCase(repo);
      const updated = await setPrimaryUseCase.execute(bank2.id, "user_A");

      assert.equal(updated.id, bank2.id);
      assert.equal(updated.isPrimary, true);

      const refreshedBank1 = await repo.findById(bank1.id);
      assert.equal(refreshedBank1?.isPrimary, false);
    });

    it("should reject setPrimary if bank account belongs to another user", async () => {
      const repo = new MockBankDetailRepository();
      const bank = await repo.create({
        userId: "user_A",
        accountHolderName: "User A",
        accountNumber: "111111111111",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
      });

      const setPrimaryUseCase = new SetPrimaryBankDetailUseCase(repo);
      await assert.rejects(async () => {
        await setPrimaryUseCase.execute(bank.id, "user_B");
      }, NotFoundError);
    });

    it("should delete bank account for owner using deleteForUser (LSP safe)", async () => {
      const repo = new MockBankDetailRepository();
      const bank = await repo.create({
        userId: "user_A",
        accountHolderName: "User A",
        accountNumber: "111111111111",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
      });

      const deleteUseCase = new DeleteBankDetailUseCase(repo);
      const deleted = await deleteUseCase.execute(bank.id, "user_A");
      assert.equal(deleted.success, true);

      const remaining = await repo.findById(bank.id);
      assert.equal(remaining, null);
    });

    it("should reject delete if bank account belongs to another user", async () => {
      const repo = new MockBankDetailRepository();
      const bank = await repo.create({
        userId: "user_A",
        accountHolderName: "User A",
        accountNumber: "111111111111",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
      });

      const deleteUseCase = new DeleteBankDetailUseCase(repo);
      await assert.rejects(async () => {
        await deleteUseCase.execute(bank.id, "user_B");
      }, NotFoundError);

      // Record should still exist
      assert.ok(await repo.findById(bank.id));
    });
  });

  describe("6. Segregated Admin Use Cases (Interface Segregation Principle)", () => {
    it("AdminGetBankDetailByIdUseCase should find any bank account", async () => {
      const repo = new MockBankDetailRepository();
      const bank = await repo.create({
        userId: "user_any",
        accountHolderName: "Random User",
        accountNumber: "123456789012",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
      });

      const adminGetUseCase = new AdminGetBankDetailByIdUseCase(repo);
      const result = await adminGetUseCase.execute(bank.id);

      assert.equal(result.id, bank.id);
      assert.equal(result.userId, "user_any");
    });

    it("AdminGetAllBankDetailsUseCase should return paginated accounts across all users", async () => {
      const repo = new MockBankDetailRepository();
      await repo.create({ userId: "u1", accountHolderName: "U1", accountNumber: "111111111111", ifscCode: "SBIN0001234", bankName: "SBI" });
      await repo.create({ userId: "u2", accountHolderName: "U2", accountNumber: "222222222222", ifscCode: "HDFC0000001", bankName: "HDFC" });

      const adminGetAllUseCase = new AdminGetAllBankDetailsUseCase(repo);
      const result = await adminGetAllUseCase.execute({ skip: 0, take: 10 });

      assert.equal(result.total, 2);
      assert.equal(result.items.length, 2);
    });

    it("AdminUpdateBankVerificationUseCase should update verification status and rejection reason", async () => {
      const repo = new MockBankDetailRepository();
      const bank = await repo.create({
        userId: "u1",
        accountHolderName: "U1",
        accountNumber: "111111111111",
        ifscCode: "SBIN0001234",
        bankName: "SBI",
      });

      const updateVerificationUseCase = new AdminUpdateBankVerificationUseCase(repo);
      const updated = await updateVerificationUseCase.execute({
        id: bank.id,
        isVerified: false,
        verificationStatus: "REJECTED",
        rejectionReason: "Name mismatch with government ID",
      });

      assert.equal(updated.isVerified, false);
      assert.equal(updated.verificationStatus, "REJECTED");
      assert.equal(updated.rejectionReason, "Name mismatch with government ID");
    });
  });
});
