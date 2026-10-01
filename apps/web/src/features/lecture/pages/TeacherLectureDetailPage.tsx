import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { LectureFormModal } from "../components/LectureFormModal";
import { LectureStatusBadge } from "../components/LectureStatusBadge";
import {
  useTeacherLectureDetail,
  useTeacherDeleteLecture,
} from "../hooks/useLectures";
import { useLectureNotes, useDeleteNote, NoteCard, NoteUploadModal } from "@/features/note";
import { Plus, FileText } from "lucide-react";

export const TeacherLectureDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lecture, isLoading, isError, refetch } = useTeacherLectureDetail(id || "");
  const deleteMutation = useTeacherDeleteLecture();

  // Notes state & hooks
  const { data: lectureNotes = [], isLoading: isNotesLoading, refetch: refetchNotes } = useLectureNotes(id || "");
  const deleteNoteMutation = useDeleteNote();
  const [isNoteUploadOpen, setIsNoteUploadOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<any | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (isError || !lecture) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
          Lecture Not Found
        </h2>
        <p className="text-xs text-neutral-500">
          The requested live lecture does not exist or you do not have permission to view it.
        </p>
        <Button
          onClick={() => navigate("/teachers/lectures")}
          size="sm"
          className="rounded-xl text-xs"
        >
          Back to Lectures
        </Button>
      </div>
    );
  }

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(lecture.id, {
      onSuccess: () => navigate("/teachers/lectures"),
    });
  };

  const scheduledDate = lecture.scheduledAt ? new Date(lecture.scheduledAt) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Top Header Banner */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/teachers/lectures")}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Lectures Studio
          </button>

          <LectureStatusBadge status={lecture.liveStatus} isLiveNow={lecture.isLiveNow} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {lecture.title}
            </h1>
            <p className="text-xs text-neutral-500 flex items-center gap-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Course: {lecture.courseTitle}
              </span>
              <span>•</span>
              <span>Module: {lecture.moduleTitle || "General"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-xl text-xs gap-1.5 h-9 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="rounded-xl text-xs text-red-600 hover:bg-red-500/10 border-red-500/20 gap-1.5 h-9 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Schedule & Description (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          {/* Lecture Schedule Card */}
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Live Session Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Date & Time
                </span>
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {scheduledDate
                    ? scheduledDate.toLocaleString(undefined, {
                        dateStyle: "full",
                        timeStyle: "short",
                      })
                    : "Not scheduled yet"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Class Duration
                </span>
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {Math.round(lecture.durationSeconds / 60)} Minutes
                </p>
              </div>
            </div>
          </div>

          {/* Lecture Description / Agenda Card */}
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Lecture Agenda & Curriculum Overview
            </h3>
            {lecture.description ? (
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {lecture.description}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                No description has been added for this live class yet.
              </p>
            )}
          </div>

          {/* Lecture Notes & Materials Section */}
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F42A18]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Lecture Notes & Handouts ({lectureNotes.length})
                </h3>
              </div>

              <Button
                size="sm"
                onClick={() => setIsNoteUploadOpen(true)}
                className="text-xs h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Document
              </Button>
            </div>

            {isNotesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              </div>
            ) : lectureNotes.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-2">
                <p className="text-xs text-neutral-500">
                  No notes or slide decks uploaded for this lecture yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNoteUploadOpen(true)}
                  className="text-xs rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Upload Note PDF / PPT
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lectureNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    canManage={true}
                    onDelete={(n) => setNoteToDelete(n)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Course Context & Info (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          {/* Associated Course Card */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Course Details
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center font-bold text-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {lecture.courseTitle}
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Module: {lecture.moduleTitle || "General"}
                    </span>
                  </div>
                </div>

                {lecture.courseId && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full text-xs rounded-xl h-8 mt-2 cursor-pointer"
                  >
                    <Link to={`/teachers/courses/${lecture.courseId}/curriculum`}>
                      Open Course Curriculum
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <LectureFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialLecture={lecture}
        defaultCourseId={lecture.courseId}
        defaultCourseTitle={lecture.courseTitle}
        onSuccess={() => refetch()}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Live Lecture"
        description={`Are you sure you want to delete "${lecture.title}"?`}
        confirmText="Delete Lecture"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      {/* Note Upload Modal */}
      {isNoteUploadOpen && (
        <NoteUploadModal
          isOpen={isNoteUploadOpen}
          onClose={() => {
            setIsNoteUploadOpen(false);
            refetchNotes();
          }}
          lectureId={lecture.id}
          lectureTitle={lecture.title}
          courseTitle={lecture.courseTitle}
        />
      )}

      {/* Note Delete Confirmation Modal */}
      {Boolean(noteToDelete)}
      <ConfirmationModal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNoteMutation.mutate(noteToDelete.id, {
              onSuccess: () => {
                setNoteToDelete(null);
                refetchNotes();
              },
            });
          }
        }}
        title="Delete Lecture Note"
        description={`Are you sure you want to delete "${noteToDelete?.name}"?`}
        confirmText="Delete Note"
        variant="destructive"
        isLoading={deleteNoteMutation.isPending}
      />
    </div>
  );
};
