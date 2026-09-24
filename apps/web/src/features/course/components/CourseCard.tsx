import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
  Flame,
  Star,
  ChevronRight,
  Layers,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/features/wishlist";
import type { Course } from "../types/course.types";

interface CourseCardProps {
  course: Course;
  viewMode?: "grid" | "list";
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

export const CourseCard: React.FC<CourseCardProps> = ({ course, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const instructor = course.teacherProfile?.profile?.user;
  const avatar = course.teacherProfile?.profile?.avatar;
  const isStarted = Boolean(course.startingDate && new Date(course.startingDate).getTime() <= Date.now());

  if (viewMode === "list") {
    return (
      <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-[#F42A18]/40 hover:shadow-xl dark:hover:shadow-[#F42A18]/5 transition-all duration-300 flex flex-col md:flex-row gap-5">
        {/* Left Thumbnail Banner */}
        <div
          onClick={() => navigate(`/courses/${course.slug}`)}
          className="relative w-full md:w-64 md:h-44 aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 cursor-pointer"
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

          {/* Highlights & Category Pills */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {course.isFeatured && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> Featured
              </span>
            )}
            {course.isTrending && (
              <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" /> Trending
              </span>
            )}
          </div>

          {/* Wishlist Button Overlay */}
          <div className="absolute top-2.5 right-2.5 z-20">
            <WishlistButton courseId={course.id} size="sm" />
          </div>

          {/* Level Pill */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
              {course.level.replace("_", " ")}
            </span>
          </div>

          {/* Duration overlay */}
          {course.totalDurationSeconds > 0 && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-neutral-200 text-[11px] font-mono border border-white/10 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(course.totalDurationSeconds)}
              </span>
            </div>
          )}
        </div>

        {/* Right Info Section */}
        <div className="flex-1 flex flex-col justify-between min-w-0 space-y-3">
          <div className="space-y-2">
            {/* Category & Starting Date */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {course.category && (
                  <span className="text-xs font-semibold text-[#F42A18] dark:text-[#ff4d3d]">
                    {course.category.name}
                  </span>
                )}
                {course.subcategory && (
                  <span className="text-xs text-neutral-400">
                    • {course.subcategory.name}
                  </span>
                )}
              </div>

              {course.startingDate && (
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isStarted
                      ? "Cohort In-Progress"
                      : `Starts ${new Date(course.startingDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`}
                  </span>
                </div>
              )}
            </div>

            {/* Course Title */}
            <Link to={`/courses/${course.slug}`}>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[#F42A18] transition-colors line-clamp-1">
                {course.title}
              </h3>
            </Link>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {course.subtitle || course.description || "Master new industry-ready skills with hands-on projects and guided lessons."}
            </p>
          </div>

          {/* Bottom Bar: Instructor, Stats & Price */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
            {/* Instructor snippet */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center shrink-0 border border-neutral-300 dark:border-neutral-700">
                {avatar ? (
                  <img src={avatar} alt={instructor?.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-neutral-500" />
                )}
              </div>
              <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">
                {instructor?.name || "Expert Instructor"}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {course.totalLessons} {course.totalLessons === 1 ? "lesson" : "lessons"}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                {course.totalModules} {course.totalModules === 1 ? "module" : "modules"}
              </span>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                {course.pricingType === "FREE" ? (
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    FREE
                  </span>
                ) : (
                  <span className="text-base font-extrabold text-neutral-900 dark:text-white font-mono">
                    ₹{Number(course.price).toLocaleString()}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="h-8 px-3.5 text-xs font-semibold bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl shadow-sm cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl overflow-hidden hover:border-[#F42A18]/40 hover:shadow-xl dark:hover:shadow-[#F42A18]/5 transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail Banner */}
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

        {/* Highlights */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {course.isFeatured && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" /> Featured
            </span>
          )}
          {course.isTrending && (
            <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3 fill-white" /> Trending
            </span>
          )}
        </div>

        {/* Pricing Badge & Wishlist Overlay */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
          {course.pricingType === "FREE" ? (
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold font-mono shadow-sm">
              FREE
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-lg bg-neutral-900/90 backdrop-blur-md text-white text-xs font-bold font-mono shadow-sm border border-white/10">
              ₹{Number(course.price).toLocaleString()}
            </span>
          )}

          <WishlistButton courseId={course.id} size="sm" />
        </div>

        {/* Level & Duration Pills */}
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

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Starting Date */}
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

          {/* Subtitle snippet */}
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {course.subtitle || course.description || "Master new industry skills with hands-on projects and guided lessons."}
          </p>
        </div>

        {/* Footer Area */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
          {/* Instructor snippet */}
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

          {/* Lessons count */}
          <span className="text-xs text-neutral-400 font-mono shrink-0">
            {course.totalLessons} {course.totalLessons === 1 ? "lesson" : "lessons"}
          </span>
        </div>
      </div>
    </div>
  );
};
