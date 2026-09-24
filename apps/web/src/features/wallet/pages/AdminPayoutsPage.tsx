import React, { useState, useMemo } from "react";
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
  type TableTabOption,
} from "@/components/common/DataTableTemplate";
import { useAdminPayouts } from "../hooks/useWallet";
import { AdminPayoutActionModal } from "../components/AdminPayoutActionModal";
import type { PayoutRequest, PayoutStatus } from "../types/wallet.types";

export const AdminPayoutsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);

  const activeStatus = statusFilter === "ALL" ? undefined : (statusFilter as PayoutStatus);

  const { data, isLoading, isFetching, refetch } = useAdminPayouts({
    page,
    limit,
    search: search || undefined,
    status: activeStatus,
  });

  const payouts = data?.items || [];
  const stats = data?.stats;

  const tabs: TableTabOption[] = useMemo(
    () => [
      { key: "ALL", label: "All Payouts" },
      { key: "PENDING", label: "Pending", count: stats?.pendingCount },
      { key: "PROCESSING", label: "Processing" },
      { key: "COMPLETED", label: "Completed", count: stats?.completedCount },
      { key: "REJECTED", label: "Rejected" },
    ],
    [stats]
  );

  const metrics: TableMetricCard[] = useMemo(
    () => [
      {
        label: "Pending Review Amount",
        val: `₹${(stats?.pendingAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        icon: Clock,
        color: "text-amber-500",
      },
      {
        label: "Pending Payout Requests",
        val: stats?.pendingCount || 0,
        icon: AlertCircle,
        color: "text-amber-500",
      },
      {
        label: "Disbursed Total Settled",
        val: `₹${(stats?.completedAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        icon: CheckCircle2,
        color: "text-emerald-500",
      },
      {
        label: "Total Completed Payouts",
        val: stats?.completedCount || 0,
        icon: ArrowUpRight,
        color: "text-emerald-500",
      },
    ],
    [stats]
  );

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
            Pending
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
            Processing
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: TableColumn<PayoutRequest>[] = [
    {
      header: "Instructor",
      accessorKey: "userId",
      cell: (item: PayoutRequest) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-600 dark:text-neutral-300">
            {item.user?.name ? item.user.name.charAt(0).toUpperCase() : "I"}
          </div>
          <div>
            <span className="font-bold text-neutral-900 dark:text-white block text-xs">
              {item.user?.name || "Instructor"}
            </span>
            <span className="text-[11px] text-neutral-400 block font-mono">
              {item.user?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Amount",
      cell: (item: PayoutRequest) => (
        <span className="font-mono font-bold text-sm text-[#F42A18]">
          ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Payout Method / Account",
      cell: (item: PayoutRequest) => (
        <div className="flex items-center gap-2">
          {item.payoutMethod === "UPI" ? (
            <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          )}
          <div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
              {item.accountSummary}
            </span>
            {item.transactionRef && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">
                UTR: {item.transactionRef}
              </span>
            )}
            {item.rejectionReason && (
              <span className="text-[10px] text-rose-500 block max-w-xs truncate">
                Reason: {item.rejectionReason}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: PayoutRequest) => getStatusBadge(item.status),
    },
    {
      header: "Date Requested",
      cell: (item: PayoutRequest) => (
        <span className="text-[11px] text-neutral-500 font-mono">
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (item: PayoutRequest) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedPayout(item)}
            className="h-8 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer border-neutral-300 dark:border-neutral-700 hover:border-[#F42A18] hover:text-[#F42A18]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Process</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTableTemplate<PayoutRequest>
        badge={{
          icon: ArrowUpRight,
          label: "Settlement & Withdrawals",
        }}
        title="Instructor Payout Requests"
        description="Review, approve, reject, and process withdrawal requests from verified instructors."
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
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data?.total || 0} Requests</span>
            </span>
          </div>
        }
        data={payouts}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        metrics={metrics}
        tabs={tabs}
        activeTab={statusFilter}
        onTabChange={(tab) => {
          setStatusFilter(tab);
          setPage(1);
        }}
        searchPlaceholder="Search by instructor name, email..."
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        pagination={{
          currentPage: page,
          pageSize: limit,
          totalItems: data?.total || 0,
          onPageChange: setPage,
          onPageSizeChange: (sz) => {
            setLimit(sz);
            setPage(1);
          },
        }}
      />

      {/* Admin Action Modal */}
      {selectedPayout && (
        <AdminPayoutActionModal
          payout={selectedPayout}
          isOpen={Boolean(selectedPayout)}
          onClose={() => setSelectedPayout(null)}
        />
      )}
    </>
  );
};

export default AdminPayoutsPage;
