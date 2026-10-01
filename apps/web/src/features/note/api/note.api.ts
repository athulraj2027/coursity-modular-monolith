import { apiClient } from "@/lib/api-client";
import type {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
  NoteFilterParams,
  NotesListResponse,
} from "../types/note.types";

export const noteApi = {
  createNote: async (payload: CreateNotePayload): Promise<Note> => {
    const res = await apiClient<{ success: boolean; data: Note; message?: string }>(
      "/notes",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  getNotesByLecture: async (lectureId: string): Promise<Note[]> => {
    const res = await apiClient<{ success: boolean; data: Note[] }>(
      `/notes/lecture/${lectureId}`,
      { method: "GET" }
    );
    return res.data;
  },

  getNotesByCourse: async (courseId: string): Promise<Note[]> => {
    const res = await apiClient<{ success: boolean; data: Note[] }>(
      `/notes/course/${courseId}`,
      { method: "GET" }
    );
    return res.data;
  },

  getNoteDetail: async (id: string): Promise<Note> => {
    const res = await apiClient<{ success: boolean; data: Note }>(
      `/notes/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  updateNote: async (id: string, payload: UpdateNotePayload): Promise<Note> => {
    const res = await apiClient<{ success: boolean; data: Note; message?: string }>(
      `/notes/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  deleteNote: async (id: string): Promise<boolean> => {
    await apiClient<{ success: boolean; message?: string }>(
      `/notes/${id}`,
      { method: "DELETE" }
    );
    return true;
  },

  adminListNotes: async (params?: NoteFilterParams): Promise<NotesListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.lectureId) query.append("lectureId", params.lectureId);
    if (params?.teacherProfileId) query.append("teacherProfileId", params.teacherProfileId);
    if (params?.fileExtension) query.append("fileExtension", params.fileExtension);
    if (params?.sort) query.append("sort", params.sort);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: NotesListResponse }>(
      `/notes/admin/all${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.data;
  },
};
