import React, { useState, useEffect } from "react";
import {
  Video,
  FileText,
  HelpCircle,
  Radio,
  Paperclip,
  Loader2,
  Clock,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { useTeacherCreateLesson, useTeacherUpdateLesson } from "../hooks/useCourses";
import { CourseMediaUpload } from "./CourseMediaUpload";
import type {
  CourseLesson,
  CreateLessonPayload,
  LessonType,
  VideoProvider,
  LessonAttachment,
} from "../types/course.types";

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  initialLesson?: CourseLesson | null;
  onSuccess?: () => void;
}

const LESSON_TYPES: Array<{ type: LessonType; label: string; icon: React.ElementType; desc: string }> = [
  { type: "VIDEO", label: "Video Lecture", icon: Video, desc: "Streamed video from S3, CloudFront, YouTube, or Mux" },
  { type: "ARTICLE", label: "Reading Article", icon: FileText, desc: "Rich markdown or text guide for reading" },
  { type: "QUIZ", label: "Interactive Quiz", icon: HelpCircle, desc: "Assessment checkpoint" },
  { type: "LIVE_CLASS", label: "Live Interactive Session", icon: Radio, desc: "Scheduled live cohort stream" },
  { type: "ATTACHMENT", label: "Downloadable Resource", icon: Paperclip, desc: "PDFs, slides, code packages, assets" },
];

export const LessonFormModal: React.FC<LessonFormModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  initialLesson,
  onSuccess,
}) => {
  const isEditing = Boolean(initialLesson?.id);
  const createLessonMutation = useTeacherCreateLesson();
  const updateLessonMutation = useTeacherUpdateLesson();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>("VIDEO");
  const [durationMinutes, setDurationMinutes] = useState<number | string>(10);
  const [sortOrder, setSortOrder] = useState<number | string>(0);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Content Payloads
  const [videoUrl, setVideoUrl] = useState("");
  const [videoProvider, setVideoProvider] = useState<VideoProvider>("S3");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [articleBody, setArticleBody] = useState("");

  // Attachments
  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);
  const [newAttachName, setNewAttachName] = useState("");
  const [newAttachUrl, setNewAttachUrl] = useState("");

  useEffect(() => {
    if (initialLesson) {
      setTitle(initialLesson.title || "");
      setDescription(initialLesson.description || "");
      setLessonType(initialLesson.lessonType || "VIDEO");
      setDurationMinutes(Math.round((initialLesson.durationSeconds || 0) / 60));
      setSortOrder(initialLesson.sortOrder ?? 0);
      setIsFreePreview(initialLesson.isFreePreview ?? false);
      setIsPublished(initialLesson.isPublished ?? true);
      setVideoUrl(initialLesson.videoUrl || "");
      setVideoProvider(initialLesson.videoProvider || "S3");
      setVideoThumbnail(initialLesson.videoThumbnail || "");
      setArticleBody(initialLesson.articleBody || "");
      setAttachments(initialLesson.attachments || []);
    } else {
      setTitle("");
      setDescription("");
      setLessonType("VIDEO");
      setDurationMinutes(10);
      setSortOrder(0);
      setIsFreePreview(false);
      setIsPublished(true);
      setVideoUrl("");
      setVideoProvider("S3");
      setVideoThumbnail("");
      setArticleBody("");
      setAttachments([]);
    }
    setNewAttachName("");
    setNewAttachUrl("");
  }, [initialLesson, isOpen]);

  const handleAddAttachment = () => {
    if (!newAttachName.trim() || !newAttachUrl.trim()) return;
    setAttachments([...attachments, { name: newAttachName.trim(), url: newAttachUrl.trim() }]);
    setNewAttachName("");
    setNewAttachUrl("");
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: CreateLessonPayload = {
      title: title.trim(),
      description: description.trim() || null as any,
      lessonType,
      durationSeconds: (Number(durationMinutes) || 0) * 60,
      sortOrder: Number(sortOrder) || 0,
      isFreePreview,
      isPublished,
      videoUrl: videoUrl.trim() || null as any,
      videoProvider: videoUrl.trim() ? videoProvider : null as any,
      videoThumbnail: videoThumbnail.trim() || null as any,
      articleBody: articleBody.trim() || null as any,
      attachments,
    };

    if (isEditing && initialLesson?.id) {
      updateLessonMutation.mutate(
        { lessonId: initialLesson.id, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    } else {
      createLessonMutation.mutate(
        { moduleId, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    }
  };

  const isPending = createLessonMutation.isPending || updateLessonMutation.isPending;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Lesson: ${initialLesson?.title}` : "Add Curriculum Lesson"}
      description="Create a video lecture, reading article, downloadable package, or quiz."
      maxWidth="xl"
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
            <span>{isEditing ? "Save Lesson" : "Add Lesson"}</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
        {/* Lesson Format Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            Lesson Type & Format
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LESSON_TYPES.map((lt) => {
              const IconComp = lt.icon;
              const isSelected = lessonType === lt.type;
              return (
                <button
                  key={lt.type}
                  type="button"
                  onClick={() => setLessonType(lt.type)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs mb-0.5">
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{lt.label}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 line-clamp-1">{lt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic Details */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Setting Up gRPC Streaming & Protocol Buffers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description / Summary
            </label>
            <textarea
              placeholder="Brief explanation of the lesson objectives and takeaways..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>

        {/* Dynamic Content by Lesson Type */}
        {(lessonType === "VIDEO" || lessonType === "LIVE_CLASS") && (
          <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
            <CourseMediaUpload
              label="Lecture Video File or Stream"
              type="video"
              folder="videos"
              value={videoUrl}
              onChange={(url) => {
                setVideoUrl(url);
                if (url && (!videoProvider || videoProvider === "LOCAL")) {
                  setVideoProvider("S3");
                }
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Storage Provider
                </label>
                <select
                  value={videoProvider}
                  onChange={(e) => setVideoProvider(e.target.value as VideoProvider)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="S3">AWS S3 / Direct Cloud Upload</option>
                  <option value="CLOUDFRONT">CloudFront CDN</option>
                  <option value="YOUTUBE">YouTube Embed</option>
                  <option value="VIMEO">Vimeo</option>
                  <option value="MUX">Mux Video Stream</option>
                  <option value="LOCAL">Local Server Storage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Video Poster / Thumbnail (Optional)
                </label>
                <Input
                  placeholder="https://... custom poster image"
                  value={videoThumbnail}
                  onChange={(e) => setVideoThumbnail(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>
        )}

        {lessonType === "ARTICLE" && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Article Content (Markdown Supported)
            </label>
            <textarea
              placeholder="## Lesson Notes&#10;&#10;Explain the concepts, include code snippets, and structured guidance..."
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-mono"
            />
          </div>
        )}

        {/* Attachments & Downloads */}
        <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-neutral-500" />
              Downloadable Files & Code
            </span>
            <span className="text-[11px] text-neutral-400">{attachments.length} attachments</span>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <span className="font-medium truncate max-w-[200px]">{att.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[120px]">
                      {att.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              placeholder="Attachment Name (e.g. starter-code.zip)"
              value={newAttachName}
              onChange={(e) => setNewAttachName(e.target.value)}
              className="text-xs h-8 flex-1"
            />
            <Input
              placeholder="URL (https://...)"
              value={newAttachUrl}
              onChange={(e) => setNewAttachUrl(e.target.value)}
              className="text-xs h-8 flex-1 font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAttachment}
              className="text-xs h-8 px-2 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Duration & Access Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Duration (Minutes)
            </label>
            <Input
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>

          <label className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 cursor-pointer">
            <div>
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-500" />
                Free Preview
              </p>
              <p className="text-[10px] text-neutral-400">Public without enrollment</p>
            </div>
            <input
              type="checkbox"
              checked={isFreePreview}
              onChange={(e) => setIsFreePreview(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 cursor-pointer">
            <div>
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                Published
              </p>
              <p className="text-[10px] text-neutral-400">Visible in syllabus</p>
            </div>
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

export default LessonFormModal;
