import { Request, Response, NextFunction } from "express";
import { DeleteNoteUseCase } from "../../application/use-cases/delete-note.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export class DeleteNoteController {
  constructor(
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");

      const noteId = req.params.id as string;

      let teacherProfileId: string | null = null;
      if (req.user.role === "TEACHER") {
        teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      }

      await this.deleteNoteUseCase.execute({
        noteId,
        userId: req.user.userId,
        userRole: req.user.role,
        teacherProfileId,
      });

      return ApiResponse.success(res, { success: true }, "Note deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
