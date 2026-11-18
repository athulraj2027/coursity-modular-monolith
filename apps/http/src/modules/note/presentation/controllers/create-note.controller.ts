import { Request, Response, NextFunction } from "express";
import { CreateNoteUseCase } from "../../application/use-cases/create-note.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";
import { createNoteBodySchema } from "../schemas/note.schema";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export class CreateNoteController {
  constructor(
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");

      const validatedData = createNoteBodySchema.parse(req.body);

      let teacherProfileId: string | null = null;
      if (req.user.role === "TEACHER") {
        teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      }

      const result = await this.createNoteUseCase.execute({
        userId: req.user.userId,
        userRole: req.user.role,
        data: validatedData,
        teacherProfileId,
      });

      return ApiResponse.created(res, result, "Note uploaded and created successfully");
    } catch (error) {
      next(error);
    }
  };
}
