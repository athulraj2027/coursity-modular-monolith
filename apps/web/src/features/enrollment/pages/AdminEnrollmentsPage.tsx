import React, { useState } from "react";
import {
  GraduationCap,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
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
import { useAdminEnrollments } from "../hooks/use-enrollment";
import { AdminEnrollmentDetailDrawer } from "../components/AdminEnrollmentDetailDrawer";
import type { CourseEnrollment, EnrollmentStatus } from "../types/enrollment.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminEnrollmentsPage: React.FC = () => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Enrollment for Drawer Inspection
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  // Query
  const { data, isLoading, refetch } = useAdminEnrollments({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: activeTab !== "all" ? activeTab : undefined,
    paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
    sortBy: sortOption === "amount-desc" ? "finalAmount" : "createdAt",
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
      label: "Platform Course Gross GMV",
      val: `₹${metrics.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      change: "Net platform tuition revenue",
    },
    {
      label: "Total Enrolled Students",
      val: metrics.totalEnrollments,
      icon: GraduationCap,
      color: "text-blue-500",
      change: `${metrics.activeEnrollments} active, ${metrics.completedEnrollments} graduated`,
    },
    {
      label: "20-Day Refunds Processed",
      val: metrics.refundedEnrollments,
      icon: ShieldAlert,
      color: "text-amber-500",
      change: `₹${metrics.totalRefundedAmount.toLocaleString()} refunded under guarantee`,
    },
    {
      label: "Teacher Coupon Savings",
      val: `₹${metrics.totalDiscounts.toLocaleString()}`,
      icon: Tag,
      color: "text-purple-500",
      change: "Student discounts via promo codes",
    },
  ];

  // Tab Options
  const tabOptions: TableTabOption[] = [
    { key: "all", label: "All Enrollments", count: metrics.totalEnrollments },
    { key: "ACTIVE", label: "Active", count: metrics.activeEnrollments },
    { key: "COMPLETED", label: "Completed", count: metrics.completedEnrollments },
    { key: "REFUNDED", label: "Refunded", count: metrics.refundedEnrollments },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  const dropdownFilters: TableDropdownFilter[] = [
    {
      key: "paymentMethod",
      label: "Payment Method",
      value: paymentMethodFilter,
      options: [
        { value: "all", label: "All Payment Methods" },
        { value: "RAZORPAY", label: "Razorpay Gateway" },
        { value: "WALLET", label: "Platform Wallet" },
        { value: "FREE", label: "100% Free" },
      ],
      onChange: (val) => {
        setPaymentMethodFilter(val);
        setCurrentPage(1);
      },
    },
  ];

  const sortOptions: TableSortOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "amount-desc", label: "Tuition Amount: High to Low" },
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
      header: "Student",
      cell: (item: CourseEnrollment) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-xs overflow-hidden shrink-0">
            {item.studentName?.charAt(0).toUpperCase() || "S"}
          </div>
          <div className="space-y-0.5 max-w-[170px]">
            <span
              onClick={() => setSelectedEnrollmentId(item.id)}
              className="font-bold text-xs text-neutral-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer block truncate"
            >
              {item.studentName || "Student"}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
              {item.studentEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Course & Cohort",
      cell: (item: CourseEnrollment) => (
        <div className="space-y-0.5 max-w-[200px]">
          <span className="font-semibold text-xs text-neutral-900 dark:text-white block truncate">
            {item.courseTitle}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <span>By {item.instructorName}</span>
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
      header: "Financials & Payment",
      cell: (item: CourseEnrollment) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              ₹{item.finalAmount.toLocaleString()}
            </span>
            {item.discountAmount > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] py-0 px-1">
                -₹{item.discountAmount.toLocaleString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <span>{item.paymentMethod}</span>
            {item.invoiceNumber && <span className="font-mono text-[10px]">({item.invoiceNumber})</span>}
          </div>
        </div>
      ),
    },
    {
      header: "20-Day Refund Policy",
      cell: (item: CourseEnrollment) => {
        if (item.status === "REFUNDED") {
          return (
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px]">
              100% Refunded
            </Badge>
          );
        }
        const deadline = new Date(item.refundEligibleUntil);
        const isEligible = deadline > new Date();
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              {isEligible ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                  Eligible
                </Badge>
              ) : (
                <Badge className="bg-neutral-500/10 text-neutral-500 text-[10px]">
                  Window Closed
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 block">
              Until {deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        );
      },
    },
    {
      header: "Progress & Attendance",
      cell: (item: CourseEnrollment) => (
        <div className="space-y-1.5 min-w-[130px]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {Math.round(item.progressPercentage)}%
            </span>
            <span className="text-[10px] text-neutral-400">
              {item.attendedClassesCount} live attended
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
            />
          </div>
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
            onClick={() => setSelectedEnrollmentId(item.id)}
            className="h-8 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1 hover:text-emerald-600 hover:border-emerald-500/30"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Audit</span>
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
          label: "Admin Academics & Enrollments",
        }}
        title="Student Course Enrollments"
        description="Monitor student live cohort enrollments, payments, 20-Day Refund Guarantee compliance, and curriculum attendance."
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
        searchPlaceholder="Search by student name, email, course title, invoice #, or coupon..."
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
          title: "No enrollments found",
          description: "No course enrollments match the selected filters or search query.",
          icon: GraduationCap,
        }}
      />

      {/* Slide-over Inspection Drawer */}
      {selectedEnrollmentId && (
        <AdminEnrollmentDetailDrawer
          enrollmentId={selectedEnrollmentId}
          onClose={() => setSelectedEnrollmentId(null)}
        />
      )}
    </div>
  );
};

export default AdminEnrollmentsPage;
