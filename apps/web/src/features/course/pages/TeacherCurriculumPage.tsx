import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Radio,
  Paperclip,
  Clock,
  Eye,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { ModuleFormModal } from "../components/ModuleFormModal";
import { LessonFormModal } from "../components/LessonFormModal";
import {
  useTeacherCourse,
  useTeacherDeleteModule,
  useTeacherDeleteLesson,
} from "../hooks/useCourses";
import type { CourseModule, CourseLesson } from "../types/course.types";

export const TeacherCurriculumPage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading, refetch } = useTeacherCourse(courseId || "");
  const deleteModuleMutation = useTeacherDeleteModule();
  const deleteLessonMutation = useTeacherDeleteLesson();

  // Collapsed modules state
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // Module modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<CourseModule | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<CourseModule | null>(null);

  // Lesson modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>("");
  const [lessonToEdit, setLessonToEdit] = useState<CourseLesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<CourseLesson | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-neutral-500">Course not found or permission denied.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/teachers/courses")}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const toggleCollapse = (modId: string) => {
    setCollapsedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const modules = course.modules || [];
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/teachers/courses")}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Courses
          </button>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Live on Platform
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {course.title}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
              <span>Curriculum & Syllabus Studio • {course.category?.name || "General"}</span>
              {course.startingDate && (
                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <Calendar className="w-3 h-3" />
                  Starts{" "}
                  {new Date(course.startingDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
            <span>{modules.length} Modules</span>
            <span>•</span>
            <span>{totalLessons} Lessons</span>
            <span>•</span>
            <span className="font-mono">{Math.round(course.totalDurationSeconds / 60)} Mins</span>
          </div>
        </div>
      </div>

      {/* Curriculum Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Course Curriculum
          </h2>
          <p className="text-xs text-neutral-500">
            Organize lectures into structured chapters and configure video, articles, and previews.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setModuleToEdit(null);
            setIsModuleModalOpen(true);
          }}
          className="text-xs h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Module
        </Button>
      </div>

      {/* Modules & Lessons List */}
      {modules.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3 bg-neutral-50/50 dark:bg-neutral-900/20">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              No Curriculum Modules Yet
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              Click &quot;Add Module&quot; to create your first course chapter and begin adding video lectures and articles.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setModuleToEdit(null);
              setIsModuleModalOpen(true);
            }}
            className="text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add First Module
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, modIdx) => {
            const isCollapsed = Boolean(collapsedModules[mod.id]);
            const lessons = mod.lessons || [];

            return (
              <div
                key={mod.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm"
              >
                {/* Module Header */}
                <div className="p-4 bg-neutral-50/80 dark:bg-neutral-950/50 flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCollapse(mod.id)}
                      className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                          Module {modIdx + 1}: {mod.title}
                        </span>
                        {!mod.isPublished && (
                          <Badge variant="outline" className="text-[10px] text-neutral-400">
                            Unpublished
                          </Badge>
                        )}
                      </div>
                      {mod.description && (
                        <p className="text-[11px] text-neutral-500 line-clamp-1">{mod.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetModuleId(mod.id);
                        setLessonToEdit(null);
                        setIsLessonModalOpen(true);
                      }}
                      className="text-xs h-7 px-2 rounded-lg border-blue-500/20 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Lesson
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModuleToEdit(mod);
                        setIsModuleModalOpen(true);
                      }}
                      className="h-7 w-7 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setModuleToDelete(mod)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Lessons inside Module */}
                {!isCollapsed && (
                  <div className="p-3 space-y-2">
                    {lessons.length === 0 ? (
                      <div className="text-center py-6 text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                        No lessons in this module. Click &quot;Add Lesson&quot; above to add content.
                      </div>
                    ) : (
                      lessons.map((les, lesIdx) => (
                        <div
                          key={les.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                              {les.lessonType === "VIDEO" && <Video className="w-4 h-4 text-blue-500" />}
                              {les.lessonType === "ARTICLE" && <FileText className="w-4 h-4 text-emerald-500" />}
                              {les.lessonType === "QUIZ" && <HelpCircle className="w-4 h-4 text-purple-500" />}
                              {les.lessonType === "LIVE_CLASS" && <Radio className="w-4 h-4 text-red-500" />}
                              {les.lessonType === "ATTACHMENT" && <Paperclip className="w-4 h-4 text-amber-500" />}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                  {lesIdx + 1}. {les.title}
                                </span>
                                {les.isFreePreview && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] px-1.5 py-0 flex items-center gap-1"
                                  >
                                    <Eye className="w-2.5 h-2.5" />
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.round(les.durationSeconds / 60)} min
                                </span>
                                {les.videoUrl && <span className="truncate max-w-[200px] font-mono">{les.videoUrl}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTargetModuleId(mod.id);
                                setLessonToEdit(les);
                                setIsLessonModalOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLessonToDelete(les)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Module Modal */}
      <ModuleFormModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        courseId={course.id}
        initialModule={moduleToEdit}
        onSuccess={() => refetch()}
      />

      {/* Lesson Modal */}
      <LessonFormModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        moduleId={targetModuleId}
        initialLesson={lessonToEdit}
        onSuccess={() => refetch()}
      />

      {/* Delete Module Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(moduleToDelete)}
        onClose={() => setModuleToDelete(null)}
        actionType="delete"
        title={`Delete Module "${moduleToDelete?.title}"?`}
        description="All lessons and attached videos inside this module will be permanently removed."
        confirmText="Delete Module"
        variant="danger"
        isLoading={deleteModuleMutation.isPending}
        onConfirm={async () => {
          if (moduleToDelete) {
            await deleteModuleMutation.mutateAsync(moduleToDelete.id);
            setModuleToDelete(null);
            refetch();
          }
        }}
      />

      {/* Delete Lesson Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(lessonToDelete)}
        onClose={() => setLessonToDelete(null)}
        actionType="delete"
        title={`Delete Lesson "${lessonToDelete?.title}"?`}
        description="This lecture and its video attachments will be removed from the curriculum."
        confirmText="Delete Lesson"
        variant="danger"
        isLoading={deleteLessonMutation.isPending}
        onConfirm={async () => {
          if (lessonToDelete) {
            await deleteLessonMutation.mutateAsync(lessonToDelete.id);
            setLessonToDelete(null);
            refetch();
          }
        }}
      />
    </div>
  );
};

export default TeacherCurriculumPage;
