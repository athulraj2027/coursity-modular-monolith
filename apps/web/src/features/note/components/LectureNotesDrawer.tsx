import React, { useState } from "react";
import {
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { ModalTemplate as Modal } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { NoteCard } from "./NoteCard";
import { NoteUploadModal } from "./NoteUploadModal";
import { useLectureNotes, useDeleteNote } from "../hooks/useNotes";
import type { Note } from "../types/note.types";

interface LectureNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle?: string;
  courseTitle?: string;
  canManage?: boolean;
}

export const LectureNotesDrawer: React.FC<LectureNotesDrawerProps> = ({
  isOpen,
  onClose,
  lectureId,
  lectureTitle,
  courseTitle,
  canManage = false,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const { data: notes = [], isLoading, refetch } = useLectureNotes(lectureId);
  const deleteMutation = useDeleteNote();

  const handleDeleteConfirm = () => {
    if (!noteToDelete) return;
    deleteMutation.mutate(noteToDelete.id, {
      onSuccess: () => {
        setNoteToDelete(null);
        refetch();
      },
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Lecture Notes & Materials"
        description={
          lectureTitle
            ? `Course materials and resources attached to "${lectureTitle}"`
            : "Review and download learning materials attached to this lecture"
        }
        maxWidth="lg"
      >
        <div className="space-y-4 pt-1">
          {/* Header Action bar */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {notes.length} {notes.length === 1 ? "Document" : "Documents"} Attached
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-7 w-7 p-0 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                title="Refresh notes"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {canManage && (
              <Button
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="text-xs h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-xs cursor-pointer font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Note
              </Button>
            )}
          </div>

          {/* Body Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#F42A18]" />
              <p className="text-xs text-neutral-500">Loading lecture materials...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 bg-neutral-50/50 dark:bg-neutral-900/30">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  No notes attached yet
                </h4>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  {canManage
                    ? "Upload slide decks, PDFs, or worksheets to share with your students."
                    : "The instructor has not uploaded any additional notes for this class yet."}
                </p>
              </div>
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-xs h-8 rounded-xl cursor-pointer mt-1"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Upload First Document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  canManage={canManage}
                  onDelete={(n) => setNoteToDelete(n)}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 rounded-xl cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Note Modal */}
      {isUploadModalOpen && (
        <NoteUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            refetch();
          }}
          lectureId={lectureId}
          lectureTitle={lectureTitle}
          courseTitle={courseTitle}
        />
      )}

      {/* Delete Confirmation Modal */}
      {Boolean(noteToDelete)}
      <ConfirmationModal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lecture Note"
        description={`Are you sure you want to delete "${noteToDelete?.name}"? This will remove the document from the lecture.`}
        confirmText="Delete Note"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
