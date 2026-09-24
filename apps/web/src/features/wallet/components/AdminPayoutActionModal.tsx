import React, { useState } from "react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useAdminProcessPayout } from "../hooks/useWallet";
import type { PayoutRequest } from "../types/wallet.types";
import { toast } from "@/lib/toast";

interface AdminPayoutActionModalProps {
  payout: PayoutRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPayoutActionModal: React.FC<AdminPayoutActionModalProps> = ({
  payout,
  isOpen,
  onClose,
}) => {
  const [actionType, setActionType] = useState<"COMPLETED" | "REJECTED" | "PROCESSING">("COMPLETED");
  const [transactionRef, setTransactionRef] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const processPayoutMutation = useAdminProcessPayout();

  if (!payout) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (actionType === "COMPLETED" && !transactionRef.trim()) {
      toast.error("Please provide Bank UTR or Transaction reference number");
      return;
    }

    if (actionType === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason for the instructor");
      return;
    }

    try {
      await processPayoutMutation.mutateAsync({
        id: payout.id,
        payload: {
          status: actionType,
          transactionRef: transactionRef.trim() || undefined,
          rejectionReason: rejectionReason.trim() || undefined,
        },
      });
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  const headerIcon = (
    <div className="w-10 h-10 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center">
      <Building2 className="w-5 h-5" />
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={() => {
        if (!processPayoutMutation.isPending) {
          onClose();
        }
      }}
      title="Process Instructor Payout"
      description="Review beneficiary details and update settlement status."
      icon={headerIcon}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Payout Summary Info Box */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Instructor:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {payout.user?.name || "Instructor"} ({payout.user?.email})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Withdrawal Amount:</span>
            <span className="font-mono font-bold text-base text-[#F42A18]">
              ₹{payout.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Account Target:</span>
            <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
              {payout.accountSummary}
            </span>
          </div>
          {payout.bankDetail && payout.bankDetail.methodType === "BANK_ACCOUNT" && (
            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-neutral-500">IFSC / Branch:</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">
                {payout.bankDetail.ifscCode} {payout.bankDetail.branchName ? `(${payout.bankDetail.branchName})` : ""}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Action Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActionType("COMPLETED")}
              className={`h-9 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                actionType === "COMPLETED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType("PROCESSING")}
              className={`h-9 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                actionType === "PROCESSING"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Processing</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType("REJECTED")}
              className={`h-9 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                actionType === "REJECTED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>

          {/* Conditional Field: Bank UTR Reference (For Completed) */}
          {actionType === "COMPLETED" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Bank UTR / Transaction Reference <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UTR123456789012 or RZP_X_PAY_987"
                className="font-mono text-xs h-10 rounded-xl bg-neutral-50 dark:bg-neutral-800"
              />
              <span className="text-[11px] text-neutral-400">
                This transaction reference will be visible to the instructor.
              </span>
            </div>
          )}

          {/* Conditional Field: Rejection Reason (For Rejected) */}
          {actionType === "REJECTED" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Explain why this withdrawal cannot be processed (funds will be unlocked back to the teacher's wallet)..."
                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={processPayoutMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={processPayoutMutation.isPending}
              className={`text-white text-xs font-bold rounded-xl px-6 cursor-pointer flex items-center gap-2 ${
                actionType === "COMPLETED"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : actionType === "REJECTED"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {processPayoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Status...</span>
                </>
              ) : (
                <span>Confirm {actionType.toLowerCase()}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
};

export default AdminPayoutActionModal;
