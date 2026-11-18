import type { UserRole } from "@/modules/user/domain/entities/user.entity";
import { ForbiddenError, BadRequestError } from "@/app/errors";

export class PortalAccessPolicy {
    private static readonly ROLE_LABELS: Record<UserRole, string> = {
        ADMIN: "an Administrator",
        TEACHER: "a Teacher",
        STUDENT: "a Student",
    };

    private static readonly PORTAL_NAMES: Record<UserRole, string> = {
        ADMIN: "Admin",
        TEACHER: "Teacher",
        STUDENT: "Student",
    };

    /**
     * Enforces that the user's registered role matches the portal role requested.
     */
    static assertPortalRoleAccess(
        userRole: UserRole,
        portalRole?: UserRole,
        action: "signin" | "reset-password" = "signin"
    ): void {
        if (!portalRole || userRole === portalRole) {
            return;
        }

        const userLabel = this.ROLE_LABELS[userRole] || `a ${userRole}`;
        const portalName = this.PORTAL_NAMES[userRole] || userRole;

        if (action === "reset-password") {
            throw new BadRequestError(
                `This account is registered as ${userLabel}. Please use the ${portalName} portal to reset your password.`
            );
        }

        throw new ForbiddenError(
            `This account is registered as ${userLabel}. Please sign in through the ${portalName} portal.`
        );
    }
}

