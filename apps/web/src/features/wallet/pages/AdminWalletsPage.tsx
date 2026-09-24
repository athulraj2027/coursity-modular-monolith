import React, { useState, useMemo } from "react";
import {
  Wallet as WalletIcon,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Building2,
  Lock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  User,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
} from "@/components/common/DataTableTemplate";
import { useAdminWallets } from "../hooks/useWallet";
import { AdminWalletAdjustModal } from "../components/AdminWalletAdjustModal";
import type { AdminWalletItem } from "../types/wallet.types";

export const AdminWalletsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedWalletForAdjust, setSelectedWalletForAdjust] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
    balance: number;
  } | null>(null);

  const { data, isLoading, isFetching, refetch } = useAdminWallets({
    page,
    limit,
    search: search || undefined,
  });

  const wallets = data?.items || [];
  const stats = data?.stats;

  const metrics: TableMetricCard[] = useMemo(
    () => [
      {
        label: "Platform Available Funds",
        val: `₹${(stats?.totalPlatformBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        icon: WalletIcon,
      },
      {
        label: "Locked in Pending Payouts",
        val: `₹${(stats?.totalLockedBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        icon: Lock,
        color: "text-amber-500",
      },
      {
        label: "Lifetime Royalties",
        val: `₹${(stats?.totalLifetimeEarned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        icon: TrendingUp,
        color: "text-emerald-500",
      },
      {
        label: "Lifetime Disbursed",
        val: `₹${(stats?.totalLifetimeWithdrawn || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        icon: Building2,
        color: "text-blue-500",
      },
    ],
    [stats]
  );

  const columns: TableColumn<AdminWalletItem>[] = [
    {
      header: "User / Account",
      accessorKey: "userId",
      cell: (item: AdminWalletItem) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-600 dark:text-neutral-300">
            {item.user?.name ? item.user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <span className="font-bold text-neutral-900 dark:text-white block text-xs">
              {item.user?.name || "User"}
            </span>
            <span className="text-[11px] text-neutral-400 block font-mono">
              {item.user?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (item: AdminWalletItem) => (
        <Badge
          variant="outline"
          className="text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md"
        >
          {item.user?.role || "STUDENT"}
        </Badge>
      ),
    },
    {
      header: "Available Balance",
      cell: (item: AdminWalletItem) => (
        <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
          ₹{item.availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Locked in Payout",
      cell: (item: AdminWalletItem) => (
        <span
          className={`font-mono text-xs font-semibold ${
            item.lockedBalance > 0
              ? "text-amber-600 dark:text-amber-400"
              : "text-neutral-400"
          }`}
        >
          ₹{item.lockedBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Lifetime Earned",
      cell: (item: AdminWalletItem) => (
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          ₹{item.totalEarned.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Lifetime Withdrawn",
      cell: (item: AdminWalletItem) => (
        <span className="font-mono text-xs text-neutral-500 font-medium">
          ₹{item.totalWithdrawn.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (item: AdminWalletItem) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setSelectedWalletForAdjust({
                userId: item.userId,
                userName: item.user?.name || "User",
                userEmail: item.user?.email || "",
                balance: item.balance,
              })
            }
            className="h-8 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer border-neutral-300 dark:border-neutral-700 hover:border-[#F42A18] hover:text-[#F42A18]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTableTemplate<AdminWalletItem>
        badge={{
          icon: WalletIcon,
          label: "Master Treasury & Ledger",
        }}
        title="Platform User Wallets"
        description="Master ledger and balance overview across all students and instructors."
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
              <WalletIcon className="w-3.5 h-3.5" />
              <span>{data?.total || 0} Wallets</span>
            </span>
          </div>
        }
        data={wallets}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        metrics={metrics}
        searchPlaceholder="Search by user name, email..."
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

      {/* Admin Adjust Modal */}
      {selectedWalletForAdjust && (
        <AdminWalletAdjustModal
          userWallet={selectedWalletForAdjust}
          isOpen={Boolean(selectedWalletForAdjust)}
          onClose={() => setSelectedWalletForAdjust(null)}
        />
      )}
    </>
  );
};

export default AdminWalletsPage;
