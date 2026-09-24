import React, { useState } from "react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SlidersHorizontal,
  PlusCircle,
  MinusCircle,
  Loader2,
} from "lucide-react";
import { useAdminWalletAdjustment } from "../hooks/useWallet";
import { toast } from "@/lib/toast";

interface AdminWalletAdjustModalProps {
  userWallet: {
    userId: string;
    userName: string;
    userEmail: string;
    balance: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminWalletAdjustModal: React.FC<AdminWalletAdjustModalProps> = ({
  userWallet,
  isOpen,
  onClose,
}) => {
  const [direction, setDirection] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amountStr, setAmountStr] = useState("");
  const [reason, setReason] = useState("");

  const adjustmentMutation = useAdminWalletAdjustment();

  if (!userWallet) return null;

  const amount = Number(amountStr) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast.error("Adjustment amount must be greater than 0");
      return;
    }

    if (direction === "DEBIT" && amount > userWallet.balance) {
      toast.error(`Cannot debit ₹${amount.toFixed(2)}: exceeds user balance (₹${userWallet.balance.toFixed(2)})`);
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      toast.error("Please provide an audit reason (min 5 characters)");
      return;
    }

    try {
      await adjustmentMutation.mutateAsync({
        userId: userWallet.userId,
        amount,
        direction,
        reason: reason.trim(),
      });
      setAmountStr("");
      setReason("");
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  const headerIcon = (
    <div className="w-10 h-10 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center">
      <SlidersHorizontal className="w-5 h-5" />
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={() => {
        if (!adjustmentMutation.isPending) {
          onClose();
        }
      }}
      title="Admin Balance Adjustment"
      description="Perform manual ledger adjustments with mandatory audit logging."
      icon={headerIcon}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Target User Info */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Target User:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {userWallet.userName} ({userWallet.userEmail})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Current Balance:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-white">
              ₹{userWallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Direction Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDirection("CREDIT")}
              className={`h-9 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                direction === "CREDIT"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Credit Funds (+)</span>
            </button>

            <button
              type="button"
              onClick={() => setDirection("DEBIT")}
              className={`h-9 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                direction === "DEBIT"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>Debit Funds (-)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Adjustment Amount (INR) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-bold text-neutral-400">
                ₹
              </span>
              <Input
                type="number"
                min={1}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="e.g. 500"
                className="pl-8 font-mono font-bold text-sm h-11 rounded-xl bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Audit Reason & Explanation <span className="text-red-500">*</span>
            </Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Provide reason for this manual adjustment (e.g. Compensation for dispute, offline cash settlement, test credit)..."
              className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={adjustmentMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={adjustmentMutation.isPending || amount <= 0 || !reason.trim()}
              className={`text-white text-xs font-bold rounded-xl px-6 cursor-pointer flex items-center gap-2 ${
                direction === "CREDIT"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {adjustmentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <span>Confirm {direction}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
};

export default AdminWalletAdjustModal;
