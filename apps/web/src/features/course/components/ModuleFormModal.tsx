import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { useTeacherCreateModule, useTeacherUpdateModule } from "../hooks/useCourses";
import type { CourseModule, CreateModulePayload } from "../types/course.types";

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  initialModule?: CourseModule | null;
  onSuccess?: () => void;
}

export const ModuleFormModal: React.FC<ModuleFormModalProps> = ({
  isOpen,
  onClose,
  courseId,
  initialModule,
  onSuccess,
}) => {
  const isEditing = Boolean(initialModule?.id);
  const createModuleMutation = useTeacherCreateModule();
  const updateModuleMutation = useTeacherUpdateModule();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number | string>(0);
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (initialModule) {
      setTitle(initialModule.title || "");
      setDescription(initialModule.description || "");
      setSortOrder(initialModule.sortOrder ?? 0);
      setIsPublished(initialModule.isPublished ?? true);
    } else {
      setTitle("");
      setDescription("");
      setSortOrder(0);
      setIsPublished(true);
    }
  }, [initialModule, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: CreateModulePayload = {
      title: title.trim(),
      description: description.trim() || null as any,
      sortOrder: Number(sortOrder) || 0,
      isPublished,
    };

    if (isEditing && initialModule?.id) {
      updateModuleMutation.mutate(
        { moduleId: initialModule.id, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    } else {
      createModuleMutation.mutate(
        { courseId, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    }
  };

  const isPending = createModuleMutation.isPending || updateModuleMutation.isPending;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Module: ${initialModule?.title}` : "Add Curriculum Module"}
      description="Modules group your lectures and lessons logically into structured chapters."
      maxWidth="md"
      showCloseButton={!isPending}
      closeOnOverlayClick={!isPending}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !title.trim()}
            className="text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm flex items-center gap-1.5"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? "Save Module" : "Add Module"}</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Module Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Module 1: System Foundations & Architecture"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-xs h-9"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Module Overview / Objective (Optional)
          </label>
          <textarea
            placeholder="Briefly state what students will learn in this chapter..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Sort Order
            </label>
            <Input
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>

          <label className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 cursor-pointer mt-5">
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              Published
            </span>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </form>
    </ModalTemplate>
  );
};

export default ModuleFormModal;
