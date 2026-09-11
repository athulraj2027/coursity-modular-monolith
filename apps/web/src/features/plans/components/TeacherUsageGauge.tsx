import React from "react";
import type { QuotaSummaryItem } from "../types/plan.types";
import { Video, BookOpen, HardDrive, Sparkles, Users, Award, Radio } from "lucide-react";

interface TeacherUsageGaugeProps {
  items: QuotaSummaryItem[];
}

export const TeacherUsageGauge: React.FC<TeacherUsageGaugeProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const getFeatureIcon = (code: string) => {
    switch (code) {
      case "LIVE_VIEWER_MINUTES_MONTHLY":
        return <Radio className="w-4 h-4 text-[#F42A18]" />;
      case "MAX_COURSES":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "MAX_RECORDED_CLASSES":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "MAX_STORAGE_GB":
        return <HardDrive className="w-4 h-4 text-emerald-500" />;
      case "MAX_STUDENTS_PER_SESSION":
        return <Users className="w-4 h-4 text-amber-500" />;
      case "AI_CLASS_SUMMARIES":
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case "CUSTOM_BRANDED_CERTIFICATES":
        return <Award className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#F42A18]" />;
    }
  };

  // Only show metered numeric quotas in the visual gauge cards
  const numericItems = items.filter((i) => i.featureType === "NUMERIC");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {numericItems.map((item) => {
        const isUnlimited = item.isUnlimited;
        const percentage = item.usagePercentage;
        const isNearLimit = percentage >= 80;
        const isExceeded = percentage >= 100;

        return (
          <div
            key={item.featureCode}
            className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm space-y-3 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                {getFeatureIcon(item.featureCode)}
              </div>
              {isUnlimited ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Unlimited
                </span>
              ) : (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isExceeded
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : isNearLimit
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200/60 dark:border-neutral-700"
                  }`}
                >
                  {percentage}% Used
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 truncate">
                {item.featureName}
              </h4>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {item.currentUsage.toLocaleString()}
                <span className="text-xs font-normal text-neutral-400 ml-1">
                  / {isUnlimited ? "∞" : item.limit.toLocaleString()} {item.unit || ""}
                </span>
              </p>
            </div>

            {/* Progress Bar */}
            {!isUnlimited && (
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    isExceeded
                      ? "bg-red-500"
                      : isNearLimit
                      ? "bg-amber-500"
                      : "bg-[#F42A18]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(3, percentage))}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeacherUsageGauge;
