import type { HomeworkFilterParams } from "../types/homework.types";

export const homeworkKeys = {
  all: ["homework"] as const,
  byLecture: (lectureId: string) => [...homeworkKeys.all, "lecture", lectureId] as const,
  byCourse: (courseId: string) => [...homeworkKeys.all, "course", courseId] as const,
  detail: (id: string) => [...homeworkKeys.all, "detail", id] as const,
  mySubmission: (homeworkId: string) => [...homeworkKeys.all, "my-submission", homeworkId] as const,
  submissions: (homeworkId: string) => [...homeworkKeys.all, "submissions", homeworkId] as const,
  adminList: (params?: HomeworkFilterParams) => [...homeworkKeys.all, "admin", params] as const,
};
