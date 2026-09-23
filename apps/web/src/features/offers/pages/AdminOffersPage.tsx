import React, { useState, useMemo } from "react";
import {
  Tag,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Coins,
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
import { OfferFormModal } from "../components/OfferFormModal";
import {
  useAdminOffers,
  useAdminOfferAnalytics,
  useAdminToggleOffer,
  useAdminDeleteOffer,
} from "../hooks/useOffers";
import type { Offer } from "../types/offer.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminOffersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState<Offer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [offerToToggle, setOfferToToggle] = useState<Offer | null>(null);

  // Queries & Mutations
  const { data: offersData, isLoading, refetch } = useAdminOffers({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    status: activeTab === "all" ? undefined : (activeTab as any),
    discountType: discountTypeFilter === "all" ? undefined : (discountTypeFilter as any),
    sortBy: sortOption === "newest" ? "createdAt" : undefined,
    sortOrder: "desc",
  });

  const { data: analytics } = useAdminOfferAnalytics();
  const toggleMutation = useAdminToggleOffer();
  const deleteMutation = useAdminDeleteOffer();

  const allOffers = useMemo(() => offersData?.items || [], [offersData]);
  const totalItems = offersData?.pagination?.totalItems || allOffers.length;

  // Table Metrics
  const metrics: TableMetricCard[] = useMemo(() => {
    return [
      {
        label: "Total Offers",
        val: analytics?.totalOffers ?? totalItems,
        icon: Tag,
        color: "text-neutral-900 dark:text-white",
        bg: "bg-neutral-100 dark:bg-neutral-800",
      },
      {
        label: "Active Campaigns",
        val: analytics?.activeOffers ?? 0,
        icon: Sparkles,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        label: "Total Redemptions",
        val: analytics?.totalRedemptions ?? 0,
        icon: TrendingUp,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
      },
      {
        label: "Total Discount Given",
        val: `₹${(analytics?.totalDiscountGiven || 0).toLocaleString()}`,
        icon: Coins,
        color: "text-[#F42A18]",
        bg: "bg-[#F42A18]/10",
      },
    ];
  }, [analytics, totalItems]);

  // Tab filters
  const tabs: TableTabOption[] = [
    { key: "all", label: "All Offers" },
    { key: "active", label: "Active Offers" },
    { key: "disabled", label: "Disabled" },
    { key: "expired", label: "Expired" },
  ];

  const dropdownFilters: TableDropdownFilter[] = [
    {
      key: "discountType",
      label: "Discount Type",
      value: discountTypeFilter,
      options: [
        { label: "All Discount Types", value: "all" },
        { label: "Percentage (%)", value: "PERCENTAGE" },
        { label: "Flat Amount (₹)", value: "FLAT" },
      ],
      onChange: (val) => {
        setDiscountTypeFilter(val);
        setCurrentPage(1);
      },
    },
  ];

  const sortOptions: TableSortOption[] = [
    { label: "Newest Created", value: "newest" },
    { label: "Alphabetical", value: "name-asc" },
  ];

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setDiscountTypeFilter("all");
    setSortOption("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    activeTab !== "all" ||
    discountTypeFilter !== "all" ||
    sortOption !== "newest";

  const handleConfirmToggle = async () => {
    if (!offerToToggle) return;
    try {
      await toggleMutation.mutateAsync(offerToToggle.id);
      setOfferToToggle(null);
    } catch {
      // Handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;
    try {
      await deleteMutation.mutateAsync(offerToDelete.id);
      setOfferToDelete(null);
    } catch {
      // Handled in hook
    }
  };

  // Table Columns Definition
  const columns: TableColumn<Offer>[] = [
    {
      header: "Offer Campaign",
      cell: (offer) => {
        const isExpired = offer.validUntil && new Date(offer.validUntil) < new Date();

        return (
          <div className="flex items-start gap-3 text-left">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[#F42A18] font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
                  {offer.title}
                </span>
                {offer.badgeText && (
                  <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 text-[10px] font-bold px-1.5 py-0">
                    {offer.badgeText}
                  </Badge>
                )}
                {isExpired && (
                  <Badge className="bg-neutral-200 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700 text-[10px] px-1.5 py-0">
                    Expired
                  </Badge>
                )}
              </div>

              {offer.description && (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-xs">
                  {offer.description}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Discount Value",
      cell: (offer) => {
        return (
          <div className="space-y-1 text-left">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-neutral-900 dark:text-white">
                {offer.discountType === "PERCENTAGE"
                  ? `${offer.discountValue}% OFF`
                  : `₹${offer.discountValue.toLocaleString()} OFF`}
              </span>
            </div>
            {offer.maxDiscountAmount ? (
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                Up to ₹{offer.maxDiscountAmount.toLocaleString()} max
              </span>
            ) : offer.minOrderAmount ? (
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                Min. order: ₹{offer.minOrderAmount.toLocaleString()}
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400">No cap / No minimum</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Eligibility & Scope",
      cell: (offer) => {
        const planCount = offer.applicablePlans?.length || 0;
        const cycleCount = offer.applicableCycles?.length || 0;

        return (
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold ${
                  offer.eligibility === "NEW_TEACHERS_ONLY"
                    ? "text-blue-600 dark:text-blue-400 border-blue-500/30"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {offer.eligibility === "NEW_TEACHERS_ONLY" ? "New Teachers Only" : "All Teachers"}
              </Badge>
              {planCount > 0 ? (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                  {planCount} Specific Plans
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                  All Plans
                </Badge>
              )}
            </div>

            <span className="text-[10px] text-neutral-400 block">
              {cycleCount > 0
                ? `Cycles: ${offer.applicableCycles?.map((c) => c.billingCycle).join(", ")}`
                : "All Billing Cycles"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Redemptions",
      align: "center",
      cell: (offer) => {
        const used = offer.usedRedemptions || 0;
        const max = offer.maxRedemptions;

        return (
          <div className="space-y-0.5 text-center">
            <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
              {used} {max ? `/ ${max}` : "used"}
            </span>
            {max && (
              <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-[#F42A18]"
                  style={{ width: `${Math.min(100, (used / max) * 100)}%` }}
                />
              </div>
            )}
            <span className="text-[10px] text-neutral-400 block">
              Max {offer.maxRedemptionsPerUser}/user
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      align: "center",
      cell: (offer) => {
        const isExpired = offer.validUntil && new Date(offer.validUntil) < new Date();

        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOfferToToggle(offer);
            }}
            disabled={toggleMutation.isPending}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              offer.isActive && !isExpired
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {offer.isActive && !isExpired ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                {isExpired ? "Expired" : "Disabled"}
              </>
            )}
          </button>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (offer) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOfferToEdit(offer)}
            className="h-8 px-2.5 rounded-xl text-xs font-medium border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18]/40 hover:text-[#F42A18] cursor-pointer flex items-center gap-1"
            title="Edit offer configuration"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOfferToDelete(offer)}
            className="h-8 w-8 p-0 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            title="Delete offer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTableTemplate
        badge={{ icon: Tag, label: "Promotional Offers" }}
        title="Default Promotional Offers"
        description="Create and manage default promotional discounts and seasonal campaigns automatically applied to teacher plans"
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs rounded-xl bg-[#F42A18] hover:bg-[#d92212] text-white font-medium cursor-pointer shadow-md shadow-red-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Offer</span>
            </Button>
          </div>
        }
        metrics={metrics}
        searchPlaceholder="Search offers by title or description..."
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
        data={allOffers}
        keyExtractor={(o) => o.id}
        isLoading={isLoading}
        emptyState={{
          icon: Tag,
          title: "No Promotional Offers Found",
          description: hasActiveFilters
            ? "No offers match your search or filter criteria. Try resetting filters."
            : "No promotional campaigns have been created yet. Click 'Create New Offer' to add the first offer.",
        }}
        pagination={{
          currentPage,
          pageSize,
          totalItems,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />

      {/* Create / Edit Offer Modal */}
      {(isCreateModalOpen || Boolean(offerToEdit)) && (
        <OfferFormModal
          isOpen={isCreateModalOpen || Boolean(offerToEdit)}
          onClose={() => {
            setIsCreateModalOpen(false);
            setOfferToEdit(null);
          }}
          initialOffer={offerToEdit}
          onSuccess={() => refetch()}
        />
      )}

      {/* Toggle Status Confirmation Modal */}
      {Boolean(offerToToggle) && (
        <ConfirmationModal
          isOpen={Boolean(offerToToggle)}
          onClose={() => setOfferToToggle(null)}
          onConfirm={handleConfirmToggle}
          isLoading={toggleMutation.isPending}
          variant={offerToToggle?.isActive ? "warning" : "success"}
          title={offerToToggle?.isActive ? `Disable "${offerToToggle.title}"?` : `Activate "${offerToToggle?.title}"?`}
          description={
            <span>
              {offerToToggle?.isActive
                ? `Disabling this offer will immediately prevent teachers from receiving this promotional discount at checkout.`
                : `Activating this offer will make it immediately active for eligible teachers at checkout.`}
            </span>
          }
          confirmText={offerToToggle?.isActive ? "Disable Offer" : "Activate Offer"}
          cancelText="Cancel"
        />
      )}

      {/* Delete Confirmation Modal */}
      {Boolean(offerToDelete) && (
        <ConfirmationModal
          isOpen={Boolean(offerToDelete)}
          onClose={() => setOfferToDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={deleteMutation.isPending}
          variant="danger"
          title="Delete Promotional Offer"
          description={
            <span>
              Are you sure you want to delete <strong>{offerToDelete?.title}</strong>? Existing invoices that already redeemed this discount will preserve their history. This action cannot be undone.
            </span>
          }
          confirmText="Delete Offer"
          cancelText="Keep Offer"
        />
      )}
    </div>
  );
};

export default AdminOffersPage;
