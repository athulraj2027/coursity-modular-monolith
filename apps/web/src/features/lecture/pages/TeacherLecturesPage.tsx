import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Radio,
  Calendar,
  Clock,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  BookOpen,
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
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { LectureFormModal } from "../components/LectureFormModal";
import { LectureStatusBadge } from "../components/LectureStatusBadge";
import { useTeacherLectures, useTeacherDeleteLecture } from "../hooks/useLectures";
import type { Lecture } from "../types/lecture.types";
import { useDebounce } from "@/hooks/use-debounce";

export const TeacherLecturesPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("startTime-asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lectureToEdit, setLectureToEdit] = useState<Lecture | null>(null);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);

  const { data: lecturesData, isLoading, refetch } = useTeacherLectures({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: activeTab === "all" ? undefined : activeTab,
    sort: sortOption as any,
  });

  const deleteMutation = useTeacherDeleteLecture();

  const allLectures = useMemo(() => lecturesData?.items || [], [lecturesData]);
  const totalCount = lecturesData?.total || 0;

  // Metrics Bar
  const metricsCards: TableMetricCard[] = useMemo(() => {
    return [
      {
        label: "Total Lectures",
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
        label: "Scheduled Ahead",
        val: allLectures.filter((l) => l.liveStatus === "SCHEDULED").length,
        icon: Calendar,
        color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      },
      {
        label: "Completed Classes",
        val: allLectures.filter((l) => l.liveStatus === "COMPLETED").length,
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      },
    ];
  }, [allLectures, totalCount]);

  // Tab Options
  const tabOptions: TableTabOption[] = [
    { key: "all", label: "All Lectures", count: totalCount },
    { key: "SCHEDULED", label: "Scheduled", count: allLectures.filter((l) => l.liveStatus === "SCHEDULED").length },
    { key: "LIVE_NOW", label: "Live Now", count: allLectures.filter((l) => l.liveStatus === "LIVE_NOW" || l.isLiveNow).length },
    { key: "COMPLETED", label: "Completed", count: allLectures.filter((l) => l.liveStatus === "COMPLETED").length },
  ];

  const sortOptions: TableSortOption[] = [
    { label: "Start Time (Soonest First)", value: "startTime-asc" },
    { label: "Start Time (Latest First)", value: "startTime-desc" },
    { label: "Name (A - Z)", value: "title-asc" },
  ];

  const columns: TableColumn<Lecture>[] = [
    {
      header: "Lecture & Course",
      accessorKey: "title",
      cell: (row) => (
        <div className="space-y-1 max-w-xs sm:max-w-sm">
          <div
            className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-1 hover:text-[#F42A18] transition-colors cursor-pointer"
            onClick={() => navigate(`/teachers/lectures/${row.id}`)}
          >
            {row.title}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <BookOpen className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="truncate">{row.courseTitle || "Unassigned Course"}</span>
            {row.moduleTitle && (
              <>
                <span>•</span>
                <span className="truncate">{row.moduleTitle}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Start Time",
      accessorKey: "scheduledAt",
      cell: (row) => {
        if (!row.scheduledAt) return <span className="text-xs text-neutral-400">Not scheduled</span>;
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
            onClick={() => navigate(`/teachers/lectures/${row.id}`)}
            className="h-7 w-7 p-0 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            title="View Lecture Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLectureToEdit(row)}
            className="h-7 w-7 p-0 rounded-lg text-neutral-500 hover:text-blue-600 hover:bg-blue-500/10 cursor-pointer"
            title="Edit Lecture"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLectureToDelete(row)}
            className="h-7 w-7 p-0 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
            title="Delete Lecture"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDeleteConfirm = () => {
    if (!lectureToDelete) return;
    deleteMutation.mutate(lectureToDelete.id, {
      onSuccess: () => setLectureToDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <DataTableTemplate<Lecture>
        badge={{
          icon: Video,
          label: "Live Class Studio",
        }}
        title="Live Lectures Studio"
        description="Schedule, broadcast, and manage live interactive class sessions across your courses."
        headerActions={
          <div className="flex items-center gap-2">
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
            <Button
              size="sm"
              onClick={() => {
                setLectureToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="text-xs h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Schedule Lecture
            </Button>
          </div>
        }
        metrics={metricsCards}
        data={allLectures}
        columns={columns}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
        searchPlaceholder="Search lectures by name, description, or course..."
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

      {/* Create / Edit Modal */}
      <LectureFormModal
        isOpen={isCreateModalOpen || Boolean(lectureToEdit)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setLectureToEdit(null);
        }}
        initialLecture={lectureToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(lectureToDelete)}
        onClose={() => setLectureToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Live Lecture"
        description={`Are you sure you want to delete "${lectureToDelete?.title}"? This will remove the lecture from the course schedule.`}
        confirmText="Delete Lecture"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
