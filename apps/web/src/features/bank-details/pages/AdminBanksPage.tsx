import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Star,
  ExternalLink,
  Eye,
  RefreshCw,
  AlertCircle,
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
import { useAdminBankDetails } from "../hooks/useBankDetails";
import { AdminVerifyBankModal } from "../components/AdminVerifyBankModal";
import type { BankDetail, BankVerificationStatus, PayoutMethodType } from "../types/bank-detail.types";
import { useDebounce } from "@/hooks/use-debounce";

export const AdminBanksPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  const [verifyModalDetail, setVerifyModalDetail] = useState<BankDetail | null>(null);

  const { data, isLoading, refetch, isFetching } = useAdminBankDetails({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: activeTab === "all" ? undefined : (activeTab as BankVerificationStatus),
    methodType: methodFilter === "all" ? undefined : (methodFilter as PayoutMethodType),
  });

  const items = data?.items || [];
  const total = data?.total || 0;

  // Derive Metrics
  const metrics: TableMetricCard[] = useMemo(() => {
    const verifiedCount = items.filter((i) => i.verificationStatus === "VERIFIED").length;
    const pendingCount = items.filter((i) => i.verificationStatus === "PENDING").length;
    const upiCount = items.filter((i) => i.methodType === "UPI").length;

    return [
      {
        label: "Total Accounts",
        val: total,
        icon: Building2,
        color: "text-neutral-500",
      },
      {
        label: "Verified Accounts",
        val: verifiedCount,
        icon: ShieldCheck,
        color: "text-emerald-500",
      },
      {
        label: "Pending Review",
        val: pendingCount,
        icon: Clock,
        color: "text-amber-500",
      },
      {
        label: "UPI Direct VPAs",
        val: upiCount,
        icon: Smartphone,
        color: "text-blue-500",
      },
    ];
  }, [items, total]);

  // Tab Options
  const tabs: TableTabOption[] = [
    { key: "all", label: "All Accounts", count: total },
    { key: "VERIFIED", label: "Verified" },
    { key: "PENDING", label: "Pending Review" },
    { key: "REJECTED", label: "Rejected" },
  ];

  // Dropdown Filters
  const dropdownFilters: TableDropdownFilter[] = [
    {
      key: "methodType",
      label: "Payout Method",
      value: methodFilter,
      options: [
        { label: "All Methods", value: "all" },
        { label: "Bank Account (NEFT/IMPS)", value: "BANK_ACCOUNT" },
        { label: "UPI Direct (VPA)", value: "UPI" },
      ],
      onChange: (val) => {
        setMethodFilter(val);
        setCurrentPage(1);
      },
    },
  ];

  // Sort Options
  const sortOptions: TableSortOption[] = [
    { value: "newest", label: "Recently Added" },
    { value: "oldest", label: "Oldest First" },
  ];

  // Columns Configuration
  const columns: TableColumn<BankDetail>[] = [
    {
      header: "User / Account Holder",
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs shrink-0 border border-neutral-200 dark:border-neutral-700">
            {row.user?.name ? row.user.name.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-neutral-900 dark:text-white text-xs truncate max-w-[140px]">
                {row.accountHolderName}
              </span>
              {row.user?.role && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 capitalize rounded-md"
                >
                  {row.user.role.toLowerCase()}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 truncate max-w-[160px]">
              {row.user?.email || "No email"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Payout Details",
      cell: (row) => {
        const isUpi = row.methodType === "UPI";
        return (
          <div className="space-y-0.5 min-w-[160px]">
            <div className="flex items-center gap-1.5">
              {isUpi ? (
                <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-[#F42A18] shrink-0" />
              )}
              <span className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                {isUpi ? "UPI VPA" : row.bankName || "Bank Account"}
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-500 truncate">
              {isUpi
                ? row.upiId
                : row.accountNumber
                ? `•••• ${row.accountNumber.slice(-4)}`
                : "—"}
            </p>
          </div>
        );
      },
    },
    {
      header: "IFSC / Branch",
      cell: (row) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
            {row.ifscCode || "—"}
          </span>
          {row.branchName && (
            <p className="text-[10px] text-neutral-400 truncate max-w-[130px]">
              {row.branchName}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Routing",
      cell: (row) =>
        row.isPrimary ? (
          <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 w-fit">
            <Star className="w-2.5 h-2.5 fill-[#F42A18]" />
            <span>Primary</span>
          </Badge>
        ) : (
          <span className="text-[11px] text-neutral-400">Secondary</span>
        ),
    },
    {
      header: "Verification",
      cell: (row) => {
        switch (row.verificationStatus) {
          case "VERIFIED":
            return (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1 w-fit">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </Badge>
            );
          case "REJECTED":
            return (
              <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px] font-semibold flex items-center gap-1 w-fit">
                <XCircle className="w-3 h-3" />
                <span>Rejected</span>
              </Badge>
            );
          case "PENDING":
          default:
            return (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold flex items-center gap-1 w-fit">
                <Clock className="w-3 h-3" />
                <span>Pending</span>
              </Badge>
            );
        }
      },
    },
    {
      header: "Registered On",
      cell: (row) => (
        <span className="text-xs text-neutral-500 font-mono">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setVerifyModalDetail(row)}
            className="h-8 px-2.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-[#F42A18] cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            <span>Verify</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/admin/bank-details/${row.id}`)}
            className="h-8 px-2.5 text-xs rounded-xl cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            <span>Details</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTableTemplate<BankDetail>
        badge={{
          icon: Building2,
          label: "Settlement & Payout Registry",
        }}
        title="Payout & Bank Accounts"
        description="Comprehensive registry of instructor settlement accounts, student refund VPAs, and compliance statuses."
        headerActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh Data"
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] text-neutral-600 dark:text-neutral-400 hover:text-[#F42A18] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#F42A18]" : ""}`} />
            </button>
            <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{total} Accounts</span>
            </span>
          </div>
        }
        data={items}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        metrics={metrics}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by account holder, bank name, IFSC, UPI VPA, or user email..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        dropdownFilters={dropdownFilters}
        sortOptions={sortOptions}
        currentSort="newest"
        onSortChange={() => {}}
        pagination={{
          currentPage,
          pageSize,
          totalItems: total,
          onPageChange: setCurrentPage,
          onPageSizeChange: (sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          },
        }}
      />

      {/* Admin Verify Modal */}
      <AdminVerifyBankModal
        isOpen={Boolean(verifyModalDetail)}
        onClose={() => {
          setVerifyModalDetail(null);
          refetch();
        }}
        bankDetail={verifyModalDetail}
      />
    </>
  );
};

export default AdminBanksPage;
