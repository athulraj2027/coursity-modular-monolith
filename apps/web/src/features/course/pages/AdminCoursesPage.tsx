import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  RefreshCw,
  Trash2,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Flame,
  Star,
  EyeOff,
  Eye,
  Snowflake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
  type TableTabOption,
  type TableDropdownFilter,
  type TableSortOption,
} from "@/components/common/DataTableTemplate";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { AdminCourseReasonModal } from "../components/AdminCourseReasonModal";
import { useAdminCategories } from "@/features/categories";
import {
  useAdminCourses,
  useAdminCourseMetrics,
  useAdminToggleFeaturedCourse,
  useAdminToggleTrendingCourse,
  useAdminDelistCourse,
  useAdminFreezeCourse,
  useAdminUnfreezeCourse,
  useAdminRestoreCourse,
  useAdminHardDeleteCourse,
} from "../hooks/useCourses";
import type { Course } from "../types/course.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: coursesData, isLoading, refetch } = useAdminCourses({
    includeDeleted: true,
    limit: 150,
  });
  const { data: metrics } = useAdminCourseMetrics();
  const { data: categoriesData } = useAdminCategories({ isDeleted: false, limit: 100 });

  const toggleFeaturedMutation = useAdminToggleFeaturedCourse();
  const toggleTrendingMutation = useAdminToggleTrendingCourse();
  const delistMutation = useAdminDelistCourse();
  const freezeMutation = useAdminFreezeCourse();
  const unfreezeMutation = useAdminUnfreezeCourse();
  const restoreMutation = useAdminRestoreCourse();
  const hardDeleteMutation = useAdminHardDeleteCourse();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("created-desc");

  // Modals state
  const [reasonModalAction, setReasonModalAction] = useState<"delist" | "freeze" | null>(null);
  const [courseForReasonModal, setCourseForReasonModal] = useState<Course | null>(null);
  const [courseToUnfreeze, setCourseToUnfreeze] = useState<Course | null>(null);
  const [courseToRestore, setCourseToRestore] = useState<Course | null>(null);
  const [courseToHardDelete, setCourseToHardDelete] = useState<Course | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const allCourses = useMemo(() => coursesData?.items || [], [coursesData]);
  const categoriesList = useMemo(() => categoriesData?.items || [], [categoriesData]);

  // Metrics Bar
  const metricsCards: TableMetricCard[] = useMemo(() => {
    return [
      {
        label: "Total Platform Courses",
        val: metrics?.total ?? allCourses.length,
        icon: BookOpen,
        color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Live on Platform",
        val: metrics?.published ?? allCourses.filter((c) => !c.isDeleted && !c.isFrozen && c.status !== "FROZEN").length,
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "Frozen Cohorts",
        val: metrics?.frozen ?? allCourses.filter((c) => !c.isDeleted && (c.isFrozen || c.status === "FROZEN")).length,
        icon: Snowflake,
        color: "text-sky-600 bg-sky-500/10 border-sky-500/20",
      },
      {
        label: "Featured Highlights",
        val: metrics?.featured ?? allCourses.filter((c) => c.isFeatured && !c.isDeleted).length,
        icon: Star,
        color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      },
      {
        label: "Delisted / Archived",
        val: (metrics?.archived ?? 0) || allCourses.filter((c) => c.isDeleted).length,
        icon: Trash2,
        color: "text-red-600 bg-red-500/10 border-red-500/20",
      },
    ];
  }, [metrics, allCourses]);

  // Tab Options
  const tabOptions: TableTabOption[] = useMemo(() => {
    const activeNonDeleted = allCourses.filter((c) => !c.isDeleted);
    const liveListed = activeNonDeleted.filter((c) => !c.isFrozen && c.status !== "FROZEN");
    const frozen = activeNonDeleted.filter((c) => c.isFrozen || c.status === "FROZEN");
    const featured = activeNonDeleted.filter((c) => c.isFeatured);
    const freeCourses = activeNonDeleted.filter((c) => c.pricingType === "FREE");
    const paidCourses = activeNonDeleted.filter((c) => c.pricingType === "PAID");
    const archived = allCourses.filter((c) => c.isDeleted);

    return [
      { key: "all", label: "All Active", count: activeNonDeleted.length },
      { key: "live", label: "Live & Listed", count: liveListed.length },
      { key: "frozen", label: "Frozen", count: frozen.length },
      { key: "featured", label: "Featured", count: featured.length },
      { key: "free", label: "Free Courses", count: freeCourses.length },
      { key: "paid", label: "Paid Courses", count: paidCourses.length },
      { key: "archived", label: "Delisted / Archived", count: archived.length },
    ];
  }, [allCourses]);

  // Category Dropdown Filter
  const dropdownFilters: TableDropdownFilter[] = useMemo(() => {
    return [
      {
        key: "category-filter",
        label: "Category Domain",
        value: categoryFilter,
        onChange: setCategoryFilter,
        options: [
          { label: "All Categories", value: "all" },
          ...categoriesList
            .filter((c) => !c.parentId)
            .map((c) => ({ label: c.name, value: c.id })),
        ],
      },
    ];
  }, [categoryFilter, categoriesList]);

  const sortOptions: TableSortOption[] = [
    { label: "Recently Created", value: "created-desc" },
    { label: "Title (A - Z)", value: "title-asc" },
    { label: "Most Lessons", value: "lessons-desc" },
    { label: "Price (High to Low)", value: "price-desc" },
  ];

  // Filter and Sort Processing
  const filteredCourses = useMemo(() => {
    let result = [...allCourses];

    if (activeTab === "archived") {
      result = result.filter((c) => c.isDeleted);
    } else {
      result = result.filter((c) => !c.isDeleted);
      if (activeTab === "live") {
        result = result.filter((c) => !c.isFrozen && c.status !== "FROZEN");
      } else if (activeTab === "frozen") {
        result = result.filter((c) => c.isFrozen || c.status === "FROZEN");
      } else if (activeTab === "featured") {
        result = result.filter((c) => c.isFeatured);
      } else if (activeTab === "free") {
        result = result.filter((c) => c.pricingType === "FREE");
      } else if (activeTab === "paid") {
        result = result.filter((c) => c.pricingType === "PAID");
      }
    }

    if (categoryFilter !== "all") {
      result = result.filter((c) => c.categoryId === categoryFilter);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.teacherProfile?.profile?.user?.name &&
            c.teacherProfile.profile.user.name.toLowerCase().includes(q)) ||
          (c.category?.name && c.category.name.toLowerCase().includes(q))
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
  }, [allCourses, activeTab, categoryFilter, debouncedSearch, sortOption]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  // Columns definition
  const columns: TableColumn<Course>[] = [
    {
      header: "Course & Category",
      cell: (course) => (
        <div
          onClick={() => navigate(`/admin/courses/${course.id}`)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-9 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:ring-2 group-hover:ring-[#F42A18]/30 transition-all">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-5 h-5 text-neutral-400" />
            )}
          </div>
          <div className="space-y-0.5 max-w-[260px]">
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs truncate group-hover:text-[#F42A18] transition-colors">
                {course.title}
              </h4>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 truncate">
              <span>{course.category?.name || "General"}</span>
              {course.subcategory && <span>• {course.subcategory.name}</span>}
              {course.startingDate && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  • Starts{" "}
                  {new Date(course.startingDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Instructor",
      cell: (course) => {
        const teacherUser = course.teacherProfile?.profile?.user;
        return (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {teacherUser?.name || "Instructor"}
            </p>
            <p className="text-[11px] text-neutral-500 truncate max-w-[150px]">
              {teacherUser?.email || "—"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Curriculum",
      align: "center",
      cell: (course) => (
        <div className="space-y-0.5">
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
            {course.totalModules} modules • {course.totalLessons} lessons
          </span>
          <p className="text-[10px] text-neutral-400 font-mono">
            {Math.round(course.totalDurationSeconds / 60)} mins
          </p>
        </div>
      ),
    },
    {
      header: "Price",
      align: "center",
      cell: (course) => (
        <Badge
          variant="outline"
          className={
            course.pricingType === "FREE"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-mono"
              : "bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-mono"
          }
        >
          {course.pricingType === "FREE" ? "Free" : `₹${Number(course.price).toLocaleString()}`}
        </Badge>
      ),
    },
    {
      header: "Status",
      align: "center",
      cell: (course) => {
        const isFrozen = course.isFrozen || course.status === "FROZEN";
        if (course.isDeleted) {
          return (
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-xs font-medium">
              Delisted / Archived
            </Badge>
          );
        }
        if (isFrozen) {
          return (
            <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-xs font-medium flex items-center gap-1">
              <Snowflake className="w-3 h-3 text-sky-500" />
              Frozen by Admin
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1 inline" />
            Live & Listed
          </Badge>
        );
      },
    },
    {
      header: "Highlights",
      align: "center",
      cell: (course) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() =>
              toggleFeaturedMutation.mutate({ id: course.id, isFeatured: !course.isFeatured })
            }
            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
              course.isFeatured
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600"
            }`}
            title="Toggle Featured on Homepage"
          >
            <Star className={`w-3.5 h-3.5 ${course.isFeatured ? "fill-amber-500" : ""}`} />
          </button>
          <button
            onClick={() =>
              toggleTrendingMutation.mutate({ id: course.id, isTrending: !course.isTrending })
            }
            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
              course.isTrending
                ? "bg-red-500/10 border-red-500/30 text-red-600"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600"
            }`}
            title="Toggle Trending"
          >
            <Flame className={`w-3.5 h-3.5 ${course.isTrending ? "fill-red-500" : ""}`} />
          </button>
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (course) => {
        const isFrozen = course.isFrozen || course.status === "FROZEN";
        const hasStarted = Boolean(course.startingDate && new Date(course.startingDate).getTime() <= Date.now());

        if (course.isDeleted) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/courses/${course.id}`)}
                className="h-8 px-2.5 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] hover:text-[#F42A18] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCourseToRestore(course)}
                className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-500/20 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Relist Course
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCourseToHardDelete(course)}
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                title="Purge Permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        }

        if (isFrozen) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/courses/${course.id}`)}
                className="h-8 px-2.5 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] hover:text-[#F42A18] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCourseToUnfreeze(course)}
                className="h-8 px-2.5 text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 border-sky-500/20 rounded-xl cursor-pointer"
              >
                <Snowflake className="w-3.5 h-3.5 mr-1" />
                Unfreeze
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/courses/${course.id}`)}
              className="h-8 px-2.5 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] hover:text-[#F42A18] cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Details
            </Button>
            {hasStarted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReasonModalAction("freeze");
                  setCourseForReasonModal(course);
                }}
                className="h-8 px-2.5 text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 border-sky-500/20 rounded-xl cursor-pointer"
                title="Freeze In-Progress Course"
              >
                <Snowflake className="w-3.5 h-3.5 mr-1" />
                Freeze
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReasonModalAction("delist");
                  setCourseForReasonModal(course);
                }}
                className="h-8 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-500/20 rounded-xl cursor-pointer"
                title="Delist Unstarted Course"
              >
                <EyeOff className="w-3.5 h-3.5 mr-1" />
                Delist
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <DataTableTemplate<Course>
        badge={{
          icon: GraduationCap,
          label: "Platform Catalog Moderation",
        }}
        title="Platform Course Directory"
        description="Audit live courses across the platform, feature top cohorts, freeze active cohorts, or delist unstarted courses with instant instructor notifications."
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
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search courses by title, slug, instructor, or category..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        dropdownFilters={dropdownFilters}
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
          description: "No courses match the active filters or search criteria.",
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

      {/* Delist or Freeze with Reason Modal */}
      {reasonModalAction && courseForReasonModal && (
        <AdminCourseReasonModal
          isOpen={Boolean(reasonModalAction && courseForReasonModal)}
          action={reasonModalAction}
          course={courseForReasonModal}
          isLoading={delistMutation.isPending || freezeMutation.isPending}
          onClose={() => {
            setReasonModalAction(null);
            setCourseForReasonModal(null);
          }}
          onConfirm={async (reason) => {
            if (reasonModalAction === "delist") {
              await delistMutation.mutateAsync({ id: courseForReasonModal.id, reason });
            } else {
              await freezeMutation.mutateAsync({ id: courseForReasonModal.id, reason });
            }
            setReasonModalAction(null);
            setCourseForReasonModal(null);
            refetch();
          }}
        />
      )}

      {/* Unfreeze Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(courseToUnfreeze)}
        onClose={() => setCourseToUnfreeze(null)}
        actionType="save"
        title={`Unfreeze "${courseToUnfreeze?.title}"?`}
        description="This course will be returned to active live status. The instructor will regain curriculum editing and lecture management access."
        confirmText="Unfreeze Course"
        variant="success"
        isLoading={unfreezeMutation.isPending}
        onConfirm={async () => {
          if (courseToUnfreeze) {
            await unfreezeMutation.mutateAsync(courseToUnfreeze.id);
            setCourseToUnfreeze(null);
            refetch();
          }
        }}
      />

      {/* Relist Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(courseToRestore)}
        onClose={() => setCourseToRestore(null)}
        actionType="save"
        title={`Relist "${courseToRestore?.title}"?`}
        description="The course will be restored and listed live on the student catalog immediately."
        confirmText="Relist Course"
        variant="success"
        isLoading={restoreMutation.isPending}
        onConfirm={async () => {
          if (courseToRestore) {
            await restoreMutation.mutateAsync(courseToRestore.id);
            setCourseToRestore(null);
            refetch();
          }
        }}
      />

      {/* Hard Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(courseToHardDelete)}
        onClose={() => setCourseToHardDelete(null)}
        actionType="delete"
        title={`Permanently Purge "${courseToHardDelete?.title}"?`}
        description="This action is destructive and irreversible. All curriculum modules and lessons will be permanently deleted."
        confirmText="Purge Course"
        variant="danger"
        isLoading={hardDeleteMutation.isPending}
        onConfirm={async () => {
          if (courseToHardDelete) {
            await hardDeleteMutation.mutateAsync(courseToHardDelete.id);
            setCourseToHardDelete(null);
            refetch();
          }
        }}
      />
    </div>
  );
};

export default AdminCoursesPage;

