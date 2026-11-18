import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  WishlistEntity,
  WishlistItemEntity,
  WishlistPolicy,
  WishlistError,
  WishlistNotFoundError,
  WishlistLimitExceededError,
  InvalidWishlistOperationError,
  toggleWishlistSchema,
  getUserWishlistQuerySchema,
  removeWishlistItemParamsSchema,
  ToggleWishlistUseCase,
  GetUserWishlistUseCase,
  GetWishlistIdsUseCase,
  RemoveWishlistItemUseCase,
  ClearWishlistUseCase,
  createWishlistModule,
  IWishlistRepository,
} from "../src/modules/wishlist";

// In-memory test double for IWishlistRepository
class InMemoryWishlistRepository implements IWishlistRepository {
  public wishlists: Map<string, WishlistEntity> = new Map();
  public items: WishlistItemEntity[] = [];

  async findById(id: string): Promise<WishlistEntity | null> {
    for (const w of this.wishlists.values()) {
      if (w.id === id) return w;
    }
    return null;
  }

  async findWishlistByUserId(userId: string): Promise<WishlistEntity | null> {
    return this.wishlists.get(userId) || null;
  }

  async getOrCreateWishlist(userId: string): Promise<WishlistEntity> {
    let wishlist = this.wishlists.get(userId);
    if (!wishlist) {
      wishlist = {
        id: `wishlist-${userId}`,
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.wishlists.set(userId, wishlist);
    }
    return wishlist;
  }

  async getWishlistCourseIds(userId: string): Promise<string[]> {
    const wishlist = await this.getOrCreateWishlist(userId);
    return this.items
      .filter((i) => i.wishlistId === wishlist.id)
      .map((i) => i.courseId);
  }

  async isCourseWishlisted(userId: string, courseId: string): Promise<boolean> {
    const wishlist = await this.getOrCreateWishlist(userId);
    return this.items.some(
      (i) => i.wishlistId === wishlist.id && i.courseId === courseId
    );
  }

  async addItem(wishlistId: string, courseId: string): Promise<WishlistItemEntity> {
    const existing = this.items.find(
      (i) => i.wishlistId === wishlistId && i.courseId === courseId
    );
    if (existing) return existing;

    const item: WishlistItemEntity = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      wishlistId,
      courseId,
      createdAt: new Date(),
      course: {
        id: courseId,
        title: `Course ${courseId}`,
        slug: `course-${courseId}`,
        pricingType: "PAID",
        price: 499,
        currency: "INR",
        level: "BEGINNER",
        language: "English",
        totalDurationSeconds: 3600,
        totalLessons: 10,
        totalModules: 2,
        isFeatured: false,
        isTrending: false,
      },
    };
    this.items.push(item);
    return item;
  }

  async removeItem(wishlistId: string, courseId: string): Promise<boolean> {
    const initialLen = this.items.length;
    this.items = this.items.filter(
      (i) => !(i.wishlistId === wishlistId && i.courseId === courseId)
    );
    return this.items.length < initialLen;
  }

  async clearWishlist(wishlistId: string): Promise<number> {
    const beforeCount = this.items.filter((i) => i.wishlistId === wishlistId).length;
    this.items = this.items.filter((i) => i.wishlistId !== wishlistId);
    return beforeCount;
  }

  async getUserWishlistItems(dto: any): Promise<any> {
    const wishlist = await this.getOrCreateWishlist(dto.userId);
    let userItems = this.items.filter((i) => i.wishlistId === wishlist.id);

    if (dto.search) {
      const q = dto.search.toLowerCase();
      userItems = userItems.filter((i) => i.course?.title.toLowerCase().includes(q));
    }

    if (dto.sortBy === "price_asc") {
      userItems.sort((a, b) => (a.course?.price || 0) - (b.course?.price || 0));
    } else if (dto.sortBy === "price_desc") {
      userItems.sort((a, b) => (b.course?.price || 0) - (a.course?.price || 0));
    } else {
      userItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const page = dto.page || 1;
    const limit = dto.limit || 12;
    const start = (page - 1) * limit;
    const paginated = userItems.slice(start, start + limit);

    return {
      items: paginated,
      total: userItems.length,
      page,
      limit,
      totalPages: Math.ceil(userItems.length / limit) || 1,
    };
  }
}

describe("Wishlist Module Clean Architecture & SOLID Tests", () => {
  let wishlistRepo: InMemoryWishlistRepository;

  beforeEach(() => {
    wishlistRepo = new InMemoryWishlistRepository();
  });

  describe("1. Pure Domain Policies", () => {
    describe("WishlistPolicy", () => {
      it("should validate wishlist maximum capacity limits", () => {
        assert.doesNotThrow(() => WishlistPolicy.validateCapacity(0));
        assert.doesNotThrow(() => WishlistPolicy.validateCapacity(99));

        assert.throws(
          () => WishlistPolicy.validateCapacity(100),
          (err: any) =>
            err instanceof WishlistLimitExceededError &&
            err.message.includes("max 100 courses")
        );
        assert.throws(
          () => WishlistPolicy.validateCapacity(105),
          (err: any) => err instanceof WishlistLimitExceededError
        );
      });

      it("should normalize pagination and clamp maximum limits", () => {
        const defaultNorm = WishlistPolicy.normalizePagination();
        assert.strictEqual(defaultNorm.page, 1);
        assert.strictEqual(defaultNorm.limit, 12);

        const customNorm = WishlistPolicy.normalizePagination(3, 20);
        assert.strictEqual(customNorm.page, 3);
        assert.strictEqual(customNorm.limit, 20);

        const clampedNorm = WishlistPolicy.normalizePagination(-5, 100);
        assert.strictEqual(clampedNorm.page, 1);
        assert.strictEqual(clampedNorm.limit, 50); // clamped to MAX_LIMIT
      });

      it("should format toggle confirmation messages consistently", () => {
        assert.strictEqual(
          WishlistPolicy.formatToggleMessage(true),
          "Course added to your wishlist"
        );
        assert.strictEqual(
          WishlistPolicy.formatToggleMessage(false),
          "Course removed from your wishlist"
        );
      });
    });
  });

  describe("2. Domain Errors", () => {
    it("should instantiate domain errors with proper status codes and messages", () => {
      const notFound = new WishlistNotFoundError();
      assert.strictEqual(notFound.statusCode, 404);
      assert.strictEqual(notFound.name, "WishlistNotFoundError");

      const limitExceeded = new WishlistLimitExceededError();
      assert.strictEqual(limitExceeded.statusCode, 400);

      const invalidOp = new InvalidWishlistOperationError();
      assert.strictEqual(invalidOp.statusCode, 400);

      const baseErr = new WishlistError("base error");
      assert.strictEqual(baseErr.name, "WishlistError");
    });
  });

  describe("3. Presentation Validation Schemas", () => {
    it("should validate toggleWishlistSchema", () => {
      assert.strictEqual(toggleWishlistSchema.safeParse({ courseId: "course-123" }).success, true);
      assert.strictEqual(toggleWishlistSchema.safeParse({ courseId: "" }).success, false);
      assert.strictEqual(toggleWishlistSchema.safeParse({}).success, false);
    });

    it("should validate getUserWishlistQuerySchema with defaults and sort orders", () => {
      const parsed = getUserWishlistQuerySchema.parse({});
      assert.strictEqual(parsed.page, 1);
      assert.strictEqual(parsed.limit, 12);
      assert.strictEqual(parsed.sortBy, "newest");

      const custom = getUserWishlistQuerySchema.parse({
        page: "2",
        limit: "24",
        sortBy: "price_desc",
        search: "React",
      });
      assert.strictEqual(custom.page, 2);
      assert.strictEqual(custom.limit, 24);
      assert.strictEqual(custom.sortBy, "price_desc");
      assert.strictEqual(custom.search, "React");

      assert.strictEqual(getUserWishlistQuerySchema.safeParse({ sortBy: "invalid_sort" }).success, false);
    });

    it("should validate removeWishlistItemParamsSchema", () => {
      assert.strictEqual(
        removeWishlistItemParamsSchema.safeParse({ courseId: "c-101" }).success,
        true
      );
      assert.strictEqual(
        removeWishlistItemParamsSchema.safeParse({ courseId: "" }).success,
        false
      );
    });
  });

  describe("4. Application Use Cases (DIP & ISP)", () => {
    it("ToggleWishlistUseCase should add course to empty wishlist and toggle off if already present", async () => {
      const useCase = new ToggleWishlistUseCase(wishlistRepo);

      // 1. Add course
      const addRes = await useCase.execute({ userId: "student-1", courseId: "c-1" });
      assert.strictEqual(addRes.isWishlisted, true);
      assert.strictEqual(addRes.courseId, "c-1");
      assert.ok(addRes.item);

      // Verify repository state
      const isPresent = await wishlistRepo.isCourseWishlisted("student-1", "c-1");
      assert.strictEqual(isPresent, true);

      // 2. Toggle off (remove course)
      const removeRes = await useCase.execute({ userId: "student-1", courseId: "c-1" });
      assert.strictEqual(removeRes.isWishlisted, false);
      assert.strictEqual(removeRes.item, null);

      const isRemoved = await wishlistRepo.isCourseWishlisted("student-1", "c-1");
      assert.strictEqual(isRemoved, false);
    });

    it("ToggleWishlistUseCase should enforce capacity limit and validate inputs", async () => {
      const useCase = new ToggleWishlistUseCase(wishlistRepo);

      // Rejects missing inputs
      await assert.rejects(
        () => useCase.execute({ userId: "", courseId: "c-1" }),
        (err: any) => err instanceof InvalidWishlistOperationError
      );
      await assert.rejects(
        () => useCase.execute({ userId: "student-1", courseId: "" }),
        (err: any) => err instanceof InvalidWishlistOperationError
      );

      // Pre-fill 100 items
      const wishlist = await wishlistRepo.getOrCreateWishlist("student-capacity");
      for (let i = 0; i < 100; i++) {
        await wishlistRepo.addItem(wishlist.id, `course-bulk-${i}`);
      }

      // 101th toggle should fail with WishlistLimitExceededError
      await assert.rejects(
        () => useCase.execute({ userId: "student-capacity", courseId: "course-101" }),
        (err: any) => err instanceof WishlistLimitExceededError
      );
    });

    it("GetUserWishlistUseCase & GetWishlistIdsUseCase should retrieve user data", async () => {
      const toggleUseCase = new ToggleWishlistUseCase(wishlistRepo);
      await toggleUseCase.execute({ userId: "student-2", courseId: "c-10" });
      await toggleUseCase.execute({ userId: "student-2", courseId: "c-20" });

      const getIdsUseCase = new GetWishlistIdsUseCase(wishlistRepo);
      const ids = await getIdsUseCase.execute("student-2");
      assert.strictEqual(ids.length, 2);
      assert.ok(ids.includes("c-10"));
      assert.ok(ids.includes("c-20"));

      const getUserWishlistUseCase = new GetUserWishlistUseCase(wishlistRepo);
      const paginated = await getUserWishlistUseCase.execute({ userId: "student-2", page: 1, limit: 10 });
      assert.strictEqual(paginated.total, 2);
      assert.strictEqual(paginated.items.length, 2);

      // Rejects missing userId
      await assert.rejects(
        () => getIdsUseCase.execute(""),
        (err: any) => err instanceof InvalidWishlistOperationError
      );
      await assert.rejects(
        () => getUserWishlistUseCase.execute({ userId: "" }),
        (err: any) => err instanceof InvalidWishlistOperationError
      );
    });

    it("RemoveWishlistItemUseCase & ClearWishlistUseCase should delete courses", async () => {
      const toggleUseCase = new ToggleWishlistUseCase(wishlistRepo);
      await toggleUseCase.execute({ userId: "student-3", courseId: "c-30" });
      await toggleUseCase.execute({ userId: "student-3", courseId: "c-31" });

      const removeUseCase = new RemoveWishlistItemUseCase(wishlistRepo);
      const removed = await removeUseCase.execute("student-3", "c-30");
      assert.strictEqual(removed, true);

      let ids = await wishlistRepo.getWishlistCourseIds("student-3");
      assert.strictEqual(ids.length, 1);
      assert.strictEqual(ids[0], "c-31");

      const clearUseCase = new ClearWishlistUseCase(wishlistRepo);
      const clearRes = await clearUseCase.execute("student-3");
      assert.strictEqual(clearRes.clearedCount, 1);

      ids = await wishlistRepo.getWishlistCourseIds("student-3");
      assert.strictEqual(ids.length, 0);

      // Rejects missing userId
      await assert.rejects(
        () => removeUseCase.execute("", "c-31"),
        (err: any) => err instanceof InvalidWishlistOperationError
      );
      await assert.rejects(
        () => clearUseCase.execute(""),
        (err: any) => err instanceof InvalidWishlistOperationError
      );
    });
  });

  describe("5. Module Factory (createWishlistModule)", () => {
    it("should construct decoupled module with in-memory dependencies", () => {
      const module = createWishlistModule({
        wishlistRepo,
      });

      assert.ok(module.wishlistRepo);
      assert.ok(module.wishlistController);
      assert.ok(module.wishlistRouter);
      assert.ok(module.useCases.toggleWishlistUseCase);
      assert.ok(module.useCases.getUserWishlistUseCase);
      assert.ok(module.useCases.getWishlistIdsUseCase);
      assert.ok(module.useCases.removeWishlistItemUseCase);
      assert.ok(module.useCases.clearWishlistUseCase);
    });
  });
});
