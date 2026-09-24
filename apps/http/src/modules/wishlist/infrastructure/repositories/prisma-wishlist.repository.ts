import { PrismaClient, Prisma } from "@prisma/client";
import { IWishlistRepository } from "../../domain/repositories/wishlist.repository.interface";
import { WishlistEntity, WishlistItemEntity } from "../../domain/entities/wishlist.entity";
import { GetUserWishlistDTO, PaginatedWishlistResultDTO } from "../../domain/dtos/wishlist.dto";

export class PrismaWishlistRepository implements IWishlistRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapCourseSnapshot(c: any) {
    if (!c) return undefined;
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      subtitle: c.subtitle,
      thumbnail: c.thumbnail,
      pricingType: c.pricingType,
      price: Number(c.price || 0),
      currency: c.currency || "INR",
      level: c.level,
      language: c.language,
      totalDurationSeconds: c.totalDurationSeconds || 0,
      totalLessons: c.totalLessons || 0,
      totalModules: c.totalModules || 0,
      isFeatured: c.isFeatured || false,
      isTrending: c.isTrending || false,
      startingDate: c.startingDate,
      category: c.category
        ? {
            id: c.category.id,
            name: c.category.name,
            slug: c.category.slug,
          }
        : null,
      subcategory: c.subcategory
        ? {
            id: c.subcategory.id,
            name: c.subcategory.name,
            slug: c.subcategory.slug,
          }
        : null,
      teacherProfile: c.teacherProfile
        ? {
            id: c.teacherProfile.id,
            expertise: c.teacherProfile.expertise || [],
            profile: c.teacherProfile.profile
              ? {
                  avatar: c.teacherProfile.profile.avatar,
                  user: c.teacherProfile.profile.user
                    ? {
                        name: c.teacherProfile.profile.user.name,
                      }
                    : undefined,
                }
              : undefined,
          }
        : null,
    };
  }

  async getOrCreateWishlist(userId: string): Promise<WishlistEntity> {
    const wishlist = await this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: true,
      },
    });

    return {
      id: wishlist.id,
      userId: wishlist.userId,
      items: wishlist.items.map((i) => ({
        id: i.id,
        wishlistId: i.wishlistId,
        courseId: i.courseId,
        createdAt: i.createdAt,
      })),
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  async findWishlistByUserId(userId: string): Promise<WishlistEntity | null> {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!wishlist) return null;

    return {
      id: wishlist.id,
      userId: wishlist.userId,
      items: wishlist.items.map((i) => ({
        id: i.id,
        wishlistId: i.wishlistId,
        courseId: i.courseId,
        createdAt: i.createdAt,
      })),
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  async getWishlistCourseIds(userId: string): Promise<string[]> {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      select: {
        items: {
          select: { courseId: true },
        },
      },
    });

    if (!wishlist) return [];
    return wishlist.items.map((i) => i.courseId);
  }

  async getUserWishlistItems(dto: GetUserWishlistDTO): Promise<PaginatedWishlistResultDTO> {
    const { userId, page = 1, limit = 12, search, sortBy = "newest" } = dto;
    const skip = (page - 1) * limit;

    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wishlist) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const whereClause: Prisma.WishlistItemWhereInput = {
      wishlistId: wishlist.id,
      course: {
        isDeleted: false,
        status: "PUBLISHED",
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { subtitle: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { category: { name: { contains: search, mode: "insensitive" } } },
                {
                  teacherProfile: {
                    profile: {
                      user: { name: { contains: search, mode: "insensitive" } },
                    },
                  },
                },
              ],
            }
          : {}),
      },
    };

    let orderBy: Prisma.WishlistItemOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "price_asc") {
      orderBy = { course: { price: "asc" } };
    } else if (sortBy === "price_desc") {
      orderBy = { course: { price: "desc" } };
    }

    const [rawItems, total] = await Promise.all([
      this.prisma.wishlistItem.findMany({
        where: whereClause,
        include: {
          course: {
            include: {
              category: true,
              subcategory: true,
              teacherProfile: {
                include: {
                  profile: {
                    include: {
                      user: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.wishlistItem.count({ where: whereClause }),
    ]);

    const items: WishlistItemEntity[] = rawItems.map((item) => ({
      id: item.id,
      wishlistId: item.wishlistId,
      courseId: item.courseId,
      createdAt: item.createdAt,
      course: this.mapCourseSnapshot(item.course),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async isCourseWishlisted(userId: string, courseId: string): Promise<boolean> {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wishlist) return false;

    const count = await this.prisma.wishlistItem.count({
      where: {
        wishlistId: wishlist.id,
        courseId,
      },
    });

    return count > 0;
  }

  async addItem(wishlistId: string, courseId: string): Promise<WishlistItemEntity> {
    const item = await this.prisma.wishlistItem.upsert({
      where: {
        wishlistId_courseId: {
          wishlistId,
          courseId,
        },
      },
      create: {
        wishlistId,
        courseId,
      },
      update: {},
      include: {
        course: {
          include: {
            category: true,
            subcategory: true,
            teacherProfile: {
              include: {
                profile: {
                  include: {
                    user: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      id: item.id,
      wishlistId: item.wishlistId,
      courseId: item.courseId,
      createdAt: item.createdAt,
      course: this.mapCourseSnapshot(item.course),
    };
  }

  async removeItem(wishlistId: string, courseId: string): Promise<boolean> {
    try {
      await this.prisma.wishlistItem.delete({
        where: {
          wishlistId_courseId: {
            wishlistId,
            courseId,
          },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async clearWishlist(wishlistId: string): Promise<number> {
    const result = await this.prisma.wishlistItem.deleteMany({
      where: { wishlistId },
    });
    return result.count;
  }
}
