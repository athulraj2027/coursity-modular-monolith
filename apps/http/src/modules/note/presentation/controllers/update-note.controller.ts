import { Request, Response, NextFunction } from "express";
import { UpdateNoteUseCase } from "../../application/use-cases/update-note.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";
import { updateNoteBodySchema } from "../schemas/note.schema";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export class UpdateNoteController {
  constructor(
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");

      const noteId = req.params.id as string;
      const validatedData = updateNoteBodySchema.parse(req.body);

      let teacherProfileId: string | null = null;
      if (req.user.role === "TEACHER") {
        teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      }

      const result = await this.updateNoteUseCase.execute({
        noteId,
        userId: req.user.userId,
        userRole: req.user.role,
        data: validatedData,
        teacherProfileId,
      });

      return ApiResponse.success(res, result, "Note updated successfully");
    } catch (error) {
      next(error);
    }
  };
}
