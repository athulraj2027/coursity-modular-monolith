import { Request, Response, NextFunction } from "express";
import { CreateCourseCheckoutOrderUseCase } from "../../application/use-cases/create-course-order.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class CreateCourseOrderController {
  constructor(private readonly createOrderUseCase: CreateCourseCheckoutOrderUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const result = await this.createOrderUseCase.execute(studentId, req.body);
      return ApiResponse.success(res, result, "Checkout order created.");
    } catch (error) {
      next(error);
    }
  };
}
