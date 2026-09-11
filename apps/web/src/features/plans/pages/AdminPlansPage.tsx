import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Gift,
  Flame,
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
import { PlanFormModal } from "../components/PlanFormModal";
import {
  useAdminPlans,
  useAdminUpdatePlan,
  useAdminDeletePlan,
} from "../hooks/usePlans";
import type { Plan } from "../types/plan.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: plans, isLoading, refetch } = useAdminPlans();
  const updatePlanMutation = useAdminUpdatePlan();
  const deletePlanMutation = useAdminDeletePlan();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [billingCycleFilter, setBillingCycleFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("sort-order");

  // Modals state
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allPlans = useMemo(() => plans || [], [plans]);

  // Global counts for metric cards and tabs
  const metricsData = useMemo(() => {
    const total = allPlans.length;
    const active = allPlans.filter((p) => p.isActive).length;
    const featured = allPlans.filter((p) => p.isFeatured).length;
    const freeOrTrial = allPlans.filter((p) => Number(p.price) === 0 || p.trialDays > 0).length;

    return { total, active, featured, freeOrTrial };
  }, [allPlans]);

  // Filter and sort plans
  const filteredPlans = useMemo(() => {
    let result = [...allPlans];

    // Tab filter
    if (activeTab === "active") {
      result = result.filter((p) => p.isActive);
    } else if (activeTab === "disabled") {
      result = result.filter((p) => !p.isActive);
    } else if (activeTab === "featured") {
      result = result.filter((p) => p.isFeatured);
    }

    // Billing cycle filter
    if (billingCycleFilter !== "all") {
      result = result.filter((p) => p.billingCycle === billingCycleFilter);
    }

    // Search query filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.tagline && p.tagline.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "sort-order":
        default:
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
    });

    return result;
  }, [allPlans, activeTab, billingCycleFilter, debouncedSearch, sortOption]);

  // Paginated slice
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, currentPage, pageSize]);

  // Actions
  const handleToggleActive = async (plan: Plan, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        payload: { isActive: !plan.isActive },
      });
    } catch {
      // Handled in hook
    }
  };

  const handleToggleFeatured = async (plan: Plan, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        payload: { isFeatured: !plan.isFeatured },
      });
    } catch {
      // Handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await deletePlanMutation.mutateAsync(planToDelete.id);
      setPlanToDelete(null);
    } catch {
      // Handled in hook
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setBillingCycleFilter("all");
    setSortOption("sort-order");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    activeTab !== "all" ||
    billingCycleFilter !== "all" ||
    sortOption !== "sort-order";

  // Table Metrics
  const metrics: TableMetricCard[] = [
    {
      label: "Total Plans",
      val: metricsData.total,
      icon: Layers,
      color: "text-[#F42A18]",
    },
    {
      label: "Active Tiers",
      val: metricsData.active,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Featured Tiers",
      val: metricsData.featured,
      icon: Flame,
      color: "text-amber-500",
    },
    {
      label: "Free & Trial Plans",
      val: metricsData.freeOrTrial,
      icon: Gift,
      color: "text-blue-500",
    },
  ];

  // Table Tabs
  const tabs: TableTabOption[] = [
    { key: "all", label: "All Plans", count: metricsData.total },
    { key: "active", label: "Active", count: metricsData.active },
    { key: "disabled", label: "Disabled", count: metricsData.total - metricsData.active },
    { key: "featured", label: "Featured", count: metricsData.featured },
  ];

  // Table Dropdown Filters
  const dropdownFilters: TableDropdownFilter[] = [
    {
      key: "billingCycle",
      label: "Billing Cycle",
      value: billingCycleFilter,
      onChange: (val) => {
        setBillingCycleFilter(val);
        setCurrentPage(1);
      },
      options: [
        { label: "All Billing Cycles", value: "all" },
        { label: "Monthly", value: "MONTHLY" },
        { label: "Quarterly", value: "QUARTERLY" },
        { label: "Yearly", value: "YEARLY" },
        { label: "Lifetime", value: "LIFETIME" },
      ],
    },
  ];

  // Sort Options
  const sortOptions: TableSortOption[] = [
    { label: "Sort Order (Default)", value: "sort-order" },
    { label: "Name (A-Z)", value: "name-asc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Newest Created", value: "newest" },
  ];

  // Table Columns Definition
  const columns: TableColumn<Plan>[] = [
    {
      header: "Plan Details",
      cell: (plan) => (
        <div className="flex items-start gap-3 text-left">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold shrink-0">
            {plan.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
                {plan.name}
              </span>
              {plan.isFeatured && (
                <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 text-[10px] font-bold px-1.5 py-0 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
              <span>slug: {plan.slug}</span>
            </div>
            {plan.tagline && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-xs">
                {plan.tagline}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Price & Terms",
      cell: (plan) => (
        <div className="space-y-1 text-left">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-neutral-900 dark:text-white">
              ${Number(plan.price).toFixed(2)}
            </span>
            <span className="text-[10px] uppercase font-bold text-neutral-400">
              / {plan.billingCycle.toLowerCase()}
            </span>
          </div>
          {plan.trialDays > 0 ? (
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] px-1.5 py-0">
              {plan.trialDays} Days Trial
            </Badge>
          ) : (
            <span className="text-[11px] text-neutral-400">No Free Trial</span>
          )}
        </div>
      ),
    },
    {
      header: "Configured Limits & Quotas",
      cell: (plan) => {
        const featureCount = plan.features?.length || 0;
        const liveMinutesPf = plan.features?.find(
          (f) => f.feature?.code === "LIVE_VIEWER_MINUTES_MONTHLY" || f.featureId === "LIVE_VIEWER_MINUTES_MONTHLY"
        );
        const coursesPf = plan.features?.find(
          (f) => f.feature?.code === "MAX_COURSES" || f.featureId === "MAX_COURSES"
        );
        const recordingsPf = plan.features?.find(
          (f) => f.feature?.code === "MAX_RECORDED_CLASSES" || f.featureId === "MAX_RECORDED_CLASSES"
        );

        return (
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                {featureCount} Features
              </Badge>
              {liveMinutesPf && (
                <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] font-medium">
                  {liveMinutesPf.isUnlimited ? "∞ Live Mins" : `${Number(liveMinutesPf.value).toLocaleString()} mins`}
                </Badge>
              )}
              {coursesPf && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium">
                  {coursesPf.isUnlimited ? "∞ Courses" : `${coursesPf.value} Courses`}
                </Badge>
              )}
            </div>
            {recordingsPf && (
              <span className="text-[11px] text-neutral-400 block">
                {recordingsPf.isUnlimited ? "Unlimited Recordings" : `${recordingsPf.value} Cloud Recordings`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      align: "center",
      cell: (plan) => (
        <button
          type="button"
          onClick={(e) => handleToggleActive(plan, e)}
          disabled={updatePlanMutation.isPending}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            plan.isActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          {plan.isActive ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" />
              Disabled
            </>
          )}
        </button>
      ),
    },
    {
      header: "Featured",
      align: "center",
      cell: (plan) => (
        <button
          type="button"
          onClick={(e) => handleToggleFeatured(plan, e)}
          disabled={updatePlanMutation.isPending}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            plan.isFeatured
              ? "bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/30 hover:bg-[#F42A18]/20"
              : "text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-200"
          }`}
          title={plan.isFeatured ? "Featured plan (Click to unfeature)" : "Mark as featured"}
        >
          <Sparkles className="w-4 h-4" />
        </button>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (plan) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/admin/plans/${plan.id}`)}
            className="h-8 px-2.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-1"
            title="View full plan details & quota controls"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Manage</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPlanToEdit(plan)}
            className="h-8 px-2.5 rounded-xl text-xs font-medium border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18]/40 hover:text-[#F42A18] cursor-pointer flex items-center gap-1"
            title="Edit plan configuration"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPlanToDelete(plan)}
            className="h-8 w-8 p-0 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            title="Delete plan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col w-full text-left">
      <DataTableTemplate<Plan>
        badge={{
          icon: Shield,
          label: "Admin Console",
        }}
        title="Subscription Plans Management"
        description="Configure dynamic teacher tiers, set live class streaming quotas, adjust recurring pricing, and govern platform feature access."
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
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs rounded-xl bg-[#F42A18] hover:bg-[#d92212] text-white font-medium cursor-pointer shadow-md shadow-red-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Plan</span>
            </Button>
          </div>
        }
        metrics={metrics}
        searchPlaceholder="Search plans by name, slug, or keywords..."
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabKey) => {
          setActiveTab(tabKey);
          setCurrentPage(1);
        }}
        dropdownFilters={dropdownFilters}
        sortOptions={sortOptions}
        currentSort={sortOption}
        onSortChange={(val) => {
          setSortOption(val);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        columns={columns}
        data={paginatedPlans}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyState={{
          icon: Layers,
          title: "No Subscription Plans Found",
          description: hasActiveFilters
            ? "No plans match your current filters. Try resetting the search or filter options."
            : "No subscription plans have been created yet. Click 'Create New Plan' to add the first tier.",
        }}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredPlans.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />

      {/* Create / Edit Plan Modal */}
      {(isCreateModalOpen || Boolean(planToEdit)) && (
        <PlanFormModal
          isOpen={isCreateModalOpen || Boolean(planToEdit)}
          onClose={() => {
            setIsCreateModalOpen(false);
            setPlanToEdit(null);
          }}
          initialPlan={planToEdit}
          onSuccess={() => refetch()}
        />
      )}

      {/* Delete Confirmation Modal */}
      {Boolean(planToDelete) && (
        <ConfirmationModal
          isOpen={Boolean(planToDelete)}
          onClose={() => setPlanToDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={deletePlanMutation.isPending}
          variant="danger"
          title="Delete Subscription Plan"
          description={
            <span>
              Are you sure you want to delete <strong>{planToDelete?.name}</strong>? Existing active subscriptions may be impacted. This action cannot be undone.
            </span>
          }
          confirmText="Delete Plan"
          cancelText="Keep Plan"
        />
      )}
    </div>
  );
};

export default AdminPlansPage;
