import { NotFoundError, BadRequestError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User, ApprovalStatus } from "../../domain/entities/user.entity";

export interface ApproveTeacherDTO {
    userId: string;
    approvalStatus?: ApprovalStatus;
    isApproved?: boolean;
    rejectionReason?: string | null;
}

export const ALLOWED_APPROVAL_TRANSITIONS: Record<ApprovalStatus, ApprovalStatus[]> = {
    PENDING: [],
    IN_PROGRESS: ["VERIFIED", "REDO"],
    VERIFIED: ["REVOKED"],
    REVOKED: ["PENDING"],
    REDO: [],
};

export class ApproveTeacher {
    constructor(private readonly userRepository: UserRepository) { }

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
        if (effectiveStatus === "REVOKED" || effectiveStatus === "REDO") {
            if (!rejectionReason || rejectionReason.trim().length < 5) {
                throw new BadRequestError(
                    `Please provide a suggestion or feedback (at least 5 characters) explaining what the instructor should improve when setting status to ${effectiveStatus.toLowerCase()}`
                );
            }
        }

        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        if (existingUser.role !== "TEACHER") {
            throw new BadRequestError("Only instructor accounts can have verification status updated");
        }

        const currentStatus: ApprovalStatus =
            existingUser.profile?.teacherProfile?.approvalStatus ||
            (existingUser.profile?.teacherProfile?.isApproved ? "VERIFIED" : "PENDING");

        const allowedTransitions = ALLOWED_APPROVAL_TRANSITIONS[currentStatus] || [];
        if (!allowedTransitions.includes(effectiveStatus)) {
            if (currentStatus === "PENDING") {
                throw new BadRequestError(
                    "Instructor application is currently in draft (Pending). The instructor must submit their application for verification before administrative evaluation."
                );
            }
            if (currentStatus === "REDO") {
                throw new BadRequestError(
                    "Instructor application is currently marked for revision (Redo). The instructor must revise their profile and re-submit for verification before administrative evaluation."
                );
            }
            throw new BadRequestError(
                `Invalid status transition from ${currentStatus} to ${effectiveStatus}. Allowed transition(s) from ${currentStatus}: ${allowedTransitions.join(", ")}.`
            );
        }

        const updatedUser = await this.userRepository.updateTeacherApproval(userId, {
            approvalStatus: effectiveStatus,
            rejectionReason: rejectionReason ? rejectionReason.trim() : null,
            isApproved: effectiveStatus === "VERIFIED",
        });

        const { password, ...safeUser } = updatedUser;

        let actionMessage: string;
        switch (effectiveStatus) {
            case "VERIFIED":
                actionMessage = "Instructor has been verified and approved successfully";
                break;
            case "IN_PROGRESS":
                actionMessage = "Instructor application marked as in progress";
                break;
            case "REVOKED":
                actionMessage = "Instructor verification has been revoked with feedback";
                break;
            case "REDO":
                actionMessage = "Instructor application marked for revision (redo) with feedback";
                break;
            case "PENDING":
            default:
                actionMessage = "Instructor application status reset to pending";
                break;
        }

        return {
            user: safeUser,
            message: actionMessage,
        };
    }
}

