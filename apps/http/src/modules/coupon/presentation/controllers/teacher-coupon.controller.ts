import { Request, Response, NextFunction } from "express";
import { CreateTeacherCouponUseCase } from "../../application/use-cases/create-teacher-coupon.usecase";
import { GetTeacherCouponsUseCase } from "../../application/use-cases/get-teacher-coupons.usecase";
import { UpdateTeacherCouponUseCase } from "../../application/use-cases/update-teacher-coupon.usecase";
import { DeleteTeacherCouponUseCase } from "../../application/use-cases/delete-teacher-coupon.usecase";
import { ValidateCouponUseCase } from "../../application/use-cases/validate-coupon.usecase";
import { AdminGetCouponsUseCase } from "../../application/use-cases/admin-get-coupons.usecase";
import { AdminToggleCouponStatusUseCase } from "../../application/use-cases/admin-toggle-coupon-status.usecase";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";

export class TeacherCouponController {
  constructor(
    private readonly createCouponUseCase: CreateTeacherCouponUseCase,
    private readonly getCouponsUseCase: GetTeacherCouponsUseCase,
    private readonly updateCouponUseCase: UpdateTeacherCouponUseCase,
    private readonly deleteCouponUseCase: DeleteTeacherCouponUseCase,
    private readonly validateCouponUseCase: ValidateCouponUseCase,
    private readonly adminGetCouponsUseCase?: AdminGetCouponsUseCase,
    private readonly adminToggleCouponUseCase?: AdminToggleCouponStatusUseCase
  ) {}


  private getUserId(req: Request): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }
    return userId;
  }

  private async getTeacherProfileId(userId: string): Promise<string> {
    const profile = await defaultPrisma.teacherProfile.findFirst({
      where: { profile: { userId } },
      select: { id: true },
    });
    if (!profile) {
      throw new ForbiddenError("Teacher profile required.");
    }
    return profile.id;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const teacherProfileId = await this.getTeacherProfileId(userId);
      const coupon = await this.createCouponUseCase.execute(teacherProfileId, req.body);
      return res.status(201).json({
        success: true,
        message: "Teacher coupon created successfully.",
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  };

  listMyCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const teacherProfileId = await this.getTeacherProfileId(userId);
      const { courseId, isActive } = req.query;
      const coupons = await this.getCouponsUseCase.execute(teacherProfileId, {
        courseId: courseId ? String(courseId) : undefined,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
      });
      return res.status(200).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      next(error);
    }
  };

  getCouponById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const coupon = await defaultPrisma.teacherCoupon.findUnique({
        where: { id: couponId },
        include: {
          course: { select: { id: true, title: true, slug: true, price: true, thumbnail: true } },
          teacherProfile: {
            include: {
              profile: {
                include: { user: true },
              },
            },
          },
          enrollments: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profile: { select: { avatar: true } },
                },
              },
              course: {
                select: { title: true, slug: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found." });
      }

      // Check teacher authorization unless admin
      const userRole = req.user?.role?.toUpperCase();
      if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
        const teacherProfileId = await this.getTeacherProfileId(userId);
        if (coupon.teacherProfileId !== teacherProfileId) {
          throw new ForbiddenError("You do not have permission to view this coupon.");
        }
      }

      const mappedRedemptions = coupon.enrollments.map((e) => ({
        id: e.id,
        studentId: e.studentId,
        studentName: e.student?.name || "Student",
        studentEmail: e.student?.email || "",
        studentAvatar: e.student?.profile?.avatar || null,
        courseTitle: e.course?.title || coupon.course?.title || "Course",
        discountAmount: Number(e.discountAmount),
        finalAmount: Number(e.finalAmount),
        paymentMethod: e.paymentMethod,
        enrolledAt: e.enrolledAt || e.createdAt,
        status: e.status,
      }));

      const totalDiscountGiven = mappedRedemptions.reduce((sum, r) => sum + r.discountAmount, 0);

      const data = {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        teacherProfileId: coupon.teacherProfileId,
        courseId: coupon.courseId,
        courseTitle: coupon.course?.title || null,
        courseSlug: coupon.course?.slug || null,
        coursePrice: coupon.course?.price ? Number(coupon.course.price) : null,
        courseThumbnail: coupon.course?.thumbnail || null,
        instructorName: coupon.teacherProfile?.profile?.user?.name || null,
        instructorEmail: coupon.teacherProfile?.profile?.user?.email || null,
        instructorAvatar: coupon.teacherProfile?.profile?.avatar || null,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        maxUsesPerStudent: coupon.maxUsesPerStudent,
        validFrom: coupon.validFrom,
        expiresAt: coupon.expiresAt,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
        totalDiscountGiven,
        redemptions: mappedRedemptions,
      };

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const teacherProfileId = await this.getTeacherProfileId(userId);
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const coupon = await this.updateCouponUseCase.execute(teacherProfileId, couponId, req.body);
      return res.status(200).json({
        success: true,
        message: "Coupon updated successfully.",
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const teacherProfileId = await this.getTeacherProfileId(userId);
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.deleteCouponUseCase.execute(teacherProfileId, couponId);
      return res.status(200).json({
        success: true,
        message: "Coupon removed/deactivated successfully.",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  validate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = String(req.query.code || "");
      const courseId = String(req.query.courseId || "");
      const studentId = req.user?.userId || "";
      const result = await this.validateCouponUseCase.execute({
        code,
        courseId,
        studentId,
      });
      return res.status(200).json({
        success: true,
        message: result.message || "Coupon validated.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  adminListCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.adminGetCouponsUseCase) {
        throw new Error("AdminGetCouponsUseCase not initialized.");
      }
      const { search, isActive, discountType, teacherProfileId, courseId, page, limit, sortBy, sortOrder } = req.query;
      const result = await this.adminGetCouponsUseCase.execute({
        search: search ? String(search) : undefined,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        discountType: discountType ? (String(discountType) as any) : undefined,
        teacherProfileId: teacherProfileId ? String(teacherProfileId) : undefined,
        courseId: courseId ? String(courseId) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 10,
        sortBy: sortBy ? String(sortBy) : "createdAt",
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
      });
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  adminToggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.adminToggleCouponUseCase) {
        throw new Error("AdminToggleCouponStatusUseCase not initialized.");
      }
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isActive } = req.body;
      const coupon = await this.adminToggleCouponUseCase.execute(couponId, isActive);
      return res.status(200).json({
        success: true,
        message: `Coupon status updated to ${coupon.isActive ? "active" : "inactive"}.`,
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  };

  adminDeleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const coupon = await defaultPrisma.teacherCoupon.findUnique({ where: { id: couponId } });
      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
      await defaultPrisma.teacherCoupon.delete({ where: { id: couponId } });
      return res.status(200).json({
        success: true,
        message: "Coupon permanently deleted by Admin.",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}

