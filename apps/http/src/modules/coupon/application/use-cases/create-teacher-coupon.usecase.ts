import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { CreateTeacherCouponDto } from "../../domain/dtos/teacher-coupon.dto";
import { TeacherCouponEntity } from "../../domain/entities/teacher-coupon.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { BadRequestError, ConflictError, NotFoundError } from "@/app/errors";

export class CreateTeacherCouponUseCase {
  constructor(private readonly couponRepo: TeacherCouponRepository) {}

  async execute(teacherProfileId: string, dto: CreateTeacherCouponDto): Promise<TeacherCouponEntity> {
    if (!dto.code || dto.code.trim().length < 3) {
      throw new BadRequestError("Coupon code must be at least 3 characters.");
    }

    if (dto.discountValue <= 0) {
      throw new BadRequestError("Discount value must be greater than zero.");
    }

    if (dto.discountType === "PERCENTAGE" && dto.discountValue > 100) {
      throw new BadRequestError("Percentage discount cannot exceed 100%.");
    }

    // Verify course belongs to teacher if courseId is provided
    if (dto.courseId) {
      const course = await defaultPrisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new NotFoundError("Course not found.");
      }
      if (course.teacherProfileId !== teacherProfileId) {
        throw new BadRequestError("You can only create coupons for your own courses.");
      }
    }

    // Check duplicate code for this teacher
    const existing = await this.couponRepo.findByCodeAndTeacher(teacherProfileId, dto.code);
    if (existing) {
      throw new ConflictError(`Coupon with code '${dto.code.toUpperCase()}' already exists in your account.`);
    }

    return this.couponRepo.create(teacherProfileId, dto);
  }
}
