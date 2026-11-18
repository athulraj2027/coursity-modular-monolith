import { ITeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { ICourseRepository } from "@/modules/course/domain/repositories/course.repository";
import { CreateTeacherCouponDto } from "../../domain/dtos/teacher-coupon.dto";
import { TeacherCouponEntity } from "../../domain/entities/teacher-coupon.entity";
import { CouponValidationPolicy } from "../../domain/policies/coupon-validation.policy";
import { BadRequestError, ConflictError, NotFoundError } from "@/app/errors";

export class CreateTeacherCouponUseCase {
  constructor(
    private readonly couponRepo: ITeacherCouponRepository,
    private readonly courseRepo?: ICourseRepository
  ) {}

  async execute(teacherProfileId: string, dto: CreateTeacherCouponDto): Promise<TeacherCouponEntity> {
    if (!dto.code || !CouponValidationPolicy.isValidCode(dto.code)) {
      throw new BadRequestError(
        "Coupon code must be between 3 and 20 alphanumeric characters, hyphens, or underscores."
      );
    }

    // Validate discount boundaries using pure domain policy
    CouponValidationPolicy.validateDiscountRules(
      dto.discountType,
      dto.discountValue,
      dto.maxDiscountAmount
    );

    // Verify course belongs to teacher if courseId is provided
    if (dto.courseId) {
      const course = this.courseRepo
        ? await this.courseRepo.findById(dto.courseId, true)
        : null;
      if (!course) {
        throw new NotFoundError("Course not found.");
      }
      if (course.teacherProfileId !== teacherProfileId) {
        throw new BadRequestError("You can only create coupons for your own courses.");
      }
    }

    const normalizedCode = CouponValidationPolicy.normalizeCode(dto.code);

    // Check duplicate code for this teacher
    const existing = await this.couponRepo.findByCodeAndTeacher(teacherProfileId, normalizedCode);
    if (existing) {
      throw new ConflictError(`Coupon with code '${normalizedCode}' already exists in your account.`);
    }

    return this.couponRepo.create(teacherProfileId, {
      ...dto,
      code: normalizedCode,
    });
  }
}
