import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
  User,
  Trash2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRemoveWishlistItem } from "../hooks/useWishlist";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import type { WishlistItem } from "../types/wishlist.types";

export interface WishlistCardProps {
  item: WishlistItem;
}

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "0 mins";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  }
  return `${minutes} mins`;
};

export const WishlistCard: React.FC<WishlistCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const removeMutation = useRemoveWishlistItem();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const course = item.course;

  if (!course) return null;

  const instructor = course.teacherProfile?.profile?.user;
  const avatar = course.teacherProfile?.profile?.avatar;
  const isStarted = Boolean(course.startingDate && new Date(course.startingDate).getTime() <= Date.now());

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = await confirm({
      actionType: "delete",
      variant: "danger",
      title: "Remove from Wishlist?",
      description: `Are you sure you want to remove "${course.title}" from your saved wishlist?`,
      confirmText: "Remove Course",
      cancelText: "Cancel",
      icon: <Trash2 className="w-5 h-5 text-[#F42A18]" />,
    });

    if (confirmed) {
      removeMutation.mutate(course.id);
    }
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl overflow-hidden hover:border-[#F42A18]/40 hover:shadow-xl dark:hover:shadow-[#F42A18]/5 transition-all duration-300 flex flex-col justify-between">
        {/* 1. Thumbnail Header */}
        <div
          onClick={() => navigate(`/courses/${course.slug}`)}
          className="relative w-full aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
        >
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-neutral-100 dark:bg-neutral-800/50">
              <GraduationCap className="w-10 h-10" />
            </div>
          )}

          {/* Remove from Wishlist Quick Button */}
          <div className="absolute top-2.5 right-2.5 z-20">
            <button
              type="button"
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              title="Remove from Wishlist"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pricing Badge Overlay */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {course.pricingType === "FREE" ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold font-mono shadow-sm">
                FREE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-lg bg-neutral-900/90 backdrop-blur-md text-white text-xs font-bold font-mono shadow-sm border border-white/10">
                ₹{Number(course.price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Level & Duration */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-medium border border-white/10">
              {course.level.replace("_", " ")}
            </span>

            {course.totalDurationSeconds > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-neutral-200 text-[10px] font-mono border border-white/10 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(course.totalDurationSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* 2. Body Details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            {/* Category & Date */}
            <div className="flex items-center justify-between gap-1 text-[11px]">
              <span className="font-semibold text-[#F42A18] dark:text-[#ff4d3d] truncate">
                {course.category?.name || "General"}
              </span>

              {course.startingDate && (
                <span className="text-blue-600 dark:text-blue-400 font-medium truncate shrink-0 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {isStarted
                    ? "Ongoing"
                    : `Starts ${new Date(course.startingDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}`}
                </span>
              )}
            </div>

            {/* Title */}
            <Link to={`/courses/${course.slug}`}>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white group-hover:text-[#F42A18] transition-colors line-clamp-2 leading-snug">
                {course.title}
              </h3>
            </Link>

            {/* Subtitle */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {course.subtitle || course.description || "Master new industry skills with guided lessons and projects."}
            </p>
          </div>

          {/* 3. Instructor & Action Bar */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center shrink-0 border border-neutral-300 dark:border-neutral-700">
                  {avatar ? (
                    <img src={avatar} alt={instructor?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                </div>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {instructor?.name || "Instructor"}
                </span>
              </div>

              <span className="text-xs text-neutral-400 font-mono shrink-0 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {course.totalLessons} {course.totalLessons === 1 ? "lesson" : "lessons"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="w-full h-9 text-xs font-semibold bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{course.pricingType === "FREE" ? "Enroll for Free" : "View & Enroll"}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </>
  );
};
