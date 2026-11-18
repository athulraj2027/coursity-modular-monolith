import { IUserQueryRepository, IUserAdminRepository } from "../../domain/repositories/user.repository";
import { User, ApprovalStatus } from "../../domain/entities/user.entity";
import { IEmailService } from "@/infrastructure/email";
import {
    UserNotFoundError,
    NonTeacherApprovalError,
} from "../../domain/errors/user.errors";
import {
    TeacherApprovalPolicy,
    ALLOWED_APPROVAL_TRANSITIONS,
} from "../../domain/policies/teacher-approval.policy";

export { ALLOWED_APPROVAL_TRANSITIONS } from "../../domain/policies/teacher-approval.policy";

export interface ApproveTeacherDTO {
    userId: string;
    approvalStatus?: ApprovalStatus;
    isApproved?: boolean;
    rejectionReason?: string | null;
}

export class ApproveTeacher {
    constructor(
        private readonly userRepository: IUserQueryRepository & IUserAdminRepository,
        private readonly emailService?: IEmailService
    ) { }

    async execute(
        userIdOrDTO: string | ApproveTeacherDTO,
        legacyIsApproved?: boolean
    ): Promise<{ user: Omit<User, "password">; message: string }> {
        let userId: string;
        let approvalStatus: ApprovalStatus | undefined;
        let isApproved: boolean | undefined;
        let rejectionReason: string | null | undefined;

        if (typeof userIdOrDTO === "string") {
            userId = userIdOrDTO;
            isApproved = legacyIsApproved !== undefined ? legacyIsApproved : true;
            approvalStatus = isApproved ? "VERIFIED" : "REVOKED";
        } else {
            userId = userIdOrDTO.userId;
            approvalStatus = userIdOrDTO.approvalStatus;
            isApproved = userIdOrDTO.isApproved;
            rejectionReason = userIdOrDTO.rejectionReason;

            if (!approvalStatus && isApproved !== undefined) {
                approvalStatus = isApproved ? "VERIFIED" : "REVOKED";
            }
        }

        const effectiveStatus = approvalStatus || "VERIFIED";

        // Validate feedback / suggestions when status is REVOKED or REDO
        TeacherApprovalPolicy.validateFeedback(effectiveStatus, rejectionReason);

        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new UserNotFoundError("User not found");
        }

        if (existingUser.role !== "TEACHER") {
            throw new NonTeacherApprovalError("Only instructor accounts can have verification status updated");
        }

        const currentStatus: ApprovalStatus =
            existingUser.profile?.teacherProfile?.approvalStatus ||
            (existingUser.profile?.teacherProfile?.isApproved ? "VERIFIED" : "PENDING");

        TeacherApprovalPolicy.validateTransition(currentStatus, effectiveStatus);

        const updatedUser = await this.userRepository.updateTeacherApproval(userId, {
            approvalStatus: effectiveStatus,
            rejectionReason: rejectionReason ? rejectionReason.trim() : null,
            isApproved: effectiveStatus === "VERIFIED",
        });

        // Asynchronously notify instructor via email queue
        if (this.emailService && updatedUser.email) {
            await this.emailService
                .sendTeacherStatusUpdate(
                    updatedUser.email,
                    updatedUser.name,
                    effectiveStatus as any,
                    rejectionReason ? rejectionReason.trim() : null
                )
                .catch((err) => {
                    console.error(`⚠️ Failed to enqueue teacher status update email for ${updatedUser.email}:`, err?.message || err);
                });
        }

        const { password, ...safeUser } = updatedUser;
        const actionMessage = TeacherApprovalPolicy.formatActionMessage(effectiveStatus);

        return {
            user: safeUser,
            message: actionMessage,
        };
    }
}
