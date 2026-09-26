import React, { useState } from "react";
import {
  Tag,
  Percent,
  TrendingDown,
  Users,
  Copy,
  Eye,
  Power,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
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
import {
  useAdminCoupons,
  useAdminToggleCouponStatus,
  useAdminDeleteCoupon,
} from "../hooks/use-coupons";
import { AdminCouponDetailModal } from "../components/AdminCouponDetailModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import type { TeacherCoupon } from "../types/coupon.types";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "@/lib/toast";

export const AdminCouponsPage: React.FC = () => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Coupon for Details Modal & Confirmations
  const [selectedCoupon, setSelectedCoupon] = useState<TeacherCoupon | null>(null);
  const [couponToToggle, setCouponToToggle] = useState<TeacherCoupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<TeacherCoupon | null>(null);

  // Queries & Mutations
  const { data, isLoading, refetch } = useAdminCoupons({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    isActive: activeTab === "all" ? undefined : activeTab === "active",
    discountType: discountTypeFilter !== "all" ? discountTypeFilter : undefined,
    sortBy: sortOption === "most-used" ? "usedCount" : "createdAt",
    sortOrder: sortOption === "oldest" ? "asc" : "desc",
  });

  const toggleStatusMutation = useAdminToggleCouponStatus();
  const deleteMutation = useAdminDeleteCoupon();

  const items = data?.items || [];
  const total = data?.total || 0;
  const metrics = data?.metrics || {
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    totalDiscountGiven: 0,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Coupon code "${text}" copied!`);
  };

  const handleConfirmToggle = async () => {
    if (!couponToToggle) return;
    try {
      await toggleStatusMutation.mutateAsync({
        id: couponToToggle.id,
        isActive: !couponToToggle.isActive,
      });
      toast.success(
        `Coupon "${couponToToggle.code}" is now ${!couponToToggle.isActive ? "Active" : "Deactivated"}`
      );
      if (selectedCoupon?.id === couponToToggle.id) {
        setSelectedCoupon((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
      }
      setCouponToToggle(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update coupon status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteMutation.mutateAsync(couponToDelete.id);
      toast.success(`Coupon "${couponToDelete.code}" has been deleted.`);
      if (selectedCoupon?.id === couponToDelete.id) {
        setSelectedCoupon(null);
      }
      setCouponToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete coupon");
    }
  };

  // Metrics Cards
  const metricCards: TableMetricCard[] = [
    {
      label: "Total Promo Codes",
      val: metrics.totalCoupons,
      icon: Tag,
      color: "text-purple-500",
      change: `${metrics.activeCoupons} active coupons platform-wide`,
    },
    {
      label: "Active Teacher Coupons",
      val: metrics.activeCoupons,
      icon: Percent,
      color: "text-emerald-500",
      change: "Currently redeemable by students",
    },
    {
      label: "Total Redemptions",
      val: metrics.totalRedemptions,
      icon: Users,
      color: "text-blue-500",
      change: "Course checkout usages",
    },
    {
      label: "Student Savings Volume",
      val: `₹${metrics.totalDiscountGiven.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-amber-500",
      change: "Cumulative discounts unlocked",
    },
  ];

  // Tab Options
  const tabOptions: TableTabOption[] = [
    { key: "all", label: "All Coupons", count: metrics.totalCoupons },
    { key: "active", label: "Active", count: metrics.activeCoupons },
    { key: "inactive", label: "Inactive", count: metrics.totalCoupons - metrics.activeCoupons },
  ];

  const dropdownFilters: TableDropdownFilter[] = [
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
  ];

  const sortOptions: TableSortOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "most-used", label: "Most Redemptions First" },
  ];

  // Table Columns
  const columns: TableColumn<TeacherCoupon>[] = [
    {
      header: "Promo Code",
      cell: (item: TeacherCoupon) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span
              onClick={() => setSelectedCoupon(item)}
              className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              {item.code}
            </span>
            <button
              onClick={() => copyToClipboard(item.code)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          {item.description && (
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate max-w-[170px]">
              {item.description}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Instructor",
      cell: (item: TeacherCoupon) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-xs overflow-hidden shrink-0">
            {item.instructorAvatar ? (
              <img src={item.instructorAvatar} alt={item.instructorName || "Instructor"} className="w-full h-full object-cover" />
            ) : (
              item.instructorName?.charAt(0).toUpperCase() || "T"
            )}
          </div>
          <div className="space-y-0.5 max-w-[150px]">
            <span className="font-bold text-xs text-neutral-900 dark:text-white block truncate">
              {item.instructorName || "Instructor"}
            </span>
            <span className="text-[10px] text-neutral-500 block truncate">
              {item.instructorEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Scope / Course",
      cell: (item: TeacherCoupon) => (
        <div className="space-y-0.5 max-w-[170px]">
          <span className="text-xs font-semibold text-neutral-900 dark:text-white block truncate">
            {item.courseTitle || "All Instructor Courses"}
          </span>
          <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[9px] py-0 px-1 border-0">
            {item.courseId ? "Course Specific" : "Teacher Wide"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Discount Value",
      cell: (item: TeacherCoupon) => (
        <div className="space-y-0.5">
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold text-[11px]">
            {item.discountType === "PERCENTAGE"
              ? `${item.discountValue}% OFF`
              : `₹${item.discountValue} FLAT`}
          </Badge>
          {item.maxDiscountAmount && (
            <span className="text-[10px] text-neutral-400 block">
              Cap: ₹{item.maxDiscountAmount}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Usage & Quota",
      cell: (item: TeacherCoupon) => (
        <div className="space-y-1 min-w-[110px]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-neutral-900 dark:text-white">
              {item.usedCount} used
            </span>
            <span className="text-[10px] text-neutral-400">
              {item.maxUses ? `/ ${item.maxUses}` : "(unlimited)"}
            </span>
          </div>
          {item.maxUses && (
            <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${Math.min(100, (item.usedCount / item.maxUses) * 100)}%` }}
              />
            </div>
          )}
        </div>
      ),
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
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedCoupon(item)}
            className="h-8 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1 hover:text-purple-600 hover:border-purple-500/30"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCouponToToggle(item)}
            title={item.isActive ? "Deactivate coupon" : "Activate coupon"}
            disabled={toggleStatusMutation.isPending}
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
            onClick={() => setCouponToDelete(item)}
            title="Delete coupon"
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
          label: "Admin Finance & Promotions",
        }}
        title="Teacher Course Coupons & Promo Codes"
        description="Oversee teacher discount codes, usage limits, student savings volume, and toggle promo code activation platform-wide."
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
        searchPlaceholder="Search by coupon code, description, instructor, or course..."
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
          totalItems: total,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size: number) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        emptyState={{
          title: "No coupons found",
          description: "No teacher coupons match the selected filters or search query.",
          icon: Tag,
        }}
      />

      {/* Details Modal */}
      {selectedCoupon && (
        <AdminCouponDetailModal
          coupon={selectedCoupon}
          isOpen={Boolean(selectedCoupon)}
          onClose={() => setSelectedCoupon(null)}
          onToggleStatus={(coupon) => setCouponToToggle(coupon)}
          onDelete={(coupon) => setCouponToDelete(coupon)}
          isToggling={toggleStatusMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Toggle Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(couponToToggle)}
        onClose={() => setCouponToToggle(null)}
        onConfirm={handleConfirmToggle}
        title={
          couponToToggle?.isActive
            ? `Deactivate Promo Code "${couponToToggle?.code}"?`
            : `Activate Promo Code "${couponToToggle?.code}"?`
        }
        description={
          couponToToggle?.isActive
            ? `Deactivating coupon "${couponToToggle?.code}" created by ${couponToToggle?.instructorName || "the teacher"} will disable it from being redeemed during student checkouts platform-wide.`
            : `Activating coupon "${couponToToggle?.code}" created by ${couponToToggle?.instructorName || "the teacher"} will enable students to redeem it immediately during checkout.`
        }
        confirmText={couponToToggle?.isActive ? "Yes, Deactivate" : "Yes, Activate"}
        cancelText="Cancel"
        variant={couponToToggle?.isActive ? "warning" : "success"}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(couponToDelete)}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Permanently Delete Promo Code "${couponToDelete?.code}"?`}
        description={`Are you sure you want to permanently delete coupon "${couponToDelete?.code}" created by ${couponToDelete?.instructorName || "the instructor"}? This action cannot be undone.`}
        confirmText="Yes, Delete Coupon"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminCouponsPage;
