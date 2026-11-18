import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaBaseRepository } from "@/shared/infrastructure/repositories/prisma-base.repository";
import {
  ICategoryRepository,
  ICategoryQueryRepository,
  ICategoryAdminRepository,
} from "../../domain/repositories/category.repository";
import {
  CategoryEntity,
  CategoryTreeNode,
  CategoryFilterParams,
  CategoryMetrics,
} from "../../domain/entities/category.entity";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../domain/dtos/category.dto";
import { CategorySlugPolicy } from "../../domain/policies/category-slug.policy";

export class PrismaCategoryRepository
  extends PrismaBaseRepository<
    CategoryEntity,
    typeof defaultPrisma.category,
    CreateCategoryDTO,
    UpdateCategoryDTO,
    CategoryFilterParams
  >
  implements ICategoryRepository, ICategoryQueryRepository, ICategoryAdminRepository
{
  constructor(prisma: PrismaClient = defaultPrisma) {
    super(prisma, (prisma as any).category);
  }

  protected mapToEntity(record: any): CategoryEntity {
    if (!record) return record;

    return new CategoryEntity({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description ?? null,
      icon: record.icon ?? null,
      image: record.image ?? null,
      parentId: record.parentId ?? null,
      isActive: record.isActive,
      isFeatured: record.isFeatured,
      sortOrder: record.sortOrder,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      parent: record.parent ? this.mapToEntity(record.parent) : null,
      children: Array.isArray(record.children)
        ? record.children.map((c: any) => this.mapToEntity(c))
        : [],
      childrenCount: record._count?.children ?? (Array.isArray(record.children) ? record.children.length : 0),
    });
  }

  async findById(id: string, includeDeleted = false): Promise<CategoryEntity | null> {
    const where: any = { id };
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const item = await (this.prisma as any).category.findFirst({
      where,
      include: {
        parent: true,
        children: {
          where: includeDeleted ? {} : { isDeleted: false },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            children: {
              where: includeDeleted ? {} : { isDeleted: false },
            },
          },
        },
      },
    });

    return item ? this.mapToEntity(item) : null;
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<CategoryEntity | null> {
    const where: any = { slug };
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const item = await (this.prisma as any).category.findFirst({
      where,
      include: {
        parent: true,
        children: {
          where: includeDeleted ? {} : { isDeleted: false },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            children: {
              where: includeDeleted ? {} : { isDeleted: false },
            },
          },
        },
      },
    });

    return item ? this.mapToEntity(item) : null;
  }

  async findMany(params: CategoryFilterParams = {}): Promise<{ items: CategoryEntity[]; total: number }> {
    const where: any = {};

    // Soft delete filtering
    if (params.isDeleted !== undefined) {
      where.isDeleted = params.isDeleted;
    } else if (!params.includeDeleted) {
      where.isDeleted = false;
    }

    // Active status filter
    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    // Featured status filter
    if (params.isFeatured !== undefined) {
      where.isFeatured = params.isFeatured;
    }

    // Parent filtering
    if (params.onlyParents) {
      where.parentId = null;
    } else if (params.parentId !== undefined) {
      where.parentId = params.parentId;
    }

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Order By
    const sortBy = params.sortBy || "sortOrder";
    const sortOrder = params.sortOrder || "asc";
    const orderBy = { [sortBy]: sortOrder };

    const total = await (this.prisma as any).category.count({ where });

    const take = params.limit;
    const skip = params.page && params.limit ? (params.page - 1) * params.limit : undefined;

    const items = await (this.prisma as any).category.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        parent: true,
        _count: {
          select: {
            children: {
              where: params.includeDeleted ? {} : { isDeleted: false },
            },
          },
        },
      },
    });

    return {
      items: items.map((i: any) => this.mapToEntity(i)),
      total,
    };
  }

  async getCategoryTree(includeInactive = false, includeDeleted = false): Promise<CategoryTreeNode[]> {
    const where: any = { parentId: null };
    if (!includeDeleted) {
      where.isDeleted = false;
    }
    if (!includeInactive) {
      where.isActive = true;
    }

    const childWhere: any = {};
    if (!includeDeleted) {
      childWhere.isDeleted = false;
    }
    if (!includeInactive) {
      childWhere.isActive = true;
    }

    const parents = await (this.prisma as any).category.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          where: childWhere,
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return parents.map((p: any) => {
      const mappedChildren: CategoryTreeNode[] = (p.children || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
        icon: c.icon ?? null,
        image: c.image ?? null,
        parentId: c.parentId ?? null,
        isActive: c.isActive,
        isFeatured: c.isFeatured,
        sortOrder: c.sortOrder,
        isDeleted: c.isDeleted,
        deletedAt: c.deletedAt ?? null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        subcategoryCount: 0,
        children: [],
        childrenCount: 0,
      }));

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? null,
        icon: p.icon ?? null,
        image: p.image ?? null,
        parentId: p.parentId ?? null,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
        isDeleted: p.isDeleted,
        deletedAt: p.deletedAt ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        subcategoryCount: mappedChildren.length,
        children: mappedChildren,
        childrenCount: mappedChildren.length,
      };
    });
  }

  async getMetrics(): Promise<CategoryMetrics> {
    const [total, parentCategories, subcategories, active, inactive, deleted] = await Promise.all([
      (this.prisma as any).category.count(),
      (this.prisma as any).category.count({ where: { parentId: null, isDeleted: false } }),
      (this.prisma as any).category.count({ where: { parentId: { not: null }, isDeleted: false } }),
      (this.prisma as any).category.count({ where: { isActive: true, isDeleted: false } }),
      (this.prisma as any).category.count({ where: { isActive: false, isDeleted: false } }),
      (this.prisma as any).category.count({ where: { isDeleted: true } }),
    ]);

    return {
      total,
      parentCategories,
      subcategories,
      active,
      inactive,
      deleted,
    };
  }

  async create(data: CreateCategoryDTO): Promise<CategoryEntity> {
    const slug = data.slug || CategorySlugPolicy.generate(data.name);

    const created = await (this.prisma as any).category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        icon: data.icon || null,
        image: data.image || null,
        parentId: data.parentId || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder ?? 0,
        isDeleted: false,
      },
      include: {
        parent: true,
      },
    });

    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<CategoryEntity> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const updated = await (this.prisma as any).category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
      },
    });

    return this.mapToEntity(updated);
  }

  async toggleActive(id: string, isActive: boolean): Promise<CategoryEntity> {
    const updated = await (this.prisma as any).category.update({
      where: { id },
      data: { isActive },
      include: { parent: true },
    });
    return this.mapToEntity(updated);
  }

  /**
   * Atomically soft-deletes a category and its children in a database transaction.
   */
  async softDelete(id: string): Promise<CategoryEntity> {
    const now = new Date();

    const [updated] = await (this.prisma as any).$transaction([
      (this.prisma as any).category.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: now,
          isActive: false,
        },
        include: { parent: true },
      }),
      (this.prisma as any).category.updateMany({
        where: { parentId: id },
        data: {
          isDeleted: true,
          deletedAt: now,
          isActive: false,
        },
      }),
    ]);

    return this.mapToEntity(updated);
  }

  /**
   * Atomically restores a category and its children in a database transaction.
   */
  async restore(id: string): Promise<CategoryEntity> {
    const [updated] = await (this.prisma as any).$transaction([
      (this.prisma as any).category.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
          isActive: true,
        },
        include: { parent: true },
      }),
      (this.prisma as any).category.updateMany({
        where: { parentId: id },
        data: {
          isDeleted: false,
          deletedAt: null,
          isActive: true,
        },
      }),
    ]);

    return this.mapToEntity(updated);
  }

  async hardDelete(id: string): Promise<boolean> {
    await this.delete(id);
    return true;
  }

  async countChildren(parentId: string, includeDeleted = false): Promise<number> {
    const where: any = { parentId };
    if (!includeDeleted) {
      where.isDeleted = false;
    }
    return await (this.prisma as any).category.count({ where });
  }

  /**
   * Base repository standard delete implementation conforming to LSP
   */
  override async delete(id: string): Promise<boolean> {
    await (this.prisma as any).category.delete({
      where: { id },
    });
    return true;
  }
}
