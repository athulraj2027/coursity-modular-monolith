export interface ICourseNotificationService {
  sendCourseDelistedNotification(
    email: string,
    teacherName: string,
    courseTitle: string,
    reason: string,
    courseSlug: string
  ): Promise<void>;

  sendCourseFrozenNotification(
    email: string,
    teacherName: string,
    courseTitle: string,
    reason: string,
    courseSlug: string
  ): Promise<void>;
}

