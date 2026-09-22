import React from "react";
import {
  PlayCircle,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseLesson, Course } from "../types/course.types";

interface LessonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: CourseLesson | null;
  course: Course;
  onEnrollClick?: () => void;
}

export const LessonPreviewModal: React.FC<LessonPreviewModalProps> = ({
  isOpen,
  onClose,
  lesson,
  course,
  onEnrollClick,
}) => {
  if (!isOpen || !lesson) return null;

  const isVideo = lesson.lessonType === "VIDEO";
  const isArticle = lesson.lessonType === "ARTICLE";

  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(lesson.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wide uppercase">
              Free Sample Lecture
            </span>
            <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
              {lesson.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Video Player */}
          {isVideo && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-inner flex items-center justify-center">
              {embedUrl ? (
                embedUrl.includes("embed") ? (
                  <iframe
                    src={embedUrl}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={embedUrl}
                    controls
                    autoPlay
                    poster={lesson.videoThumbnail || course.thumbnail || undefined}
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="text-center p-8 space-y-2 text-neutral-400">
                  <PlayCircle className="w-12 h-12 text-[#F42A18] mx-auto opacity-80" />
                  <p className="text-xs">No media preview stream attached to this lesson.</p>
                </div>
              )}
            </div>
          )}

          {/* Article Viewer */}
          {isArticle && (
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-950/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              {lesson.articleBody ? (
                <div className="whitespace-pre-wrap font-sans">{lesson.articleBody}</div>
              ) : (
                <p className="text-neutral-400 italic">No text content provided for this reading lesson.</p>
              )}
            </div>
          )}

          {/* Description & Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              {lesson.durationSeconds > 0 && (
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.round(lesson.durationSeconds / 60)} minutes
                </span>
              )}
              <span>•</span>
              <span className="text-neutral-400">From course:</span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                {course.title}
              </span>
            </div>

            {lesson.description && (
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {lesson.description}
              </p>
            )}
          </div>

          {/* Attachments if any */}
          {lesson.attachments && Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Lesson Resources & Downloads
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lesson.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between hover:border-[#F42A18]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      <Download className="w-3.5 h-3.5 text-[#F42A18] shrink-0" />
                      <span className="truncate">{att.name || "Resource File"}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Enrollment Banner */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
              Enjoying this sample lecture?
            </p>
            <p className="text-[11px] text-neutral-500">
              Unlock all {course.totalLessons} lectures, interactive projects, and certification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white">
                {course.pricingType === "FREE" ? "FREE" : `₹${Number(course.price).toLocaleString()}`}
              </span>
            </div>

            <Button
              onClick={() => {
                onClose();
                if (onEnrollClick) onEnrollClick();
              }}
              className="bg-[#F42A18] hover:bg-[#D92212] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Enroll Full Course
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
