import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Calendar,
  Users,
  Award,
  Link as LinkIcon,
  Download,
  Trash2,
  Eye,
  User,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
  type TableSortOption,
} from "@/components/common/DataTableTemplate";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { TeacherSubmissionsModal } from "../components/TeacherSubmissionsModal";
import { useAdminHomework, useDeleteHomework } from "../hooks/useHomework";
import type { Homework } from "../types/homework.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminHomeworkPage: React.FC = () => {
  const navigate = useNavigate();

  // Search, Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sortOption, setSortOption] = useState<string>("created-desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null);
  const [homeworkForSubmissions, setHomeworkForSubmissions] = useState<Homework | null>(null);

  const { data: homeworkData, isLoading, refetch } = useAdminHomework({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    sort: sortOption as any,
  });

  const deleteMutation = useDeleteHomework();

  const allHomework = useMemo(() => homeworkData?.items || [], [homeworkData]);
  const totalCount = homeworkData?.total || 0;

  // Calculate metrics
  const metricsCards: TableMetricCard[] = useMemo(() => {
    const totalSubmissions = allHomework.reduce(
      (acc, curr) => acc + (curr.totalSubmissions || 0),
      0
    );
    const totalVerified = allHomework.reduce(
      (acc, curr) => acc + (curr.verifiedCount || 0),
      0
    );
    const totalRedo = allHomework.reduce(
      (acc, curr) => acc + (curr.redoCount || 0),
      0
    );

    return [
      {
        label: "Total Assigned Tasks",
        val: totalCount,
        icon: FileCheck,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Submissions Submitted",
        val: totalSubmissions,
        icon: Users,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      },
      {
        label: "Verified & Passed",
        val: totalVerified,
        icon: CheckCircle2,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "Redo Requested",
        val: totalRedo,
        icon: RotateCcw,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      },
    ];
  }, [allHomework, totalCount]);

  const sortOptions: TableSortOption[] = [
    { label: "Newest First", value: "created-desc" },
    { label: "Oldest First", value: "created-asc" },
    { label: "Title (A-Z)", value: "title-asc" },
    { label: "Title (Z-A)", value: "title-desc" },
    { label: "Due Date (Earliest)", value: "due-asc" },
  ];

  const columns: TableColumn<Homework>[] = [
    {
      header: "Homework Assignment",
      accessor: (hw) => (
        <div className="flex flex-col gap-1 min-w-[200px] max-w-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 text-sm hover:text-[#F42A18] transition-colors line-clamp-1">
              {hw.title}
            </span>
            <span className="text-[11px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex-shrink-0">
              {hw.maxScore} pts
            </span>
          </div>

          {hw.dueDate ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-[#F42A18]" />
              <span>
                Due:{" "}
                {new Date(hw.dueDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 italic">No deadline specified</span>
          )}
        </div>
      ),
    },
    {
      header: "Lecture & Course",
      accessor: (hw) => (
        <div className="flex flex-col gap-1 max-w-[220px]">
          <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium truncate">
            <BookOpen className="w-3.5 h-3.5 text-[#F42A18] flex-shrink-0" />
            <span className="truncate">{hw.lectureTitle || "Lecture Lesson"}</span>
          </div>
          <span className="text-[11px] text-slate-400 truncate pl-5">
            {hw.courseTitle || "Course"}
          </span>
        </div>
      ),
    },
    {
      header: "Instructor",
      accessor: (hw) => (
        <div className="flex items-center gap-2">
          {hw.teacherAvatar ? (
            <img
              src={hw.teacherAvatar}
              alt={hw.teacherName || "Instructor"}
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
            {hw.teacherName || "Instructor"}
          </span>
        </div>
      ),
    },
    {
      header: "Deliverables",
      accessor: (hw) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {hw.taskContent && (
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Text Prompt
            </span>
          )}
          {hw.taskUrl && (
            <a
              href={hw.taskUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/20 flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" /> Link
            </a>
          )}
          {hw.attachmentUrl && (
            <a
              href={hw.attachmentUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="text-[11px] bg-slate-800 text-slate-200 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-[#F42A18]" /> Handout
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Submissions",
      accessor: (hw) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{hw.totalSubmissions || 0} Submissions</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-400">{hw.verifiedCount || 0} Pass</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400">{hw.redoCount || 0} Redo</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400">{hw.pendingCount || 0} Pend</span>
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (hw) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            onClick={() => setHomeworkForSubmissions(hw)}
            className="h-8 px-2.5 bg-slate-800 hover:bg-[#F42A18] text-slate-200 hover:text-white text-xs transition-colors"
            title="View Submissions & Grade"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Submissions
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHomeworkToDelete(hw)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            title="Delete Assignment"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDeleteConfirm = () => {
    if (!homeworkToDelete) return;
    deleteMutation.mutate(homeworkToDelete.id, {
      onSuccess: () => {
        setHomeworkToDelete(null);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6">
      <DataTableTemplate<Homework>
        title="Homework & Assignment Management"
        subtitle="Global administrative oversight for lecture assignments, starter repositories, student submissions, and review states across all courses."
        metrics={metricsCards}
        searchPlaceholder="Search homework by title, task details, lecture, or course..."
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        sortOptions={sortOptions}
        sortValue={sortOption}
        onSortChange={(val) => {
          setSortOption(val);
          setCurrentPage(1);
        }}
        columns={columns}
        data={allHomework}
        keyExtractor={(hw) => hw.id}
        isLoading={isLoading}
        pagination={{
          page: currentPage,
          limit: pageSize,
          total: totalCount,
          onPageChange: setCurrentPage,
          onLimitChange: (newLimit) => {
            setPageSize(newLimit);
            setCurrentPage(1);
          },
        }}
        emptyTitle="No homework assignments found"
        emptyDescription={
          searchQuery
            ? "No assignments matched your search criteria."
            : "No homework assignments have been assigned across any courses yet."
        }
      />

      {/* Submissions Modal */}
      {homeworkForSubmissions && (
        <TeacherSubmissionsModal
          isOpen={Boolean(homeworkForSubmissions)}
          onClose={() => {
            setHomeworkForSubmissions(null);
            refetch();
          }}
          homework={homeworkForSubmissions}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(homeworkToDelete)}
        onClose={() => setHomeworkToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Homework Assignment"
        description={`Are you sure you want to delete "${homeworkToDelete?.title}"? All associated student submissions and records will be deleted.`}
        confirmText="Delete Assignment"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
