import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Zap,
  TrendingUp,
  CalendarPlus,
  ArrowRightLeft,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
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
  useAdminSubscriptions,
  useAdminCancelSubscription,
  useAdminExtendSubscription,
  useAdminChangeSubscriptionPlan,
} from "../hooks/useAdminSubscriptions";
import { useAdminPlans } from "../hooks/usePlans";
import {
  CancelSubscriptionModal,
  ExtendSubscriptionModal,
  ChangePlanModal,
} from "../components/AdminSubscriptionModals";
import type { AdminSubscriptionListItem, SubscriptionStatus } from "../types/plan.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminSubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [billingCycleFilter, setBillingCycleFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [selectedSubForCancel, setSelectedSubForCancel] = useState<AdminSubscriptionListItem | null>(null);
  const [selectedSubForExtend, setSelectedSubForExtend] = useState<AdminSubscriptionListItem | null>(null);
  const [selectedSubForChangePlan, setSelectedSubForChangePlan] = useState<AdminSubscriptionListItem | null>(null);

  // Queries
  const { data: plansData } = useAdminPlans();
  const { data: subscriptionsData, isLoading, refetch } = useAdminSubscriptions({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: activeTab !== "all" ? activeTab : undefined,
    planId: planFilter !== "all" ? planFilter : undefined,
    billingCycle: billingCycleFilter !== "all" ? billingCycleFilter : undefined,
    sortBy: "createdAt",
    sortOrder: sortOption === "oldest" ? "asc" : "desc",
  });

  // Mutations
  const cancelMutation = useAdminCancelSubscription();
  const extendMutation = useAdminExtendSubscription();
  const changePlanMutation = useAdminChangeSubscriptionPlan();

  const items = subscriptionsData?.items || [];
  const total = subscriptionsData?.total || 0;
  const metrics = subscriptionsData?.metrics || {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    mrr: 0,
    totalRevenue: 0,
    churnedCount: 0,
    pastDueCount: 0,
  };

  // Top Metrics Cards
  const metricCards: TableMetricCard[] = [
    {
      label: "Monthly Recurring Revenue",
      val: `₹${metrics.mrr.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      change: "Active recurring MRR",
    },
    {
      label: "Active Subscriptions",
      val: metrics.activeSubscriptions,
      icon: Zap,
      color: "text-blue-500",
      change: "Instructors with active tier limits",
    },
    {
      label: "Total Invoiced Revenue",
      val: `₹${metrics.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: "text-purple-500",
      change: "Lifetime collected invoice GMV",
    },
    {
      label: "Churned & Past Due",
      val: metrics.churnedCount + metrics.pastDueCount,
      icon: AlertTriangle,
      color: "text-amber-500",
      change: `${metrics.pastDueCount} past due, ${metrics.churnedCount} canceled/expired`,
    },
  ];

  // Tab Options
  const tabOptions: TableTabOption[] = [
    { key: "all", label: "All Subscriptions", count: metrics.totalSubscriptions },
    { key: "ACTIVE", label: "Active", count: metrics.activeSubscriptions },
    { key: "PAST_DUE", label: "Past Due", count: metrics.pastDueCount },
    { key: "CANCELED", label: "Canceled" },
    { key: "EXPIRED", label: "Expired" },
  ];

  // Plan Filter options
  const planFilterOptions = useMemo(() => {
    const active = (plansData || []).map((p) => ({
      value: p.id,
      label: p.name,
    }));
    return [{ value: "all", label: "All Plans" }, ...active];
  }, [plansData]);

  const dropdownFilters: TableDropdownFilter[] = [
    {
      key: "plan",
      label: "Plan",
      value: planFilter,
      options: planFilterOptions,
      onChange: (val) => {
        setPlanFilter(val);
        setCurrentPage(1);
      },
    },
    {
      key: "billingCycle",
      label: "Billing Cycle",
      value: billingCycleFilter,
      options: [
        { value: "all", label: "All Billing Cycles" },
        { value: "MONTHLY", label: "Monthly" },
        { value: "QUARTERLY", label: "Quarterly" },
        { value: "YEARLY", label: "Yearly" },
        { value: "LIFETIME", label: "Lifetime" },
      ],
      onChange: (val) => {
        setBillingCycleFilter(val);
        setCurrentPage(1);
      },
    },
  ];

  const sortOptions: TableSortOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

  // Helper for Status Badges
  const getStatusBadge = (status: SubscriptionStatus, cancelAtPeriodEnd: boolean) => {
    switch (status) {
      case "ACTIVE":
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </Badge>
            {cancelAtPeriodEnd && (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium text-[9px] py-0 px-1">
                Cancels at period end
              </Badge>
            )}
          </div>
        );
      case "PAST_DUE":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Past Due
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold text-[11px] flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Canceled
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 font-semibold text-[11px]">
            Expired
          </Badge>
        );
      default:
        return <Badge className="text-[11px]">{status}</Badge>;
    }
  };

  // Table Columns
  const columns: TableColumn<AdminSubscriptionListItem>[] = [
    {
      header: "Instructor",
      cell: (item: AdminSubscriptionListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-xs overflow-hidden shrink-0">
            {item.instructorAvatar ? (
              <img
                src={item.instructorAvatar}
                alt={item.instructorName}
                className="w-full h-full object-cover"
              />
            ) : (
              item.instructorName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-0.5 max-w-[180px]">
            <span
              onClick={() => navigate(`/admin/subscriptions/${item.id}`)}
              className="font-bold text-xs text-neutral-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer block truncate"
            >
              {item.instructorName}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
              {item.instructorEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Plan & Billing",
      cell: (item: AdminSubscriptionListItem) => (
        <div className="space-y-0.5">
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold text-[11px]">
            {item.planName}
          </Badge>
          <div className="text-[11px] text-neutral-500">
            ₹{item.price.toLocaleString()}/{item.billingCycle.toLowerCase()}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: AdminSubscriptionListItem) => getStatusBadge(item.status, item.cancelAtPeriodEnd),
    },
    {
      header: "Period End / Expiry",
      cell: (item: AdminSubscriptionListItem) => {
        const date = new Date(item.currentPeriodEnd);
        const isPast = date < new Date();
        return (
          <div className="space-y-0.5">
            <span className={`text-xs font-semibold ${isPast ? "text-neutral-400 line-through" : "text-neutral-900 dark:text-white"}`}>
              {date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="text-[10px] text-neutral-400 block">
              Started {new Date(item.currentPeriodStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        );
      },
    },
    {
      header: "Invoiced Revenue",
      cell: (item: AdminSubscriptionListItem) => (
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-neutral-900 dark:text-white">
            ₹{item.totalInvoicedAmount.toLocaleString()}
          </span>
          <span className="text-[10px] text-neutral-400 block">
            {item.invoiceCount} {item.invoiceCount === 1 ? "invoice" : "invoices"}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (item: AdminSubscriptionListItem) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/admin/subscriptions/${item.id}`)}
            className="h-8 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
            <span>Manage</span>
          </Button>

          {item.status === "ACTIVE" && !item.cancelAtPeriodEnd && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedSubForCancel(item)}
              title="Cancel subscription"
              className="h-8 w-8 p-0 rounded-xl border-neutral-200 dark:border-neutral-800 hover:text-red-600 hover:border-red-500/30 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-neutral-500 hover:text-red-600" />
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedSubForExtend(item)}
            title="Extend subscription period"
            className="h-8 w-8 p-0 rounded-xl border-neutral-200 dark:border-neutral-800 hover:text-blue-600 hover:border-blue-500/30 cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-neutral-500 hover:text-blue-600" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedSubForChangePlan(item)}
            title="Switch plan tier"
            className="h-8 w-8 p-0 rounded-xl border-neutral-200 dark:border-neutral-800 hover:text-purple-600 hover:border-purple-500/30 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-500 hover:text-purple-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col w-full text-left">
      <DataTableTemplate<AdminSubscriptionListItem>
        badge={{
          icon: CreditCard,
          label: "Admin Billing & Subscriptions",
        }}
        title="Teacher Subscriptions Management"
        description="Monitor teacher billing cycles, active tier quotas, subscription cancellations, and Razorpay refunds."
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
        searchPlaceholder="Search by instructor name, email, or subscription ID..."
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
        keyExtractor={(item: AdminSubscriptionListItem) => item.id}
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
          title: "No subscriptions found",
          description: "No teacher subscriptions match the selected filters or search query.",
          icon: CreditCard,
        }}
      />

      {/* Modals */}
      {selectedSubForCancel && (
        <CancelSubscriptionModal
          isOpen={Boolean(selectedSubForCancel)}
          onClose={() => setSelectedSubForCancel(null)}
          onConfirm={async (data) => {
            await cancelMutation.mutateAsync({
              subscriptionId: selectedSubForCancel.id,
              immediate: data.immediate,
              reason: data.reason,
            });
            setSelectedSubForCancel(null);
          }}
          subscriptionId={selectedSubForCancel.id}
          instructorName={selectedSubForCancel.instructorName}
          planName={selectedSubForCancel.planName}
          currentPeriodEnd={selectedSubForCancel.currentPeriodEnd}
          isLoading={cancelMutation.isPending}
        />
      )}

      {selectedSubForExtend && (
        <ExtendSubscriptionModal
          isOpen={Boolean(selectedSubForExtend)}
          onClose={() => setSelectedSubForExtend(null)}
          onConfirm={async (data) => {
            await extendMutation.mutateAsync({
              subscriptionId: selectedSubForExtend.id,
              daysToAdd: data.daysToAdd,
              newPeriodEnd: data.newPeriodEnd,
              reason: data.reason,
            });
            setSelectedSubForExtend(null);
          }}
          currentPeriodEnd={selectedSubForExtend.currentPeriodEnd}
          instructorName={selectedSubForExtend.instructorName}
          isLoading={extendMutation.isPending}
        />
      )}

      {selectedSubForChangePlan && (
        <ChangePlanModal
          isOpen={Boolean(selectedSubForChangePlan)}
          onClose={() => setSelectedSubForChangePlan(null)}
          onConfirm={async (data) => {
            await changePlanMutation.mutateAsync({
              subscriptionId: selectedSubForChangePlan.id,
              newPlanId: data.newPlanId,
              resetPeriod: data.resetPeriod,
            });
            setSelectedSubForChangePlan(null);
          }}
          currentPlanId={selectedSubForChangePlan.planId}
          instructorName={selectedSubForChangePlan.instructorName}
          isLoading={changePlanMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminSubscriptionsPage;
