import React, { useState } from "react";
import { useCurrentUser } from "@/features/auth";
import {
  useMyWallet,
  useWalletTransactions,
} from "../hooks/useWallet";
import { WalletBalanceCard } from "../components/WalletBalanceCard";
import { WalletTransactionTable } from "../components/WalletTransactionTable";
import { TopUpWalletModal } from "../components/TopUpWalletModal";
import { RequestPayoutModal } from "../components/RequestPayoutModal";
import type { TransactionType } from "../types/wallet.types";
import { Loader2, RefreshCw } from "lucide-react";

export const UserWalletPage: React.FC = () => {
  const { data: user } = useCurrentUser();
  const role =
    user?.role === "TEACHER" || user?.role === "teacher"
      ? "teacher"
      : user?.role === "ADMIN" || user?.role === "admin"
        ? "admin"
        : "student";

  const {
    data: wallet,
    isLoading: isWalletLoading,
    isFetching: isWalletFetching,
    refetch: refetchWallet,
  } = useMyWallet();

  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<TransactionType | undefined>();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const {
    data: txData,
    isLoading: isTxLoading,
    isFetching: isTxFetching,
    refetch: refetchTx,
  } = useWalletTransactions({
    page,
    limit: 10,
    type: filterType,
  });

  const isRefreshing = isWalletFetching || isTxFetching;

  const handleRefresh = async () => {
    await Promise.all([refetchWallet(), refetchTx()]);
  };

  if (isWalletLoading && !wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#F42A18]" />
        <p className="text-xs font-medium text-neutral-500">Loading your wallet balance & ledger...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full space-y-8 animate-in fade-in duration-300">
      {/* 1. Wallet Balance Hero Card */}
      <WalletBalanceCard
        wallet={wallet}
        role={role}
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onOpenWithdraw={role === "teacher" ? () => setIsWithdrawOpen(true) : undefined}
        isLoading={isWalletLoading}
      />

      {/* 2. Transaction Ledger Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Wallet Activity & Ledger
            </h3>
            <p className="text-xs text-neutral-500">
              Real-time chronological record of your deposits, purchases, refunds, and earnings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh Wallet & Ledger"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[#F42A18] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#F42A18]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>


        <WalletTransactionTable
          transactions={txData?.items || []}
          total={txData?.total || 0}
          currentPage={page}
          pageSize={10}
          onPageChange={setPage}
          activeFilterType={filterType}
          onFilterTypeChange={(t) => {
            setFilterType(t);
            setPage(1);
          }}
          isLoading={isTxLoading}
        />
      </div>

      {/* 3. Top-Up Modal */}
      <TopUpWalletModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />

      {/* 4. Request Payout Modal (Teachers) */}
      {role === "teacher" && (
        <RequestPayoutModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          availableBalance={wallet?.availableBalance ?? 0}
        />
      )}
    </div>
  );
};

export default UserWalletPage;
