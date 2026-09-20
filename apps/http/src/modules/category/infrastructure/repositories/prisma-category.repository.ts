import { PrismaClient, Prisma } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ICategoryRepository } from "../../domain/repositories/category.repository";
import {
  CategoryEntity,
  CategoryTreeNode,
  CategoryFilterParams,
  CategoryMetrics,
} from "../../domain/entities/category.entity";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../domain/dtos/category.dto";

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

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

    return item as CategoryEntity | null;
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

    return item as CategoryEntity | null;
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

    return { items: items as CategoryEntity[], total };
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

    return parents.map((p: any) => ({
      ...p,
      subcategoryCount: p.children?.length || 0,
      children: (p.children || []).map((c: any) => ({
        ...c,
        subcategoryCount: 0,
        children: [],
      })),
    }));
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
    const slug = data.slug || this.generateSlug(data.name);

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

    return created as CategoryEntity;
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

    return updated as CategoryEntity;
  }

  async toggleActive(id: string, isActive: boolean): Promise<CategoryEntity> {
    const updated = await (this.prisma as any).category.update({
      where: { id },
      data: { isActive },
      include: { parent: true },
    });
    return updated as CategoryEntity;
  }

  async softDelete(id: string): Promise<CategoryEntity> {
    const updated = await (this.prisma as any).category.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
      include: { parent: true },
    });

    // Also soft-delete children if it's a parent
    await (this.prisma as any).category.updateMany({
      where: { parentId: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return updated as CategoryEntity;
  }

  async restore(id: string): Promise<CategoryEntity> {
    const updated = await (this.prisma as any).category.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        isActive: true,
      },
      include: { parent: true },
    });

    // Also restore children if it was a parent
    await (this.prisma as any).category.updateMany({
      where: { parentId: id },
      data: {
        isDeleted: false,
        deletedAt: null,
        isActive: true,
      },
    });

    return updated as CategoryEntity;
  }

  async hardDelete(id: string): Promise<boolean> {
    await (this.prisma as any).category.delete({
      where: { id },
    });
    return true;
  }

  async countChildren(parentId: string, includeDeleted = false): Promise<number> {
    const where: any = { parentId };
    if (!includeDeleted) {
      where.isDeleted = false;
    }
    return await (this.prisma as any).category.count({ where });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
