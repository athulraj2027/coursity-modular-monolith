import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { QuotaSummaryItem } from "../types/plan.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  BookOpen,
  HardDrive,
  Sparkles,
  Users,
  Award,
  Radio,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Gauge,
  Layers,
  CalendarCheck,
} from "lucide-react";

interface TeacherUsageGaugeProps {
  items: QuotaSummaryItem[];
  planName?: string;
}

const DEFAULT_FALLBACK_ITEMS: QuotaSummaryItem[] = [
  {
    featureCode: "MAX_COURSES",
    featureName: "Published Courses Limit",
    featureType: "NUMERIC",
    category: "COURSES",
    unit: "courses",
    limit: 2,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 2,
    usagePercentage: 0,
  },
  {
    featureCode: "MAX_RECORDED_CLASSES",
    featureName: "Cloud Recorded Classes",
    featureType: "NUMERIC",
    category: "RECORDING",
    unit: "classes",
    limit: 5,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 5,
    usagePercentage: 0,
  },
  {
    featureCode: "LIVE_VIEWER_MINUTES_MONTHLY",
    featureName: "Live Class Viewer Minutes",
    featureType: "NUMERIC",
    category: "LIVE_STREAMING",
    unit: "minutes/mo",
    limit: 1000,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 1000,
    usagePercentage: 0,
  },
  {
    featureCode: "MAX_LIVE_CLASSES_PER_WEEK",
    featureName: "Live Classes per Week",
    featureType: "NUMERIC",
    category: "LIVE_STREAMING",
    unit: "classes/wk",
    limit: 2,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 2,
    usagePercentage: 0,
  },
  {
    featureCode: "MAX_STUDENTS_PER_SESSION",
    featureName: "Max Students per Live Session",
    featureType: "NUMERIC",
    category: "LIVE_STREAMING",
    unit: "students",
    limit: 25,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 25,
    usagePercentage: 0,
  },
  {
    featureCode: "MAX_STORAGE_GB",
    featureName: "Cloud Video & Asset Storage",
    featureType: "NUMERIC",
    category: "STORAGE",
    unit: "GB",
    limit: 5,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 5,
    usagePercentage: 0,
  },
  {
    featureCode: "HD_RECORDING_1080P",
    featureName: "1080p FHD Recording & Streaming",
    featureType: "BOOLEAN",
    category: "RECORDING",
    unit: null,
    limit: 0,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 0,
    usagePercentage: 0,
  },
  {
    featureCode: "AI_CLASS_SUMMARIES",
    featureName: "AI Class Summaries & Notes",
    featureType: "BOOLEAN",
    category: "ANALYTICS",
    unit: null,
    limit: 0,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 0,
    usagePercentage: 0,
  },
  {
    featureCode: "CUSTOM_BRANDED_CERTIFICATES",
    featureName: "Custom Branded Certificates",
    featureType: "BOOLEAN",
    category: "COMMUNITY",
    unit: null,
    limit: 0,
    isUnlimited: false,
    currentUsage: 0,
    remaining: 0,
    usagePercentage: 0,
  },
];

export const TeacherUsageGauge: React.FC<TeacherUsageGaugeProps> = ({
  items,
  planName = "Current Plan",
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "METERS" | "CAPABILITIES">("ALL");

  const effectiveItems = items && items.length > 0 ? items : DEFAULT_FALLBACK_ITEMS;

  const getFeatureIcon = (code: string) => {
    switch (code) {
      case "LIVE_VIEWER_MINUTES_MONTHLY":
        return <Radio className="w-4 h-4 text-[#F42A18]" />;
      case "MAX_COURSES":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "MAX_RECORDED_CLASSES":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "MAX_LIVE_CLASSES_PER_WEEK":
      case "MAX_LIVE_CLASSES_PER_MONTH":
        return <CalendarCheck className="w-4 h-4 text-amber-500" />;
      case "MAX_STORAGE_GB":
        return <HardDrive className="w-4 h-4 text-emerald-500" />;
      case "MAX_STUDENTS_PER_SESSION":
        return <Users className="w-4 h-4 text-indigo-500" />;
      case "HD_RECORDING_1080P":
        return <Video className="w-4 h-4 text-sky-500" />;
      case "AI_CLASS_SUMMARIES":
        return <Sparkles className="w-4 h-4 text-violet-500" />;
      case "CUSTOM_BRANDED_CERTIFICATES":
        return <Award className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#F42A18]" />;
    }
  };

  // Separate numeric meter items and boolean capability switches
  const numericItems = effectiveItems.filter(
    (i) =>
      i.featureType === "NUMERIC" ||
      (typeof i.limit === "number" && (i.limit > 1 || i.isUnlimited))
  );

  const booleanItems = effectiveItems.filter(
    (i) =>
      i.featureType === "BOOLEAN" ||
      (typeof i.limit === "number" && (i.limit === 0 || i.limit === 1) && !i.isUnlimited && !numericItems.includes(i))
  );

  return (
    <div className="space-y-6 w-full text-left">
      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "ALL"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            All Limits ({effectiveItems.length})
          </button>
          <button
            onClick={() => setActiveTab("METERS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "METERS"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Usage Meters ({numericItems.length})
          </button>
          <button
            onClick={() => setActiveTab("CAPABILITIES")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "CAPABILITIES"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Capabilities ({booleanItems.length})
          </button>
        </div>

        <span className="text-xs text-neutral-400 font-medium">
          Tier Quota: <strong className="text-neutral-900 dark:text-white">{planName}</strong>
        </span>
      </div>

      {/* 1. Numeric Resource Usage Gauges */}
      {(activeTab === "ALL" || activeTab === "METERS") && (
        <div className="space-y-3">
          {activeTab === "ALL" && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Gauge className="w-3.5 h-3.5 text-[#F42A18]" />
              <span>Resource Usage Meters</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {numericItems.map((item) => {
              const isUnlimited = item.isUnlimited;
              const numericLimit =
                typeof item.limit === "number" ? item.limit : parseFloat(String(item.limit));
              const currentUsage = Number(item.currentUsage || 0);
              const percentage =
                item.usagePercentage !== undefined && item.usagePercentage !== null
                  ? item.usagePercentage
                  : !isUnlimited && !isNaN(numericLimit) && numericLimit > 0
                  ? Math.min(100, Math.round((currentUsage / numericLimit) * 100))
                  : 0;

              const isNearLimit = percentage >= 80;
              const isExceeded = percentage >= 100;
              const featureTitle = item.featureName || (item as any).name || item.featureCode;

              return (
                <div
                  key={item.featureCode}
                  className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm space-y-3 text-left shadow-xs transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
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
                    <h4
                      className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 truncate"
                      title={featureTitle}
                    >
                      {featureTitle}
                    </h4>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {currentUsage.toLocaleString()}
                      <span className="text-xs font-normal text-neutral-400 ml-1">
                        / {isUnlimited ? "∞" : (!isNaN(numericLimit) && numericLimit > 0 ? numericLimit.toLocaleString() : "1")}{" "}
                        {item.unit || ""}
                      </span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {!isUnlimited && !isNaN(numericLimit) && numericLimit > 0 ? (
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
                  ) : (
                    <div className="w-full bg-emerald-500/20 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full bg-emerald-500 w-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Capability Switches & Add-on Features */}
      {(activeTab === "ALL" || activeTab === "CAPABILITIES") && booleanItems.length > 0 && (
        <div className="space-y-3 pt-2">
          {activeTab === "ALL" && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Platform Capabilities & Features</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {booleanItems.map((item) => {
              const isIncluded =
                item.isUnlimited ||
                item.limit === true ||
                item.limit === 1 ||
                (item as any).isAvailable === true;
              const featureTitle = item.featureName || (item as any).name || item.featureCode;

              return (
                <div
                  key={item.featureCode}
                  className={`p-4 rounded-2xl border transition-all duration-200 space-y-2.5 text-left ${
                    isIncluded
                      ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10"
                      : "border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white dark:bg-neutral-800 shadow-2xs">
                      {getFeatureIcon(item.featureCode)}
                    </div>
                    {isIncluded ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-[10px] gap-1 px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </Badge>
                    ) : (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-neutral-500 hover:text-[#F42A18] gap-1 rounded-lg cursor-pointer"
                      >
                        <Link to="/teachers/plans/browse">
                          <Lock className="w-3 h-3" />
                          Upgrade
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      {featureTitle}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {isIncluded
                        ? "Full platform access enabled on your active tier."
                        : "Available by upgrading to Pro Educator or Elite tier."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherUsageGauge;
