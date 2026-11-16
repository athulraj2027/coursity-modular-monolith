import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CategoryEntity,
  CategoryTreeNode,
  CategoryMetrics,
  CategoryFilterParams,
  CategorySlugPolicy,
  CategoryHierarchyPolicy,
  GetCategoriesUseCase,
  GetCategoryTreeUseCase,
  GetCategoryBySlugUseCase,
  AdminCreateCategoryUseCase,
  AdminUpdateCategoryUseCase,
  AdminToggleCategoryStatusUseCase,
  AdminSoftDeleteCategoryUseCase,
  AdminRestoreCategoryUseCase,
  AdminHardDeleteCategoryUseCase,
  AdminGetAllCategoriesUseCase,
  AdminGetCategoryByIdUseCase,
  AdminGetCategoryTreeUseCase,
  AdminGetMetricsUseCase,
  AdminManageCategoriesUseCase,
  ICategoryQueryRepository,
  ICategoryAdminRepository,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../src/modules/category";
import { BadRequestError, NotFoundError } from "../src/app/errors";

class MockCategoryRepository implements ICategoryQueryRepository, ICategoryAdminRepository {
  public records: Map<string, CategoryEntity> = new Map();

  async create(data: CreateCategoryDTO): Promise<CategoryEntity> {
    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const slug = data.slug || CategorySlugPolicy.generate(data.name);

    const entity = new CategoryEntity({
      id,
      name: data.name,
      slug,
      description: data.description ?? null,
      icon: data.icon ?? null,
      image: data.image ?? null,
      parentId: data.parentId ?? null,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      sortOrder: data.sortOrder ?? 0,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.records.set(id, entity);
    return entity;
  }

  async findById(id: string, includeDeleted = false): Promise<CategoryEntity | null> {
    const item = this.records.get(id);
    if (!item) return null;
    if (!includeDeleted && item.isDeleted) return null;

    const parent = item.parentId ? this.records.get(item.parentId) || null : null;
    const children = Array.from(this.records.values()).filter(
      (c) => c.parentId === id && (includeDeleted || !c.isDeleted)
    );

    return new CategoryEntity({
      ...item,
      parent,
      children,
      childrenCount: children.length,
    });
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<CategoryEntity | null> {
    for (const item of this.records.values()) {
      if (item.slug === slug) {
        if (!includeDeleted && item.isDeleted) return null;
        return item;
      }
    }
    return null;
  }

  async findMany(params: CategoryFilterParams = {}): Promise<{ items: CategoryEntity[]; total: number }> {
    let list = Array.from(this.records.values());

    if (params.isDeleted !== undefined) {
      list = list.filter((r) => r.isDeleted === params.isDeleted);
    } else if (!params.includeDeleted) {
      list = list.filter((r) => !r.isDeleted);
    }

    if (params.isActive !== undefined) {
      list = list.filter((r) => r.isActive === params.isActive);
    }

    if (params.onlyParents) {
      list = list.filter((r) => r.parentId === null);
    } else if (params.parentId !== undefined) {
      list = list.filter((r) => r.parentId === params.parentId);
    }

    return {
      items: list,
      total: list.length,
    };
  }

  async getCategoryTree(includeInactive = false, includeDeleted = false): Promise<CategoryTreeNode[]> {
    let parents = Array.from(this.records.values()).filter((r) => r.parentId === null);
    if (!includeDeleted) parents = parents.filter((r) => !r.isDeleted);
    if (!includeInactive) parents = parents.filter((r) => r.isActive);

    return parents.map((p) => {
      let children = Array.from(this.records.values()).filter((c) => c.parentId === p.id);
      if (!includeDeleted) children = children.filter((c) => !c.isDeleted);
      if (!includeInactive) children = children.filter((c) => c.isActive);

      const treeChildren: CategoryTreeNode[] = children.map((c) => ({
        ...c,
        children: [],
        subcategoryCount: 0,
      } as CategoryTreeNode));

      return {
        ...p,
        children: treeChildren,
        subcategoryCount: treeChildren.length,
      } as CategoryTreeNode;
    });
  }

  async getMetrics(): Promise<CategoryMetrics> {
    const all = Array.from(this.records.values());
    const notDeleted = all.filter((r) => !r.isDeleted);

    return {
      total: all.length,
      parentCategories: notDeleted.filter((r) => r.parentId === null).length,
      subcategories: notDeleted.filter((r) => r.parentId !== null).length,
      active: notDeleted.filter((r) => r.isActive).length,
      inactive: notDeleted.filter((r) => !r.isActive).length,
      deleted: all.filter((r) => r.isDeleted).length,
    };
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<CategoryEntity> {
    const existing = this.records.get(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const updated = new CategoryEntity({
      ...existing,
      name: data.name ?? existing.name,
      slug: data.slug ?? existing.slug,
      description: data.description !== undefined ? data.description : existing.description,
      icon: data.icon !== undefined ? data.icon : existing.icon,
      image: data.image !== undefined ? data.image : existing.image,
      parentId: data.parentId !== undefined ? data.parentId : existing.parentId,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : existing.isFeatured,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      updatedAt: new Date(),
    });

    this.records.set(id, updated);
    return updated;
  }

  async toggleActive(id: string, isActive: boolean): Promise<CategoryEntity> {
    const existing = this.records.get(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const updated = new CategoryEntity({
      ...existing,
      isActive,
      updatedAt: new Date(),
    });
    this.records.set(id, updated);
    return updated;
  }

  async softDelete(id: string): Promise<CategoryEntity> {
    const existing = this.records.get(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const now = new Date();
    const updated = new CategoryEntity({
      ...existing,
      isDeleted: true,
      deletedAt: now,
      isActive: false,
    });
    this.records.set(id, updated);

    // Cascading soft-delete to children
    for (const [key, item] of this.records.entries()) {
      if (item.parentId === id) {
        this.records.set(
          key,
          new CategoryEntity({
            ...item,
            isDeleted: true,
            deletedAt: now,
            isActive: false,
          })
        );
      }
    }

    return updated;
  }

  async restore(id: string): Promise<CategoryEntity> {
    const existing = this.records.get(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const updated = new CategoryEntity({
      ...existing,
      isDeleted: false,
      deletedAt: null,
      isActive: true,
    });
    this.records.set(id, updated);

    // Cascading restore to children
    for (const [key, item] of this.records.entries()) {
      if (item.parentId === id) {
        this.records.set(
          key,
          new CategoryEntity({
            ...item,
            isDeleted: false,
            deletedAt: null,
            isActive: true,
          })
        );
      }
    }

    return updated;
  }

  async hardDelete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }

  async countChildren(parentId: string, includeDeleted = false): Promise<number> {
    return Array.from(this.records.values()).filter(
      (c) => c.parentId === parentId && (includeDeleted || !c.isDeleted)
    ).length;
  }

  async delete(id: string): Promise<boolean> {
    return this.hardDelete(id);
  }
}

describe("Category Module Clean Architecture & SOLID Principles Suite", () => {
  describe("1. CategorySlugPolicy (Domain Logic & Formatting)", () => {
    it("should generate clean, sanitized URL slugs from category names", () => {
      assert.equal(
        CategorySlugPolicy.generate("Development & Software Engineering"),
        "development-software-engineering"
      );
      assert.equal(CategorySlugPolicy.generate("  React 19 & Next.js!  "), "react-19-nextjs");
      assert.equal(CategorySlugPolicy.generate("---DevOps / Cloud---"), "devops-cloud");
    });

    it("should correctly validate slugs", () => {
      assert.equal(CategorySlugPolicy.isValid("web-development"), true);
      assert.equal(CategorySlugPolicy.isValid("machine-learning-101"), true);
      assert.equal(CategorySlugPolicy.isValid("Web-Development"), false); // uppercase
      assert.equal(CategorySlugPolicy.isValid("web development"), false); // spaces
      assert.equal(CategorySlugPolicy.isValid("-web-dev-"), false); // leading/trailing hyphens
    });

    it("should normalize slugs", () => {
      assert.equal(CategorySlugPolicy.normalize("  Web-Dev-101  "), "web-dev-101");
    });
  });

  describe("2. CategoryHierarchyPolicy (Domain Invariants & Depth Limits)", () => {
    it("should allow root categories with null parentId", () => {
      assert.doesNotThrow(() => {
        CategoryHierarchyPolicy.validateParentAssignment({
          parentId: null,
        });
      });
    });

    it("should reject setting category as its own parent", () => {
      assert.throws(
        () => {
          CategoryHierarchyPolicy.validateParentAssignment({
            currentId: "cat_1",
            parentId: "cat_1",
            parent: { id: "cat_1", parentId: null },
          });
        },
        (err: unknown) => err instanceof BadRequestError && err.message.includes("own parent")
      );
    });

    it("should reject parent assignment when parent does not exist", () => {
      assert.throws(
        () => {
          CategoryHierarchyPolicy.validateParentAssignment({
            parentId: "cat_non_existent",
            parent: null,
          });
        },
        (err: unknown) => err instanceof BadRequestError && err.message.includes("does not exist")
      );
    });

    it("should reject nesting beyond 2 levels (subcategories under subcategories)", () => {
      const parentIsSubcategory = { id: "sub_1", parentId: "root_1" };

      assert.throws(
        () => {
          CategoryHierarchyPolicy.validateParentAssignment({
            parentId: "sub_1",
            parent: parentIsSubcategory,
          });
        },
        (err: unknown) => err instanceof BadRequestError && err.message.includes("Nesting beyond 2 levels")
      );
    });

    it("should prevent demoting a parent category with existing children into a subcategory", () => {
      const validRootParent = { id: "root_2", parentId: null };

      assert.throws(
        () => {
          CategoryHierarchyPolicy.validateParentAssignment({
            currentId: "cat_has_children",
            parentId: "root_2",
            parent: validRootParent,
            currentChildCount: 3, // has 3 subcategories
          });
        },
        (err: unknown) => err instanceof BadRequestError && err.message.includes("cannot be demoted")
      );
    });
  });

  describe("3. Clean Domain Entity & Backward Compatibility", () => {
    it("should instantiate CategoryEntity and support both childrenCount and _count getter", () => {
      const entity = new CategoryEntity({
        id: "cat_test",
        name: "Testing",
        slug: "testing",
        childrenCount: 5,
      });

      assert.equal(entity.childrenCount, 5);
      // Backward compatible Prisma _count convention
      assert.deepEqual(entity._count, { children: 5 });
    });
  });

  describe("4. Fine-Grained Single Responsibility Use Cases", () => {
    it("AdminCreateCategoryUseCase: creates root and subcategories with unique slugs", async () => {
      const repo = new MockCategoryRepository();
      const createUseCase = new AdminCreateCategoryUseCase(repo);

      // 1. Create root category
      const root = await createUseCase.execute({
        name: "Engineering",
        description: "All engineering courses",
      });
      assert.equal(root.name, "Engineering");
      assert.equal(root.slug, "engineering");
      assert.equal(root.parentId, null);

      // 2. Reject duplicate slug
      await assert.rejects(
        async () => {
          await createUseCase.execute({
            name: "Engineering",
          });
        },
        (err: unknown) => err instanceof BadRequestError && err.message.includes("already exists")
      );

      // 3. Create subcategory under root
      const sub = await createUseCase.execute({
        name: "Backend Development",
        parentId: root.id,
      });
      assert.equal(sub.parentId, root.id);
      assert.equal(sub.slug, "backend-development");
    });

    it("AdminUpdateCategoryUseCase: updates properties and enforces hierarchy checks", async () => {
      const repo = new MockCategoryRepository();
      const root = await repo.create({ name: "Web Dev" });
      const updateUseCase = new AdminUpdateCategoryUseCase(repo);

      const updated = await updateUseCase.execute(root.id, {
        name: "Web Development",
        description: "Modern web courses",
      });

      assert.equal(updated.name, "Web Development");
      assert.equal(updated.description, "Modern web courses");

      // Reject non-existent category
      await assert.rejects(async () => {
        await updateUseCase.execute("non_existent_id", { name: "Test" });
      }, NotFoundError);
    });

    it("AdminToggleCategoryStatusUseCase: activates and deactivates categories", async () => {
      const repo = new MockCategoryRepository();
      const cat = await repo.create({ name: "Cloud Computing", isActive: true });
      const toggleUseCase = new AdminToggleCategoryStatusUseCase(repo);

      const deactivated = await toggleUseCase.execute(cat.id, false);
      assert.equal(deactivated.isActive, false);

      const reactivated = await toggleUseCase.execute(cat.id, true);
      assert.equal(reactivated.isActive, true);
    });

    it("AdminSoftDeleteCategoryUseCase and AdminRestoreCategoryUseCase: cascade to children", async () => {
      const repo = new MockCategoryRepository();
      const parent = await repo.create({ name: "Languages" });
      const child = await repo.create({ name: "Python", parentId: parent.id });

      const softDeleteUseCase = new AdminSoftDeleteCategoryUseCase(repo);
      await softDeleteUseCase.execute(parent.id);

      // Both parent and child must be soft-deleted
      const refreshedParent = await repo.findById(parent.id, true);
      const refreshedChild = await repo.findById(child.id, true);
      assert.equal(refreshedParent?.isDeleted, true);
      assert.equal(refreshedChild?.isDeleted, true);

      // Hidden from default query
      assert.equal(await repo.findById(parent.id, false), null);

      // Restore
      const restoreUseCase = new AdminRestoreCategoryUseCase(repo);
      await restoreUseCase.execute(parent.id);

      const restoredParent = await repo.findById(parent.id, false);
      const restoredChild = await repo.findById(child.id, false);
      assert.equal(restoredParent?.isDeleted, false);
      assert.equal(restoredChild?.isDeleted, false);
    });

    it("AdminGetMetricsUseCase: calculates accurate category counts", async () => {
      const repo = new MockCategoryRepository();
      const p1 = await repo.create({ name: "Parent 1" });
      await repo.create({ name: "Parent 2" });
      await repo.create({ name: "Child 1", parentId: p1.id });

      const metricsUseCase = new AdminGetMetricsUseCase(repo);
      const metrics = await metricsUseCase.execute();

      assert.equal(metrics.total, 3);
      assert.equal(metrics.parentCategories, 2);
      assert.equal(metrics.subcategories, 1);
      assert.equal(metrics.active, 3);
      assert.equal(metrics.deleted, 0);
    });

    it("Public Queries (GetCategoriesUseCase & GetCategoryTreeUseCase)", async () => {
      const repo = new MockCategoryRepository();
      const p1 = await repo.create({ name: "Design" });
      await repo.create({ name: "UI/UX", parentId: p1.id });

      const getCategoriesUseCase = new GetCategoriesUseCase(repo);
      const activeList = await getCategoriesUseCase.getAllActive();
      assert.equal(activeList.length, 2);

      const treeUseCase = new GetCategoryTreeUseCase(repo);
      const tree = await treeUseCase.execute();
      assert.equal(tree.length, 1);
      assert.equal(tree[0].name, "Design");
      assert.equal(tree[0].subcategoryCount, 1);
      assert.equal(tree[0].children[0].name, "UI/UX");
    });
  });

  describe("5. AdminManageCategoriesUseCase Facade (Backward Compatibility)", () => {
    it("should delegate all methods properly through facade", async () => {
      const repo = new MockCategoryRepository();
      const facade = new AdminManageCategoriesUseCase(repo);

      const created = await facade.createCategory({ name: "Mobile Development" });
      assert.equal(created.name, "Mobile Development");

      const fetched = await facade.getCategoryById(created.id);
      assert.equal(fetched.id, created.id);

      const metrics = await facade.getMetrics();
      assert.equal(metrics.total, 1);

      const tree = await facade.getCategoryTree();
      assert.equal(tree.length, 1);
    });
  });
});

