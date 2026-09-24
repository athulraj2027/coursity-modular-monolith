import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { useRequestPayout } from "../hooks/useWallet";
import { useMyBankDetails } from "@/features/bank-details";
import { toast } from "@/lib/toast";

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
}) => {
  const { data: bankAccounts = [], isLoading: isBanksLoading } = useMyBankDetails();
  const [amountStr, setAmountStr] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string>("");

  const requestPayoutMutation = useRequestPayout();

  // Set default primary bank account
  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedBankId) {
      const primary = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];
      setSelectedBankId(primary.id);
    }
  }, [bankAccounts, selectedBankId]);

  const amount = Number(amountStr) || 0;
  const primaryBank = bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0];

  const handleWithdrawMax = () => {
    setAmountStr(String(Math.floor(availableBalance)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 500) {
      toast.error("Minimum withdrawal amount is ₹500");
      return;
    }

    if (amount > availableBalance) {
      toast.error(`Requested amount exceeds available balance (₹${availableBalance.toFixed(2)})`);
      return;
    }

    if (!selectedBankId && (!bankAccounts || bankAccounts.length === 0)) {
      toast.error("Please add a bank account before requesting a payout");
      return;
    }

    try {
      await requestPayoutMutation.mutateAsync({
        amount,
        bankDetailId: selectedBankId || undefined,
      });
      setAmountStr("");
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  const headerIcon = (
    <div className="w-10 h-10 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center">
      <ArrowUpRight className="w-5 h-5" />
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={() => {
        if (!requestPayoutMutation.isPending) {
          onClose();
        }
      }}
      title="Request Payout Withdrawal"
      description="Disburse your course royalties directly to your verified bank account or UPI ID."
      icon={headerIcon}
      maxWidth="md"
    >
      {bankAccounts.length === 0 && !isBanksLoading ? (
        /* No Bank Accounts Configured Warning */
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              No Payout Account Configured
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              You must link a verified bank account or UPI ID before requesting withdrawals.
            </p>
          </div>
          <Button asChild size="sm" className="bg-[#F42A18] hover:bg-[#d92212] text-white text-xs font-bold rounded-xl">
            <Link to="/teachers/bank-details">Add Bank Details</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Selected Payout Destination Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Payout Destination Account
              </Label>
              <Link
                to="/teachers/bank-details"
                className="text-[11px] font-bold text-[#F42A18] hover:underline"
              >
                Manage Accounts
              </Link>
            </div>

            {primaryBank && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-[#F42A18]">
                    {primaryBank.methodType === "UPI" ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {primaryBank.methodType === "UPI" ? primaryBank.upiId : primaryBank.bankName}
                      </span>
                      {primaryBank.isPrimary && (
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {primaryBank.methodType === "UPI"
                        ? "Instant UPI Disbursal"
                        : `A/C: ••••${primaryBank.accountNumber.slice(-4)} • IFSC: ${primaryBank.ifscCode}`}
                    </p>
                  </div>
                </div>

                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            )}
          </div>

          {/* Withdrawal Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Withdrawal Amount (INR)
              </Label>
              <button
                type="button"
                onClick={handleWithdrawMax}
                className="text-[11px] font-bold text-[#F42A18] hover:underline cursor-pointer"
              >
                Withdraw Max (₹{availableBalance.toFixed(2)})
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-bold text-neutral-400">
                ₹
              </span>
              <Input
                type="number"
                min={500}
                max={availableBalance}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="e.g. 2500"
                className="pl-8 font-mono font-bold text-base h-11 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
              <span>Minimum withdrawal: ₹500</span>
              <span>Available: ₹{availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Processing Policy Strip */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 text-xs flex items-start gap-2.5 text-neutral-600 dark:text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Withdrawal requests are processed within 24–48 business hours via NEFT/IMPS. Requested funds are locked in your wallet until the settlement is completed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={requestPayoutMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={requestPayoutMutation.isPending || amount < 500 || amount > availableBalance}
              className="bg-[#F42A18] hover:bg-[#d92212] text-white text-xs font-bold rounded-xl px-6 shadow-md shadow-[#F42A18]/25 cursor-pointer flex items-center gap-2"
            >
              {requestPayoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </ModalTemplate>
  );
};

export default RequestPayoutModal;
