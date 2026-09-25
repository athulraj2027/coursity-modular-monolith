import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  TrendingUp,
  CreditCard,
  Tag,
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  IndianRupee,
  Users,
  BookOpen,
  User,
  ShieldAlert,
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
import { useTeacherEnrollments } from "../hooks/use-enrollment";
import { useTeacherCourses } from "@/features/course/hooks/useCourses";
import type { CourseEnrollment, EnrollmentStatus } from "../types/enrollment.types";
import { useDebounce } from "@/hooks/use-debounce";

export const TeacherEnrollmentsPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Queries
  const { data: coursesData } = useTeacherCourses({ limit: 100 });
  const teacherCourses = coursesData?.items || [];

  const { data, isLoading, refetch } = useTeacherEnrollments({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: activeTab !== "all" ? activeTab : undefined,
    courseId: courseFilter !== "all" ? courseFilter : undefined,
    paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
    sortBy:
      sortOption === "progress-desc"
        ? "progressPercentage"
        : sortOption === "amount-desc"
        ? "finalAmount"
        : "createdAt",
    sortOrder: sortOption === "oldest" ? "asc" : "desc",
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const metrics = data?.metrics || {
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    refundedEnrollments: 0,
    totalRevenue: 0,
    totalRefundedAmount: 0,
    totalDiscounts: 0,
  };

  // Metrics Cards
  const metricCards: TableMetricCard[] = [
    {
      label: "Total Students Enrolled",
      val: metrics.totalEnrollments,
      icon: GraduationCap,
      color: "text-[#F42A18]",
      change: `${metrics.activeEnrollments} active cohort learners`,
    },
    {
      label: "Active Cohort Learners",
      val: metrics.activeEnrollments,
      icon: CheckCircle2,
      color: "text-emerald-500",
      change: "Currently attending live lessons",
    },
    {
      label: "Graduated / Completed",
      val: metrics.completedEnrollments,
      icon: Sparkles,
      color: "text-blue-500",
      change: "Earned completion certificate",
    },
    {
      label: "Total Tuition Collected",
      val: `₹${metrics.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: IndianRupee,
      color: "text-amber-500",
      change: `₹${metrics.totalDiscounts.toLocaleString()} coupon discounts applied`,
    },
  ];

  // Tab Options
  const tabOptions: TableTabOption[] = [
    { key: "all", label: "All Students", count: metrics.totalEnrollments },
    { key: "ACTIVE", label: "Active Learners", count: metrics.activeEnrollments },
    { key: "COMPLETED", label: "Graduated", count: metrics.completedEnrollments },
    { key: "REFUNDED", label: "Refunded", count: metrics.refundedEnrollments },
  ];

  // Dropdown Filters
  const dropdownFilters: TableDropdownFilter[] = useMemo(() => {
    return [
      {
        key: "courseFilter",
        label: "Course Cohort",
        value: courseFilter,
        options: [
          { value: "all", label: "All My Courses" },
          ...teacherCourses.map((c) => ({
            value: c.id,
            label: c.title.length > 30 ? `${c.title.substring(0, 30)}...` : c.title,
          })),
        ],
        onChange: (val) => {
          setCourseFilter(val);
          setCurrentPage(1);
        },
      },
      {
        key: "paymentMethod",
        label: "Payment Method",
        value: paymentMethodFilter,
        options: [
          { value: "all", label: "All Payment Methods" },
          { value: "RAZORPAY", label: "Razorpay / Cards / UPI" },
          { value: "WALLET", label: "Student Wallet" },
          { value: "FREE", label: "100% Free Enrollment" },
        ],
        onChange: (val) => {
          setPaymentMethodFilter(val);
          setCurrentPage(1);
        },
      },
    ];
  }, [courseFilter, paymentMethodFilter, teacherCourses]);

  const sortOptions: TableSortOption[] = [
    { value: "newest", label: "Recently Enrolled" },
    { value: "oldest", label: "Oldest Enrolled" },
    { value: "progress-desc", label: "Highest Progress %" },
    { value: "amount-desc", label: "Tuition Paid: High to Low" },
  ];

  // Status Badge Helper
  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-[11px] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Refunded
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold text-[11px] flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge className="text-[11px]">{status}</Badge>;
    }
  };

  // Table Columns
  const columns: TableColumn<CourseEnrollment>[] = [
    {
      header: "Student Learner",
      cell: (item: CourseEnrollment) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-xs overflow-hidden shrink-0">
            {item.studentAvatar ? (
              <img src={item.studentAvatar} alt={item.studentName || "Student"} className="w-full h-full object-cover" />
            ) : (
              item.studentName?.charAt(0).toUpperCase() || <User className="w-4 h-4 text-neutral-400" />
            )}
          </div>
          <div className="space-y-0.5 max-w-[170px]">
            <span
              onClick={() => navigate(`/teachers/enrollments/${item.id}`)}
              className="font-bold text-xs text-neutral-900 dark:text-white hover:text-[#F42A18] dark:hover:text-[#F42A18] cursor-pointer block truncate"
            >
              {item.studentName || "Student Learner"}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
              {item.studentEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Enrolled Course & Batch",
      cell: (item: CourseEnrollment) => (
        <div className="space-y-0.5 max-w-[210px]">
          <span className="font-semibold text-xs text-neutral-900 dark:text-white block truncate">
            {item.courseTitle}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <span>
              {item.courseStartingDate
                ? `Starts ${new Date(item.courseStartingDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}`
                : "Self-Paced / Flexible"}
            </span>
            {item.courseLevel && (
              <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium uppercase">
                {item.courseLevel}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Tuition & Coupon",
      cell: (item: CourseEnrollment) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
              ₹{item.finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            {item.discountAmount > 0 && (
              <Badge className="bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20 text-[9px] py-0 px-1 font-bold">
                -₹{item.discountAmount.toFixed(0)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            {item.appliedCouponCode ? (
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                🏷️ {item.appliedCouponCode}
              </span>
            ) : (
              <span>{item.paymentMethod}</span>
            )}
            {item.invoiceNumber && (
              <span className="font-mono text-[10px] text-neutral-400">({item.invoiceNumber})</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Learning Progress",
      cell: (item: CourseEnrollment) => (
        <div className="space-y-1.5 min-w-[130px]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
              {Math.round(item.progressPercentage)}%
            </span>
            <span className="text-[10px] text-neutral-400">
              {item.attendedClassesCount} live attended
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-[#F42A18] rounded-full transition-all"
              style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Enrolled Date",
      cell: (item: CourseEnrollment) => (
        <div className="space-y-0.5 text-xs text-neutral-600 dark:text-neutral-300">
          <span>
            {new Date(item.enrolledAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-[10px] text-neutral-400 block font-mono">
            {new Date(item.enrolledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: CourseEnrollment) => getStatusBadge(item.status),
    },
    {
      header: "Actions",
      align: "right",
      cell: (item: CourseEnrollment) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/teachers/enrollments/${item.id}`)}
            className="h-8 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1 hover:text-[#F42A18] hover:border-[#F42A18]/30"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col w-full text-left">
      <DataTableTemplate<CourseEnrollment>
        badge={{
          icon: GraduationCap,
          label: "Student Roster & Enrollments",
        }}
        title="Course Student Enrollments"
        description="Track students enrolled in your courses, live lesson attendance, progress metrics, and payment records."
        headerActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        }
        data={items}
        columns={columns}
        isLoading={isLoading}
        metrics={metricCards}
        searchPlaceholder="Search by student name, email, course title, or invoice #..."
        searchQuery={searchQuery}
        onSearchChange={(q: string) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={(tabKey: string) => {
          setActiveTab(tabKey);
          setCurrentPage(1);
        }}
        dropdownFilters={dropdownFilters}
        sortOptions={sortOptions}
        currentSort={sortOption}
        onSortChange={(val: string) => {
          setSortOption(val);
          setCurrentPage(1);
        }}
        keyExtractor={(item: CourseEnrollment) => item.id}
        pagination={{
          currentPage,
          pageSize,
          totalItems: total,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size: number) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        emptyState={{
          title: "No student enrollments found",
          description: "No student enrollments match the selected filters or search query.",
          icon: GraduationCap,
        }}
      />
    </div>
  );
};

export default TeacherEnrollmentsPage;
