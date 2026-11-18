import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaTeacherCouponRepository } from "./infrastructure/repositories/prisma-teacher-coupon.repository";
import { CreateTeacherCouponUseCase } from "./application/use-cases/create-teacher-coupon.usecase";
import { GetTeacherCouponsUseCase } from "./application/use-cases/get-teacher-coupons.usecase";
import { GetCouponByIdUseCase } from "./application/use-cases/get-coupon-by-id.usecase";
import { UpdateTeacherCouponUseCase } from "./application/use-cases/update-teacher-coupon.usecase";
import { DeleteTeacherCouponUseCase } from "./application/use-cases/delete-teacher-coupon.usecase";
import { ValidateCouponUseCase } from "./application/use-cases/validate-coupon.usecase";
import { AdminGetCouponsUseCase } from "./application/use-cases/admin-get-coupons.usecase";
import { AdminToggleCouponStatusUseCase } from "./application/use-cases/admin-toggle-coupon-status.usecase";
import { AdminDeleteCouponUseCase } from "./application/use-cases/admin-delete-coupon.usecase";
import { TeacherCouponController } from "./presentation/controllers/teacher-coupon.controller";
import { createTeacherCouponRouter } from "./presentation/routes/teacher-coupon.routes";
import { PrismaCourseRepository } from "@/modules/course/infrastructure/repositories/prisma-course.repository";
import { defaultTeacherProfileResolver } from "./domain/services/teacher-profile-resolver.service";

export function createCouponModule(prisma: PrismaClient = defaultPrisma) {
  const couponRepo = new PrismaTeacherCouponRepository(prisma);
  const courseRepo = new PrismaCourseRepository(prisma);

  const createCouponUseCase = new CreateTeacherCouponUseCase(couponRepo, courseRepo);
  const getCouponsUseCase = new GetTeacherCouponsUseCase(couponRepo);
  const getCouponByIdUseCase = new GetCouponByIdUseCase(couponRepo);
  const updateCouponUseCase = new UpdateTeacherCouponUseCase(couponRepo);
  const deleteCouponUseCase = new DeleteTeacherCouponUseCase(couponRepo);
  const validateCouponUseCase = new ValidateCouponUseCase(couponRepo, courseRepo);
  const adminGetCouponsUseCase = new AdminGetCouponsUseCase(couponRepo);
  const adminToggleCouponUseCase = new AdminToggleCouponStatusUseCase(couponRepo);
  const adminDeleteCouponUseCase = new AdminDeleteCouponUseCase(couponRepo);

  const couponController = new TeacherCouponController({
    createCouponUseCase,
    getCouponsUseCase,
    getCouponByIdUseCase,
    updateCouponUseCase,
    deleteCouponUseCase,
    validateCouponUseCase,
    adminGetCouponsUseCase,
    adminToggleCouponUseCase,
    adminDeleteCouponUseCase,
    couponRepo,
    profileResolver: defaultTeacherProfileResolver,
  });

  const couponRouter = createTeacherCouponRouter(couponController);

  return {
    couponRepo,
    useCases: {
      createCouponUseCase,
      getCouponsUseCase,
      getCouponByIdUseCase,
      updateCouponUseCase,
      deleteCouponUseCase,
      validateCouponUseCase,
      adminGetCouponsUseCase,
      adminToggleCouponUseCase,
      adminDeleteCouponUseCase,
    },
    couponController,
    couponRouter,
  };
}

const defaultModule = createCouponModule();
export const couponRouter: Router = defaultModule.couponRouter;
export const couponRepo = defaultModule.couponRepo;
export const createCouponUseCase = defaultModule.useCases.createCouponUseCase;
export const validateCouponUseCase = defaultModule.useCases.validateCouponUseCase;
export const adminGetCouponsUseCase = defaultModule.useCases.adminGetCouponsUseCase;
export const adminToggleCouponUseCase = defaultModule.useCases.adminToggleCouponUseCase;
export const couponController = defaultModule.couponController;
export default couponRouter;

// Re-export Domain layer
export * from "./domain/entities/teacher-coupon.entity";
export * from "./domain/dtos/teacher-coupon.dto";
export * from "./domain/repositories/teacher-coupon.repository";
export * from "./domain/policies/coupon-discount.policy";
export * from "./domain/policies/coupon-validation.policy";
export * from "./domain/services/teacher-profile-resolver.service";

// Re-export Application layer (Use Cases)
export * from "./application/use-cases/create-teacher-coupon.usecase";
export * from "./application/use-cases/get-teacher-coupons.usecase";
export * from "./application/use-cases/get-coupon-by-id.usecase";
export * from "./application/use-cases/update-teacher-coupon.usecase";
export * from "./application/use-cases/delete-teacher-coupon.usecase";
export * from "./application/use-cases/validate-coupon.usecase";
export * from "./application/use-cases/admin-get-coupons.usecase";
export * from "./application/use-cases/admin-toggle-coupon-status.usecase";
export * from "./application/use-cases/admin-delete-coupon.usecase";

// Re-export Infrastructure & Presentation layers
export * from "./infrastructure/repositories/prisma-teacher-coupon.repository";
export * from "./presentation/controllers";
export * from "./presentation/routes/teacher-coupon.routes";
export * from "./presentation/schemas/teacher-coupon.schema";
