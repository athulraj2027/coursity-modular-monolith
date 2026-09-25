import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaTeacherCouponRepository } from "./infrastructure/repositories/prisma-teacher-coupon.repository";
import { CreateTeacherCouponUseCase } from "./application/use-cases/create-teacher-coupon.usecase";
import { GetTeacherCouponsUseCase } from "./application/use-cases/get-teacher-coupons.usecase";
import { UpdateTeacherCouponUseCase } from "./application/use-cases/update-teacher-coupon.usecase";
import { DeleteTeacherCouponUseCase } from "./application/use-cases/delete-teacher-coupon.usecase";
import { ValidateCouponUseCase } from "./application/use-cases/validate-coupon.usecase";
import { AdminGetCouponsUseCase } from "./application/use-cases/admin-get-coupons.usecase";
import { AdminToggleCouponStatusUseCase } from "./application/use-cases/admin-toggle-coupon-status.usecase";
import { TeacherCouponController } from "./presentation/controllers/teacher-coupon.controller";
import { createTeacherCouponRouter } from "./presentation/routes/teacher-coupon.routes";

export function createCouponModule() {
  const couponRepo = new PrismaTeacherCouponRepository(defaultPrisma);
  const createCouponUseCase = new CreateTeacherCouponUseCase(couponRepo);
  const getCouponsUseCase = new GetTeacherCouponsUseCase(couponRepo);
  const updateCouponUseCase = new UpdateTeacherCouponUseCase(couponRepo);
  const deleteCouponUseCase = new DeleteTeacherCouponUseCase(couponRepo);
  const validateCouponUseCase = new ValidateCouponUseCase(couponRepo);
  const adminGetCouponsUseCase = new AdminGetCouponsUseCase(couponRepo);
  const adminToggleCouponUseCase = new AdminToggleCouponStatusUseCase(couponRepo);

  const couponController = new TeacherCouponController(
    createCouponUseCase,
    getCouponsUseCase,
    updateCouponUseCase,
    deleteCouponUseCase,
    validateCouponUseCase,
    adminGetCouponsUseCase,
    adminToggleCouponUseCase
  );

  const couponRouter = createTeacherCouponRouter(couponController);

  return {
    couponRepo,
    createCouponUseCase,
    validateCouponUseCase,
    adminGetCouponsUseCase,
    adminToggleCouponUseCase,
    couponController,
    couponRouter,
  };
}

const defaultModule = createCouponModule();
export const couponRouter = defaultModule.couponRouter;
export const couponRepo = defaultModule.couponRepo;
export const validateCouponUseCase = defaultModule.validateCouponUseCase;
export default couponRouter;

