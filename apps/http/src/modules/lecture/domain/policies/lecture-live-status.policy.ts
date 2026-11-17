import { LiveClassStatus } from "../entities/lecture.entity";

export class LectureLiveStatusPolicy {
  /**
   * Determines if transition between two live class states is permissible
   */
  static canTransition(current: LiveClassStatus, next: LiveClassStatus): boolean {
    if (current === next) return true;

    switch (current) {
      case "SCHEDULED":
        return next === "LIVE_NOW" || next === "CANCELLED" || next === "COMPLETED";
      case "LIVE_NOW":
        return next === "COMPLETED" || next === "CANCELLED";
      case "COMPLETED":
        return false; // Terminal state
      case "CANCELLED":
        return false; // Terminal state
      default:
        return false;
    }
  }

  /**
   * Determines if a lecture is currently broadcasting live
   */
  static isBroadcasting(status: LiveClassStatus, isLiveNow: boolean): boolean {
    return status === "LIVE_NOW" || isLiveNow;
  }
}
