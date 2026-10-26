import { Request, Response, NextFunction } from "express";
import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class GetCouponByIdController {
  constructor(private readonly couponRepo?: TeacherCouponRepository) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const coupon = await this.couponRepo?.findCouponWithRedemptions(couponId);

      if (!coupon) {
        return ApiResponse.error(res, "Coupon not found.", 404);
      }

      // Check teacher authorization unless admin
      const userRole = req.user?.role?.toUpperCase();
      if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
        const teacherProfileId = await profileRepository.getTeacherProfileIdByUserId(userId);
        if (!teacherProfileId || coupon.teacherProfileId !== teacherProfileId) {
          throw new ForbiddenError("You do not have permission to view this coupon.");
        }
      }

      const mappedRedemptions = (coupon.enrollments || []).map((e: any) => ({
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

      const totalDiscountGiven = mappedRedemptions.reduce((sum: number, r: any) => sum + r.discountAmount, 0);

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

      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  };
}
