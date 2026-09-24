import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  WalletTransaction,
  TransactionType,
  TransactionDirection,
} from "../types/wallet.types";

interface WalletTransactionTableProps {
  transactions: WalletTransaction[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  activeFilterType?: TransactionType;
  onFilterTypeChange: (type?: TransactionType) => void;
  isLoading?: boolean;
}

const FILTER_TABS: Array<{ label: string; value?: TransactionType }> = [
  { label: "All Activity", value: undefined },
  { label: "Earnings", value: "EARNING" },
  { label: "Purchases", value: "ENROLLMENT_PAYMENT" },
  { label: "Deposits", value: "DEPOSIT" },
  { label: "Withdrawals", value: "PAYOUT_WITHDRAWAL" },
  { label: "Refunds", value: "REFUND" },
  { label: "Adjustments", value: "ADJUSTMENT" },
];

export const WalletTransactionTable: React.FC<WalletTransactionTableProps> = ({
  transactions,
  total,
  currentPage,
  pageSize,
  onPageChange,
  activeFilterType,
  onFilterTypeChange,
  isLoading,
}) => {
  const totalPages = Math.ceil(total / pageSize) || 1;

  const getTransactionIcon = (type: TransactionType, direction: TransactionDirection) => {
    switch (type) {
      case "EARNING":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "ENROLLMENT_PAYMENT":
        return <ShoppingBag className="w-4 h-4 text-rose-500" />;
      case "DEPOSIT":
        return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
      case "PAYOUT_WITHDRAWAL":
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case "REFUND":
        return <RotateCcw className="w-4 h-4 text-amber-500" />;
      case "CASHBACK_BONUS":
        return <Sparkles className="w-4 h-4 text-yellow-500" />;
      default:
        return direction === "CREDIT" ? (
          <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
        ) : (
          <ArrowUpRight className="w-4 h-4 text-rose-500" />
        );
    }
  };

  const getBadgeVariant = (type: TransactionType) => {
    switch (type) {
      case "EARNING":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "ENROLLMENT_PAYMENT":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "DEPOSIT":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "PAYOUT_WITHDRAWAL":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "REFUND":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Filter Chips Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilterType === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => onFilterTypeChange(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#F42A18] text-white shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-neutral-400 font-medium">
          Showing {transactions.length} of {total} transactions
        </span>
      </div>

      {/* 2. Transactions Table Container */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        {transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                No Transactions Found
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No ledger activity matches the selected filter. Wallet top-ups, purchases, and earnings will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction / Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/70 text-neutral-800 dark:text-neutral-200">
                {transactions.map((tx) => {
                  const isCredit = tx.direction === "CREDIT";
                  const dateStr = new Date(tx.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Description & Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            {getTransactionIcon(tx.type, tx.direction)}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white block">
                              {tx.description}
                            </span>
                            {tx.referenceId && (
                              <span className="text-[10px] font-mono text-neutral-400 block">
                                Ref: {tx.referenceId.slice(0, 16)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-lg border ${getBadgeVariant(
                            tx.type
                          )}`}
                        >
                          {tx.type.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isCredit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-neutral-500 font-medium">
                        ₹{tx.balanceAfter.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-neutral-500">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-8 w-8 p-0 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-8 w-8 p-0 rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTransactionTable;
