import React, { useState } from "react";
import {
  FileCheck,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { ModalTemplate as Modal } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { HomeworkCard } from "./HomeworkCard";
import { CreateHomeworkModal } from "./CreateHomeworkModal";
import { StudentSubmitHomeworkModal } from "./StudentSubmitHomeworkModal";
import { TeacherSubmissionsModal } from "./TeacherSubmissionsModal";
import { useLectureHomework, useDeleteHomework } from "../hooks/useHomework";
import type { Homework } from "../types/homework.types";

interface LectureHomeworkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle?: string;
  courseTitle?: string;
  userRole?: string; // "STUDENT" | "TEACHER" | "ADMIN" | "SUPERADMIN"
  canManage?: boolean; // True if teacher or admin
}

export const LectureHomeworkDrawer: React.FC<LectureHomeworkDrawerProps> = ({
  isOpen,
  onClose,
  lectureId,
  lectureTitle,
  courseTitle,
  userRole = "STUDENT",
  canManage = false,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [homeworkToEdit, setHomeworkToEdit] = useState<Homework | null>(null);
  const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null);
  const [homeworkToSubmit, setHomeworkToSubmit] = useState<Homework | null>(null);
  const [homeworkForSubmissions, setHomeworkForSubmissions] = useState<Homework | null>(null);

  const { data: homeworkList = [], isLoading, refetch } = useLectureHomework(lectureId);
  const deleteMutation = useDeleteHomework();

  const handleDeleteConfirm = () => {
    if (!homeworkToDelete) return;
    deleteMutation.mutate(homeworkToDelete.id, {
      onSuccess: () => {
        setHomeworkToDelete(null);
        refetch();
      },
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Homework & Assignments"
        description={
          lectureTitle
            ? `Tasks, exercises, and submissions for "${lectureTitle}"`
            : "Review and complete homework tasks assigned for this lecture"
        }
        maxWidth="xl"
      >
        <div className="space-y-4 pt-1">
          {/* Header Action bar */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                {homeworkList.length} {homeworkList.length === 1 ? "Assignment" : "Assignments"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                title="Refresh assignments"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {canManage && (
              <Button
                size="sm"
                onClick={() => {
                  setHomeworkToEdit(null);
                  setIsCreateModalOpen(true);
                }}
                className="text-xs h-8 rounded-lg bg-[#F42A18] hover:bg-[#d92212] text-white shadow-xs cursor-pointer font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Assign Homework
              </Button>
            )}
          </div>

          {/* Body Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#F42A18]" />
              <p className="text-xs text-slate-400">Loading homework assignments...</p>
            </div>
          ) : homeworkList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl p-6 bg-slate-900/30">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">
                  No homework assigned yet
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {canManage
                    ? "Create tasks, add problem sets, or provide starter repositories for students."
                    : "There are no homework tasks assigned for this lecture yet."}
                </p>
              </div>
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setHomeworkToEdit(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="text-xs h-8 rounded-lg cursor-pointer mt-1 border-slate-700 hover:bg-slate-800 text-slate-200"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Assign First Homework
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {homeworkList.map((hw) => (
                <HomeworkCard
                  key={hw.id}
                  homework={hw}
                  userRole={userRole}
                  isInstructor={canManage}
                  onEdit={(item) => {
                    setHomeworkToEdit(item);
                    setIsCreateModalOpen(true);
                  }}
                  onDelete={(item) => setHomeworkToDelete(item)}
                  onSubmitHomework={(item) => setHomeworkToSubmit(item)}
                  onViewSubmissions={(item) => setHomeworkForSubmissions(item)}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 rounded-lg border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create / Edit Homework Modal */}
      {isCreateModalOpen && (
        <CreateHomeworkModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setHomeworkToEdit(null);
            refetch();
          }}
          lectureId={lectureId}
          lectureTitle={lectureTitle}
          courseTitle={courseTitle}
          homeworkToEdit={homeworkToEdit}
        />
      )}

      {/* Student Submit Modal */}
      {homeworkToSubmit && (
        <StudentSubmitHomeworkModal
          isOpen={Boolean(homeworkToSubmit)}
          onClose={() => {
            setHomeworkToSubmit(null);
            refetch();
          }}
          homework={homeworkToSubmit}
          existingSubmission={homeworkToSubmit.mySubmission}
        />
      )}

      {/* Teacher Submissions View & Grading Modal */}
      {homeworkForSubmissions && (
        <TeacherSubmissionsModal
          isOpen={Boolean(homeworkForSubmissions)}
          onClose={() => {
            setHomeworkForSubmissions(null);
            refetch();
          }}
          homework={homeworkForSubmissions}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(homeworkToDelete)}
        onClose={() => setHomeworkToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Homework Assignment"
        description={`Are you sure you want to delete "${homeworkToDelete?.title}"? All associated submissions will also be deleted.`}
        confirmText="Delete Assignment"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
