import { UserRole } from "../entities/user.entity";
import { AdminBlockNotAllowedError } from "../errors/user.errors";

export class UserBlockPolicy {
  /**
   * Validates that an administrator cannot be blocked.
   */
  static validateBlockAllowed(userRole: UserRole, targetStatus: boolean): void {
    if (userRole === "ADMIN" && targetStatus) {
      throw new AdminBlockNotAllowedError("Cannot block an administrator account");
    }
  }

  /**
   * Determines target block status: uses explicit value if given, otherwise toggles current status.
   */
  static determineTargetStatus(currentIsBlocked: boolean, requestedIsBlocked?: boolean): boolean {
    return requestedIsBlocked !== undefined ? requestedIsBlocked : !currentIsBlocked;
  }

  /**
   * Formats confirmation message.
   */
  static formatBlockMessage(targetStatus: boolean): string {
    const actionText = targetStatus ? "blocked" : "unblocked";
    return `User has been ${actionText} successfully`;
  }
}
