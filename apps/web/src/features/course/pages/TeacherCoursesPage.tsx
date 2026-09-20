import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Sparkles,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
  type TableTabOption,
  type TableSortOption,
} from "@/components/common/DataTableTemplate";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { CourseFormModal } from "../components/CourseFormModal";
import {
  useTeacherCourses,
  useTeacherCourseMetrics,
  useTeacherDeleteCourse,
} from "../hooks/useCourses";
import type { Course } from "../types/course.types";
import { useDebounce } from "@/hooks/use-debounce";

export const TeacherCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: coursesData, isLoading, refetch } = useTeacherCourses({ limit: 100 });
  const { data: metrics } = useTeacherCourseMetrics();

  const deleteMutation = useTeacherDeleteCourse();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("created-desc");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allCourses = useMemo(() => coursesData?.items || [], [coursesData]);

  // Metrics Bar
  const metricsCards: TableMetricCard[] = useMemo(() => {
    return [
      {
        label: "Total Courses",
        val: metrics?.total ?? allCourses.length,
        icon: BookOpen,
        color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Live & Published",
        val: metrics?.published ?? allCourses.filter((c) => c.status === "PUBLISHED").length,
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "Free Cohorts",
        val: metrics?.freeCourses ?? allCourses.filter((c) => c.pricingType === "FREE").length,
        icon: Sparkles,
        color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
      },
      {
        label: "Paid Cohorts",
        val: metrics?.paidCourses ?? allCourses.filter((c) => c.pricingType === "PAID").length,
        icon: DollarSign,
        color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      },
    ];
  }, [metrics, allCourses]);

  // Tab Options
  const tabOptions: TableTabOption[] = useMemo(() => {
    return [
      { key: "all", label: "All Courses", count: allCourses.length },
      {
        key: "published",
        label: "Live & Listed",
        count: allCourses.filter((c) => c.status === "PUBLISHED").length,
      },
      {
        key: "free",
        label: "Free",
        count: allCourses.filter((c) => c.pricingType === "FREE").length,
      },
      {
        key: "paid",
        label: "Paid",
        count: allCourses.filter((c) => c.pricingType === "PAID").length,
      },
    ];
  }, [allCourses]);

  const sortOptions: TableSortOption[] = [
    { label: "Recently Created", value: "created-desc" },
    { label: "Title (A - Z)", value: "title-asc" },
    { label: "Most Lessons", value: "lessons-desc" },
    { label: "Price (High to Low)", value: "price-desc" },
  ];

  // Filtering & Sorting
  const filteredCourses = useMemo(() => {
    let result = [...allCourses];

    if (activeTab === "published") {
      result = result.filter((c) => c.status === "PUBLISHED");
    } else if (activeTab === "free") {
      result = result.filter((c) => c.pricingType === "FREE");
    } else if (activeTab === "paid") {
      result = result.filter((c) => c.pricingType === "PAID");
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
          (c.category && c.category.name.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortOption === "created-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === "lessons-desc") {
        return b.totalLessons - a.totalLessons;
      }
      if (sortOption === "price-desc") {
        return Number(b.price) - Number(a.price);
      }
      return 0;
    });

    return result;
  }, [allCourses, activeTab, debouncedSearch, sortOption]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  // Columns definition
  const columns: TableColumn<Course>[] = [
    {
      header: "Course & Topic Outline",
      cell: (course) => (
        <div
          onClick={() => navigate(`/teachers/courses/${course.id}`)}
          className="flex items-center gap-3 py-1 cursor-pointer group"
        >
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0 group-hover:ring-2 group-hover:ring-[#F42A18]/30 transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-[#F42A18]/30 transition-all">
              <GraduationCap className="w-5 h-5 text-neutral-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#F42A18] transition-colors">
              {course.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
              <span>{course.category?.name || "General"}</span>
              <span>•</span>
              <span className="font-mono">{course.totalModules} Topics</span>
              <span>•</span>
              <span className="font-mono">{course.language}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Live Batch Start",
      align: "center",
      cell: (course) => {
        if (!course.startingDate) {
          return (
            <Badge variant="outline" className="bg-neutral-500/10 text-neutral-500 border-neutral-500/20 text-xs">
              Flexible / Self-Paced
            </Badge>
          );
        }
        const startDate = new Date(course.startingDate);
        return (
          <div className="text-center">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {startDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-[10px] text-neutral-400">Live Cohort Batch</p>
          </div>
        );
      },
    },
    {
      header: "Pricing",
      align: "center",
      cell: (course) => (
        <div className="text-center">
          <Badge
            variant="outline"
            className={
              course.pricingType === "FREE"
                ? "bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs font-semibold"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold"
            }
          >
            {course.pricingType === "FREE" ? "Free" : `$${Number(course.price).toFixed(2)}`}
          </Badge>
          <p className="text-[10px] text-neutral-400">{course.level}</p>
        </div>
      ),
    },
    {
      header: "Status",
      align: "center",
      cell: (course) => {
        switch (course.status) {
          case "PUBLISHED":
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                Live & Listed
              </Badge>
            );
          case "ARCHIVED":
            return (
              <Badge variant="outline" className="bg-neutral-500/10 text-neutral-500 border-neutral-500/20 text-xs">
                Archived
              </Badge>
            );
          case "DRAFT":
          default:
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                Published
              </Badge>
            );
        }
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (course) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Details / Overview */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/teachers/courses/${course.id}`)}
            className="h-8 px-2 text-xs text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
            title="View Course Details"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Overview
          </Button>

          {/* Curriculum Builder Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/teachers/courses/${course.id}/curriculum`)}
            className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
            title="Open Curriculum Builder"
          >
            <Layers className="w-3.5 h-3.5 mr-1" />
            Curriculum
          </Button>

          {/* Edit Details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCourseToEdit(course);
              setIsCreateModalOpen(true);
            }}
            className="h-8 px-2 text-xs text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
            title="Edit Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          {/* Delete / Archive */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCourseToDelete(course)}
            className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
            title="Archive Course"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTableTemplate<Course>
        badge={{
          icon: GraduationCap,
          label: "Instructor Course Studio",
        }}
        title="My Courses & Curriculums"
        description="Design live cohort courses, manage module topics, and publish directly to the global student catalog."
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
                setCourseToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="text-xs h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Course
            </Button>
          </div>
        }
        metrics={metricsCards}
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search courses by title, slug, or keywords..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        sortOptions={sortOptions}
        currentSort={sortOption}
        onSortChange={setSortOption}
        columns={columns}
        data={paginatedCourses}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        emptyState={{
          icon: BookOpen,
          title: "No Courses Found",
          description: "Start creating your first course to build curriculum modules and share your knowledge.",
        }}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredCourses.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialCourse={courseToEdit}
        onSuccess={() => refetch()}
      />

      {/* Archive / Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        actionType="delete"
        title={`Archive "${courseToDelete?.title}"?`}
        description="This will unpublish the course and move it to your archives."
        confirmText="Archive Course"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (courseToDelete) {
            await deleteMutation.mutateAsync(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default TeacherCoursesPage;
