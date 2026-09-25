import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Power,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  IndianRupee,
  Copy,
  Check,
  Users,
  Sparkles,
  BookOpen,
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
import { useMyCoupons, useDeleteCoupon, useUpdateCoupon } from "../hooks/use-coupons";
import { useTeacherCourses } from "@/features/course/hooks/useCourses";
import { TeacherCouponFormModal } from "../components/TeacherCouponFormModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { toast } from "@/lib/toast";
import { useDebounce } from "@/hooks/use-debounce";
import type { TeacherCoupon } from "../types/coupon.types";

export const TeacherCouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: coupons = [], isLoading, refetch } = useMyCoupons();
  const { data: coursesData } = useTeacherCourses({ limit: 100 });
  const teacherCourses = coursesData?.items || [];

  const deleteMutation = useDeleteCoupon();
  const updateMutation = useUpdateCoupon();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<TeacherCoupon | null>(null);
  const [couponToToggle, setCouponToToggle] = useState<TeacherCoupon | null>(null);
  const [couponToSoftDelete, setCouponToSoftDelete] = useState<TeacherCoupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(
      (c) => c.isActive && !(c.expiresAt && new Date(c.expiresAt).getTime() < Date.now())
    ).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const totalDiscountGiven = coupons.reduce((sum, c) => sum + (c.totalDiscountGiven || 0), 0);

    return {
      totalCoupons,
      activeCoupons,
      totalRedemptions,
      totalDiscountGiven,
    };
  }, [coupons]);

  // Metric Cards
  const metricCards: TableMetricCard[] = useMemo(() => {
    return [
      {
        label: "Total Coupons",
        val: metrics.totalCoupons,
        icon: Tag,
        color: "text-[#F42A18]",
        change: `${metrics.activeCoupons} active coupons`,
      },
      {
        label: "Active & Live",
        val: metrics.activeCoupons,
        icon: CheckCircle2,
        color: "text-emerald-500",
        change: "Redeemable at checkout",
      },
      {
        label: "Total Redemptions",
        val: metrics.totalRedemptions,
        icon: Users,
        color: "text-blue-500",
        change: "Enrolled students",
      },
      {
        label: "Total Tuition Saved",
        val: `₹${metrics.totalDiscountGiven.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        icon: IndianRupee,
        color: "text-amber-500",
        change: "Direct student savings",
      },
    ];
  }, [metrics]);

  // Tab Options
  const tabOptions: TableTabOption[] = useMemo(() => {
    const activeCount = coupons.filter(
      (c) => c.isActive && !(c.expiresAt && new Date(c.expiresAt).getTime() < Date.now())
    ).length;
    const inactiveCount = coupons.filter((c) => !c.isActive).length;
    const expiredCount = coupons.filter(
      (c) => Boolean(c.expiresAt && new Date(c.expiresAt).getTime() < Date.now())
    ).length;

    return [
      { key: "all", label: "All Coupons", count: coupons.length },
      { key: "active", label: "Active", count: activeCount },
      { key: "inactive", label: "Inactive", count: inactiveCount },
      { key: "expired", label: "Expired", count: expiredCount },
    ];
  }, [coupons]);

  // Dropdown Filters
  const dropdownFilters: TableDropdownFilter[] = useMemo(() => {
    return [
      {
        key: "discountType",
        label: "Discount Type",
        value: discountTypeFilter,
        options: [
          { value: "all", label: "All Discount Types" },
          { value: "PERCENTAGE", label: "Percentage (%) Off" },
          { value: "FLAT", label: "Flat Amount (₹) Off" },
        ],
        onChange: (val) => {
          setDiscountTypeFilter(val);
          setCurrentPage(1);
        },
      },
      {
        key: "courseFilter",
        label: "Course Scope",
        value: courseFilter,
        options: [
          { value: "all", label: "All Course Scopes" },
          { value: "GLOBAL", label: "✨ All My Courses (Global)" },
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
    ];
  }, [discountTypeFilter, courseFilter, teacherCourses]);

  const sortOptions: TableSortOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "most-used", label: "Most Redemptions" },
    { value: "highest-discount", label: "Highest Discount Value" },
  ];

  // Filtered and Sorted Data
  const filteredCoupons = useMemo(() => {
    let list = coupons.filter((c) => {
      // 1. Search Query
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesDesc = (c.description || "").toLowerCase().includes(q);
        const matchesCourse = (c.courseTitle || "").toLowerCase().includes(q);
        if (!matchesCode && !matchesDesc && !matchesCourse) return false;
      }

      // 2. Status Tab
      const isExpired = Boolean(c.expiresAt && new Date(c.expiresAt).getTime() < Date.now());
      if (activeTab === "active") {
        if (!c.isActive || isExpired) return false;
      } else if (activeTab === "inactive") {
        if (c.isActive) return false;
      } else if (activeTab === "expired") {
        if (!isExpired) return false;
      }

      // 3. Discount Type Filter
      if (discountTypeFilter !== "all" && c.discountType !== discountTypeFilter) {
        return false;
      }

      // 4. Course Scope Filter
      if (courseFilter !== "all") {
        if (courseFilter === "GLOBAL" && c.courseId !== null) return false;
        if (courseFilter !== "GLOBAL" && c.courseId !== courseFilter) return false;
      }

      return true;
    });

    // Sort
    list.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === "most-used") {
        return (b.usedCount || 0) - (a.usedCount || 0);
      }
      if (sortOption === "highest-discount") {
        return b.discountValue - a.discountValue;
      }
      return 0;
    });

    return list;
  }, [coupons, debouncedSearch, activeTab, discountTypeFilter, courseFilter, sortOption]);

  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCoupons.slice(start, start + pageSize);
  }, [filteredCoupons, currentPage, pageSize]);

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleConfirmToggleStatus = async () => {
    if (!couponToToggle) return;
    try {
      await updateMutation.mutateAsync({
        id: couponToToggle.id,
        payload: { isActive: !couponToToggle.isActive },
      });
      toast.success(
        `Coupon "${couponToToggle.code}" is now ${!couponToToggle.isActive ? "Active and live" : "Deactivated / Inactive"}`
      );
      setCouponToToggle(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update coupon status");
    }
  };

  const handleConfirmSoftDelete = async () => {
    if (!couponToSoftDelete) return;
    try {
      await deleteMutation.mutateAsync(couponToSoftDelete.id);
      toast.success(`Coupon "${couponToSoftDelete.code}" soft-deleted.`);
      setCouponToSoftDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to soft delete coupon");
    }
  };

  // Columns definition
  const columns: TableColumn<TeacherCoupon>[] = [
    {
      header: "Promo Code",
      cell: (item: TeacherCoupon) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              onClick={() => navigate(`/teachers/coupons/${item.id}`)}
              className="font-mono font-bold text-xs text-[#F42A18] hover:underline cursor-pointer tracking-wider"
            >
              {item.code}
            </span>
            <button
              type="button"
              onClick={(e) => handleCopyCode(item.code, e)}
              title="Copy code"
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {copiedCode === item.code ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          {item.description && (
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate max-w-[200px]">
              {item.description}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Course Scope",
      cell: (item: TeacherCoupon) => (
        <div className="space-y-0.5 max-w-[180px]">
          <span className="text-xs font-semibold text-neutral-900 dark:text-white block truncate">
            {item.courseTitle || "All My Courses"}
          </span>
          <Badge
            variant="outline"
            className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[9px] py-0 px-1.5 border-0"
          >
            {item.courseId ? "Course Specific" : "✨ All Courses (Global)"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Discount",
      cell: (item: TeacherCoupon) => (
        <div className="space-y-0.5">
          <Badge className="bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20 font-bold text-[11px]">
            {item.discountType === "PERCENTAGE"
              ? `${item.discountValue}% OFF`
              : `₹${item.discountValue} FLAT OFF`}
          </Badge>
          {item.maxDiscountAmount && (
            <span className="text-[10px] text-neutral-400 block">
              Cap: ₹{item.maxDiscountAmount}
            </span>
          )}
          {item.minOrderAmount && (
            <span className="text-[10px] text-neutral-400 block">
              Min: ₹{item.minOrderAmount}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Redemptions",
      cell: (item: TeacherCoupon) => (
        <div className="space-y-1 min-w-[110px]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-neutral-900 dark:text-white font-mono">
              {item.usedCount} used
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {item.maxUses ? `/ ${item.maxUses}` : "(unlimited)"}
            </span>
          </div>
          {item.maxUses && (
            <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-[#F42A18] rounded-full"
                style={{ width: `${Math.min(100, (item.usedCount / item.maxUses) * 100)}%` }}
              />
            </div>
          )}
          <span className="text-[10px] text-neutral-400 block">
            Saved: ₹{(item.totalDiscountGiven || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
          </span>
        </div>
      ),
    },
    {
      header: "Validity",
      cell: (item: TeacherCoupon) => {
        const isExpired = Boolean(item.expiresAt && new Date(item.expiresAt).getTime() < Date.now());
        return (
          <div className="space-y-0.5 text-xs">
            <span className="text-neutral-600 dark:text-neutral-300 block">
              {item.expiresAt
                ? new Date(item.expiresAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Evergreen (No expiry)"}
            </span>
            {item.expiresAt && (
              <span className={`text-[10px] block ${isExpired ? "text-red-500 font-bold" : "text-neutral-400"}`}>
                {isExpired ? "Expired" : "Active until expiry"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (item: TeacherCoupon) => {
        const isExpired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false;
        if (!item.isActive) {
          return (
            <Badge className="bg-neutral-500/10 text-neutral-500 border border-neutral-500/20 text-[11px] flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Inactive
            </Badge>
          );
        }
        if (isExpired) {
          return (
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expired
            </Badge>
          );
        }
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (item: TeacherCoupon) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/teachers/coupons/${item.id}`)}
            className="h-8 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1 hover:text-[#F42A18] hover:border-[#F42A18]/30"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCouponToToggle(item)}
            title={item.isActive ? "Deactivate coupon" : "Activate coupon"}
            disabled={updateMutation.isPending}
            className={`h-8 w-8 p-0 rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer ${
              item.isActive
                ? "hover:text-amber-600 hover:border-amber-500/30 text-emerald-600"
                : "hover:text-emerald-600 hover:border-emerald-500/30 text-neutral-400"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingCoupon(item);
              setIsFormModalOpen(true);
            }}
            title="Edit coupon"
            className="h-8 w-8 p-0 rounded-xl border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white cursor-pointer text-neutral-400"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCouponToSoftDelete(item)}
            title="Soft delete coupon"
            disabled={deleteMutation.isPending}
            className="h-8 w-8 p-0 rounded-xl border-neutral-200 dark:border-neutral-800 hover:text-red-600 hover:border-red-500/30 cursor-pointer text-neutral-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col w-full text-left">
      <DataTableTemplate<TeacherCoupon>
        badge={{
          icon: Tag,
          label: "Course Promotions",
        }}
        title="Course Promo Coupons"
        description="Create, track, and manage promotional discount codes for your live cohort courses."
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => {
                setEditingCoupon(null);
                setIsFormModalOpen(true);
              }}
              className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-bold gap-1.5 px-4 py-2 shadow-md shadow-[#F42A18]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </Button>
          </div>
        }
        data={paginatedCoupons}
        columns={columns}
        isLoading={isLoading}
        metrics={metricCards}
        searchPlaceholder="Search by coupon code, description, or course..."
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
        keyExtractor={(item: TeacherCoupon) => item.id}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredCoupons.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size: number) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        emptyState={{
          title: coupons.length === 0 ? "No coupons created yet" : "No matching coupons found",
          description:
            coupons.length === 0
              ? "Create promotional coupon codes to offer limited-time tuition discounts for your students."
              : "No coupons match the selected filters or search query. Try adjusting your search criteria.",
          icon: Tag,
          action:
            coupons.length === 0
              ? {
                  label: "Create Your First Coupon",
                  onClick: () => {
                    setEditingCoupon(null);
                    setIsFormModalOpen(true);
                  },
                }
              : undefined,
        }}
      />

      {/* Create / Edit Coupon Modal */}
      <TeacherCouponFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCoupon(null);
        }}
        coupon={editingCoupon}
      />

      {/* Toggle Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(couponToToggle)}
        onClose={() => setCouponToToggle(null)}
        onConfirm={handleConfirmToggleStatus}
        title={
          couponToToggle?.isActive
            ? `Deactivate Coupon "${couponToToggle?.code}"?`
            : `Activate Coupon "${couponToToggle?.code}"?`
        }
        description={
          couponToToggle?.isActive
            ? `Deactivating coupon "${couponToToggle?.code}" will prevent students from applying it during course checkout. Existing enrollments and records will remain completely safe.`
            : `Activating coupon "${couponToToggle?.code}" will make it immediately active and redeemable by students during course checkout.`
        }
        confirmText={couponToToggle?.isActive ? "Yes, Deactivate" : "Yes, Activate"}
        cancelText="Cancel"
        variant={couponToToggle?.isActive ? "warning" : "success"}
        isLoading={updateMutation.isPending}
      />

      {/* Soft Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(couponToSoftDelete)}
        onClose={() => setCouponToSoftDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="Deactivate / Soft-Delete Coupon"
        description={`Are you sure you want to soft-delete coupon "${couponToSoftDelete?.code}"? It will be marked inactive and can no longer be used by students during checkout, but all existing student redemptions and enrollment records will be safely preserved.`}
        confirmText="Yes, Soft Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default TeacherCouponsPage;
