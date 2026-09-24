import React, { useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyPayouts } from "../hooks/useWallet";
import type { PayoutRequest, PayoutStatus } from "../types/wallet.types";

interface TeacherPayoutsTableProps {
  onRequestNewPayout?: () => void;
  availableBalance?: number;
}

const STATUS_TABS: Array<{ label: string; value?: PayoutStatus }> = [
  { label: "All Requests", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
];

export const TeacherPayoutsTable: React.FC<TeacherPayoutsTableProps> = ({
  onRequestNewPayout,
  availableBalance = 0,
}) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | undefined>();

  const { data, isLoading, isFetching, refetch } = useMyPayouts({
    page,
    limit: 10,
    status: statusFilter,
  });

  const payouts = data?.items || [];
  const total = data?.total || 0;
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize) || 1;

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
            Pending Review
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

  return (
    <div className="space-y-4">
      {/* 1. Header with Filter Chips & Refresh Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Payout Requests"
            className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] text-neutral-600 dark:text-neutral-400 hover:text-[#F42A18] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#F42A18]" : ""}`}
            />
          </button>
          <span className="text-xs text-neutral-400 font-medium">
            Showing {payouts.length} of {total} requests
          </span>
        </div>
      </div>

      {/* 2. Payouts Table Container */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        {payouts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                No Payout Requests Found
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                You have not submitted any withdrawal requests matching the selected filter.
              </p>
            </div>
            {onRequestNewPayout && availableBalance >= 500 && (
              <Button
                type="button"
                size="sm"
                onClick={onRequestNewPayout}
                className="bg-[#F42A18] hover:bg-[#d92212] text-white text-xs font-bold rounded-xl gap-1.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Request Payout</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payout Method / Destination</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Disbursal Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/70 text-neutral-800 dark:text-neutral-200">
                {payouts.map((payout: PayoutRequest) => {
                  const dateStr = new Date(payout.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={payout.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Destination */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-[#F42A18]">
                            {payout.payoutMethod === "UPI" ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (
                              <Building2 className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white block">
                              {payout.accountSummary}
                            </span>
                            <span className="text-[10px] text-neutral-400 block font-mono">
                              Method: {payout.payoutMethod === "UPI" ? "UPI Instant Transfer" : "NEFT / Bank Transfer"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(payout.status)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-sm text-[#F42A18]">
                          ₹{payout.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Reference / Reason */}
                      <td className="py-3.5 px-4">
                        {payout.transactionRef ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium block">
                            UTR: {payout.transactionRef}
                          </span>
                        ) : payout.rejectionReason ? (
                          <span className="text-[11px] text-rose-500 font-medium block max-w-xs truncate" title={payout.rejectionReason}>
                            Reason: {payout.rejectionReason}
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic">
                            In Review
                          </span>
                        )}
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
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

export default TeacherPayoutsTable;
