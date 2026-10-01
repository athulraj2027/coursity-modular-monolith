import type { NoteFilterParams } from "../types/note.types";

export const noteKeys = {
  all: ["notes"] as const,
  byLecture: (lectureId: string) => [...noteKeys.all, "lecture", lectureId] as const,
  byCourse: (courseId: string) => [...noteKeys.all, "course", courseId] as const,
  detail: (id: string) => [...noteKeys.all, "detail", id] as const,
  adminList: (params?: NoteFilterParams) => [...noteKeys.all, "admin", params] as const,
};
