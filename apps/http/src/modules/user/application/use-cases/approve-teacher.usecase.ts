import { NotFoundError, BadRequestError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";

export class ApproveTeacher {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string, isApproved: boolean = true): Promise<{ user: Omit<User, "password">; message: string }> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        if (existingUser.role !== "TEACHER") {
            throw new BadRequestError("Only instructor accounts can have verification status updated");
        }

        const updatedUser = await this.userRepository.updateTeacherApproval(userId, isApproved);
        const { password, ...safeUser } = updatedUser;

        const actionText = isApproved ? "verified and approved" : "marked unverified";

        return {
            user: safeUser,
            message: `Instructor has been ${actionText} successfully`,
        };
    }
}
