import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Building2,
} from "lucide-react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { useAdminUpdateBankVerification } from "../hooks/useBankDetails";
import type { BankDetail, BankVerificationStatus } from "../types/bank-detail.types";

export interface AdminVerifyBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankDetail: BankDetail | null;
}

export const AdminVerifyBankModal: React.FC<AdminVerifyBankModalProps> = ({
  isOpen,
  onClose,
  bankDetail,
}) => {
  const [status, setStatus] = useState<BankVerificationStatus>("VERIFIED");
  const [notes, setNotes] = useState("");
  const verifyMutation = useAdminUpdateBankVerification();

  useEffect(() => {
    if (bankDetail) {
      setStatus(bankDetail.verificationStatus === "PENDING" ? "VERIFIED" : bankDetail.verificationStatus);
      setNotes(bankDetail.verificationNotes || "");
    }
  }, [bankDetail]);

  if (!bankDetail) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyMutation.mutate(
      {
        id: bankDetail.id,
        payload: {
          status,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const isReject = status === "REJECTED";

  const headerIcon = (
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
        isReject
          ? "bg-red-500/10 border-red-500/20 text-red-500"
          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
      }`}
    >
      <ShieldCheck className="w-5 h-5" />
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Payout Account"
      description="Review compliance status and verify this bank account for platform payouts."
      icon={headerIcon}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Account Quick Summary Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 dark:text-white">
              {bankDetail.accountHolderName}
            </span>
            <span className="font-mono text-neutral-500 text-[11px]">
              {bankDetail.user?.email}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-300">
            <div>
              <span className="text-neutral-400 block text-[10px]">Method</span>
              <span className="font-semibold">{bankDetail.methodType}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">Bank / VPA</span>
              <span className="font-mono font-semibold">
                {bankDetail.methodType === "UPI" ? bankDetail.upiId : bankDetail.bankName}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Verification Decision <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus("VERIFIED")}
              className={`h-11 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                status === "VERIFIED"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-emerald-500/20"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Approve & Verify</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus("REJECTED")}
              className={`h-11 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                status === "REJECTED"
                  ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 shadow-sm"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-red-500/20"
              }`}
            >
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Reject Account</span>
            </button>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Administrative Notes / Feedback{" "}
            {isReject && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isReject
                ? "Provide reason for rejection (e.g. Account name mismatch with KYC document, invalid IFSC)..."
                : "Optional verification notes for audit logs..."
            }
            className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={verifyMutation.isPending}
            className="text-xs rounded-xl h-9 px-4 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={verifyMutation.isPending || (isReject && !notes.trim())}
            className={`text-xs rounded-xl font-semibold text-white h-9 px-5 shadow-sm cursor-pointer flex items-center gap-1.5 ${
              isReject
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            }`}
          >
            {verifyMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isReject ? "Confirm Rejection" : "Confirm Verification"}</span>
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
};

export default AdminVerifyBankModal;
