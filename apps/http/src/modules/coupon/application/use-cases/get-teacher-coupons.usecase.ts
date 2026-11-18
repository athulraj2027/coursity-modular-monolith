import { ITeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { TeacherCouponEntity } from "../../domain/entities/teacher-coupon.entity";

export class GetTeacherCouponsUseCase {
  constructor(private readonly couponRepo: ITeacherCouponRepository) {}

  async execute(teacherProfileId: string, options?: { courseId?: string; isActive?: boolean }): Promise<TeacherCouponEntity[]> {
    return this.couponRepo.listByTeacher(teacherProfileId, options);
  }
}
