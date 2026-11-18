export class NoteAccessPolicy {
  /**
   * Checks if user has permission to upload notes
   */
  static canUploadNote(userRole: string): boolean {
    return userRole === "TEACHER" || userRole === "ADMIN" || userRole === "SUPERADMIN";
  }

  /**
   * Checks if teacher owns the course/lecture to add a note
   */
  static isTeacherAuthorizedForLecture(
    userTeacherProfileId: string | null,
    lectureTeacherProfileId: string
  ): boolean {
    if (!userTeacherProfileId) return false;
    return userTeacherProfileId === lectureTeacherProfileId;
  }

  /**
   * Checks if user can modify or delete a note
   */
  static canModifyNote(
    userRole: string,
    userTeacherProfileId: string | null,
    noteTeacherProfileId: string
  ): boolean {
    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      return true;
    }
    if (userRole === "TEACHER") {
      return Boolean(userTeacherProfileId && userTeacherProfileId === noteTeacherProfileId);
    }
    return false;
  }

  /**
   * Checks if user has permission to read note detail
   */
  static canReadNote(params: {
    userRole: string;
    isAuthor: boolean;
    isEnrolled: boolean;
  }): boolean {
    const { userRole, isAuthor, isEnrolled } = params;
    if (userRole === "ADMIN" || userRole === "SUPERADMIN") return true;
    if (isAuthor) return true;
    return isEnrolled;
  }
}
