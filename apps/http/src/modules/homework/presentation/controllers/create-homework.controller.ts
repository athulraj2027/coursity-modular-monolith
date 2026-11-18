import { Request, Response, NextFunction } from "express";
import { CreateHomeworkUseCase } from "../../application/use-cases/create-homework.usecase";
import { createHomeworkBodySchema } from "../schemas/homework.schema";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class CreateHomeworkController {
  constructor(private readonly createHomeworkUseCase: CreateHomeworkUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const validatedBody = createHomeworkBodySchema.parse(req.body);

      const result = await this.createHomeworkUseCase.execute({
        userId: req.user.userId,
        userRole: req.user.role,
        data: validatedBody,
      });
      return ApiResponse.created(res, result, "Homework assignment created successfully");
    } catch (error) {
      next(error);
    }
  };
}
