import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteApi } from "../api/note.api";
import { noteKeys } from "../api/note.keys";
import type {
  CreateNotePayload,
  UpdateNotePayload,
  NoteFilterParams,
} from "../types/note.types";
import { toast } from "@/lib/toast";

export function useLectureNotes(lectureId: string | undefined | null) {
  return useQuery({
    queryKey: noteKeys.byLecture(lectureId || ""),
    queryFn: () => noteApi.getNotesByLecture(lectureId!),
    enabled: Boolean(lectureId),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

export function useCourseNotes(courseId: string | undefined | null) {
  return useQuery({
    queryKey: noteKeys.byCourse(courseId || ""),
    queryFn: () => noteApi.getNotesByCourse(courseId!),
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useNoteDetail(id: string | undefined | null) {
  return useQuery({
    queryKey: noteKeys.detail(id || ""),
    queryFn: () => noteApi.getNoteDetail(id!),
    enabled: Boolean(id),
  });
}

export function useAdminNotes(params?: NoteFilterParams) {
  return useQuery({
    queryKey: noteKeys.adminList(params),
    queryFn: () => noteApi.adminListNotes(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotePayload) => noteApi.createNote(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byLecture(data.lectureId) });
      queryClient.invalidateQueries({ queryKey: noteKeys.byCourse(data.courseId) });
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      toast.success("Note uploaded successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create note");
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNotePayload }) =>
      noteApi.updateNote(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byLecture(data.lectureId) });
      queryClient.invalidateQueries({ queryKey: noteKeys.byCourse(data.courseId) });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      toast.success("Note updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update note");
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => noteApi.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      toast.success("Note deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete note");
    },
  });
}
