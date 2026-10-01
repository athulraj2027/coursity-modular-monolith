import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Presentation,
  FileCode,
  Calendar,
  HardDrive,
  Download,
  ExternalLink,
  Trash2,
  RefreshCw,
  Eye,
  User,
  BookOpen,
  Video,
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
import { NoteFileIcon } from "../components/NoteFileIcon";
import { useAdminNotes, useDeleteNote } from "../hooks/useNotes";
import type { Note } from "../types/note.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminNotesPage: React.FC = () => {
  const navigate = useNavigate();

  // Search, Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("created-desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Note Action State
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const fileExtensionFilter = useMemo(() => {
    if (activeTab === "pdf") return "pdf";
    if (activeTab === "presentation") return "ppt";
    if (activeTab === "document") return "doc";
    return undefined;
  }, [activeTab]);

  const { data: notesData, isLoading, refetch } = useAdminNotes({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    fileExtension: fileExtensionFilter,
    sort: sortOption as any,
  });

  const deleteMutation = useDeleteNote();

  const allNotes = useMemo(() => notesData?.items || [], [notesData]);
  const totalCount = notesData?.total || 0;

  // Format bytes utility
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Calculate metrics
  const metricsCards: TableMetricCard[] = useMemo(() => {
    const totalBytes = allNotes.reduce((acc, curr) => acc + (curr.fileSizeBytes || 0), 0);
    const pdfCount = allNotes.filter((n) => (n.fileExtension || "").toLowerCase().includes("pdf")).length;
    const pptCount = allNotes.filter((n) =>
      ["ppt", "pptx"].includes((n.fileExtension || "").toLowerCase())
    ).length;

    return [
      {
        label: "Total Notes Attached",
        val: totalCount,
        icon: FileText,
        color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "PDF Handouts",
        val: pdfCount,
        icon: FileCode,
        color: "text-red-600 bg-red-500/10 border-red-500/20",
      },
      {
        label: "Slide Decks (PPT/PPTX)",
        val: pptCount,
        icon: Presentation,
        color: "text-orange-600 bg-orange-500/10 border-orange-500/20",
      },
      {
        label: "Storage Monitored",
        val: formatBytes(totalBytes),
        icon: HardDrive,
        color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      },
    ];
  }, [allNotes, totalCount]);

  // Tab Options
  const tabOptions: TableTabOption[] = [
    { key: "all", label: "All Notes", count: totalCount },
    { key: "pdf", label: "PDF Documents" },
    { key: "presentation", label: "Slide Decks (PPT/PPTX)" },
    { key: "document", label: "Word & Docs" },
  ];

  const sortOptions: TableSortOption[] = [
    { label: "Recently Uploaded", value: "created-desc" },
    { label: "Oldest First", value: "created-asc" },
    { label: "Name (A - Z)", value: "name-asc" },
    { label: "Name (Z - A)", value: "name-desc" },
  ];

  const columns: TableColumn<Note>[] = [
    {
      header: "Note Document",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-start gap-3 max-w-sm">
          <NoteFileIcon extension={row.fileExtension} size="sm" className="mt-0.5" />
          <div className="space-y-0.5 min-w-0">
            <h5 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
              {row.name}
            </h5>
            {row.description ? (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                {row.description}
              </p>
            ) : (
              <span className="text-[10px] text-neutral-400 font-mono">No description</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Lecture & Course",
      accessorKey: "lectureTitle",
      cell: (row) => (
        <div className="space-y-0.5 max-w-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            <Video className="w-3 h-3 text-[#F42A18] shrink-0" />
            <span
              className="truncate hover:underline cursor-pointer"
              onClick={() => navigate(`/admin/lectures/${row.lectureId}`)}
            >
              {row.lectureTitle || "Associated Lecture"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 truncate">
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
          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-600 dark:text-neutral-400 font-bold text-[10px]">
            {row.teacherAvatar ? (
              <img
                src={row.teacherAvatar}
                alt={row.teacherName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-3 h-3" />
            )}
          </div>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
            {row.teacherName || "Instructor"}
          </span>
        </div>
      ),
    },
    {
      header: "Size & Type",
      accessorKey: "fileSizeBytes",
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
            {formatBytes(row.fileSizeBytes)}
          </span>
          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            {(row.fileExtension || "PDF").toUpperCase()}
          </div>
        </div>
      ),
    },
    {
      header: "Uploaded At",
      accessorKey: "createdAt",
      cell: (row) => {
        if (!row.createdAt) return <span className="text-xs text-neutral-400">—</span>;
        const date = new Date(row.createdAt);
        return (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-neutral-400" />
              <span>{date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Preview Document"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={row.fileUrl}
            download={row.name}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-[#F42A18] hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Download Document"
          >
            <Download className="w-3.5 h-3.5" />
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNoteToDelete(row)}
            className="h-7 w-7 p-0 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
            title="Moderate / Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDeleteConfirm = () => {
    if (!noteToDelete) return;
    deleteMutation.mutate(noteToDelete.id, {
      onSuccess: () => {
        setNoteToDelete(null);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6">
      <DataTableTemplate<Note>
        badge={{
          icon: FileText,
          label: "Learning Materials Oversight",
        }}
        title="Lecture Notes & Materials Directory"
        description="Global administrative oversight, auditing, previewing, and moderation of all student notes and lecture slides across the platform."
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
        data={allNotes}
        columns={columns}
        keyExtractor={(n) => n.id}
        isLoading={isLoading}
        searchPlaceholder="Search notes by document title, instructor, course, or lecture..."
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Moderate & Delete Note"
        description={`Are you sure you want to administratively delete "${noteToDelete?.name}"? This document will be unlinked from the lecture and removed from student access.`}
        confirmText="Delete Document"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
