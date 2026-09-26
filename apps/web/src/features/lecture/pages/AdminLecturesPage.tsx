import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Radio,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  BookOpen,
  User,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
  type TableTabOption,
  type TableSortOption,
} from "@/components/common/DataTableTemplate";
import { LectureStatusBadge } from "../components/LectureStatusBadge";
import { useAdminLectures } from "../hooks/useLectures";
import type { Lecture } from "../types/lecture.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminLecturesPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("startTime-desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: lecturesData, isLoading, refetch } = useAdminLectures({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: activeTab === "all" ? undefined : activeTab,
    sort: sortOption as any,
  });

  const allLectures = useMemo(() => lecturesData?.items || [], [lecturesData]);
  const totalCount = lecturesData?.total || 0;

  // Metrics Bar
  const metricsCards: TableMetricCard[] = useMemo(() => {
    return [
      {
        label: "Platform Lectures",
        val: totalCount,
        icon: Video,
        color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Live Now",
        val: allLectures.filter((l) => l.liveStatus === "LIVE_NOW" || l.isLiveNow).length,
        icon: Radio,
        color: "text-red-600 bg-red-500/10 border-red-500/20",
      },
      {
        label: "Scheduled",
        val: allLectures.filter((l) => l.liveStatus === "SCHEDULED").length,
        icon: Calendar,
        color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      },
      {
        label: "Conducted & Completed",
        val: allLectures.filter((l) => l.liveStatus === "COMPLETED").length,
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      },
    ];
  }, [allLectures, totalCount]);

  const tabOptions: TableTabOption[] = [
    { key: "all", label: "All Lectures", count: totalCount },
    { key: "LIVE_NOW", label: "Live Now", count: allLectures.filter((l) => l.liveStatus === "LIVE_NOW" || l.isLiveNow).length },
    { key: "SCHEDULED", label: "Scheduled", count: allLectures.filter((l) => l.liveStatus === "SCHEDULED").length },
    { key: "COMPLETED", label: "Completed", count: allLectures.filter((l) => l.liveStatus === "COMPLETED").length },
  ];

  const sortOptions: TableSortOption[] = [
    { label: "Start Time (Latest First)", value: "startTime-desc" },
    { label: "Start Time (Soonest First)", value: "startTime-asc" },
    { label: "Recently Created", value: "created-desc" },
    { label: "Lecture Name (A - Z)", value: "title-asc" },
  ];

  const columns: TableColumn<Lecture>[] = [
    {
      header: "Lecture & Course",
      accessorKey: "title",
      cell: (row) => (
        <div className="space-y-1 max-w-xs sm:max-w-sm">
          <div
            className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-1 hover:text-[#F42A18] transition-colors cursor-pointer"
            onClick={() => navigate(`/admin/lectures/${row.id}`)}
          >
            {row.title}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <BookOpen className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="truncate">{row.courseTitle || "Course"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Instructor",
      accessorKey: "teacherName",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-neutral-500" />
          </div>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {row.teacherName || "Instructor"}
          </span>
        </div>
      ),
    },
    {
      header: "Start Time",
      accessorKey: "scheduledAt",
      cell: (row) => {
        if (!row.scheduledAt) return <span className="text-xs text-neutral-400">Unscheduled</span>;
        const date = new Date(row.scheduledAt);
        return (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Duration",
      accessorKey: "durationSeconds",
      cell: (row) => (
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {Math.round(row.durationSeconds / 60)} mins
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "liveStatus",
      cell: (row) => (
        <LectureStatusBadge status={row.liveStatus} isLiveNow={row.isLiveNow} />
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/lectures/${row.id}`)}
            className="h-7 px-2.5 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTableTemplate<Lecture>
        badge={{
          icon: Video,
          label: "Live Classes Directory",
        }}
        title="Platform Lectures & Live Classes Directory"
        description="Global administrative oversight of all live cohort classes across all instructors and courses."
        headerActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-xs h-9 rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
        metrics={metricsCards}
        data={allLectures}
        columns={columns}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
        searchPlaceholder="Search by lecture name, description, instructor, or course..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        sortOptions={sortOptions}
        currentSort={sortOption}
        onSortChange={setSortOption}
        pagination={{
          currentPage,
          pageSize,
          totalItems: totalCount,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
};
